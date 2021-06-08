import * as DXFSolidObjectRenderer2D from "./dxfSolidObjectRenderer2D";

import * as Colors from "../colors";
import Feature from "../../core/feature";

import * as FeatureSets from "../../featureSets";
import * as Registry from "../../core/registry";
import { renderEdgeFeature } from "../../view/render2D/dxfObjectRenderer2D";
import paper from "paper";

var getLayerColor = function(feature) {
    let height = feature.getValue("height");
    let layerHeight = 1; // feature.layer.estimateLayerHeight();
    let decimal = height / layerHeight;
    if (decimal > 1) decimal = 1;
    if (!feature.layer.flip) decimal = 1 - decimal;
    let targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
};

var getBaseColor = function(feature) {
    let decimal = 0;
    if (!feature.layer.flip) decimal = 1 - decimal;
    let targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
};

export function getDefaultValueForType(typeString, setString, key) {
    return Feature.getDefaultsForType(typeString, setString)[key];
}

export function getFeatureRenderer(typeString, setString) {
    if (typeString == "TEXT") {
        let rendererInfo = renderTextTarget;
        return rendererInfo;
    } else if (typeString == "EDGE") {
        return renderEdge;
    } else {
        let rendererInfo = FeatureSets.getRender2D(typeString, setString);
        return rendererInfo;
    }
}

export function getPrimitive2D(typeString, setString) {
    console.error("What are Primitive sets ?");
    //return PrimitiveSets2D[setString][typeString]; //Looks like the primitivesets2d are the function pointers
}

export function renderTarget(typeString, setString, position) {
    let rendererinfo = getFeatureRenderer(typeString, setString);
    let renderer = rendererinfo.object;
    let params = renderer.targetParams;
    let primParams = {};
    for (let key in params) {
        primParams[key] = getDefaultValueForType(typeString, setString, params[key]);
    }
    primParams["position"] = position;
    primParams["color"] = Colors.getDefaultFeatureColor(typeString, setString, Registry.currentLayer);
    let rendered = renderer.render2DTarget(null, primParams);
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
    let rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = "center";
    rendered.fillColor = Colors.DEEP_PURPLE_500;
    rendered.content = Registry.text;
    rendered.fontSize = 10000 / 3;
    return rendered;
}

export function renderEdge(feature) {
    //TODO: Just call the DXF renderer (outline) for this
    renderEdgeFeature(feature);
}

export function renderText(feature) {
    //TODO - Figure out where to save the position of the feature
    let position = feature.getValue("position");
    let rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = "center";
    rendered.fillColor = Colors.DEEP_PURPLE_500;
    ///rendered.content = feature.getText();
    rendered.content = feature.getValue("text");
    rendered.fontSize = 10000 / 3;
    rendered.featureID = feature.getID();
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
    let type = feature.getType();
    let set = feature.getSet();
    if (type == "TEXT") {
        return renderText(feature);
    } else if (set === "Custom") {
        rendered = DXFSolidObjectRenderer2D.renderCustomComponentFeature(feature, getBaseColor(feature));
        rendered.featureID = feature.getID();

        return rendered;
    } else if (type === "EDGE") {
        return renderEdge(feature);
    } else {
        let rendererinfo = getFeatureRenderer(type, set);
        let renderer = rendererinfo.object;

        /*
        If the user does not specify the key, then extract it from the rendering info of the feature.
        I guess theoretically speaking, one needs to generate a set of invisible feature but for now we are just
        ignoring that.
         */

        if (null === key) {
            key = rendererinfo.key;
        }

        if (!renderer) {
            console.error("Could not find renderer method for feature:", feature);
        } else {
            params = renderer.featureParams;
        }

        let primParams = {};
        for (let key in params) {
            primParams[key] = feature.getValue(params[key]);
        }
        primParams["color"] = getLayerColor(feature);
        primParams["baseColor"] = getBaseColor(feature);
        rendered = renderer.render2D(primParams, key);
        rendered.featureID = feature.getID();

        return rendered;
    }
}
