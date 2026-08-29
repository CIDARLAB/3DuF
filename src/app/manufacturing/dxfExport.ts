import Device from "../core/device";
import Feature from "../core/feature";
import Layer from "../core/layer";
import DXFObject from "../core/dxfObject";
import { LogicalLayerType } from "../core/init";
import { getDxfModelFromDevice } from "../import/dxfDeviceImport";
import { betterMixerCenterlineSegments } from "./flowGCodeExport";

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

export type DxfExportOptions = {
    /** Cover-layer export: Port circles only (plus the device border). */
    portsOnly?: boolean;
};

function withPortsFilename(filename: string): string {
    return filename.replace(/(\.[^.]+)$/, "_ports$1");
}

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

/**
 * Deepest component/feature height on the device (µm). Used to size the exported
 * substrate box as max(height) + 1 mm for CAD (Fusion 360) replacement workflows.
 */
export function computeMaxComponentDepthUm(device: Device): number {
    let maxUm = 0;
    const consider = (raw: unknown) => {
        const n = Number(raw);
        if (Number.isFinite(n) && n > maxUm) maxUm = n;
    };

    try {
        for (const component of device.components || []) {
            try {
                if (typeof (component as any).getValue === "function") {
                    consider((component as any).getValue("height"));
                }
            } catch (_err) {
                // Param may be absent for this component type.
            }
        }
    } catch (_err) {
        // optional
    }

    for (const layer of device.layers || []) {
        const features = layer.features || {};
        for (const key in features) {
            const feature = features[key];
            if (!feature) continue;
            const t = String((feature as any).getType?.() || (feature as any).type || "");
            if (t === "EDGE" || t === "DxfSketch") continue;
            const h = tryGetNumber(feature as Feature, "height");
            if (h != null) consider(h);
            try {
                const info = (feature as any).manufacturingInfo;
                if (info && info.depth != null) consider(info.depth);
            } catch (_err) {
                // optional
            }
        }
    }
    return maxUm;
}

/** Substrate / enclosure depth in DXF mm: deepest component + 1 mm margin. */
export function computeSubstrateDepthMm(device: Device): number {
    return computeMaxComponentDepthUm(device) * UM_TO_MM + 1;
}

function exportRectAtZ(
    widthUm: number,
    heightUm: number,
    zMm: number,
    layerName: string
): string {
    const corners: Array<[number, number]> = [
        [0, 0],
        [widthUm, 0],
        [widthUm, heightUm],
        [0, heightUm],
        [0, 0]
    ];
    let out = "";
    for (let i = 0; i < corners.length - 1; i++) {
        const a = canvasUmToDxfMm(corners[i][0], corners[i][1], heightUm);
        const b = canvasUmToDxfMm(corners[i + 1][0], corners[i + 1][1], heightUm);
        out += writeLine(
            {
                type: "LINE",
                vertices: [
                    { x: a.x, y: a.y, z: zMm },
                    { x: b.x, y: b.y, z: zMm }
                ]
            },
            layerName
        );
    }
    return out;
}

/**
 * Emit a device-outline box from device spans (canvas µm → DXF mm).
 * XY footprint at z=0 plus top face at substrate depth = max(component height)+1mm,
 * with vertical edges — a rectangular enclosure for CAD detailing.
 */
function exportDeviceBorderEntities(device: Device, layerName: string): string {
    const widthUm = device.getXSpan();
    const heightUm = device.getYSpan();
    if (!Number.isFinite(widthUm) || !Number.isFinite(heightUm) || widthUm <= 0 || heightUm <= 0) {
        return "";
    }
    const depthMm = computeSubstrateDepthMm(device);
    const borderLayer = layerName + "_border";
    let out = exportRectAtZ(widthUm, heightUm, 0, borderLayer);
    out += exportRectAtZ(widthUm, heightUm, depthMm, borderLayer);

    // Vertical edges of the enclosure box
    const cornersUm: Array<[number, number]> = [
        [0, 0],
        [widthUm, 0],
        [widthUm, heightUm],
        [0, heightUm]
    ];
    for (const [xUm, yUm] of cornersUm) {
        const p = canvasUmToDxfMm(xUm, yUm, heightUm);
        out += writeLine(
            {
                type: "LINE",
                vertices: [
                    { x: p.x, y: p.y, z: 0 },
                    { x: p.x, y: p.y, z: depthMm }
                ]
            },
            borderLayer
        );
    }
    return out;
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

function tryGetNumber(feature: Feature, key: string): number | null {
    try {
        const value = Number(feature.getValue(key));
        return Number.isFinite(value) ? value : null;
    } catch (_err) {
        return null;
    }
}

/** Normalize [x,y] or ["Point", x, y] canvas coordinates. */
function asUmPoint(value: unknown): [number, number] | null {
    if (!Array.isArray(value) || value.length < 2) {
        return null;
    }
    if (value.length >= 3 && value[0] === "Point") {
        const x = Number(value[1]);
        const y = Number(value[2]);
        return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
    }
    const x = Number(value[0]);
    const y = Number(value[1]);
    return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
}

/**
 * Export one channel segment as two parallel wall lines spaced by channelWidth.
 * Matches typical manufacturing DXF (and the original inlet-channel-outlet sketch):
 * width is the gap between walls — not a closed rectangle that import can mistake for the device border.
 */
function exportChannelSegmentOutline(
    p1: [number, number],
    p2: [number, number],
    channelWidthUm: number,
    deviceHeightUm: number,
    layer: string,
    z: number
): string {
    if (!(channelWidthUm > 0)) {
        return "";
    }
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) {
        return "";
    }
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const half = channelWidthUm / 2;
    const wallA1: [number, number] = [p1[0] - px * half, p1[1] - py * half];
    const wallA2: [number, number] = [p2[0] - px * half, p2[1] - py * half];
    const wallB1: [number, number] = [p1[0] + px * half, p1[1] + py * half];
    const wallB2: [number, number] = [p2[0] + px * half, p2[1] + py * half];

    const a1 = canvasUmToDxfMm(wallA1[0], wallA1[1], deviceHeightUm);
    const a2 = canvasUmToDxfMm(wallA2[0], wallA2[1], deviceHeightUm);
    const b1 = canvasUmToDxfMm(wallB1[0], wallB1[1], deviceHeightUm);
    const b2 = canvasUmToDxfMm(wallB2[0], wallB2[1], deviceHeightUm);

    let out = "";
    out += writeLine(
        {
            type: "LINE",
            vertices: [
                { x: a1.x, y: a1.y, z },
                { x: a2.x, y: a2.y, z }
            ]
        },
        layer
    );
    out += writeLine(
        {
            type: "LINE",
            vertices: [
                { x: b1.x, y: b1.y, z },
                { x: b2.x, y: b2.y, z }
            ]
        },
        layer
    );
    return out;
}

function isStructuredDesignFeature(type: string): boolean {
    return (
        type === "Port" ||
        type === "Connection" ||
        type === "Channel" ||
        type === "RoundedChannel" ||
        type === "RoundedChannelConnection" ||
        type === "BetterMixer" ||
        type === "Mixer" ||
        type === "CurvedMixer" ||
        type === "Valve3D" ||
        type === "Valve3D_control" ||
        type === "CircleValve" ||
        type === "Valve"
    );
}

function layerHasStructuredFeatures(layer: Layer): boolean {
    for (const key in layer.features) {
        if (isStructuredDesignFeature(layer.features[key].getType())) {
            return true;
        }
    }
    return false;
}

function exportFeatureEntities(
    feature: Feature,
    layerName: string,
    deviceHeightUm: number,
    includeRawDxfObjects: boolean
): string {
    const type = feature.getType();
    let entities = "";

    // Device outline is always synthesized from getXSpan()/getYSpan() below.
    // Skip EDGE (imported coords may not match canvas-space features) and skip
    // stale DxfSketch payloads when structured features exist.
    if (type === "EDGE") {
        return entities;
    }
    if (type === "DxfSketch") {
        if (!includeRawDxfObjects) {
            return entities;
        }
        for (const dxfObj of feature.dxfObjects) {
            entities += writeEntity(dxfObjectToEntity(dxfObj), layerName);
        }
        return entities;
    }

    if (type === "Port" || type === "Valve3D" || type === "Valve3D_control" || type === "CircleValve" || type === "Valve") {
        let position: [number, number] | null = null;
        try {
            position = feature.getValue("position") as [number, number];
        } catch (_err) {
            return entities;
        }
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

    if (type === "Connection" || type === "Channel" || type === "RoundedChannel" || type === "RoundedChannelConnection") {
        const channelWidthUm = tryGetNumber(feature, "channelWidth");
        if (channelWidthUm == null || !(channelWidthUm > 0)) {
            return entities;
        }
        const z = 0;
        const channelLayer = layerName + "_channels";

        let segments: Array<[[number, number], [number, number]]> = [];
        if (type === "Connection" || type === "RoundedChannelConnection") {
            try {
                const raw = feature.getValue("segments") as Array<[[number, number], [number, number]]>;
                if (Array.isArray(raw)) {
                    segments = raw;
                }
            } catch (_err) {
                // Fall through to start/end if segments are missing.
            }
            if (!segments.length) {
                try {
                    const start = asUmPoint(feature.getValue("start"));
                    const end = asUmPoint(feature.getValue("end"));
                    if (start && end) {
                        segments = [[start, end]];
                    }
                } catch (_err) {
                    return entities;
                }
            }
        } else {
            let start: [number, number] | null = null;
            let end: [number, number] | null = null;
            try {
                start = asUmPoint(feature.getValue("start"));
                end = asUmPoint(feature.getValue("end"));
            } catch (_err) {
                return entities;
            }
            if (start && end) {
                segments = [[start, end]];
            }
        }

        for (const seg of segments) {
            if (!seg || seg.length < 2) continue;
            const p1 = asUmPoint(seg[0]);
            const p2 = asUmPoint(seg[1]);
            if (!p1 || !p2) continue;
            entities += exportChannelSegmentOutline(p1, p2, channelWidthUm, deviceHeightUm, channelLayer, z);
        }
        return entities;
    }

    if (type === "BetterMixer" || type === "Mixer" || type === "CurvedMixer") {
        try {
            const position = feature.getValue("position") as [number, number];
            const channelWidth = Number(feature.getValue("channelWidth"));
            const bendLength = Number(feature.getValue("bendLength"));
            const bendSpacing = Number(feature.getValue("bendSpacing"));
            const numberOfBends = Number(feature.getValue("numberOfBends"));
            let edgeBend1: number | undefined;
            let edgeBend2: number | undefined;
            try {
                const e1 = Number(feature.getValue("edgeBend1"));
                const e2 = Number(feature.getValue("edgeBend2"));
                if (Number.isFinite(e1)) edgeBend1 = e1;
                if (Number.isFinite(e2)) edgeBend2 = e2;
            } catch (_edgeErr) {
                // Older mixer JSON omits end-bend lengths.
            }
            if (!Array.isArray(position) || !Number.isFinite(channelWidth) || !(channelWidth > 0)) {
                return entities;
            }
            const segments = betterMixerCenterlineSegments({
                position,
                channelWidth,
                bendLength: Number.isFinite(bendLength) ? bendLength : 2460,
                bendSpacing: Number.isFinite(bendSpacing) ? bendSpacing : 1230,
                numberOfBends: Number.isFinite(numberOfBends) ? numberOfBends : 1,
                edgeBend1,
                edgeBend2
            });
            for (const seg of segments) {
                entities += exportChannelSegmentOutline(
                    seg[0],
                    seg[1],
                    channelWidth,
                    deviceHeightUm,
                    layerName + "_mixer",
                    0
                );
            }
        } catch (_err) {
            // Missing params — skip.
        }
    }

    return entities;
}

function exportLayerEntities(device: Device, layer: Layer, portsOnly = false): string {
    const deviceHeightUm = device.getYSpan();
    const layerName = layer.name || layer.type || "LAYER";
    const includeRawDxfObjects = !portsOnly && !layerHasStructuredFeatures(layer);
    let entities = "";
    const features = layer.features;
    for (const key in features) {
        try {
            const feature = features[key];
            if (portsOnly && feature.getType() !== "Port") {
                continue;
            }
            entities += exportFeatureEntities(feature, layerName, deviceHeightUm, includeRawDxfObjects);
        } catch (err) {
            // Skip a single bad feature instead of aborting the whole download.
            console.warn("[DXF export] Skipping feature", key, err);
        }
    }
    // Always write the device border from current spans so CAD extents match the
    // canvas device size (JSON params.width/length), even when EDGE is skipped.
    entities += exportDeviceBorderEntities(device, layerName);
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
 * True when the device has control-layer manufacturing content
 * (features on CONTROL, valves, or CONTROL-placed components).
 * Empty CONTROL tabs on flow-only designs do NOT count.
 */
export function isMultilayerBiochip(device: Device): boolean {
    if (!device || !Array.isArray(device.layers)) {
        return false;
    }
    for (const layer of device.layers) {
        if (layer.type !== LogicalLayerType.CONTROL) {
            continue;
        }
        if (Object.keys(layer.features || {}).length > 0) {
            return true;
        }
    }
    try {
        const valves = (device as any).valves;
        if (Array.isArray(valves) && valves.length > 0) {
            return true;
        }
    } catch (_err) {
        // optional
    }
    for (const component of device.components || []) {
        const layers = (component as any).layers;
        if (!Array.isArray(layers) || !layers.length) continue;
        for (const layerRef of layers) {
            const id = typeof layerRef === "string" ? layerRef : layerRef?.id;
            const layer = device.layers.find(l => l.id === id);
            if (layer && layer.type === LogicalLayerType.CONTROL) {
                return true;
            }
        }
        const mint = String((component as any).mint || (component as any).entity || "").toUpperCase();
        if (mint.includes("VALVE")) {
            return true;
        }
    }
    return false;
}

/**
 * Export FLOW/CONTROL layers as separate DXF files from the current canvas
 * features (not the original uploaded DXF payload).
 * Multilayer devices get one file per layer with suffixes _flowN / _ctrlN.
 */
export function generateDeviceDxfFiles(device: Device, options: DxfExportOptions = {}): DxfExportFile[] {
    if (!device) {
        throw new Error("No device loaded");
    }
    if (!Array.isArray(device.layers)) {
        throw new Error("Device has no layers to export");
    }
    const portsOnly = Boolean(options.portsOnly);
    // Prefer layers that actually have geometry. Empty CONTROL tabs on
    // flow-only designs should not force a zip of blank files.
    let exportLayers = device.layers.filter(layer => {
        if (layer.type !== LogicalLayerType.FLOW && layer.type !== LogicalLayerType.CONTROL) {
            return false;
        }
        if (portsOnly) {
            for (const key in layer.features || {}) {
                if (layer.features[key].getType() === "Port") {
                    return true;
                }
            }
            return false;
        }
        return Object.keys(layer.features || {}).length > 0;
    });

    // If every FLOW/CONTROL layer is empty, still emit one placeholder DXF.
    if (exportLayers.length === 0) {
        exportLayers = device.layers
            .filter(layer => layer.type === LogicalLayerType.FLOW || layer.type === LogicalLayerType.CONTROL)
            .slice(0, 1);
    }

    if (exportLayers.length === 0) {
        const filename = `${device.name}.dxf`;
        return [
            {
                filename: portsOnly ? withPortsFilename(filename) : filename,
                content: wrapEntities(emptyPlaceholderEntities(device))
            }
        ];
    }

    if (exportLayers.length === 1) {
        const filename = `${device.name}.dxf`;
        return [
            {
                filename: portsOnly ? withPortsFilename(filename) : filename,
                content: wrapEntities(exportLayerEntities(device, exportLayers[0], portsOnly))
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
        const filename = `${device.name}${suffix}.dxf`;
        files.push({
            filename: portsOnly ? withPortsFilename(filename) : filename,
            content: wrapEntities(exportLayerEntities(device, layer, portsOnly))
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
