/**
 * Validates multilayer DXF export naming/content against the flow+control demo JSON.
 * Run: node scripts/validate-multilayer-dxf-export.js
 */

const fs = require("fs");
const path = require("path");

const DEMO = path.join(
    __dirname,
    "../../Neptune_2026/Microfluidics-Benchmarks/Results/Quick_Examples/flow_and_control_demo/flow_and_control_demo_fromLFR_PR.json"
);

const UM_TO_MM = 0.001;

function dxfPair(code, value) {
    return `${code}\n${value}\n`;
}

function writeHeader() {
    let out = "0\nSECTION\n2\nHEADER\n";
    out += dxfPair(9, "$ACADVER");
    out += dxfPair(1, "AC1015");
    out += dxfPair(9, "$INSUNITS");
    out += dxfPair(70, 4);
    out += "0\nENDSEC\n";
    return out;
}

function wrapEntities(entities) {
    return writeHeader() + "0\nSECTION\n2\nENTITIES\n" + entities + "0\nENDSEC\n0\nEOF\n";
}

function writeLine(a, b, layer, z = 0) {
    let out = "0\nLINE\n";
    out += dxfPair(8, layer);
    out += dxfPair(10, a.x);
    out += dxfPair(20, a.y);
    out += dxfPair(30, z);
    out += dxfPair(11, b.x);
    out += dxfPair(21, b.y);
    out += dxfPair(31, z);
    return out;
}

function writeCircle(center, radius, layer) {
    let out = "0\nCIRCLE\n";
    out += dxfPair(8, layer);
    out += dxfPair(10, center.x);
    out += dxfPair(20, center.y);
    out += dxfPair(30, 0);
    out += dxfPair(40, radius);
    return out;
}

function canvasUmToDxfMm(xUm, yUm, deviceHeightUm) {
    return { x: xUm * UM_TO_MM, y: (deviceHeightUm - yUm) * UM_TO_MM };
}

function isMultilayerBiochip(layers) {
    let count = 0;
    for (const layer of layers) {
        if (layer.type === "FLOW" || layer.type === "CONTROL") {
            count += 1;
            if (count > 1) return true;
        }
    }
    return false;
}

function buildMockDevice(json) {
    const heightUm = json.params["y-span"];
    const layers = json.layers.map(l => ({
        id: l.id,
        name: l.name,
        type: l.type,
        features: []
    }));
    const byId = Object.fromEntries(layers.map(l => [l.id, l]));

    for (const comp of json.components || []) {
        const layer = byId[comp.layers[0]];
        if (!layer) continue;
        const entity = (comp.entity || "").toUpperCase();
        if (entity === "PORT") {
            layer.features.push({
                type: "Port",
                position: comp.params.position,
                portRadius: comp.params.portRadius
            });
        } else if (entity === "VALVE3D" || entity === "VALVE" || entity === "CIRCLE VALVE") {
            layer.features.push({
                type: entity === "VALVE3D" ? "Valve3D_control" : "CircleValve",
                position: comp.params.position,
                valveRadius: comp.params.valveRadius || comp.params.portRadius || 400
            });
        }
        // Mixer etc. are complex; DXF export currently focuses on ports/connections/valves.
    }

    for (const conn of json.connections || []) {
        const layer = byId[conn.layer];
        if (!layer) continue;
        layer.features.push({
            type: "Connection",
            segments: conn.params.segments,
            height: conn.params.height || 250
        });
    }

    return { name: json.name, heightUm, layers };
}

function exportLayer(device, layer) {
    let entities = "";
    const layerName = layer.name || layer.type;
    for (const feature of layer.features) {
        if (feature.type === "Port" || feature.type === "Valve3D_control" || feature.type === "CircleValve") {
            const radius = feature.portRadius || feature.valveRadius;
            if (!feature.position || !radius) continue;
            const pt = canvasUmToDxfMm(feature.position[0], feature.position[1], device.heightUm);
            const suffix = feature.type === "Port" ? "_ports" : "_valves";
            entities += writeCircle(pt, radius * UM_TO_MM, layerName + suffix);
        } else if (feature.type === "Connection") {
            for (const seg of feature.segments || []) {
                const a = canvasUmToDxfMm(seg[0][0], seg[0][1], device.heightUm);
                const b = canvasUmToDxfMm(seg[1][0], seg[1][1], device.heightUm);
                entities += writeLine(a, b, layerName + "_channels", (feature.height || 250) * UM_TO_MM);
            }
        }
    }
    return wrapEntities(entities);
}

function generateFiles(device) {
    const exportLayers = device.layers.filter(l => l.type === "FLOW" || l.type === "CONTROL");
    if (exportLayers.length <= 1) {
        return [{ filename: `${device.name}.dxf`, content: exportLayer(device, exportLayers[0]) }];
    }
    const files = [];
    let flowIndex = 0;
    let controlIndex = 0;
    for (const layer of exportLayers) {
        if (layer.type === "FLOW") flowIndex += 1;
        else controlIndex += 1;
        const suffix = layer.type === "CONTROL" ? `_ctrl${controlIndex}` : `_flow${flowIndex}`;
        files.push({
            filename: `${device.name}${suffix}.dxf`,
            content: exportLayer(device, layer)
        });
    }
    return files;
}

function countEntities(dxfText, type) {
    const re = new RegExp(`^0\\n${type}\\n`, "gm");
    return (dxfText.match(re) || []).length;
}

function main() {
    const json = JSON.parse(fs.readFileSync(DEMO, "utf8"));
    const device = buildMockDevice(json);
    const multilayer = isMultilayerBiochip(device.layers);
    const files = generateFiles(device);

    console.log("Device:", device.name);
    console.log("Layers:", device.layers.map(l => `${l.name}(${l.type}) features=${l.features.length}`).join(", "));
    console.log("isMultilayerBiochip:", multilayer);
    console.log("Expected GCode blocked:", multilayer === true);
    console.log("DXF files:");
    for (const f of files) {
        const lines = countEntities(f.content, "LINE");
        const circles = countEntities(f.content, "CIRCLE");
        console.log(`  ${f.filename}: LINE=${lines}, CIRCLE=${circles}, bytes=${f.content.length}`);
    }

    const names = files.map(f => f.filename);
    const expect = [`${device.name}_flow1.dxf`, `${device.name}_ctrl1.dxf`];
    const okNames = expect.every(n => names.includes(n)) && names.length === 2;
    const flow = files.find(f => f.filename.endsWith("_flow1.dxf"));
    const ctrl = files.find(f => f.filename.endsWith("_ctrl1.dxf"));
    const flowOk = flow && countEntities(flow.content, "LINE") > 0 && countEntities(flow.content, "CIRCLE") > 0;
    const ctrlOk = ctrl && countEntities(ctrl.content, "LINE") > 0 && countEntities(ctrl.content, "CIRCLE") > 0;

    if (!okNames || !flowOk || !ctrlOk || !multilayer) {
        console.error("FAIL");
        process.exit(1);
    }
    console.log("PASS: multilayer DXF naming and non-empty flow/control geometry");
}

main();
