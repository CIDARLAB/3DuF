var FeatureSets = require("../../featureSets");
var FeatureRenderer = require("./FeatureRenderer");

function importFeatureSet(featureSet) {
    for (let type in featureSet.getRenderers2D()) {
        let renderer = featureSet.getRenderers2D()[type];
        console.log("Importing feature renderer:" + type);
        FeatureRenderer.registerFeatureType(type, renderer.featureParams, renderer.targetParams, renderer.featurePrimitive, renderer.targetPrimitive);
    }
}

for (let setKey in FeatureSets) {
    importFeatureSet(FeatureSets[setKey]);
    console.log("Imported set" + setKey);
}