import Feature from "../core/feature";

class FeatureSet {
    constructor(definitions, tools, render2D, render3D, setString) {
        this.__definitions = definitions;
        this.__setString = setString;
        this.__tools = tools;
        this.__render2D = render2D;
        this.__render3D = render3D;
        this.__checkDefinitions();
    }

    containsDefinition(featureTypeString) {
        if (this.__definitions.hasOwnProperty(featureTypeString)) return true;
        else return false;
    }

    getDefaults() {
        let output = {};
        let defs = this.__definitions;
        for (let key in defs){
            output[key] = defs[key]["defaults"];
        }
        return output;
    }

    getFeatureType(typeString){
        let setString = this.name;
        let defaultName = "New " + setString + "." + typeString;
        return function(values, name = defaultName){
            return Feature.makeFeature(typeString, setString, values, name);
        }
    }

    getSetString(){
        return this.setString;
    }

    getDefinition(typeString){
        return this.__definitions[typeString];
    }

    getRender3D(typeString){
        return this.__render3D[typeString];
    }

    getRender2D(typeString){
        return this.__render2D[typeString];
    }

    getTool(typeString){
        return this.__tools[typeString];
    }

    makeFeature(typeString, setString, values, name){
        console.log(setString);
        let set = getSet(setString);
        let featureType = getFeatureType(typeString);
        return featureType(values, name);
    }

    __checkDefinitions() {
        for (let key in this.__definitions) {
            if (!this.__tools.hasOwnProperty(key) || !this.__render2D.hasOwnProperty(key) || !this.__render3D.hasOwnProperty(key)) {
                throw new Error("Feature set does not contain a renderer or tool definition for: " + key);
            }
        }
    }
}

module.exports = FeatureSet;