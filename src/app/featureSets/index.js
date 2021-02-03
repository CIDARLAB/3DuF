import * as DXFSolidObjectRenderer2D from "../view/render2D/dxfSolidObjectRenderer2D";
import CustomComponent from "../core/customComponent";
import FeatureSet from "./featureSet";
import * as Basic from "./basic";

const registeredFeatureSets = {};
const typeStrings = {};
import * as Registry from "../core/registry";

// add more sets here!
const requiredSets = {
    Basic: Basic
};

registerSets(requiredSets);

function registerSets(sets) {
    for (let key in sets) {
        let name = key;
        let set = sets[key];

        let newSet = new FeatureSet(set.definitions, set.tools, set.render2D, set.render3D, name);
        Registry.featureSet = newSet;
        registeredFeatureSets[key] = newSet;
        Registry.featureDefaults[key] = newSet.getDefaults();
    }
}

export function getSet(setString) {
    return registeredFeatureSets[setString];
}

export function getDefinition(typeString, setString) {
    let set = getSet(setString);
    // console.log("Set:", set);
    if (set != undefined || set != null) {
        let def = set.getDefinition(typeString);
        return def;
    } else if (setString === "Custom") {
        return CustomComponent.defaultParameterDefinitions();
    } else {
        return null;
    }
}

export function getTool(typeString, setString) {
    let set = getSet(setString);
    return set.getTool(typeString);
}

export function getRender2D(typeString, setString) {
    let set;
    if (setString === "Custom") {
        return DXFSolidObjectRenderer2D.renderCustomComponentFeature;
    } else {
        set = getSet(setString);
        return set.getRender2D(typeString);
    }
}

export function getTechnologyDefinition(typeString, setString){
    let set = getSet(setString);
    return set.getTechnology(typeString);
}

export function getRender3D(typeString, setString) {
    let set = getSet(setString);
    return set.getRender3D(typeString);
}

export function getComponentPorts(params, typeString, setString = "Basic") {
    let set = getSet(setString);
    return set.getComponentPorts(typeString);
}
