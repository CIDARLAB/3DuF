import * as THREE from "three";
import Device from "../core/device";
import Feature from "../core/feature";
import Layer from "../core/layer";
import { LogicalLayerType } from "../core/init";

const UM_TO_MM = 0.001;

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function cleanSignedZero(value: number, decimals: number): string {
    const rounded = value.toFixed(decimals);
    return rounded === "-0." + "0".repeat(decimals) ? "0." + "0".repeat(decimals) : rounded;
}

function formatStlFloat(value: number): string {
    // Keep ASCII STL numbers parser-friendly (no NaN/Infinity/scientific notation).
    return cleanSignedZero(value, 6);
}

/** Matches Paper.js Path.Rectangle(stadium) used by Connection / RoundedChannel render2D. */
function buildSegmentExtrusion(axUm: number, ayUm: number, bxUm: number, byUm: number, channelWidthUm: number, rounded: boolean): THREE.BufferGeometry {
    if (
        !isFiniteNumber(axUm) ||
        !isFiniteNumber(ayUm) ||
        !isFiniteNumber(bxUm) ||
        !isFiniteNumber(byUm) ||
        !isFiniteNumber(channelWidthUm) ||
        channelWidthUm <= 0
    ) {
        return new THREE.BufferGeometry();
    }
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
    if (
        !Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.z) ||
        !Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.z) ||
        !Number.isFinite(c.x) || !Number.isFinite(c.y) || !Number.isFinite(c.z)
    ) {
        return;
    }
    const e1 = new THREE.Vector3().subVectors(b, a);
    const e2 = new THREE.Vector3().subVectors(c, a);
    const n = new THREE.Vector3().crossVectors(e1, e2);
    if (n.lengthSq() < 1e-18) {
        return;
    }
    n.normalize();
    if (!Number.isFinite(n.x) || !Number.isFinite(n.y) || !Number.isFinite(n.z)) {
        return;
    }
    lines.push(`facet normal ${formatStlFloat(n.x)} ${formatStlFloat(n.y)} ${formatStlFloat(n.z)}`);
    lines.push("  outer loop");
    lines.push(`    vertex ${formatStlFloat(a.x)} ${formatStlFloat(a.y)} ${formatStlFloat(a.z)}`);
    lines.push(`    vertex ${formatStlFloat(b.x)} ${formatStlFloat(b.y)} ${formatStlFloat(b.z)}`);
    lines.push(`    vertex ${formatStlFloat(c.x)} ${formatStlFloat(c.y)} ${formatStlFloat(c.z)}`);
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
    return lines.join("\n") + "\n";
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
            if (!isFiniteNumber(channelWidth) || !isFiniteNumber(height) || channelWidth <= 0 || height <= 0) {
                continue;
            }
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
                if (
                    !Array.isArray(p1) || !Array.isArray(p2) ||
                    !isFiniteNumber(p1[0]) || !isFiniteNumber(p1[1]) ||
                    !isFiniteNumber(p2[0]) || !isFiniteNumber(p2[1])
                ) {
                    continue;
                }
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
    const feed = isFiniteNumber(feedMmMin) && feedMmMin > 0 ? feedMmMin : 600;
    const safeZ = isFiniteNumber(safeZMm) && safeZMm >= 0 ? safeZMm : 1;
    const lines: string[] = [
        "; 3DuF connection centerline toolpath",
        "; XY in mm, Z negative is cut depth converted from um",
        "G21 ; millimeters",
        "G90 ; absolute positioning",
        "G17 ; XY plane",
        `G0 F${feed}`,
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
            if (!isFiniteNumber(height) || height <= 0) {
                continue;
            }
            const depthMm = height * UM_TO_MM;
            if (!segments || !Array.isArray(segments)) {
                continue;
            }
            lines.push(`; feature ${feature.ID}`);
            lines.push(`G0 Z${cleanSignedZero(safeZ, 3)}`);
            for (let s = 0; s < segments.length; s++) {
                const seg = segments[s];
                if (!seg || seg.length < 2) {
                    continue;
                }
                const p1 = seg[0];
                const p2 = seg[1];
                if (
                    !Array.isArray(p1) || !Array.isArray(p2) ||
                    !isFiniteNumber(p1[0]) || !isFiniteNumber(p1[1]) ||
                    !isFiniteNumber(p2[0]) || !isFiniteNumber(p2[1])
                ) {
                    continue;
                }
                const x1 = p1[0] * UM_TO_MM;
                const y1 = -p1[1] * UM_TO_MM;
                const x2 = p2[0] * UM_TO_MM;
                const y2 = -p2[1] * UM_TO_MM;
                lines.push(`G0 X${cleanSignedZero(x1, 4)} Y${cleanSignedZero(y1, 4)}`);
                lines.push(`G1 Z${cleanSignedZero(-depthMm, 4)} F${feed}`);
                lines.push(`G1 X${cleanSignedZero(x2, 4)} Y${cleanSignedZero(y2, 4)} F${feed}`);
                lines.push(`G0 Z${cleanSignedZero(safeZ, 3)}`);
            }
            lines.push("");
        }
    }

    lines.push("G0 Z5");
    lines.push("M5");
    lines.push("M30");
    return lines.join("\n") + "\n";
}
