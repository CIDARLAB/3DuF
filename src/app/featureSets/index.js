import * as DXFSolidObjectRenderer2D from "../view/render2D/dxfSolidObjectRenderer2D";
import CustomComponent from "../core/customComponent";

const FeatureSet = require("./featureSet");
const registeredFeatureSets = {};
const typeStrings = {};
const Registry = require("../core/registry");

// add more sets here!
const requiredSets = {
    "Basic": require("./basic")
};

registerSets(requiredSets);

function makeFeatureSet(set, name) {
    let newSet = new FeatureSet(set.definitions, set.tools, set.render2D, set.render3D, name);
    return newSet;
}

function registerSets(sets) {
    for (let key in sets) {
        let newSet = makeFeatureSet(sets[key], key);
        registeredFeatureSets[key] = newSet;
        Registry.featureDefaults[key] = newSet.getDefaults();
    }
}

function getSet(setString){
    return registeredFeatureSets[setString];
}

function getDefinition(typeString, setString) {

    let set = getSet(setString);
    // console.log("Set:", set);
    if(set != undefined || set != null){
        let def = set.getDefinition(typeString);
        return def;
    } else if(setString === 'Custom'){
        return CustomComponent.defaultParameterDefinitions();
    }else{
        return null;
    }
}

function getTool(typeString, setString){
    let set = getSet(setString);
    return set.getTool(typeString);
}

function getRender2D(typeString, setString){
    let set;
    if (setString === "Custom") {
        return DXFSolidObjectRenderer2D.renderCustomComponentFeature;
    } else {
        set = getSet(setString);
        return set.getRender2D(typeString);
    }
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