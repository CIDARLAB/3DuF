var Colors = require("../colors");
var Feature = require("../../core/feature");
var PrimitiveSets2D = require("./primitiveSets2D");
var FeatureSets = require("../../featureSets");

function getLayerColor(feature) {
    let height = feature.getValue("height");
    let layerHeight = 1 // feature.layer.estimateLayerHeight();
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
    let rendererInfo = FeatureSets.getRender2D(typeString, setString);
    return rendererInfo;
}

function getPrimitive2D(typeString, setString) {
    return PrimitiveSets2D[setString][typeString];
}

function calculateDistance(pointer_position, radius, feature_position) {
    dist = sqrt()
}

function renderTarget(position, radius, features) {
    // let renderer = getFeatureRenderer(typeString, setString);
    // let params = renderer.targetParams;
    // let prim = getPrimitive2D(renderer.targetPrimitiveType, renderer.targetPrimitiveSet);
    // let primParams = {};
    // for (let key in params) {
    //     primParams[key] = getDefaultValueForType(typeString, setString, params[key]);
    // }
    // primParams["position"] = position;
    // primParams["color"] = Colors.getDefaultFeatureColor(typeString, setString, Registry.currentLayer);
    // let rendered = prim(primParams);
    console.log("test 1");
    for(i in features){
        let feature = features[i];
        if(calculateDistance(position, radius, feature.value("position"))){

        }
    }

    return rendered;
}

function renderFeature(feature) {
    let type = feature.getType();
    let set = feature.getSet();
    let renderer = getFeatureRenderer(type, set);
    let params = renderer.featureParams;
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

module.exports.renderFeature = renderFeature;
module.exports.renderTarget = renderTarget;
