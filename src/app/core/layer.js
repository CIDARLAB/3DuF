var Params = require('./params');
var Parameters = require('./parameters');
var Feature = require('./feature');
var Registry = require("./registry");

var FloatValue = Parameters.FloatValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;

class Layer {
    constructor(values, name = "New Layer") {
        this.params = new Params(values, Layer.getUniqueParameters(), Layer.getHeritableParameters());
        this.name = new StringValue(name);
        this.features = {};
        this.featureCount = 0;
        this.device = undefined;
    }

    addFeature(feature) {
        this.__ensureIsAFeature(feature);
        this.features[feature.id] = feature;
        this.featureCount += 1;
        feature.layer = this;
        if (Registry.viewManager) Registry.viewManager.addFeature(feature);
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

    static getUniqueParameters(){
        return {
            "z_offset": FloatValue.typeString(),
            "flip": BooleanValue.typeString()
        }
    }

    //TODO: Figure out whether this is ever needed
    static getHeritableParameters(){
        return {};
    }

    getFeature(featureID) {
        this.__ensureFeatureIDExists(featureID)
        return this.features[featureID];
    }

    removeFeature(feature) {
        this.removeFeatureByID(feature.id);
    }

    //TODO: Stop using delete, it's slow!
    removeFeatureByID(featureID){
        this.__ensureFeatureIDExists(featureID);
        let feature = this.features[featureID];
        this.featureCount -= 1;
        if (Registry.viewManager) Registry.viewManager.removeFeature(feature);
        delete this.features[featureID];
    }

    containsFeature(feature) {
        this.__ensureIsAFeature(feature);
        return (this.features.hasOwnProperty(feature.id));
    }

    containsFeatureID(featureID) {
        return this.features.hasOwnProperty(featureID);
    }

    __renderFeatures2D(){
        let output = [];
        for (let i in this.features){
            output.push(this.features[i].render2D());
        }
        return output;
    }

    __featuresToJSON() {
        let output = {};
        for (let i in this.features) {
            output[i] = this.features[i].toJSON();
        }
        return output;
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
        output.params = this.params.toJSON();
        output.features = this.__featuresToJSON();
        return output;
    }

    static fromJSON(json) {
        if (!json.hasOwnProperty("features")) {
            throw new Error("JSON layer has no features!");
        }
        let newLayer = new Layer(json.params, json.name);
        newLayer.__loadFeaturesFromJSON(json.features);
        return newLayer;
    }

    render2D(paperScope){
        return this.__renderFeatures2D();
    }
}

module.exports = Layer;