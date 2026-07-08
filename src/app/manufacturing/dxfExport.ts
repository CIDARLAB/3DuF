import Device from "../core/device";
import Feature from "../core/feature";
import Layer from "../core/layer";
import DXFObject from "../core/dxfObject";
import { LogicalLayerType } from "../core/init";
import { getDxfModelFromDevice } from "../import/dxfDeviceImport";

const UM_TO_MM = 0.001;

type DxfEntity = {
    type: string;
    layer?: string;
    vertices?: Array<{ x: number; y: number; z?: number }>;
    center?: { x: number; y: number; z?: number };
    radius?: number;
    startPoint?: { x: number; y: number; z?: number };
    endPoint?: { x: number; y: number; z?: number };
};

function dxfPair(code: number, value: string | number): string {
    return `${code}\n${value}\n`;
}

function writeHeader(): string {
    let out = "0\nSECTION\n2\nHEADER\n";
    out += dxfPair(9, "$ACADVER");
    out += dxfPair(1, "AC1015");
    out += dxfPair(9, "$INSUNITS");
    out += dxfPair(70, 4);
    out += "0\nENDSEC\n";
    return out;
}

function writeLine(entity: DxfEntity, layer: string): string {
    const a = entity.vertices?.[0] ?? entity.startPoint;
    const b = entity.vertices?.[entity.vertices.length - 1] ?? entity.endPoint;
    if (!a || !b) return "";
    let out = "0\nLINE\n";
    out += dxfPair(8, layer);
    out += dxfPair(10, a.x);
    out += dxfPair(20, a.y);
    out += dxfPair(30, a.z ?? 0);
    out += dxfPair(11, b.x);
    out += dxfPair(21, b.y);
    out += dxfPair(31, b.z ?? a.z ?? 0);
    return out;
}

function writeCircle(entity: DxfEntity, layer: string): string {
    if (!entity.center || entity.radius == null) return "";
    let out = "0\nCIRCLE\n";
    out += dxfPair(8, layer);
    out += dxfPair(10, entity.center.x);
    out += dxfPair(20, entity.center.y);
    out += dxfPair(30, entity.center.z ?? 0);
    out += dxfPair(40, entity.radius);
    return out;
}

function writeEntity(entity: DxfEntity, defaultLayer: string): string {
    const layer = entity.layer || defaultLayer;
    if (entity.type === "LINE" || entity.type === "LWPOLYLINE" || entity.type === "POLYLINE") {
        if (entity.type === "LINE") {
            return writeLine(entity, layer);
        }
        if (entity.vertices && entity.vertices.length >= 2) {
            let out = "";
            for (let i = 0; i < entity.vertices.length - 1; i++) {
                out += writeLine(
                    {
                        type: "LINE",
                        vertices: [entity.vertices[i], entity.vertices[i + 1]]
                    },
                    layer
                );
            }
            return out;
        }
        return writeLine(entity, layer);
    }
    if (entity.type === "CIRCLE") {
        return writeCircle(entity, layer);
    }
    return "";
}

function dxfObjectToEntity(obj: DXFObject): DxfEntity {
    return obj.getData() as DxfEntity;
}

function exportFromStoredDxfImport(device: Device): string | null {
    const dxfImport = device.getOptionalParam("dxfImport");
    if (!dxfImport || !Array.isArray(dxfImport.entities)) {
        return null;
    }
    let entities = "";
    for (const entity of dxfImport.entities) {
        entities += writeEntity(entity as DxfEntity, "3DuF_export");
    }
    return writeHeader() + "0\nSECTION\n2\nENTITIES\n" + entities + "0\nENDSEC\n0\nEOF\n";
}

function canvasUmToDxfMm(xUm: number, yUm: number, deviceHeightUm: number): { x: number; y: number } {
    return {
        x: xUm * UM_TO_MM,
        y: (deviceHeightUm - yUm) * UM_TO_MM
    };
}

function exportFromDeviceFeatures(device: Device): string {
    let entities = "";
    const deviceHeightUm = device.getYSpan();
    const layers: Layer[] = device.layers;

    for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        if (layer.type !== LogicalLayerType.FLOW) {
            continue;
        }
        const layerName = layer.name || "FLOW";
        const features = layer.features;

        for (const key in features) {
            const feature: Feature = features[key];
            const type = feature.getType();

            if (type === "EDGE" || type === "DxfSketch") {
                for (const dxfObj of feature.dxfObjects) {
                    entities += writeEntity(dxfObjectToEntity(dxfObj), layerName);
                }
                continue;
            }

            if (type === "Port") {
                const position = feature.getValue("position") as [number, number];
                const portRadius = Number(feature.getValue("portRadius"));
                if (!Array.isArray(position) || !Number.isFinite(portRadius)) {
                    continue;
                }
                const pt = canvasUmToDxfMm(position[0], position[1], deviceHeightUm);
                entities += writeCircle(
                    {
                        type: "CIRCLE",
                        center: { x: pt.x, y: pt.y, z: 0 },
                        radius: portRadius * UM_TO_MM
                    },
                    layerName + "_ports"
                );
                continue;
            }

            if (type === "Connection") {
                const segments = feature.getValue("segments") as Array<[[number, number], [number, number]]>;
                const heightUm = Number(feature.getValue("height"));
                const z = Number.isFinite(heightUm) ? heightUm * UM_TO_MM : 0.25;
                if (!segments || !Array.isArray(segments)) {
                    continue;
                }
                for (const seg of segments) {
                    if (!seg || seg.length < 2) continue;
                    const p1 = seg[0];
                    const p2 = seg[1];
                    if (!Array.isArray(p1) || !Array.isArray(p2)) continue;
                    const a = canvasUmToDxfMm(p1[0], p1[1], deviceHeightUm);
                    const b = canvasUmToDxfMm(p2[0], p2[1], deviceHeightUm);
                    if (Math.hypot(a.x - b.x, a.y - b.y) < 1e-9) continue;
                    entities += writeLine(
                        {
                            type: "LINE",
                            vertices: [
                                { x: a.x, y: a.y, z },
                                { x: b.x, y: b.y, z }
                            ]
                        },
                        layerName + "_channels"
                    );
                }
            }
        }
    }

    if (!entities) {
        entities += writeLine(
            {
                type: "LINE",
                vertices: [
                    { x: 0, y: 0, z: 0 },
                    { x: device.getXSpan() * UM_TO_MM, y: 0, z: 0 }
                ]
            },
            "3DuF_empty"
        );
    }

    return writeHeader() + "0\nSECTION\n2\nENTITIES\n" + entities + "0\nENDSEC\n0\nEOF\n";
}

/**
 * Export the current device as an ASCII DXF file (mm units).
 * DXF-imported designs round-trip the stored sketch entities; JSON designs
 * export ports (circles), connections (lines), and any EDGE/DxfSketch geometry.
 */
export function generateDeviceDxf(device: Device): string {
    const fromImport = exportFromStoredDxfImport(device);
    if (fromImport) {
        return fromImport;
    }
    return exportFromDeviceFeatures(device);
}

export function getDxfModelForDevice(device: Device) {
    return getDxfModelFromDevice(device);
}
