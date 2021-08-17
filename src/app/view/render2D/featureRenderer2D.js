import * as DXFSolidObjectRenderer2D from "./dxfSolidObjectRenderer2D";

import * as Colors from "../colors";
import Feature from "../../core/feature";

import * as FeatureSets from "../../featureSets";
import Registry from "../../core/registry";
import { renderEdgeFeature } from "../../view/render2D/dxfObjectRenderer2D";
import paper from "paper";
import { ComponentAPI } from "@/componentAPI";

const getLayerColor = function(feature) {
    const height = feature.getValue("height");
    const layerHeight = 1; // feature.layer.estimateLayerHeight();
    let decimal = height / layerHeight;
    if (decimal > 1) decimal = 1;
    if (!feature.layer.flip) decimal = 1 - decimal;
    const targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
};

const getBaseColor = function(feature) {
    let decimal = 0;
    if (!feature.layer.flip) decimal = 1 - decimal;
    const targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
};

export function getDefaultValueForType(typeString, setString, key) {
    return ComponentAPI.getDefaultsForType(typeString)[key];
}

export function getFeatureRenderer(typeString, setString) {
    if (typeString === "EDGE") {
        return renderEdge;
    } else {
        const rendererInfo = FeatureSets.getRender2D(typeString, setString);
        return rendererInfo;
    }
}

export function getPrimitive2D(typeString, setString) {
    console.error("What are Primitive sets ?");
    // return PrimitiveSets2D[setString][typeString]; //Looks like the primitivesets2d are the function pointers
}

export function renderTarget(typeString, setString, position, customParameters = null) {
    const rendererinfo = getFeatureRenderer(typeString, setString);
    const renderer = rendererinfo.object;
    const params = renderer.targetParams;
    const primParams = {};
    if (customParameters !== null) {
        for (const item of customParameters) {
            primParams[item.name] = item.value;
        }
    } else {
        for (const key in params) {
            primParams[key] = getDefaultValueForType(typeString, setString, params[key]);
        }
    }
    primParams.position = position;
    primParams.color = Colors.getDefaultFeatureColor(typeString, setString, Registry.currentLayer);
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
export function renderTextTarget(typeString, setString, position) {
    const rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = "center";
    rendered.fillColor = Colors.DEEP_PURPLE_500;
    rendered.content = Registry.viewManager.tools.InsertTextTool.text;
    rendered.fontSize = 10000;
    return rendered;
}

export function renderEdge(feature) {
    // TODO: Just call the DXF renderer (outline) for this
    renderEdgeFeature(feature);
}

export function renderText(feature) {
    // TODO - Figure out where to save the position of the feature
    const position = feature.getValue("position");
    const rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = "center";
    if (feature.getParams().color != undefined) {
        let color = feature.getParams().color.value;
        if (color == "white" || color == "White" || color == "WHITE") {
            rendered.fillColor = Colors.WHITE;
        } else if (color == "black" || color == "Black" || color == "BLACK") {
            rendered.fillColor = Colors.BLACK;
        } else if (color == "blue" || color == "Blue" || color == "BLUE") {
            rendered.fillColor = Colors.BLUE_500;
        } else if (color == "red" || color == "Red" || color == "RED") {
            rendered.fillColor = Colors.RED_500;
        } else {
            throw new Error("Color choice", color, " not enabled");
        }
    } else {
        rendered.fillColor = getLayerColor(feature);
    }
    /// rendered.content = feature.getText();
    rendered.content = feature.getValue("text");
    rendered.fontSize = feature.getValue("fontSize");
    rendered.featureID = feature.ID;
    return rendered;
}

/**
 * Returns the paperjs drawing object of the passed feature
 * @param feature
 * @return {*}
 */
export function renderFeature(feature, key = null) {
    let rendered;
    let params;
    const type = feature.getType();
    let set = "Basic";
    if (ComponentAPI.isCustomType(type)) {
        set = "Custom";
        rendered = DXFSolidObjectRenderer2D.renderCustomComponentFeature(feature, getBaseColor(feature));
        rendered.featureID = feature.ID;

        return rendered;
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
         */

        if (key === null) {
            key = rendererinfo.key;
        }

        if (!renderer) {
            console.error("Could not find renderer method for feature:", feature);
        } else {
            params = renderer.featureParams;
        }

        const primParams = {};
        for (const key in params) {
            primParams[key] = feature.getValue(params[key]);
        }
        primParams.color = getLayerColor(feature);
        primParams.baseColor = getBaseColor(feature);
        rendered = renderer.render2D(primParams, key);
        rendered.featureID = feature.ID;

        return rendered;
    }
}
