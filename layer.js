import EdgeFeature from "./edgeFeature";
import Feature from "./feature";
import TextFeature from "./textFeature";
import Params from "./params";

import * as Registry from "./registry";

export default class Layer {
    /**
     * Default Constructor for the layer
     * @param {*} values Value of the layer
     * @param {String} name Name of the layer
     */
    constructor(values, name = "New Layer") {
        this.params = new Params(values, Layer.getUniqueParameters(), Layer.getHeritableParameters());
        this.name = String(name);
        this.features = {};
        this.featureCount = 0;
        this.device = undefined;
        this.color = undefined;
    }
    /**
     * Adds a feature to the layer
     * @param {*} feature Feature to pass to add to the layer
     */
    addFeature(feature) {
        this.__ensureIsAFeature(feature);
        this.features[feature.getID()] = feature;
        this.featureCount += 1;
        feature.layer = this;
        if (Registry.viewManager) Registry.viewManager.addFeature(feature);
    }
    /**
     * Selects a parameter corresponding to the key identifier and assigns it to the new value
     * @param {*} key Key to identify the parameter
     * @param {*} value Value to be assing to the parameter
     */
    updateParameter(key, value) {
        this.params.updateParameter(key, value);
        if (Registry.viewManager) Registry.viewManager.updateLayer(this);
    }
    /**
     * Sets color for the layer
     * @param {*} layerColor 
     */
    setColor(layerColor) {
        this.color = layerColor;
        if (Registry.viewManager) Registry.viewManager.updateLayer(this);
    }
    /**
     * Returns index of layer
     * @returns
     */
    getIndex() {
        if (this.device) return this.device.layers.indexOf(this);
    }
    /*
    estimateLayerHeight(){
        let dev = this.device;
        let flip = this.params.getValue("flip");
        let offset = this.params.getValue("z_offset");
        if (dev){
            let thisIndex = this.getIndex();
            let targetIndex;
            if (flip) targetIndex = thisIndex - 1;
            else targetIndex = thisIndex + 1;
            if (thisIndex >= 0 || thisIndex <= (dev.layers.length -1)){
                let targetLayer = dev.layers[targetIndex];
                return Math.abs(offset - targetLayer.params.getValue("z_offset"));
            } else {
                if (thisIndex -1 >= 0){
                    let targetLayer = dev.layers[thisIndex -1];
                    return targetLayer.estimateLayerHeight();
                } 
            }
        }
        return 0;
    }
*/  
    /**
     * Checks whether the argument pass is a feature
     * @param {*} feature 
     */
    __ensureIsAFeature(feature) {
        if (!(feature instanceof Feature) && !(feature instanceof TextFeature) && !(feature instanceof EdgeFeature)) {
            throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
        }
    }
    /**
     * Checks whether the feature already exist
     * @param {} feature 
     */
    __ensureFeatureExists(feature) {
        if (!this.containsFeature(feature)) throw new Error("Layer does not contain the specified feature!");
    }
    /**
     * Checks if feature exist based on it's ID
     * @param {*} featureID 
     */
    __ensureFeatureIDExists(featureID) {
        if (!this.containsFeatureID(featureID)) throw new Error("Layer does not contain a feature with the specified ID!");
    }
    /**
     * Returns unique parameters 
     * @returns
     */
    static getUniqueParameters() {
        return {
            z_offset: "Float",
            flip: "Boolean"
        };
    }
    /**
     * Returns heritable parameters
     * @returns
     */
    static getHeritableParameters() {
        return {};
    }
    /**
     * Returns feature based on it's ID
     * @param {*} featureID 
     * @returns 
     */
    getFeature(featureID) {
        this.__ensureFeatureIDExists(featureID);
        return this.features[featureID];
    }
    /**
     * Removes selected feature
     * @param {*} feature 
     */
    removeFeature(feature) {
        this.removeFeatureByID(feature.getID());
    }

    //TODO: Stop using delete, it's slow!
    removeFeatureByID(featureID) {
        this.__ensureFeatureIDExists(featureID);
        let feature = this.features[featureID];
        this.featureCount -= 1;
        if (Registry.viewManager) Registry.viewManager.removeFeature(feature);
        delete this.features[featureID];
    }
    /**
     * Checks if object contains a feature
     * @param {*} feature 
     * @returns
     */
    containsFeature(feature) {
        this.__ensureIsAFeature(feature);
        return this.features.hasOwnProperty(feature.getID());
    }
    /**
     * Checks if object contains a feature based on the feature's ID
     * @param {*} featureID 
     * @returns
     */
    containsFeatureID(featureID) {
        return this.features.hasOwnProperty(featureID);
    }
    /**
     * Gets all features from the layers
     * @returns Returns all features from the layers
     */
    getAllFeaturesFromLayer() {
        return this.features;
    }
    /**
     * Render all the features in 2D
     * @returns {Array} Returns array with the renders of the features in 2D
     */
    __renderFeatures2D() {
        let output = [];
        for (let i in this.features) {
            output.push(this.features[i].render2D());
        }
        return output;
    }
    /**
     * Convers features to JSON format
     * @returns {JSON} Returns a JSON format with the features in a JSON format
     */
    __featuresToJSON() {
        let output = {};
        for (let i in this.features) {
            output[i] = this.features[i].toJSON();
        }
        return output;
    }
    /**
     * Converts features to Interchange format
     * @returns Returns an array with the features in Interchange format
     */
    __featuresInterchangeV1() {
        let output = {};
        for (let i in this.features) {
            output[i] = this.features[i].toInterchangeV1();
        }
        return output;
    }
    /**
     * Loads features from JSON format
     * @param {*} json 
     */
    __loadFeaturesFromJSON(json) {
        for (let i in json) {
            this.addFeature(Feature.fromJSON(json[i]));
        }
    }
    /**
     * Loads features from Interchange format
     * @param {*} json 
     */
    __loadFeaturesFromInterchangeV1(json) {
        for (let i in json) {
            this.addFeature(Feature.fromInterchangeV1(json[i]));
        }
    }

    //TODO: Replace Params and remove static method
    /**
     * Converts the attributes of the object into a JSON format
     * @returns {JSON} Returns a JSON format with the attributes of the object
     */
    toJSON() {
        let output = {};
        output.name = this.name.toJSON();
        output.color = this.color;
        output.params = this.params.toJSON();
        output.features = this.__featuresToJSON();
        return output;
    }
    /**
     * Converts the attributes of the object into Interchange format
     * @returns {*} Returns a Interchange format with the attributes of the object
     */
    toInterchangeV1() {
        let output = {};
        output.name = this.name;
        output.color = this.color;
        output.params = this.params.toJSON();
        output.features = this.__featuresInterchangeV1();
        return output;
    }
    /**
     * Load from a JSON format a new layer object
     * @param {JSON} json JSON format
     * @returns {Object} Returns a new layer object
     */
    static fromJSON(json) {
        if (!json.hasOwnProperty("features")) {
            throw new Error("JSON layer has no features!");
        }
        let newLayer = new Layer(json.params, json.name);
        newLayer.__loadFeaturesFromJSON(json.features);
        if (json.color) newLayer.color = json.color;
        return newLayer;
    }
    /**
     * Load from an Interchange format a new layer object
     * @param {*} json 
     * @returns {Object} Returns a new layer object
     */
    static fromInterchangeV1(json) {
        //TODO: Need to be able to through all the features in the layer
        if (!json.hasOwnProperty("features")) {
            throw new Error("JSON layer has no features!");
        }
        let newLayer = new Layer(json.params, json.name);
        newLayer.__loadFeaturesFromInterchangeV1(json.features);
        if (json.color) newLayer.color = json.color; //TODO: Figure out if this needs to change in the future
        return newLayer;
    }
    /**
     * Render in 2D the features
     * @param {*} paperScope 
     * @returns Returns the renders
     */
    render2D(paperScope) {
        return this.__renderFeatures2D();
    }
}
