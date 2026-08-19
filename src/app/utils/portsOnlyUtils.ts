import Feature from "../core/feature";
import { InterchangeV1_2, LogicalLayerType } from "../core/init";

/**
 * Keep only PORT components / Port features on FLOW and CONTROL layers.
 * Used for cover-layer fabrication: closed chips need port holes even when
 * the rest of the channel geometry is omitted.
 */

export function isPortTypeName(value: unknown): boolean {
    return String(value || "").trim().toUpperCase() === "PORT";
}

export function isFlowOrControlLayerType(value: unknown): boolean {
    const type = String(value || "").trim().toUpperCase();
    return type === "FLOW" || type === "CONTROL";
}

export function isFlowOrControlPortFeature(feature: Feature | null | undefined): boolean {
    if (!feature) {
        return false;
    }
    if (!isPortTypeName(feature.getType())) {
        return false;
    }
    const layerType = feature.layer ? feature.layer.type : null;
    if (!layerType) {
        return true;
    }
    return layerType === LogicalLayerType.FLOW || layerType === LogicalLayerType.CONTROL;
}

function isPortFeatureRecord(feature: any): boolean {
    if (!feature || typeof feature !== "object") {
        return false;
    }
    return isPortTypeName(feature.macro) || isPortTypeName(feature.type);
}

function filterFeatureCollection(features: any): any {
    if (Array.isArray(features)) {
        return features.filter(isPortFeatureRecord);
    }
    if (features && typeof features === "object") {
        const kept: { [key: string]: any } = {};
        for (const key of Object.keys(features)) {
            if (isPortFeatureRecord(features[key])) {
                kept[key] = features[key];
            }
        }
        return kept;
    }
    return features;
}

function layerRefId(ref: any): string {
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

/**
 * Deep-clone an interchange JSON and drop every component, connection, valve,
 * and feature that is not a FLOW/CONTROL port.
 */
export function stripToFlowControlPorts(json: InterchangeV1_2): InterchangeV1_2 {
    const clone = JSON.parse(JSON.stringify(json)) as InterchangeV1_2;
    const layers = Array.isArray(clone.layers) ? clone.layers : [];
    const keptLayers = layers.filter(layer => isFlowOrControlLayerType(layer.type));
    const layerIds = new Set(keptLayers.map(layer => String(layer.id)));

    for (const layer of keptLayers) {
        (layer as any).features = filterFeatureCollection((layer as any).features);
    }
    clone.layers = keptLayers;

    clone.components = (clone.components || []).filter(component => {
        if (!isPortTypeName(component.entity)) {
            return false;
        }
        const refs = (component as any).layers;
        if (!Array.isArray(refs) || refs.length === 0) {
            return true;
        }
        return refs.some((ref: any) => layerIds.has(layerRefId(ref)));
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
