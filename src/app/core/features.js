var Feature = require("./feature");
var FeatureSets = require("../featureSets");

function importFeatureSet(featureSet) {
    for (let type in featureSet.getDefinitions()) {
        let definition = featureSet.getDefinitions()[type];
        //Feature.registerFeatureType(type, definition.unique, definition.heritable, definition.defaults);
        module.exports[type] = createFeatureExport(type);
    }
}
/*
for (let setKey in FeatureSets) {
    importFeatureSet(FeatureSets[setKey]);
}
*/

function createFeatureExport(typeString) {
    let defaultName = "New " + typeString;
    return function(values, name = defaultName) {
        return Feature.makeFeature(typeString, values, name);
    }
}



importFeatureSet(FeatureSets["Basic"]);