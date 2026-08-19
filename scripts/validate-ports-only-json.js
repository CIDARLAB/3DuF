/**
 * Validates ports-only JSON filtering against the flow+control demo.
 * Run: node scripts/validate-ports-only-json.js
 */

const fs = require("fs");
const path = require("path");

const DEMO = path.join(
    __dirname,
    "../../Neptune_2026/Microfluidics-Benchmarks/Results/Quick_Examples/flow_and_control_demo/flow_and_control_demo_fromLFR_PR.json"
);

function isPortTypeName(value) {
    return String(value || "").trim().toUpperCase() === "PORT";
}

function isFlowOrControlLayerType(value) {
    const type = String(value || "").trim().toUpperCase();
    return type === "FLOW" || type === "CONTROL";
}

function isPortFeatureRecord(feature) {
    if (!feature || typeof feature !== "object") {
        return false;
    }
    return isPortTypeName(feature.macro) || isPortTypeName(feature.type);
}

function filterFeatureCollection(features) {
    if (Array.isArray(features)) {
        return features.filter(isPortFeatureRecord);
    }
    if (features && typeof features === "object") {
        const kept = {};
        for (const key of Object.keys(features)) {
            if (isPortFeatureRecord(features[key])) {
                kept[key] = features[key];
            }
        }
        return kept;
    }
    return features;
}

function layerRefId(ref) {
    if (ref == null) {
        return "";
    }
    if (typeof ref === "string" || typeof ref === "number") {
        return String(ref);
    }
    if (typeof ref === "object" && ref.id != null) {
        return String(ref.id);
    }
    return "";
}

function stripToFlowControlPorts(json) {
    const clone = JSON.parse(JSON.stringify(json));
    const layers = Array.isArray(clone.layers) ? clone.layers : [];
    const keptLayers = layers.filter(layer => isFlowOrControlLayerType(layer.type));
    const layerIds = new Set(keptLayers.map(layer => String(layer.id)));

    for (const layer of keptLayers) {
        layer.features = filterFeatureCollection(layer.features);
    }
    clone.layers = keptLayers;

    clone.components = (clone.components || []).filter(component => {
        if (!isPortTypeName(component.entity)) {
            return false;
        }
        const refs = component.layers;
        if (!Array.isArray(refs) || refs.length === 0) {
            return true;
        }
        return refs.some(ref => layerIds.has(layerRefId(ref)));
    });

    clone.connections = [];
    clone.valves = [];

    if (Array.isArray(clone.renderLayers)) {
        clone.renderLayers = clone.renderLayers
            .filter(
                renderLayer =>
                    isFlowOrControlLayerType(renderLayer.type) || layerIds.has(String(renderLayer.modellayer))
            )
            .map(renderLayer => ({
                ...renderLayer,
                features: filterFeatureCollection(renderLayer.features)
            }));
    }

    if (Array.isArray(clone.features)) {
        clone.features = [];
    }

    return clone;
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const json = JSON.parse(fs.readFileSync(DEMO, "utf8"));
const portsOnly = stripToFlowControlPorts(json);

const entities = portsOnly.components.map(c => String(c.entity).toUpperCase());
assert(entities.length > 0, "expected at least one PORT component");
assert(
    entities.every(entity => entity === "PORT"),
    "ports-only JSON still contains non-PORT components: " + entities.filter(e => e !== "PORT").join(", ")
);
assert(Array.isArray(portsOnly.connections) && portsOnly.connections.length === 0, "connections were not cleared");
assert(Array.isArray(portsOnly.valves) && portsOnly.valves.length === 0, "valves were not cleared");
assert(
    portsOnly.layers.every(layer => isFlowOrControlLayerType(layer.type)),
    "layers other than FLOW/CONTROL remain"
);
assert(
    portsOnly.layers.some(layer => String(layer.type).toUpperCase() === "FLOW"),
    "FLOW layer missing"
);
assert(
    portsOnly.layers.some(layer => String(layer.type).toUpperCase() === "CONTROL"),
    "CONTROL layer missing"
);

console.log("PASS: ports-only JSON keeps FLOW/CONTROL PORT components and drops connections/valves");
console.log("  original components:", json.components.length);
console.log("  ports-only components:", portsOnly.components.length);
console.log("  original connections:", (json.connections || []).length);
console.log("  original valves:", (json.valves || []).length);
