import EdgeFeature from "./edgeFeature";
import Feature from "./feature";
import TextFeature from "./textFeature";
import Params from "./params";

import * as Registry from "./registry";

export default class Layer {
    constructor(values, name = "New Layer") {
        this.params = new Params(values, Layer.getUniqueParameters(), Layer.getHeritableParameters());
        this.name = String(name);
        this.features = {};
        this.featureCount = 0;
        this.device = undefined;
        this.color = undefined;
    }

    addFeature(feature) {
        this.__ensureIsAFeature(feature);
        this.features[feature.getID()] = feature;
        this.featureCount += 1;
        feature.layer = this;
        if (Registry.viewManager) Registry.viewManager.addFeature(feature);
    }

    updateParameter(key, value) {
        this.params.updateParameter(key, value);
        if (Registry.viewManager) Registry.viewManager.updateLayer(this);
    }

    setColor(layerColor) {
        this.color = layerColor;
        if (Registry.viewManager) Registry.viewManager.updateLayer(this);
    }

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
    __ensureIsAFeature(feature) {
        if (!(feature instanceof Feature) && !(feature instanceof TextFeature) && !(feature instanceof EdgeFeature)) {
            throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
        }
    }

    __ensureFeatureExists(feature) {
        if (!this.containsFeature(feature)) throw new Error("Layer does not contain the specified feature!");
    }

    __ensureFeatureIDExists(featureID) {
        if (!this.containsFeatureID(featureID)) throw new Error("Layer does not contain a feature with the specified ID!");
    }

    static getUniqueParameters() {
        return {
            z_offset: "Float",
            flip: "Boolean"
        };
    }

    static getHeritableParameters() {
        return {};
    }

    getFeature(featureID) {
        this.__ensureFeatureIDExists(featureID);
        return this.features[featureID];
    }

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

    containsFeature(feature) {
        this.__ensureIsAFeature(feature);
        return this.features.hasOwnProperty(feature.getID());
    }

    containsFeatureID(featureID) {
        return this.features.hasOwnProperty(featureID);
    }
    getAllFeaturesFromLayer() {
        return this.features;
    }
    __renderFeatures2D() {
        let output = [];
        for (let i in this.features) {
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

    __featuresInterchangeV1() {
        let output = {};
        for (let i in this.features) {
            output[i] = this.features[i].toInterchangeV1();
        }
        return output;
    }

    __loadFeaturesFromJSON(json) {
        for (let i in json) {
            this.addFeature(Feature.fromJSON(json[i]));
        }
    }

    __loadFeaturesFromInterchangeV1(json) {
        for (let i in json) {
            this.addFeature(Feature.fromInterchangeV1(json[i]));
        }
    }

    //TODO: Replace Params and remove static method
    toJSON() {
        let output = {};
        output.name = this.name.toJSON();
        output.color = this.color;
        output.params = this.params.toJSON();
        output.features = this.__featuresToJSON();
        return output;
    }

    toInterchangeV1() {
        let output = {};
        output.name = this.name;
        output.color = this.color;
        output.params = this.params.toJSON();
        output.features = this.__featuresInterchangeV1();
        return output;
    }

    static fromJSON(json) {
        if (!json.hasOwnProperty("features")) {
            throw new Error("JSON layer has no features!");
        }
        let newLayer = new Layer(json.params, json.name);
        newLayer.__loadFeaturesFromJSON(json.features);
        if (json.color) newLayer.color = json.color;
        return newLayer;
    }

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

    render2D(paperScope) {
        return this.__renderFeatures2D();
    }
}
