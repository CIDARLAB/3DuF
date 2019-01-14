import Feature from "../core/feature";
import Port from "../library/port";
import Channel from "../library/channel";
import BetterMixer from "../library/betterMixer";
import RotaryMixer from "../library/rotaryMixer";

export default class FeatureSet {
    constructor(definitions, tools, render2D, render3D, setString) {
        this.__definitions = definitions;
        this.__setString = setString;
        this.__tools = tools;
        this.__render2D = render2D;
        this.__render3D = render3D;
        //TODO: Replace this cumbersome mechanism for generating different feature variants, etc.
        this.__library = {
            "Port": {"object": new Port(), "key": null},
            "Channel": {"object": new Channel(), "key":null },
            "BetterMixer": {"object": new BetterMixer(), "key":"FLOW" },
            "RotaryMixer": {"object": new RotaryMixer(), "key":"FLOW" },
            "RotaryMixer_control": {"object": new RotaryMixer(), "key":"CONTROL"}
        };
        // this.__checkDefinitions();
        console.warn("Skipping definition check over here ");
    }

    containsDefinition(featureTypeString) {
        if (this.__definitions.hasOwnProperty(featureTypeString)) return true;
        else return false;
    }

    getDefaults() {
        let output = {};
        for (let key in this.__library){
            output[key] = this.__library[key].object.defaults;
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
        let definition = this.__library[typeString].object;
        let ret = {
            "unique": definition.unique,
            "heritable": definition.heritable,
            "units": definition.units,
            "defaults": definition.default,
            "minimum": definition.minimum,
            "maximum": definition.maximum
        };
        return this.__definitions[typeString];
    }

    getRender3D(typeString){
        return this.__render3D[typeString];
    }

    /*
    Returns the library/technology description instead of the function pointer as it was doing before
     */
    getRender2D(typeString){
        return this.__library[typeString];
    }

    getTool(typeString){
        return this.__definitions[typeString].tool;
    }

    makeFeature(typeString, setString, values, name){
        throw new Error("MAke featre in feature set is being called");
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
