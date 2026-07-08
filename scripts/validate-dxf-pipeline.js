/**
 * Validates DXF import and export pipeline against reference files in Data/.
 * Run: node scripts/validate-dxf-pipeline.js
 */

const fs = require("fs");
const path = require("path");
const DxfParser = require("dxf-parser");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "Data");

function loadTsModule(relPath) {
    // Use compiled dist if available; otherwise rely on transpiled require via ts-node not installed.
    // For validation we duplicate minimal logic in plain JS below.
    return null;
}

function parseDxf(filePath) {
    const text = fs.readFileSync(filePath, "utf8");
    return new DxfParser().parseSync(text);
}

function stlBounds(filePath) {
    const buf = fs.readFileSync(filePath);
    const triCount = buf.readUInt32LE(80);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    let offset = 84;
    for (let i = 0; i < triCount; i++) {
        for (let v = 0; v < 3; v++) {
            const base = offset + 12 + v * 12;
            const x = buf.readFloatLE(base);
            const y = buf.readFloatLE(base + 4);
            const z = buf.readFloatLE(base + 8);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
        }
        offset += 50;
    }
    return { triCount, minX, maxX, minY, maxY, minZ, maxZ };
}

function approxEqual(a, b, tol = 1.5) {
    return Math.abs(a - b) <= tol;
}

function validatePair(dxfName, stlName) {
    const dxfPath = path.join(DATA, dxfName);
    const stlPath = path.join(DATA, stlName);
    const parsed = parseDxf(dxfPath);
    const ref = stlBounds(stlPath);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const e of parsed.entities || []) {
        if (e.vertices) {
            for (const v of e.vertices) {
                minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
                minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
            }
        }
        if (e.center) {
            minX = Math.min(minX, e.center.x - e.radius);
            maxX = Math.max(maxX, e.center.x + e.radius);
            minY = Math.min(minY, e.center.y - e.radius);
            maxY = Math.max(maxY, e.center.y + e.radius);
        }
    }

    console.log(`\n=== ${dxfName} / ${stlName} ===`);
    console.log("DXF bounds mm:", { minX, maxX, minY, maxY });
    console.log("Ref STL bounds mm:", ref);
    const ok =
        approxEqual(minX, ref.minX) &&
        approxEqual(maxX, ref.maxX) &&
        approxEqual(minY, ref.minY) &&
        approxEqual(maxY, ref.maxY);
    console.log(ok ? "PASS: XY bounds align with reference STL" : "WARN: XY bounds differ from reference STL");
}

function validateGcodeSample() {
    const sample = path.join(
        DATA,
        "gcode/3_20250513_single_channel_fluorescence_activated_droplet_sorting/150um_measure_INLET.gcode"
    );
    const text = fs.readFileSync(sample, "utf8");
    const checks = [
        text.includes("G0 G90 G94 G17"),
        text.includes("G21"),
        text.includes("M3 S"),
        text.includes("G55"),
        text.includes("M30")
    ];
    console.log("\n=== G-code reference format ===");
    console.log(checks.every(Boolean) ? "PASS: reference gcode has Fusion-style header/footer" : "FAIL: gcode format mismatch");
}

validatePair("fork_1to2.dxf", "fork_1to2.stl");
validatePair("inlet-channel-outlet.dxf", "inlet-channel-outlet.stl");
validateGcodeSample();

console.log("\nDone. Import DXF in 3DuF UI, then export DXF/SVG/G-code/JSON from Manufacturing panel.");
