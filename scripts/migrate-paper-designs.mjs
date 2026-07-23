/**
 * Migrates 3DuF-Paper-Designs JSON files to the current interchange format.
 * Run: node scripts/migrate-paper-designs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESIGNS_DIR = path.join(__dirname, "..", "3DuF-Paper-Designs");

const LAYER_NAME_TO_TYPE = {
    flow: "FLOW",
    control: "CONTROL",
    integration: "INTEGRATION",
    cells: "INTEGRATION"
};

function componentRefToId(component) {
    if (component == null) return null;
    if (typeof component === "string") return component;
    if (typeof component === "object") return component.__id || component.id || null;
    return null;
}

function normalizeDxfEntry(entry) {
    if (!entry || typeof entry !== "object") return entry;
    if (Object.prototype.hasOwnProperty.call(entry, "__rootObject")) {
        const root = entry.__rootObject || {};
        return { ...root, type: entry.__type || root.type };
    }
    return entry;
}

function normalizeFeatureParams(params) {
    if (!params || !Object.prototype.hasOwnProperty.call(params, "orientation")) return;
    params.rotation = params.orientation === "V" ? 0 : 270;
    delete params.orientation;
}

function normalizeFeatureEntry(feature) {
    if (!feature || typeof feature !== "object") return;
    if (!feature.macro && feature.type) feature.macro = feature.type;
    normalizeFeatureParams(feature.params);
    if (Array.isArray(feature.dxfData)) {
        feature.dxfData = feature.dxfData.map(normalizeDxfEntry);
    }
}

function normalizeFeatureMap(features) {
    if (!features) return;
    if (Array.isArray(features)) {
        for (const feature of features) normalizeFeatureEntry(feature);
        return;
    }
    for (const key in features) normalizeFeatureEntry(features[key]);
}

function migrateJson(json) {
    if (!json.params) json.params = { width: 135000, length: 85000 };
    if (!Array.isArray(json.components)) json.components = [];
    if (!Array.isArray(json.connections)) json.connections = [];
    if (!Array.isArray(json.valves)) json.valves = [];

    if (!json.layers && Array.isArray(json.features) && json.features[0]?.features) {
        json.layers = json.features.map((layer, index) => {
            const layerName = String(layer.name || `layer-${index}`).toLowerCase();
            return {
                id: layer.id || `${layerName}-layer-${index}`,
                name: layer.name || layerName,
                type: layer.type || LAYER_NAME_TO_TYPE[layerName] || "FLOW",
                group: layer.group || "0",
                params: layer.params || { z_offset: 0, flip: false },
                features: layer.features || {}
            };
        });
        delete json.features;
    }

    if (json.layers) {
        const groups = new Set(json.layers.map((layer) => String(layer.group ?? "0")));
        for (const group of groups) {
            const groupLayers = json.layers.filter((layer) => String(layer.group ?? "0") === group);
            if (!groupLayers.some((layer) => layer.type === "INTEGRATION")) {
                json.layers.push({
                    id: `integration-layer-${group}`,
                    name: "integration",
                    type: "INTEGRATION",
                    group,
                    params: { z_offset: 0, flip: false },
                    features: {}
                });
            }
        }
        for (const layer of json.layers) normalizeFeatureMap(layer.features);
    }

    for (const component of json.components) {
        if (component.entity === "TEST MINT") component.entity = "PUMP";
        normalizeFeatureParams(component.params);
        if (!Array.isArray(component.ports)) component.ports = [];
    }

    const defaultLayer = json.layers?.find((layer) => layer.type === "FLOW") || json.layers?.[0];
    for (const connection of json.connections) {
        if (!connection.layer && defaultLayer) connection.layer = defaultLayer.id;
        if (connection.source) {
            const sourceId = componentRefToId(connection.source.component);
            if (sourceId) connection.source.component = sourceId;
        }
        if (Array.isArray(connection.sinks)) {
            for (const sink of connection.sinks) {
                const sinkId = componentRefToId(sink.component);
                if (sinkId) sink.component = sinkId;
            }
        }
    }

    return json;
}

const files = fs.readdirSync(DESIGNS_DIR).filter((name) => name.endsWith(".json"));
for (const file of files) {
    const fullPath = path.join(DESIGNS_DIR, file);
    const original = fs.readFileSync(fullPath, "utf8");
    const migrated = migrateJson(JSON.parse(original));
    const output = JSON.stringify(migrated);
    fs.writeFileSync(fullPath, output);
    const layerCount = migrated.layers?.length || 0;
    const featureCount = (migrated.layers || []).reduce(
        (sum, layer) => sum + Object.keys(layer.features || {}).length,
        0
    );
    console.log(`${file}: layers=${layerCount} features=${featureCount}`);
}

console.log(`Migrated ${files.length} design files.`);
