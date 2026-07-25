/**
 * Generate example Fusion-style GCode folders for Data/JSON/channel.json and mixer.json.
 * Output: Data/gcode/channel/ and Data/gcode/mixer/
 *
 * Run: node scripts/generate-flow-gcode-examples.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const JSON_DIR = path.join(ROOT, "Data", "JSON");
const OUT_DIR = path.join(ROOT, "Data", "gcode");
const UM_TO_MM = 0.001;

function cleanNum(value, decimals = 3) {
    const rounded = value.toFixed(decimals);
    return rounded === "-0." + "0".repeat(decimals) ? "0." + "0".repeat(decimals) : rounded;
}

function umToMmPoint(xUm, yUm, deviceHeightUm) {
    return { x: xUm * UM_TO_MM, y: (deviceHeightUm - yUm) * UM_TO_MM };
}

function fusionHeader(programName, toolDiameterMm, zMin, spindle = 16000) {
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

function fusionFooter() {
    return ["M9", "M5", "G53 G0 Z0.", "M30"];
}

function emitPolyline(lines, points, zCut, opts = {}) {
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
        lines.push(`X${cleanNum(points[0].x, 3)} Y${cleanNum(points[0].y, 3)} F${cutF}.`);
    }
    lines.push(`G0 Z${cleanNum(approachZ, 1)}`);
}

function circlePoints(cx, cy, radius, segments = 36) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return pts;
}

function betterMixerCenterlineSegments(params) {
    const cw = params.channelWidth;
    const bl = params.bendLength;
    const bs = params.bendSpacing;
    const n = Math.max(1, Math.round(params.numberOfBends));
    const [x, y] = params.position;
    const segHalf = bl / 2 + cw;
    const segLength = bl + 2 * cw;
    const segBend = bs + 2 * cw;
    const vRepeat = 2 * bs + 2 * cw;
    const vOffset = bs + cw;
    const hOffset = bl / 2 + cw / 2;
    const segs = [];
    const y0 = y + cw / 2;
    segs.push([[x, y0], [x + segHalf + cw / 2, y0]]);
    for (let i = 0; i < n; i++) {
        const yBase = y + vRepeat * i;
        segs.push([[x + cw / 2, yBase + cw], [x + cw / 2, yBase + segBend]]);
        const yh = y + vOffset + vRepeat * i + cw / 2;
        segs.push([[x + cw / 2, yh], [x + segLength - cw / 2, yh]]);
        const xr = x + cw + bl + cw / 2;
        segs.push([[xr, yh], [xr, y + vOffset + vRepeat * i + segBend - cw / 2]]);
        const yf = y + vRepeat * (i + 1) + cw / 2;
        if (i === n - 1) segs.push([[xr, yf], [x + hOffset, yf]]);
        else segs.push([[xr, yf], [x + cw / 2, yf]]);
    }
    return segs;
}

function pickChannelToolMm(channelWidthUm) {
    const widthMm = channelWidthUm * UM_TO_MM;
    if (widthMm >= 1.2) return 0.25;
    if (widthMm >= 1.0) return 0.15;
    if (widthMm >= 0.6) return 0.1;
    if (widthMm >= 0.4) return 0.075;
    return 0.075;
}

function channelToolVariantsMm(channelWidthUm) {
    const primary = pickChannelToolMm(channelWidthUm);
    const widthMm = channelWidthUm * UM_TO_MM;
    const variants = [primary];
    for (const d of [0.075, 0.1, 0.125, 0.15]) {
        if (d < widthMm * 0.6 && !variants.includes(d)) variants.push(d);
    }
    return variants.sort((a, b) => a - b);
}

function toolFilePrefix(diameterMm) {
    if (Math.abs(diameterMm - 0.792) < 1e-6) return "1-32";
    return String(Math.round(diameterMm * 1000));
}

function collectFromJson(json) {
    const heightUm = json.params.length || json.params["y-span"] || 85000;
    const channels = [];
    const ports = [];

    const walkFeatures = features => {
        for (const f of features || []) {
            const macro = f.macro;
            const p = f.params || {};
            if (macro === "Port") {
                ports.push({
                    xUm: p.position[0],
                    yUm: p.position[1],
                    radiusUm: p.portRadius,
                    heightUm: p.height || 1100
                });
            } else if (macro === "Connection") {
                channels.push({
                    segments: p.segments || [],
                    heightUm: p.height || 250,
                    channelWidthUm: p.channelWidth || 800,
                    label: "channel"
                });
            } else if (macro === "BetterMixer" || macro === "Mixer" || macro === "CurvedMixer") {
                channels.push({
                    segments: betterMixerCenterlineSegments({
                        position: p.position,
                        channelWidth: p.channelWidth || 800,
                        bendLength: p.bendLength || 2460,
                        bendSpacing: p.bendSpacing || 1230,
                        numberOfBends: p.numberOfBends || 1
                    }),
                    heightUm: p.height || 250,
                    channelWidthUm: p.channelWidth || 800,
                    label: "mixer"
                });
            }
        }
    };

    for (const layer of json.layers || []) {
        if (layer.type === "FLOW") walkFeatures(layer.features);
    }
    for (const rl of json.renderLayers || []) {
        if (rl.type === "FLOW" && channels.length === 0 && ports.length === 0) {
            walkFeatures(rl.features);
        }
    }
    return { heightUm, channels, ports, name: json.name };
}

function buildChannelProgram(heightUm, channels, toolMm, measure) {
    const depthMm = Math.max(...channels.map(c => c.heightUm * UM_TO_MM), 0.1);
    const zCut = measure ? -0.01 : -Math.min(depthMm, toolMm);
    const label = channels[0].label;
    const prefix = toolFilePrefix(toolMm);
    const programName = (measure ? `${prefix}_MEASURE_${label}` : `${prefix}UM_${label}`)
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_");
    const lines = fusionHeader(programName, toolMm, zCut);
    for (const ch of channels) {
        for (const seg of ch.segments || []) {
            if (!seg || seg.length < 2) continue;
            const a = seg[0];
            const b = seg[1];
            if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1) continue;
            emitPolyline(lines, [umToMmPoint(a[0], a[1], heightUm), umToMmPoint(b[0], b[1], heightUm)], zCut, {
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

function buildPortProgram(heightUm, ports, tool, measure) {
    const depthMm = Math.max(...ports.map(p => p.heightUm * UM_TO_MM), 0.5);
    const zCut = measure ? -0.01 : -Math.min(depthMm, 2.9);
    const programName = (measure ? `${tool.label}_MEASURE_PORTS` : `${tool.label}_PORTS`)
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_");
    const lines = fusionHeader(programName, tool.diameterMm, zCut, 16500);
    for (const port of ports) {
        const c = umToMmPoint(port.xUm, port.yUm, heightUm);
        const r = Math.max(port.radiusUm * UM_TO_MM - tool.diameterMm / 2, tool.diameterMm / 2);
        emitPolyline(lines, circlePoints(c.x, c.y, r), zCut, {
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

function generateFiles(device) {
    const files = [];
    if (device.channels.length) {
        const widthUm = Math.min(...device.channels.map(c => c.channelWidthUm));
        const label = device.channels.every(c => c.label === "mixer") ? "mixer" : "channel";
        for (const toolMm of channelToolVariantsMm(widthUm)) {
            const prefix = toolFilePrefix(toolMm);
            files.push({
                filename: `${prefix}um_${label}.gcode`,
                content: buildChannelProgram(device.heightUm, device.channels, toolMm, false)
            });
            files.push({
                filename: `${prefix}_measure_${label}.gcode`,
                content: buildChannelProgram(device.heightUm, device.channels, toolMm, true)
            });
        }
    }
    if (device.ports.length) {
        const maxRadius = Math.max(...device.ports.map(p => p.radiusUm));
        const portDiaMm = 2 * maxRadius * UM_TO_MM;
        const tool =
            portDiaMm >= 0.9
                ? { label: "1-32", diameterMm: 0.792 }
                : { label: "250", diameterMm: 0.25 };
        files.push({
            filename: `${tool.label}_ports.gcode`,
            content: buildPortProgram(device.heightUm, device.ports, tool, false)
        });
        files.push({
            filename: `${tool.label}_MEASURE_ports.gcode`,
            content: buildPortProgram(device.heightUm, device.ports, tool, true)
        });
    }
    return files;
}

function writeDevice(jsonName) {
    const jsonPath = path.join(JSON_DIR, jsonName);
    const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const device = collectFromJson(json);
    const outFolder = path.join(OUT_DIR, device.name);
    fs.mkdirSync(outFolder, { recursive: true });
    const files = generateFiles(device);
    for (const f of files) {
        fs.writeFileSync(path.join(outFolder, f.filename), f.content);
    }
    console.log(`${device.name}: wrote ${files.length} files → ${outFolder}`);
    for (const f of files) {
        console.log(`  - ${f.filename} (${f.content.split(/\r?\n/).length} lines)`);
    }
}

writeDevice("channel.json");
writeDevice("mixer.json");
console.log("DONE");
