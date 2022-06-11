import * as DXFSolidObjectRenderer2D from "./dxfSolidObjectRenderer2D";
import * as Colors from "../colors";
import Registry from "../../core/registry";
import { renderEdgeFeature } from "./dxfObjectRenderer2D";
import paper from "paper";
import { ComponentAPI } from "@/componentAPI";
import {Point} from "@/app/core/init";
import Feature from "@/app/core/feature";

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

const getBaseColor = function(feature: Feature) {
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
    if (Registry.currentLayer === null) {
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
    primParams["color"] = new paper.Color(Colors.getDefaultFeatureColor(typeString, Registry.currentLayer));
    const rendered = renderer.render2DTarget(null, primParams);
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
    // TODO: Just call the DXF renderer (outline) for this
    renderEdgeFeature(feature);
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
        rendered.fillColor = getLayerColor(feature);
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
 * @return {*}
 */
export function renderFeature(feature: Feature, key: string | null) {
    let rendered;
    let params;
    const type = feature.getType();
    let set = "Basic";
    if (ComponentAPI.isCustomType(type)) {
        set = "Custom";
        rendered = DXFSolidObjectRenderer2D.renderCustomComponentFeature(feature, getBaseColor(feature));
        let modrendered = rendered as any;
        modrendered["featureID"] = feature.ID;
        return modrendered;
    } else if (type === "EDGE") {
        return renderEdge(feature);
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
        // Rendered is going to be at 0,0 with whatever rotation
        // Now we can get draw offset by looking at the rendered topleft corner
        // move the feature to user pointed position
        // save the drawoffsets on the feature object 
        // later on in the component, calculate position by subtracting draw offset
        // recalculate draw offset whenever parameter changed
        let modrendered = rendered as any;
        modrendered["featureID"] = feature.ID;
    
        return modrendered;
    }
}
