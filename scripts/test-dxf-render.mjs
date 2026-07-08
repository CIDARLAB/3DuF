import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import DxfParser from "dxf-parser";
import paper from "paper";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function main() {
    paper.setup(new paper.Size(100, 100));

    const { buildDeviceJsonFromDxf } = await import("../src/app/import/dxfDeviceImport.ts");
    const LoadUtils = (await import("../src/app/utils/loadUtils.ts")).default;
    const { renderFeature } = await import("../src/app/view/render2D/featureRenderer2D.ts");

    const dxfPath = path.join(ROOT, "Data/fork_1to2.dxf");
    const parsed = new DxfParser().parseSync(fs.readFileSync(dxfPath, "utf8"));
    const deviceJson = buildDeviceJsonFromDxf(parsed, "fork_1to2.dxf");
    const mockLayer = { type: "FLOW" };

    const macros = deviceJson.layers[0].features.map((f) => f.macro);
    console.log("features:", macros);
    console.log("connections:", deviceJson.connections.length);
    if (macros.includes("DxfSketch")) {
        throw new Error("DxfSketch should not be imported for display");
    }

    for (const featJson of deviceJson.layers[0].features) {
        const feature = LoadUtils.loadFeatureFromInterchangeV1(featJson);
        feature.layer = mockLayer;
        const rendered = renderFeature(feature, null);
        if (featJson.macro === "EDGE") {
            if (!rendered.strokeColor || rendered.fillColor) {
                throw new Error("EDGE should use stroke outline, not fill");
            }
        }
        if (featJson.macro === "Connection") {
            if (!rendered.fillColor) {
                throw new Error("Connection should be filled");
            }
        }
    }
    console.log("render smoke test OK");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
