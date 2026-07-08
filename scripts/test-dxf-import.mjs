import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import DxfParser from "dxf-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function main() {
    const { buildDeviceJsonFromDxf } = await import("../src/app/import/dxfDeviceImport.ts");
    const LoadUtils = (await import("../src/app/utils/loadUtils.ts")).default;

    const dxfPath = path.join(ROOT, "Data/fork_1to2.dxf");
    const parsed = new DxfParser().parseSync(fs.readFileSync(dxfPath, "utf8"));
    const deviceJson = buildDeviceJsonFromDxf(parsed, "fork_1to2.dxf");

    console.log("Built JSON summary:", {
        features: deviceJson.layers?.[0]?.features?.length,
        components: deviceJson.components?.length,
        connections: deviceJson.connections?.length,
        renderFeatures: deviceJson.renderLayers?.[0]?.features?.length
    });

    try {
        const [device, renderLayers] = LoadUtils.loadFromScratch(deviceJson);
        console.log("Load OK:", {
            layers: device.layers.length,
            components: device.components.length,
            connections: device.connections.length,
            renderLayers: renderLayers.length,
            flowFeatures: Object.keys(renderLayers[0].features).length
        });
    } catch (err) {
        console.error("Load FAILED:", err?.message);
        console.error(err?.stack);
        process.exitCode = 1;
    }
}

main();
