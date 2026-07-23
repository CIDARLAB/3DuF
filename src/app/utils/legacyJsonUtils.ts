import { InterchangeV1_2 } from "@/app/core/init";

const LAYER_NAME_TO_TYPE: Record<string, string> = {
    flow: "FLOW",
    control: "CONTROL",
    integration: "INTEGRATION",
    cells: "INTEGRATION"
};

function componentRefToId(component: unknown): string | null {
    if (component == null) return null;
    if (typeof component === "string") return component;
    if (typeof component === "object") {
        const obj = component as { __id?: string; id?: string };
        return obj.__id || obj.id || null;
    }
    return null;
}

function normalizeDxfEntry(entry: any): any {
    if (!entry || typeof entry !== "object") return entry;
    if (Object.prototype.hasOwnProperty.call(entry, "__rootObject")) {
        const root = entry.__rootObject || {};
        return {
            ...root,
            type: entry.__type || root.type
        };
    }
    return entry;
}

function normalizeFeatureParams(params: { [key: string]: any } | undefined): void {
    if (!params || !Object.prototype.hasOwnProperty.call(params, "orientation")) return;
    const orientation = params.orientation;
    params.rotation = orientation === "V" ? 0 : 270;
    delete params.orientation;
}

function normalizeFeatureEntry(feature: any): void {
    if (!feature || typeof feature !== "object") return;
    if (!feature.macro && feature.type) {
        feature.macro = feature.type;
    }
    normalizeFeatureParams(feature.params);
    if (Array.isArray(feature.dxfData)) {
        feature.dxfData = feature.dxfData.map(normalizeDxfEntry);
    }
}

function normalizeFeatureMap(features: { [key: string]: any } | Array<any> | undefined): void {
    if (!features) return;
    if (Array.isArray(features)) {
        for (const feature of features) {
            normalizeFeatureEntry(feature);
        }
        return;
    }
    for (const key in features) {
        normalizeFeatureEntry(features[key]);
    }
}

function legacyFeatureLayersToLayers(json: InterchangeV1_2): void {
    if (Object.prototype.hasOwnProperty.call(json, "layers")) return;
    const legacyLayers = (json as any).features;
    if (!Array.isArray(legacyLayers) || legacyLayers.length === 0) return;
    if (!legacyLayers[0] || !Object.prototype.hasOwnProperty.call(legacyLayers[0], "features")) return;

    (json as any).layers = legacyLayers.map((layer: any, index: number) => {
        const layerName = String(layer.name || `layer-${index}`).toLowerCase();
        const layerType = layer.type || LAYER_NAME_TO_TYPE[layerName] || "FLOW";
        return {
            id: layer.id || `${layerName}-layer-${index}`,
            name: layer.name || layerName,
            type: layerType,
            group: layer.group || "0",
            params: layer.params || { z_offset: 0, flip: false },
            features: layer.features || {}
        };
    });
}

function ensureIntegrationLayer(json: InterchangeV1_2): void {
    if (!json.layers || json.layers.length === 0) return;
    const groups = new Set(json.layers.map((layer) => String(layer.group ?? "0")));
    for (const group of groups) {
        const groupLayers = json.layers.filter((layer) => String(layer.group ?? "0") === group);
        const hasIntegration = groupLayers.some((layer) => layer.type === "INTEGRATION");
        if (!hasIntegration) {
            // Omit `features` so loadLayerFromInterchangeV1 regenerates multilayer
            // geometry (e.g. Sorter/PicoInjection electrodes) from components.
            // An empty `features: {}` is truthy and would skip that generation.
            json.layers.push({
                id: `integration-layer-${group}`,
                name: "integration",
                type: "INTEGRATION",
                group,
                params: { z_offset: 0, flip: false }
            } as any);
        }
    }
}

function normalizeConnections(json: InterchangeV1_2): void {
    if (!Array.isArray(json.connections)) {
        json.connections = [];
        return;
    }
    const defaultLayer = json.layers?.find((layer) => layer.type === "FLOW") || json.layers?.[0];
    for (const connection of json.connections) {
        if (!connection.layer && defaultLayer) {
            connection.layer = defaultLayer.id;
        }
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
}

function normalizeComponents(json: InterchangeV1_2): void {
    if (!Array.isArray(json.components)) {
        json.components = [];
        return;
    }
    for (const component of json.components) {
        if (component.entity === "TEST MINT") {
            component.entity = "PUMP";
        }
        normalizeFeatureParams(component.params);
        if (!Array.isArray(component.ports)) {
            component.ports = [];
        }
    }
}

/**
 * Normalizes legacy literature/paper design JSON into the current interchange shape.
 */
export function normalizeLegacyDeviceJson(json: InterchangeV1_2): InterchangeV1_2 {
    if (!json.params) {
        json.params = { width: 135000, length: 85000 } as any;
    }
    if (!Array.isArray(json.components)) json.components = [];
    if (!Array.isArray(json.connections)) json.connections = [];
    if (!Array.isArray(json.valves)) json.valves = [];

    legacyFeatureLayersToLayers(json);
    ensureIntegrationLayer(json);

    if (json.layers) {
        for (const layer of json.layers) {
            normalizeFeatureMap(layer.features as any);
        }
    }

    normalizeComponents(json);
    normalizeConnections(json);
    return json;
}
