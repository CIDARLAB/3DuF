import * as DXFSolidObjectRenderer2D from "./dxfSolidObjectRenderer2D";
import * as Colors from "../colors";
import Registry from "../../core/registry";
import { renderEdgeFeature } from "./dxfObjectRenderer2D";
import paper from "paper";
import { ComponentAPI } from "@/componentAPI";
import { LogicalLayerType, Point, ToolPaperObject } from "@/app/core/init";
import Feature from "@/app/core/feature";

/**
 * When there is no matching valve geometry on the active logical layer (e.g. legacy/single-layer
 * valve JSONs that only contain CONTROL features), keep the inactive-layer valve visible but dim.
 */
const VALVE_INACTIVE_LOGICAL_LAYER_ALPHA = 0.5;

const VALVE_RENDER_TYPES = new Set(["Valve", "Valve3D_control", "Valve3D"]);
const FLOW_VALVE_RENDER_TYPES = new Set(["Valve3D_control", "Valve3D"]);

function applyValveFlowCutToConnectionRender(rendered: paper.Item, feature: Feature): paper.Item {
    if (!feature.layer || feature.layer.type !== LogicalLayerType.FLOW) {
        return rendered;
    }
    if (feature.getType() !== "Connection") {
        return rendered;
    }

    const layerFeatures = feature.layer.getAllFeaturesFromLayer();
    let current = rendered;
    let channelWidth = 0;
    try {
        const cw = Number(feature.getValue("channelWidth"));
        if (Number.isFinite(cw) && cw > 0) {
            channelWidth = cw;
        }
    } catch {
        channelWidth = 0;
    }
    const axialPadding = channelWidth / 2;

    for (const featureID in layerFeatures) {
        const candidate = layerFeatures[featureID];
        if (!FLOW_VALVE_RENDER_TYPES.has(candidate.getType())) {
            continue;
        }
        if (!candidate.layer || candidate.layer.type !== LogicalLayerType.FLOW) {
            continue;
        }

        let position;
        let radius;
        let gap;
        let rotation;
        try {
            position = candidate.getValue("position");
            radius = Number(candidate.getValue("valveRadius"));
            gap = Number(candidate.getValue("gap"));
            rotation = Number(candidate.getValue("rotation"));
        } catch {
            continue;
        }

        if (
            !position ||
            !Number.isFinite(radius) ||
            radius <= 0 ||
            !Number.isFinite(gap) ||
            gap <= 0 ||
            !Number.isFinite(rotation)
        ) {
            continue;
        }

        const center = new paper.Point(position[0], position[1]);
        const gapPath = new paper.Path.Rectangle({
            from: new paper.Point(position[0] - radius - axialPadding, position[1] - gap / 2),
            to: new paper.Point(position[0] + radius + axialPadding, position[1] + gap / 2)
        });
        gapPath.rotate(rotation, center);

        const cut = (current as paper.PathItem).subtract(gapPath) as paper.Item;
        current.remove();
        gapPath.remove();
        current = cut;
    }

    return current;
}

function hasValveCounterpartOnLayer(feature: Feature, logicalLayerType: LogicalLayerType): boolean {
    const referenceID = feature.referenceID;
    const device = Registry.currentDevice;
    if (!referenceID || !device) {
        return false;
    }
    const component = device.getComponentByID(referenceID);
    if (!component) {
        return false;
    }
    for (const featureID of component.featureIDs) {
        try {
            const sibling = device.getFeatureByID(featureID);
            if (!sibling.layer) {
                continue;
            }
            if (!VALVE_RENDER_TYPES.has(sibling.getType())) {
                continue;
            }
            if (sibling.layer.type === logicalLayerType) {
                return true;
            }
        } catch {
            continue;
        }
    }
    return false;
}

export type RenderFeatureOptions = {
    /** Skip FLOW/CONTROL cross-layer hiding (e.g. manufacturing). Default false. */
    neutralValveOpacity?: boolean;
};

function applyValveCrossLayerOpacity(rendered: paper.Item, feature: Feature, options?: RenderFeatureOptions): void {
    const t = feature.getType();
    if (!VALVE_RENDER_TYPES.has(t)) return;
    if (options?.neutralValveOpacity) {
        rendered.opacity = 1;
        return;
    }
    const vm = Registry.viewManager;
    if (!vm?.currentLayer || !feature.layer) {
        rendered.opacity = 1;
        return;
    }
    const matchesActiveLogicalLayer = vm.currentLayer.type === feature.layer.type;
    if (matchesActiveLogicalLayer) {
        rendered.opacity = 1;
        return;
    }
    // Keep inactive-layer valve visibility consistent with other components:
    // show a dimmed ghost instead of fully hiding it when a counterpart exists.
    rendered.opacity = VALVE_INACTIVE_LOGICAL_LAYER_ALPHA;
}

const getLayerColor = function(feature: Feature) {
    const height = feature.getValue("height");
    const layerHeight = 1; // feature.layer.estimateLayerHeight();
    let decimal = height / layerHeight;
    if (decimal > 1) decimal = 1;
    // if (!feature.layer.flip) decimal = 1 - decimal;
    console.log("feature Object:", feature);
    console.log("feature layer:", feature.layer);
    console.log("feature layer type:", feature.layer!.type);
    // Throw error if the layer in the feature is null
    if (!feature.layer) {
        throw new Error("Feature layer is null");
    }
    const targetColorSet = Colors.getLayerColors(feature.layer.type);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
};

const getBaseColor = function(feature: Feature): string {
    let decimal = 0;
    // if (!feature.layer.flip) decimal = 1 - decimal;
    // throw error if the layer in the feature is null
    if (!feature.layer) {
        throw new Error("Feature layer is null");
    }
    const targetColorSet = Colors.getLayerColors(feature.layer.type);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
};

export function getDefaultValueForType(typeString: string, key: string) {
    return ComponentAPI.getDefaultsForType(typeString)[key];
}

export function renderTarget(typeString:string, position: Point, customParameters:any = null) {
    if (Registry.viewManager?.currentLayer === null || Registry.viewManager?.currentLayer === undefined) {
        console.error("No current layer");
        throw new Error("No current layer");
    }
    const rendererinfo = ComponentAPI.getRendererInfo(typeString);
    const renderer = rendererinfo.object;
    const params = renderer.targetParams;
    const primParams: {[key: string]: any} = {};
    if (customParameters !== null) {
        for (const item of customParameters) {
            primParams[item.name] = item.value;
        }
    } else {
        for (const key in params) {
            primParams[key] = getDefaultValueForType(typeString, params[key]);
        }
    }
    primParams["position"] = position;
    primParams["color"] = new paper.Color(Colors.getDefaultFeatureColor(typeString, Registry.viewManager?.currentLayer));
    // Pick the geometry key by the active logical layer (e.g. Valve3D shows the FLOW crescents
    // on the FLOW layer and the full CONTROL circle on the CONTROL layer). Renderers that ignore
    // the key (most non-valve components) are unaffected.
    let targetKey: string | null = null;
    try {
        const activeLayerType: string = Registry.viewManager.currentLayer.type;
        const supportedKeys = renderer.renderKeys;
        if (supportedKeys && supportedKeys.includes(activeLayerType)) {
            targetKey = activeLayerType;
        }
    } catch {
        targetKey = null;
    }
    const rendered = renderer.render2DTarget(targetKey, primParams);
    return rendered;
}

/**
 * This function renders the text to target that trails the cursor
 * @param typeString
 * @param setString
 * @param position
 * @return {d}
 */
export function renderTextTarget(typeString: string, position: Point) {
    if (Registry.viewManager === null) {
        console.error("Registry.viewManager is null");
        throw new Error("Registry.viewManager is null");
    }
    const rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = "center";
    rendered.fillColor = new paper.Color(Colors.DEEP_PURPLE_500);
    rendered.content = Registry.viewManager.tools.InsertTextTool.text;
    rendered.fontSize = 10000;
    return rendered;
}

export function renderEdge(feature:any) {
    return renderEdgeFeature(feature);
}

export function renderText(feature:any) {
    // TODO - Figure out where to save the position of the feature
    const position = feature.getValue("position");
    const rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = "center";
    if (feature.getParams().color != undefined) {
        let color = feature.getParams().color.value;
        if (color == "white" || color == "White" || color == "WHITE") {
            rendered.fillColor = new paper.Color(Colors.WHITE);
        } else if (color == "black" || color == "Black" || color == "BLACK") {
            rendered.fillColor = new paper.Color(Colors.BLACK);
        } else if (color == "blue" || color == "Blue" || color == "BLUE") {
            rendered.fillColor = new paper.Color(Colors.BLUE_500);
        } else if (color == "red" || color == "Red" || color == "RED") {
            rendered.fillColor = new paper.Color(Colors.RED_500);
        } else {
            throw new Error("Color choice " + color + " not enabled");
        }
    } else {
        rendered.fillColor = new paper.Color(getLayerColor(feature));
    }
    /// rendered.content = feature.getText();
    rendered.content = feature.getValue("text");
    rendered.fontSize = feature.getValue("fontSize");
    let modrendered = rendered as any;
    modrendered["featureID"] = feature.ID;
    return modrendered;
}

/**
 * Returns the paperjs drawing object of the passed feature
 * @param feature
 * @param key
 * @param options Optional rendering behavior (valve cross-layer opacity).
 * @return {*}
 */
export function renderFeature(feature: Feature, key: string | null, options?: RenderFeatureOptions) {
    console.log("RenderFeature beginning", feature);
    // console.log(feature);
    console.log(key);
    let rendered;
    let params;
    const type = feature.getType();
    let set = "Basic";
    if (ComponentAPI.isCustomType(type)) {
        //(Eric) all blackbox code should be in here
        set = "Custom";
        rendered = DXFSolidObjectRenderer2D.renderCustomComponentFeature(feature, getBaseColor(feature));
        let modrendered = rendered as any;
        modrendered["featureID"] = feature.ID;
        return modrendered as ToolPaperObject;
    } else if (type === "EDGE") {
        return renderEdge(feature);
    } else if (type === "DxfSketch") {
        // Legacy DXF imports stored raw sketch geometry here; rendering is handled
        // by Connection + Port features. Keep an invisible placeholder for old files.
        const placeholder = new paper.CompoundPath("");
        const modrendered = placeholder as any;
        modrendered.featureID = feature.ID;
        return modrendered as ToolPaperObject;
    } else if (type === "Text") {
        return renderText(feature);
    } else {
        const rendererinfo = ComponentAPI.getRendererInfo(type);
        const renderer = ComponentAPI.getRenderer(type);

        /*
        If the user does not specify the key, then extract it from the rendering info of the feature.
        I guess theoretically speaking, one needs to generate a set of invisible feature but for now we are just
        ignoring that.

        TODO - Clean up this mess of a system. Its not obvious about how once send this logic.
         */
        if (!key || key === null) {
            key = rendererinfo.key;
        }

        // Flow-layer Valve3D features must match placement preview geometry (FLOW in render2DTarget), not CONTROL.
        if (
            type === "Valve3D_control" &&
            feature.layer &&
            feature.layer.type === LogicalLayerType.FLOW &&
            key === "CONTROL"
        ) {
            key = "FLOW";
        }

        if (!renderer) {
            console.error("Could not find renderer method for feature:", feature);
        } else {
            params = renderer.featureParams;
        }

        const primParams: {[key: string]: any} = {};
        for (const paramkey in params) {
            primParams[paramkey] = feature.getValue(params[paramkey]);
        }
        //primParams["position"] = [0,0];
        //console.log("Data for rendering:", primParams);
        //Set the position of the params to 0,0
        primParams.color = getLayerColor(feature);
        primParams.baseColor = getBaseColor(feature);
        rendered = renderer.render2D(primParams, key);
        rendered = applyValveFlowCutToConnectionRender(rendered as paper.Item, feature);
        // Rendered is going to be at 0,0 with whatever rotation
        // Now we can get draw offset by looking at the rendered topleft corner
        // move the feature to user pointed position
        // save the drawoffsets on the feature object 
        // later on in the component, calculate position by subtracting draw offset
        // recalculate draw offset whenever parameter changed
        let modrendered = rendered as any;
        modrendered["featureID"] = feature.ID;
        applyValveCrossLayerOpacity(rendered as paper.Item, feature, options);

        return modrendered as ToolPaperObject;
    }
}
