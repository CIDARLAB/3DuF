var FeatureSet = require("./featureSet");
var registeredFeatureSets = {};
var typeStrings = {};

// add more sets here!
var requiredSets = {
    "Basic": require("./basic")
}

registerSets(requiredSets);

function makeFeatureSet(set, name) {
    let newSet = new FeatureSet(set.definitions, set.tools, set.render2D, set.render3D, name);
    return newSet;
}

function registerSets(sets) {
    for (let key in sets) {
        registeredFeatureSets[key] = makeFeatureSet(sets[key], key);
    }
}

function getSet(setString){
    return registeredFeatureSets[setString];
}

function getDefinition(typeString, setString) {
    var set = getSet(setString);
    let def = set.getDefinition(typeString);
    return def;
}

function getTool(typeString, setString){
    let set = getSet(setString);
    return set.getTool(typeString);
}

function getRender2D(typeString, setString){
    let set = getSet(setString);
    return set.getRender2D(typeString);
}

function getRender3D(typeString, setString){
    let set = getSet(setString);
    return set.getRender3D(typeString);
}

module.exports.getSet = getSet;
module.exports.getDefinition = getDefinition;
module.exports.getTool = getTool;
module.exports.getRender2D = getRender2D;
module.exports.getRender3D = getRender3D;