import Device from "../core/device";
import Feature from "../core/feature";
import Layer from "../core/layer";
import { LogicalLayerType } from "../core/init";
import { DEFAULT_CHANNEL_WIDTH_UM, mixerEndLayout } from "../library/channelWidths";

const UM_TO_MM = 0.001;

export type GCodeExportFile = {
    filename: string;
    content: string;
};

type Pt = { x: number; y: number };
type SegUm = [[number, number], [number, number]];

function cleanNum(value: number, decimals = 3): string {
    const rounded = value.toFixed(decimals);
    return rounded === "-0." + "0".repeat(decimals) ? "0." + "0".repeat(decimals) : rounded;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function umToMmPoint(xUm: number, yUm: number, deviceHeightUm: number): Pt {
    // Canvas Y grows downward; CAM Y grows upward (match DXF export convention).
    return { x: xUm * UM_TO_MM, y: (deviceHeightUm - yUm) * UM_TO_MM };
}

function tryGetNumber(feature: Feature, key: string): number | null {
    try {
        const value = Number(feature.getValue(key));
        return Number.isFinite(value) ? value : null;
    } catch (_err) {
        return null;
    }
}

function pickChannelToolMm(channelWidthUm: number): number {
    const widthMm = channelWidthUm * UM_TO_MM;
    // Match Data/gcode reference naming: prefer 0.100mm end mills for typical
    // ~0.8mm channels; step up only when the channel is wide enough.
    if (widthMm >= 1.2) return 0.25;
    if (widthMm >= 1.0) return 0.15;
    if (widthMm >= 0.6) return 0.1;
    if (widthMm >= 0.4) return 0.075;
    return 0.075;
}

/** Extra channel tool sizes to emit (like reference folders with 100/125/150). */
function channelToolVariantsMm(channelWidthUm: number): number[] {
    const primary = pickChannelToolMm(channelWidthUm);
    const widthMm = channelWidthUm * UM_TO_MM;
    const variants = [primary];
    for (const d of [0.075, 0.1, 0.125, 0.15]) {
        if (d < widthMm * 0.6 && !variants.includes(d)) {
            variants.push(d);
        }
    }
    return variants.sort((a, b) => a - b);
}

function pickPortToolLabel(portRadiusUm: number): { label: string; diameterMm: number } {
    const diameterMm = 2 * portRadiusUm * UM_TO_MM;
    // Prefer 1/32" (~0.792mm) when the port is large enough; else 0.25mm.
    if (diameterMm >= 0.9) {
        return { label: "1-32", diameterMm: 0.792 };
    }
    if (diameterMm >= 0.4) {
        return { label: "250", diameterMm: 0.25 };
    }
    return { label: "125", diameterMm: 0.125 };
}

function toolFilePrefix(diameterMm: number): string {
    if (Math.abs(diameterMm - 0.792) < 1e-6) return "1-32";
    if (Math.abs(diameterMm - 3.175) < 1e-6) return "1-8";
    const um = Math.round(diameterMm * 1000);
    return String(um);
}

function fusionHeader(programName: string, toolDiameterMm: number, zMin: number, spindle = 16000): string[] {
    return [
        `(${programName})`,
        `(T1 D=${cleanNum(toolDiameterMm, 3)} CR=0. - ZMIN=${cleanNum(zMin, 2)} - FLAT END MILL)`,
        "G0 G90 G94 G17",
        "G21",
        "M5",
        "G53 G0 Z0.",
        "",
        `(${programName})`,
        "T1",
        `M3 S${spindle}`,
        "G90 G94 G17",
        "G55",
        "M8"
    ];
}

function fusionFooter(): string[] {
    return ["M9", "M5", "G53 G0 Z0.", "M30"];
}

function emitPolyline(
    lines: string[],
    points: Pt[],
    zCut: number,
    opts: { safeZ?: number; approachZ?: number; plungeF?: number; cutF?: number; measure?: boolean } = {}
): void {
    if (points.length < 2) return;
    const safeZ = opts.safeZ ?? 1.5;
    const approachZ = opts.approachZ ?? 0.5;
    const plungeF = opts.plungeF ?? 16;
    const cutF = opts.cutF ?? 210;
    lines.push(`G0 X${cleanNum(points[0].x, 3)} Y${cleanNum(points[0].y, 3)}`);
    lines.push(`Z${cleanNum(safeZ, 1)}`);
    lines.push(`G0 Z${cleanNum(approachZ, 1)}`);
    lines.push(`G1 Z${cleanNum(zCut, 2)} F${plungeF}.`);
    for (let i = 1; i < points.length; i++) {
        lines.push(`X${cleanNum(points[i].x, 3)} Y${cleanNum(points[i].y, 3)} F${cutF}.`);
    }
    if (opts.measure) {
        // Short reverse stroke used by reference "measure" programs.
        lines.push(`X${cleanNum(points[0].x, 3)} Y${cleanNum(points[0].y, 3)} F${cutF}.`);
    }
    lines.push(`G0 Z${cleanNum(approachZ, 1)}`);
}

function circlePoints(cx: number, cy: number, radius: number, segments = 36): Pt[] {
    const pts: Pt[] = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return pts;
}

/** Centerline segments for BetterMixer serpentine (device um). */
export function betterMixerCenterlineSegments(params: {
    position: [number, number];
    channelWidth: number;
    bendLength: number;
    bendSpacing: number;
    numberOfBends: number;
    edgeBend1?: number;
    edgeBend2?: number;
}): SegUm[] {
    const cw = params.channelWidth;
    const bl = params.bendLength;
    const bs = params.bendSpacing;
    const n = Math.max(1, Math.round(params.numberOfBends));
    const [x, y] = params.position;
    const layout = mixerEndLayout(params);
    const segLength = bl + 2 * cw;
    const segBend = bs + 2 * cw;
    const vRepeat = 2 * bs + 2 * cw;
    const vOffset = bs + cw;
    const segs: SegUm[] = [];

    const y0 = y + cw / 2;
    segs.push([
        [x, y0],
        [x + layout.firstWidth, y0]
    ]);

    for (let i = 0; i < n; i++) {
        const yBase = y + vRepeat * i;
        segs.push([
            [x + cw / 2, yBase + cw],
            [x + cw / 2, yBase + segBend]
        ]);
        const yh = y + vOffset + vRepeat * i + cw / 2;
        segs.push([
            [x + cw / 2, yh],
            [x + segLength - cw / 2, yh]
        ]);
        const xr = x + cw + bl + cw / 2;
        segs.push([
            [xr, yh],
            [xr, y + vOffset + vRepeat * i + segBend - cw / 2]
        ]);
        const yf = y + vRepeat * (i + 1) + cw / 2;
        if (i === n - 1) {
            segs.push([
                [xr, yf],
                [x + layout.lastStart, yf]
            ]);
        } else {
            segs.push([
                [xr, yf],
                [x + cw / 2, yf]
            ]);
        }
    }
    return segs;
}

function collectPortFeatures(
    device: Device
): Array<{ xUm: number; yUm: number; radiusUm: number; heightUm: number }> {
    const ports: Array<{ xUm: number; yUm: number; radiusUm: number; heightUm: number }> = [];
    for (const layer of device.layers) {
        if (layer.type !== LogicalLayerType.FLOW && layer.type !== LogicalLayerType.CONTROL) {
            continue;
        }
        for (const key in layer.features) {
            const feature = layer.features[key];
            if (feature.getType() !== "Port") {
                continue;
            }
            try {
                const position = feature.getValue("position") as [number, number];
                const radiusUm = tryGetNumber(feature, "portRadius");
                const heightUm = tryGetNumber(feature, "height") ?? 1100;
                if (Array.isArray(position) && radiusUm != null && radiusUm > 0) {
                    ports.push({ xUm: position[0], yUm: position[1], radiusUm, heightUm });
                }
            } catch (_err) {
                // Skip a port with missing geometry.
            }
        }
    }
    return ports;
}

function buildPortOnlyFiles(device: Device): GCodeExportFile[] {
    const ports = collectPortFeatures(device);
    const deviceHeightUm = device.getYSpan();
    const files: GCodeExportFile[] = [];
    if (ports.length) {
        const maxRadius = Math.max(...ports.map(p => p.radiusUm));
        const tool = pickPortToolLabel(maxRadius);
        files.push({
            filename: `${tool.label}_ports.gcode`,
            content: buildPortProgram(deviceHeightUm, ports, tool, false)
        });
        files.push({
            filename: `${tool.label}_MEASURE_ports.gcode`,
            content: buildPortProgram(deviceHeightUm, ports, tool, true)
        });
    }
    if (!files.length) {
        files.push({
            filename: `${device.name || "device"}_ports_empty.gcode`,
            content:
                fusionHeader("EMPTY_PORTS", 0.125, -0.01).join("\r\n") +
                "\r\n" +
                fusionFooter().join("\r\n") +
                "\r\n"
        });
    }
    return files;
}

function collectFlowFeatures(device: Device): {
    channels: Array<{ segments: SegUm[]; heightUm: number; channelWidthUm: number; label: string }>;
    ports: Array<{ xUm: number; yUm: number; radiusUm: number; heightUm: number }>;
} {
    const channels: Array<{ segments: SegUm[]; heightUm: number; channelWidthUm: number; label: string }> = [];
    const ports: Array<{ xUm: number; yUm: number; radiusUm: number; heightUm: number }> = [];

    for (const layer of device.layers) {
        if (layer.type !== LogicalLayerType.FLOW) continue;
        for (const key in layer.features) {
            const feature = layer.features[key];
            const type = feature.getType();
            if (type === "Port") {
                const position = feature.getValue("position") as [number, number];
                const radiusUm = tryGetNumber(feature, "portRadius");
                const heightUm = tryGetNumber(feature, "height") ?? 1100;
                if (Array.isArray(position) && radiusUm != null && radiusUm > 0) {
                    ports.push({ xUm: position[0], yUm: position[1], radiusUm, heightUm });
                }
            } else if (type === "Connection") {
                const segments = feature.getValue("segments") as SegUm[];
                const heightUm = tryGetNumber(feature, "height") ?? 250;
                const channelWidthUm = tryGetNumber(feature, "channelWidth") ?? DEFAULT_CHANNEL_WIDTH_UM;
                if (Array.isArray(segments) && segments.length) {
                    channels.push({ segments, heightUm, channelWidthUm, label: "channel" });
                }
            } else if (type === "BetterMixer" || type === "Mixer" || type === "CurvedMixer") {
                const position = feature.getValue("position") as [number, number];
                const channelWidth = tryGetNumber(feature, "channelWidth") ?? DEFAULT_CHANNEL_WIDTH_UM;
                const bendLength = tryGetNumber(feature, "bendLength") ?? 2460;
                const bendSpacing = tryGetNumber(feature, "bendSpacing") ?? 1230;
                const numberOfBends = tryGetNumber(feature, "numberOfBends") ?? 1;
                const heightUm = tryGetNumber(feature, "height") ?? 250;
                const edgeBend1 = tryGetNumber(feature, "edgeBend1") ?? undefined;
                const edgeBend2 = tryGetNumber(feature, "edgeBend2") ?? undefined;
                if (Array.isArray(position)) {
                    channels.push({
                        segments: betterMixerCenterlineSegments({
                            position,
                            channelWidth,
                            bendLength,
                            bendSpacing,
                            numberOfBends,
                            edgeBend1,
                            edgeBend2
                        }),
                        heightUm,
                        channelWidthUm: channelWidth,
                        label: "mixer"
                    });
                }
            }
        }
    }
    return { channels, ports };
}

function buildChannelProgram(
    deviceName: string,
    deviceHeightUm: number,
    channels: Array<{ segments: SegUm[]; heightUm: number; channelWidthUm: number; label: string }>,
    toolMm: number,
    measure: boolean
): string {
    const depthMm = Math.max(...channels.map(c => c.heightUm * UM_TO_MM), 0.1);
    const zCut = measure ? -0.01 : -Math.min(depthMm, toolMm);
    const label = channels[0]?.label || "channel";
    const prefix = toolFilePrefix(toolMm);
    const programName = measure
        ? `${prefix}_MEASURE_${label}`.toUpperCase().replace(/[^A-Z0-9_]/g, "_")
        : `${prefix}UM_${label}`.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const lines = fusionHeader(programName, toolMm, zCut);
    for (const ch of channels) {
        for (const seg of ch.segments) {
            if (!seg || seg.length < 2) continue;
            const a = seg[0];
            const b = seg[1];
            if (!Array.isArray(a) || !Array.isArray(b)) continue;
            if (!isFiniteNumber(a[0]) || !isFiniteNumber(a[1]) || !isFiniteNumber(b[0]) || !isFiniteNumber(b[1])) continue;
            if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1) continue;
            const p1 = umToMmPoint(a[0], a[1], deviceHeightUm);
            const p2 = umToMmPoint(b[0], b[1], deviceHeightUm);
            emitPolyline(lines, [p1, p2], zCut, {
                measure,
                plungeF: measure ? 4 : 16,
                cutF: measure ? 128 : 210,
                safeZ: measure ? 1.2 : 1.5,
                approachZ: measure ? 0.2 : 0.5
            });
        }
    }
    lines.push(`G0 Z${measure ? "1.2" : "1.5"}`);
    lines.push(...fusionFooter());
    return lines.join("\r\n") + "\r\n";
}

function buildPortProgram(
    deviceHeightUm: number,
    ports: Array<{ xUm: number; yUm: number; radiusUm: number; heightUm: number }>,
    tool: { label: string; diameterMm: number },
    measure: boolean
): string {
    const depthMm = Math.max(...ports.map(p => p.heightUm * UM_TO_MM), 0.5);
    const zCut = measure ? -0.01 : -Math.min(depthMm, 2.9);
    const programName = measure
        ? `${tool.label}_MEASURE_PORTS`.toUpperCase().replace(/[^A-Z0-9_]/g, "_")
        : `${tool.label}_PORTS`.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const lines = fusionHeader(programName, tool.diameterMm, zCut, 16500);
    for (const port of ports) {
        const c = umToMmPoint(port.xUm, port.yUm, deviceHeightUm);
        // Leave ~toolRadius stock; mill at (radius - tool/2).
        const r = Math.max(port.radiusUm * UM_TO_MM - tool.diameterMm / 2, tool.diameterMm / 2);
        const pts = circlePoints(c.x, c.y, r);
        emitPolyline(lines, pts, zCut, {
            measure,
            plungeF: measure ? 16 : 356,
            cutF: measure ? 300 : 210,
            safeZ: measure ? 1.5 : 17,
            approachZ: measure ? 0.5 : 5.921
        });
    }
    lines.push(`G0 Z${measure ? "1.5" : "17"}`);
    lines.push(...fusionFooter());
    return lines.join("\r\n") + "\r\n";
}

/**
 * Generate Fusion-style GCode files for flow-only devices.
 * Multiple files cover channel/mixer milling and port milling at tool sizes
 * matched to feature dimensions (plus shallow measure passes).
 */
export type GCodeExportOptions = {
    /** Cover-layer export: mill only FLOW/CONTROL port holes. */
    portsOnly?: boolean;
};

export function generateFlowGCodeFiles(device: Device, options: GCodeExportOptions = {}): GCodeExportFile[] {
    if (options.portsOnly) {
        return buildPortOnlyFiles(device);
    }
    const { channels, ports } = collectFlowFeatures(device);
    const deviceHeightUm = device.getYSpan();
    const files: GCodeExportFile[] = [];

    if (channels.length) {
        const widthUm = Math.min(...channels.map(c => c.channelWidthUm));
        const label = channels.every(c => c.label === "mixer")
            ? "mixer"
            : channels.some(c => c.label === "mixer")
            ? "channel_mixer"
            : "channel";
        for (const toolMm of channelToolVariantsMm(widthUm)) {
            const prefix = toolFilePrefix(toolMm);
            files.push({
                filename: `${prefix}um_${label}.gcode`,
                content: buildChannelProgram(device.name, deviceHeightUm, channels, toolMm, false)
            });
            files.push({
                filename: `${prefix}_measure_${label}.gcode`,
                content: buildChannelProgram(device.name, deviceHeightUm, channels, toolMm, true)
            });
        }
    }

    if (ports.length) {
        const maxRadius = Math.max(...ports.map(p => p.radiusUm));
        const tool = pickPortToolLabel(maxRadius);
        files.push({
            filename: `${tool.label}_ports.gcode`,
            content: buildPortProgram(deviceHeightUm, ports, tool, false)
        });
        files.push({
            filename: `${tool.label}_MEASURE_ports.gcode`,
            content: buildPortProgram(deviceHeightUm, ports, tool, true)
        });
    }

    if (!files.length) {
        files.push({
            filename: `${device.name || "device"}_empty.gcode`,
            content:
                fusionHeader("EMPTY", 0.125, -0.01).join("\r\n") +
                "\r\n" +
                fusionFooter().join("\r\n") +
                "\r\n"
        });
    }

    return files;
}

/** Single combined Fusion-style program (channels then ports). */
export function generateFlowFusionGCode(device: Device): string {
    const files = generateFlowGCodeFiles(device);
    if (files.length === 1) return files[0].content;
    // Prefer the primary channel/mixer mill file when multiple exist.
    const mill = files.find(f => /um_/.test(f.filename) && !/measure/i.test(f.filename));
    return (mill || files[0]).content;
}
