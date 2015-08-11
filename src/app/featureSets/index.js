var FeatureSet = require("./featureSet");
var registeredFeatureSets = {};
var typeStrings = {};

// add more sets here!
var requiredSets = {
    "Basic": require("./basic"),
}

registerSets(requiredSets);
checkForDuplicates();

function makeFeatureSet(set, name) {
    return new FeatureSet(name, set.definitions, set.tools2D, set.renderers2D, set.renderers3D);
}

function registerSets(sets) {
    for (let key in sets) {
        registeredFeatureSets[key] = makeFeatureSet(sets[key], key);
    }
}

function checkForDuplicates() {
    for (let currentName in registeredFeatureSets) {
        let currentSet = registeredFeatureSets[currentName];
        for (let targetName in registeredFeatureSets) {
            if (currentName != targetName) {
                let targetSet = registeredFeatureSets[targetName];
                for (let featureTypeString in targetSet.getDefinitions()) {
                    if (currentSet.containsDefinition(featureTypeString)) {
                        throw new Error("Found duplicate feature typeString " + featureTypeString +
                            " in sets" + currentName + " and " + targetName);
                    }
                }
            }
        }
    }
}

function findContainingSet(typeString) {
    for (let setName in registeredFeatureSets) {
        let set = registeredFeatureSets[setName];
        if (set.containsDefinition(typeString)) return set.getDefinition(typeString);
    }
    throw new Error("Unable to find a definition for: " + typeString + " in any registered FeatureSet.");
}

function getDefinition(typeString) {
    let set = findContainingSet(typeString);
    return set.getDefinition(typeString);
}

function getTool(typeString){
    let set = findContainingSet(typeString);
    return set.getTool(typeString);
}

function getRenderer2D(typeString){
    let set = findContainingSet(typeString);
    return set.getTool(typeString);
}

function getRenderer3D(typeString){
    let set = findContainingSet(typeString);
    return set.getTool(typeString);
}