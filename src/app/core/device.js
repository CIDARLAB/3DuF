var Params = require("./params");
var Parameters = require("./parameters");
var Parameter =require("./parameter");
var Feature = require('./feature')
var Layer = require('./layer');
var Registry = require("./registry");

var StringValue = Parameters.StringValue;
var FloatValue = Parameters.FloatValue;

/* The Device stores information about a design. */
class Device {
    constructor(values, name = "New Device") {
        this.layers = [];
        this.params = new Params(values, Device.getUniqueParameters(), Device.getHeritableParameters());
        this.name = StringValue(name);
    }

    setName(name){
        this.name = StringValue(name);
        this.updateView();
    }

    updateParameter(key, value){
        this.params.updateParameter(key, value);
        this.updateView();
    }

    /* Sort the layers such that they are ordered from lowest to highest z_offset. */
    sortLayers() {
        this.layers.sort(function(a, b) {
            return a.params.getValue("z_offset") - b.params.getValue("z_offset");
        });
    }

    getLayerFromFeatureID(featureID){
        for (let i = 0; i < this.layers.length; i ++){
            let layer = this.layers[i];
            if (layer.containsFeatureID(featureID)){
                return layer;
            } 
        } 
        throw new Error("FeatureID " + featureID + " not found in any layer.");
    }

    containsFeatureID(featureID){
        for (let i = 0; i < this.layers.length; i ++){
            if (this.layers[i].containsFeatureID(featureID)) return true;
        }
        return false;
    }

    getFeatureByID(featureID){
        let layer =  this.getLayerFromFeatureID(featureID);
        return layer.getFeature(featureID);
    }

    /* Add a layer, and re-sort the layers array.*/
    addLayer(layer) {
        layer.device = this;
        this.layers.push(layer);
        this.sortLayers();
        if (Registry.viewManager) Registry.viewManager.addLayer(this.layers.indexOf(layer));
    }
    
    removeFeature(feature){
        this.removeFeatureByID(feature.getID());
    }

    removeFeatureByID(featureID){
        let layer = this.getLayerFromFeatureID(featureID);
        layer.removeFeatureByID(featureID);
    }

    updateViewLayers(){
        if (Registry.viewManager) Registry.viewManager.updateLayers(this);
    }

    updateView(){
        if (Registry.viewManager) Registry.viewManager.updateDevice(this);
    }

    static getUniqueParameters(){
        return {
            "height": "Float",
            "width": "Float"
        }
    }

    static getHeritableParameters(){
        return {};
    }

    __renderLayers2D(){
        let output = [];
        for (let i = 0; i < this.layers.length; i++){
            output.push(this.layers[i].render2D())
        }
        return output;
    }

    __groupsToJSON() {
        let output = [];
        for (let i in this.groups) {
            output.push(this.groups[i].toJSON());
        }
        return output;
    }

    __layersToJSON() {
        let output = [];
        for (let i in this.layers) {
            output.push(this.layers[i].toJSON());
        }
        return output;
    }

    __featureLayersToInterchangeV1(){
        let output = [];
        for(let i in this.layers){
            output.push(this.layers[i].toInterchangeV1())
        }
        return output;
    }

    __loadLayersFromJSON(json) {
        for (let i in json) {
            let newLayer = Layer.fromJSON(json[i]);
            this.addLayer(newLayer);
        }
    }

    __loadFeatureLayersFromInterchangeV1(json){
        for (let i in json){
            let newLayer = Layer.fromInterchangeV1(json[i]);
            this.addLayer(newLayer);
        }
    }

    toJSON() {
        let output = {};
        output.name = this.name.toJSON();
        output.params = this.params.toJSON();
        output.layers = this.__layersToJSON();
        output.groups = this.__groupsToJSON();
        output.defaults = this.defaults;
        return output;
    }

    toInterchangeV1() {
        let output = {};
        output.name = this.name.toJSON();
        output.params = this.params.toJSON();
        //TODO: Use this to dynamically create enough layers to scroll through
        // output.layers = this.__layersToInterchangeV1();
        // output.components = this.__componentsToInterchangeV1();
        // output.connections = this.__connectionToInterchangeV1();
        //TODO: Use this to render the device features
        output.flayers = this.__featureLayersToInterchangeV1();
        output.version = 1;
        output.groups = this.__groupsToJSON();
        return output;
    }

    static fromJSON(json) {
        let defaults = json.defaults;
        let newDevice = new Device({
            "width": json.params.width,
            "height": json.params.height
        }, json.name);
        newDevice.__loadLayersFromJSON(json.layers);
        return newDevice;
    }

    static fromInterchangeV1(json) {
        let defaults = json.defaults;
        let newDevice = new Device({
            "width": json.params.width,
            "height": json.params.height
        }, json.name);
        //TODO: Use this to dynamically create enough layers to scroll through
        //newDevice.__loadLayersFromInterchangeV1(json.layers);
        //TODO: Use these two generate a rat's nest
        //newDevice.__loadComponentsFromInterchangeV1(json.layers);
        //newDevice.__loadConnectionsFromInterchangeV1(json.layers);
        //TODO: Use this to render the device features
        newDevice.__loadFeatureLayersFromInterchangeV1(json.flayers);
        return newDevice;
    }


    render2D(){
        return this.__renderLayers2D();
    }
}

module.exports = Device;