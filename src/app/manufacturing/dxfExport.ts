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

export type DxfExportFile = {
    /** File name without directory, e.g. device_flow1.dxf */
    filename: string;
    content: string;
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

function wrapEntities(entities: string): string {
    return writeHeader() + "0\nSECTION\n2\nENTITIES\n" + entities + "0\nENDSEC\n0\nEOF\n";
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

function canvasUmToDxfMm(xUm: number, yUm: number, deviceHeightUm: number): { x: number; y: number } {
    return {
        x: xUm * UM_TO_MM,
        y: (deviceHeightUm - yUm) * UM_TO_MM
    };
}

function emptyPlaceholderEntities(device: Device): string {
    return writeLine(
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

function readCircleRadiusUm(feature: Feature): number | null {
    const candidates = ["portRadius", "valveRadius", "radius1", "radius"];
    for (const key of candidates) {
        try {
            const value = Number(feature.getValue(key));
            if (Number.isFinite(value) && value > 0) {
                return value;
            }
        } catch (_err) {
            // Param may be absent for this feature type.
        }
    }
    return null;
}

function exportFeatureEntities(feature: Feature, layerName: string, deviceHeightUm: number): string {
    const type = feature.getType();
    let entities = "";

    if (type === "EDGE" || type === "DxfSketch") {
        for (const dxfObj of feature.dxfObjects) {
            entities += writeEntity(dxfObjectToEntity(dxfObj), layerName);
        }
        return entities;
    }

    if (type === "Port" || type === "Valve3D" || type === "Valve3D_control" || type === "CircleValve") {
        const position = feature.getValue("position") as [number, number];
        const radiusUm = readCircleRadiusUm(feature);
        if (!Array.isArray(position) || radiusUm == null) {
            return entities;
        }
        const pt = canvasUmToDxfMm(position[0], position[1], deviceHeightUm);
        const suffix = type === "Port" ? "_ports" : "_valves";
        entities += writeCircle(
            {
                type: "CIRCLE",
                center: { x: pt.x, y: pt.y, z: 0 },
                radius: radiusUm * UM_TO_MM
            },
            layerName + suffix
        );
        return entities;
    }

    if (type === "Connection") {
        const segments = feature.getValue("segments") as Array<[[number, number], [number, number]]>;
        const heightUm = Number(feature.getValue("height"));
        const z = Number.isFinite(heightUm) ? heightUm * UM_TO_MM : 0.25;
        if (!segments || !Array.isArray(segments)) {
            return entities;
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

    return entities;
}

function exportLayerEntities(device: Device, layer: Layer): string {
    const deviceHeightUm = device.getYSpan();
    const layerName = layer.name || layer.type || "LAYER";
    let entities = "";
    const features = layer.features;
    for (const key in features) {
        entities += exportFeatureEntities(features[key], layerName, deviceHeightUm);
    }
    if (!entities) {
        entities = emptyPlaceholderEntities(device);
    }
    return entities;
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
    return wrapEntities(entities);
}

function layerSuffix(layer: Layer, flowIndex: number, controlIndex: number): string {
    if (layer.type === LogicalLayerType.CONTROL) {
        return `_ctrl${controlIndex}`;
    }
    return `_flow${flowIndex}`;
}

/**
 * True when the device has more than one FLOW/CONTROL manufacturing layer
 * (typical multilayer biochip with fluid + control).
 */
export function isMultilayerBiochip(device: Device): boolean {
    if (!device || !Array.isArray(device.layers)) {
        return false;
    }
    let count = 0;
    for (const layer of device.layers) {
        if (layer.type === LogicalLayerType.FLOW || layer.type === LogicalLayerType.CONTROL) {
            count += 1;
            if (count > 1) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Export FLOW/CONTROL layers as separate DXF files.
 * Multilayer devices get one file per layer with suffixes _flowN / _ctrlN.
 * Single-layer and DXF-imported designs return one .dxf file.
 */
export function generateDeviceDxfFiles(device: Device): DxfExportFile[] {
    const fromImport = exportFromStoredDxfImport(device);
    if (fromImport) {
        return [{ filename: `${device.name}.dxf`, content: fromImport }];
    }

    const exportLayers = device.layers.filter(
        layer => layer.type === LogicalLayerType.FLOW || layer.type === LogicalLayerType.CONTROL
    );

    if (exportLayers.length === 0) {
        return [
            {
                filename: `${device.name}.dxf`,
                content: wrapEntities(emptyPlaceholderEntities(device))
            }
        ];
    }

    if (exportLayers.length === 1) {
        return [
            {
                filename: `${device.name}.dxf`,
                content: wrapEntities(exportLayerEntities(device, exportLayers[0]))
            }
        ];
    }

    const files: DxfExportFile[] = [];
    let flowIndex = 0;
    let controlIndex = 0;
    for (const layer of exportLayers) {
        if (layer.type === LogicalLayerType.FLOW) {
            flowIndex += 1;
        } else {
            controlIndex += 1;
        }
        const suffix = layerSuffix(layer, flowIndex, controlIndex);
        files.push({
            filename: `${device.name}${suffix}.dxf`,
            content: wrapEntities(exportLayerEntities(device, layer))
        });
    }
    return files;
}

/**
 * Export the current device as an ASCII DXF file (mm units).
 * For multilayer devices this concatenates all layer entities into one file;
 * prefer generateDeviceDxfFiles() for per-layer downloads.
 */
export function generateDeviceDxf(device: Device): string {
    const files = generateDeviceDxfFiles(device);
    if (files.length === 1) {
        return files[0].content;
    }
    let entities = "";
    for (const file of files) {
        // Strip header/footer and keep ENTITIES body for a combined fallback.
        const match = file.content.match(/2\nENTITIES\n([\s\S]*?)0\nENDSEC\n0\nEOF\n/);
        entities += match ? match[1] : "";
    }
    if (!entities) {
        entities = emptyPlaceholderEntities(device);
    }
    return wrapEntities(entities);
}

export function getDxfModelForDevice(device: Device) {
    return getDxfModelFromDevice(device);
}
