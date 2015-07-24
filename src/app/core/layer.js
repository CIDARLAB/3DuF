var Params = require('./values').Params;
var FloatValue = require('./values').FloatValue;
var BooleanValue = require('./values').BooleanValue;
var StringValue = require('./values').StringValue;
var Feature = require('./feature');
var Parameters = require('./parameters');

var FloatValue = Parameters.FloatValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;

class Layer {
    constructor(z_offset, flip, name = "New Layer") {
        this.params = {};
        if (z_offset == undefined || flip == undefined || name == undefined) {
            throw new Error("Cannot create feature with undefined values. z_offset: " + z_offset + "flip: " + flip + "name: " + name);
        }
        if (z_offset < 0) {
            throw new Error("Layer z_offset must be >= 0.");
        }
        this.params.z_offset = new FloatValue(z_offset);
        this.params.flip = new BooleanValue(flip);
        this.name = new StringValue(name);
        this.features = {};
        this.featureCount = 0;
    }

    addFeature(feature) {
        this.__ensureIsAFeature(feature);
        this.features[feature.id] = feature;
        this.featureCount += 1;
    }

    __ensureIsAFeature(feature) {
        if (!(feature instanceof Feature)) throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
    }

    __ensureFeatureExists(feature) {
        if (!this.containsFeature(feature)) throw new Error("Layer does not contain the specified feature!");
    }

    __ensureFeatureIDExists(featureID) {
        if (!this.containsFeatureID(featureID)) throw new Error("Layer does not contain a feature with the specified ID!");
    }

    getFeature(featureID) {
        this.__ensureFeatureIDExists(featureID)
        return this.features[featureID];
    }

    removeFeature(feature) {
        this.__ensureFeatureExists(feature);
        this.features[feature.id] = undefined;
        this.featureCount -= 1;
    }

    containsFeature(feature) {
        this.__ensureIsAFeature(feature);
        return (this.features.hasOwnProperty(feature.id));
    }

    containsFeatureID(featureID) {
        return this.features.hasOwnProperty(featureID);
    }

    __featuresToJSON() {
        let output = {};
        for (let i in this.features) {
            output[i] = this.features[i].toJSON();
        }
    }

    __loadFeaturesFromJSON(json) {
        for (let i in json) {
            this.addFeature(Feature.fromJSON(json[i]));
        }
    }

    //TODO: Replace Params and remove static method
    toJSON() {
        let output = {};
        output.name = this.name.toJSON();
        output.params = Params.toJSON(this.params);
        output.features = this.__featuresToJSON();
        return output;
    }

    static fromJSON(json) {
        if (!json.hasOwnProperty("features")) {
            throw new Error("JSON layer has no features!");
        }
        let jsonParams = Params.fromJSON(json.params);
        let newLayer = new Layer(jsonParams.z_offset.value, jsonParams.flip.value, json.name.value);
        newLayer.__loadFeaturesFromJSON(json.features);
        return newLayer;
    }
}

module.exports = Layer;