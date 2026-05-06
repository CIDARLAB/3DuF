import * as THREE from "three";
import Device from "../core/device";
import Feature from "../core/feature";
import Layer from "../core/layer";
import { LogicalLayerType } from "../core/init";

const UM_TO_MM = 0.001;

/** Matches Paper.js Path.Rectangle(stadium) used by Connection / RoundedChannel render2D. */
function buildSegmentExtrusion(axUm: number, ayUm: number, bxUm: number, byUm: number, channelWidthUm: number, rounded: boolean): THREE.BufferGeometry {
    const dx = bxUm - axUm;
    const dy = byUm - ayUm;
    const spineLen = Math.sqrt(dx * dx + dy * dy);
    if (spineLen < 1e-9) {
        return new THREE.BufferGeometry();
    }

    const wUm = channelWidthUm;
    const lUm = spineLen;
    const wMm = wUm * UM_TO_MM;
    const lMm = lUm * UM_TO_MM;
    const totalXMm = (lUm + wUm) * UM_TO_MM;

    const shape = new THREE.Shape();
    const x = 0;
    const y = 0;
    if (!rounded) {
        shape.moveTo(x, y);
        shape.lineTo(x + totalXMm, y);
        shape.lineTo(x + totalXMm, y + wMm);
        shape.lineTo(x, y + wMm);
        shape.lineTo(x, y);
    } else {
        const r = wMm / 2;
        shape.moveTo(x + r, y);
        shape.lineTo(x + totalXMm - r, y);
        shape.absarc(x + totalXMm - r, y + r, r, -Math.PI / 2, Math.PI / 2, false);
        shape.lineTo(x + r, y + wMm);
        shape.absarc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    }

    const geom = new THREE.ExtrudeGeometry(shape, {
        depth: 1,
        bevelEnabled: false
    });

    const angle = Math.atan2(dy, dx);
    geom.scale(1, -1, 1);
    geom.translate(-wMm / 2, wMm / 2, 0);
    geom.rotateZ(angle);
    geom.translate(axUm * UM_TO_MM, -ayUm * UM_TO_MM, 0);
    return geom;
}

function scaleGeometryDepth(geometry: THREE.BufferGeometry, depthMm: number): void {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        pos.setZ(i, z * depthMm);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
}

function appendFacet(lines: string[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): void {
    const e1 = new THREE.Vector3().subVectors(b, a);
    const e2 = new THREE.Vector3().subVectors(c, a);
    const n = new THREE.Vector3().crossVectors(e1, e2);
    if (n.lengthSq() < 1e-18) {
        return;
    }
    n.normalize();
    lines.push(`facet normal ${n.x} ${n.y} ${n.z}`);
    lines.push("  outer loop");
    lines.push(`    vertex ${a.x} ${a.y} ${a.z}`);
    lines.push(`    vertex ${b.x} ${b.y} ${b.z}`);
    lines.push(`    vertex ${c.x} ${c.y} ${c.z}`);
    lines.push("  endloop");
    lines.push("endfacet");
}

export function bufferGeometryToSTLASCII(geometry: THREE.BufferGeometry): string {
    const geom = geometry.index ? geometry.toNonIndexed() : geometry;
    const pos = geom.attributes.position as THREE.BufferAttribute | undefined;
    if (!pos || pos.count === 0) {
        return "solid 3duf_export\nendsolid 3duf_export\n";
    }
    geom.computeVertexNormals();
    const positions = geom.attributes.position as THREE.BufferAttribute;
    const lines: string[] = ["solid 3duf_export"];
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();
    for (let i = 0; i < positions.count; i += 3) {
        v1.fromBufferAttribute(positions, i);
        v2.fromBufferAttribute(positions, i + 1);
        v3.fromBufferAttribute(positions, i + 2);
        appendFacet(lines, v1, v2, v3);
    }
    lines.push("endsolid 3duf_export");
    return lines.join("\n");
}

function collectConnectionGeometries(device: Device): THREE.BufferGeometry[] {
    const out: THREE.BufferGeometry[] = [];
    const layers: Layer[] = device.layers;
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (layer.type !== LogicalLayerType.FLOW) {
            continue;
        }
        const features = layer.features;
        for (const key in features) {
            const feature: Feature = features[key];
            if (feature.type !== "Connection") {
                continue;
            }
            const segments = feature.getValue("segments") as Array<[[number, number], [number, number]]>;
            const channelWidth = feature.getValue("channelWidth") as number;
            const height = feature.getValue("height") as number;
            const crossSection = Number(feature.getValue("crossSection"));
            const rounded = crossSection >= 0.5;
            const depthMm = height * UM_TO_MM;
            if (!segments || !Array.isArray(segments)) {
                continue;
            }
            for (let s = 0; s < segments.length; s++) {
                const seg = segments[s];
                if (!seg || seg.length < 2) {
                    continue;
                }
                const p1 = seg[0];
                const p2 = seg[1];
                const g = buildSegmentExtrusion(p1[0], p1[1], p2[0], p2[1], channelWidth, rounded);
                if (g.attributes.position && (g.attributes.position as THREE.BufferAttribute).count > 0) {
                    scaleGeometryDepth(g, depthMm);
                    out.push(g);
                }
            }
        }
    }
    return out;
}

export function generateConnectionSTLASCII(device: Device): string {
    const geoms = collectConnectionGeometries(device);
    if (geoms.length === 0) {
        return bufferGeometryToSTLASCII(new THREE.BufferGeometry());
    }
    const merged = mergeGeometriesNonIndexed(geoms);
    for (const g of geoms) {
        g.dispose();
    }
    const stl = bufferGeometryToSTLASCII(merged);
    merged.dispose();
    return stl;
}

function mergeGeometriesNonIndexed(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    const merged = new THREE.BufferGeometry();
    if (geometries.length === 0) {
        return merged;
    }
    const prepared: THREE.BufferGeometry[] = [];
    let totalFloats = 0;
    for (const g of geometries) {
        const gi = g.index ? g.toNonIndexed() : g;
        prepared.push(gi);
        totalFloats += (gi.attributes.position as THREE.BufferAttribute).count * 3;
    }
    const positions = new Float32Array(totalFloats);
    let offset = 0;
    for (const gi of prepared) {
        const arr = (gi.attributes.position as THREE.BufferAttribute).array as Float32Array;
        positions.set(arr, offset);
        offset += arr.length;
    }
    for (let i = 0; i < prepared.length; i++) {
        if (geometries[i].index) {
            prepared[i].dispose();
        }
    }
    merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return merged;
}

/** Linear centerline moves along each segment (Grbl-friendly). Matches spine routing; use STL for full envelope. */
export function generateConnectionProfileGCode(device: Device, feedMmMin = 600, safeZMm = 1): string {
    const lines: string[] = [
        "; 3DuF connection centerline toolpath — XY in mm, Z negative = cut depth (μm-based)",
        "; For pocket outlines matching square vs rounded channels, use Vector Art (.svg) or STL export.",
        "G21 ; millimeters",
        "G90 ; absolute positioning",
        "G17 ; XY plane",
        `G0 F${feedMmMin}`,
        ""
    ];

    const layers: Layer[] = device.layers;
    for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        if (layer.type !== LogicalLayerType.FLOW) {
            continue;
        }
        for (const key in layer.features) {
            const feature: Feature = layer.features[key];
            if (feature.type !== "Connection") {
                continue;
            }
            const segments = feature.getValue("segments") as Array<[[number, number], [number, number]]>;
            const height = feature.getValue("height") as number;
            const depthMm = height * UM_TO_MM;
            if (!segments || !Array.isArray(segments)) {
                continue;
            }
            lines.push(`; feature ${feature.ID}`);
            lines.push(`G0 Z${safeZMm.toFixed(3)}`);
            for (let s = 0; s < segments.length; s++) {
                const seg = segments[s];
                if (!seg || seg.length < 2) {
                    continue;
                }
                const p1 = seg[0];
                const p2 = seg[1];
                const x1 = p1[0] * UM_TO_MM;
                const y1 = -p1[1] * UM_TO_MM;
                const x2 = p2[0] * UM_TO_MM;
                const y2 = -p2[1] * UM_TO_MM;
                lines.push(`G0 X${x1.toFixed(4)} Y${y1.toFixed(4)}`);
                lines.push(`G1 Z${(-depthMm).toFixed(4)} F${feedMmMin}`);
                lines.push(`G1 X${x2.toFixed(4)} Y${y2.toFixed(4)} F${feedMmMin}`);
                lines.push(`G0 Z${safeZMm.toFixed(3)}`);
            }
            lines.push("");
        }
    }

    lines.push("G0 Z5");
    lines.push("M5");
    lines.push("M30");
    return lines.join("\n");
}
