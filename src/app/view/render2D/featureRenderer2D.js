var Colors = require("../colors");
var Feature = require("../../core/feature");
var PrimitiveSets2D = require("./primitiveSets2D");
var FeatureSets = require("../../featureSets");
var Registry = require("../../core/registry");

function getLayerColor(feature) {
    let height = feature.getValue("height");
    let layerHeight = 1; // feature.layer.estimateLayerHeight();
    let decimal = height / layerHeight;
    if (decimal >1) decimal = 1;
    if (!feature.layer.flip) decimal = 1 - decimal;
    let targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
}

function getBaseColor(feature) {
    let decimal = 0;
    if (!feature.layer.flip) decimal = 1 - decimal;
    let targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
}

function getDefaultValueForType(typeString, setString, key) {
    return Feature.getDefaultsForType(typeString, setString)[key];
}

function getFeatureRenderer(typeString, setString) {
    if(typeString == "TEXT"){
        let rendererInfo = renderTextTarget;
        return rendererInfo;
    }else{
        let rendererInfo = FeatureSets.getRender2D(typeString, setString);
        return rendererInfo;
    }
}

function getPrimitive2D(typeString, setString) {
    return PrimitiveSets2D[setString][typeString];
}

function renderTarget(typeString, setString, position) {
    let renderer = getFeatureRenderer(typeString, setString);
    let params = renderer.targetParams;
    let prim = getPrimitive2D(renderer.targetPrimitiveType, renderer.targetPrimitiveSet);
    let primParams = {};
    for (let key in params) {
        primParams[key] = getDefaultValueForType(typeString, setString, params[key]);
    }
    primParams["position"] = position;
    primParams["color"] = Colors.getDefaultFeatureColor(typeString, setString, Registry.currentLayer);
    let rendered = prim(primParams);
    return rendered;
}

/**
 * This function renders the text to target that trails the cursor
 * @param typeString
 * @param setString
 * @param position
 * @return {d}
 */
function renderTextTarget(typeString, setString, position) {
    let rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = 'center';
    rendered.fillColor = Colors.DEEP_PURPLE_500;
    rendered.content = Registry.text;
    rendered.fontSize = 10000/3;
    return rendered;
}


function renderText(feature){
    //TODO - Figure out where to save the position of the feature
    let position = feature.getValue("position");
    let rendered = new paper.PointText(new paper.Point(position[0], position[1]));
    rendered.justification = 'center';
    rendered.fillColor = Colors.DEEP_PURPLE_500;
    ///rendered.content = feature.getText();
    rendered.content = feature.getValue("text");
    rendered.fontSize = 10000/3;
    rendered.featureID = feature.getID();
    return rendered;

}

function renderFeature(feature) {
    let type = feature.getType();
    let set = feature.getSet();
    let renderer = getFeatureRenderer(type, set);
    let params = renderer.featureParams;
    if (type == "TEXT") {
        return renderText(feature);
    } else {
        let prim = getPrimitive2D(renderer.featurePrimitiveType, renderer.featurePrimitiveSet);
        let primParams = {};
        for (let key in params) {
            primParams[key] = feature.getValue(params[key]);
        }
        primParams["color"] = getLayerColor(feature);
        primParams["baseColor"] = getBaseColor(feature);
        let rendered = prim(primParams);
        rendered.featureID = feature.getID();

        return rendered;
    }
}

module.exports.renderFeature = renderFeature;
module.exports.renderTarget = renderTarget;
module.exports.renderTextTarget = renderTextTarget;
module.exports.renderText = renderText;
