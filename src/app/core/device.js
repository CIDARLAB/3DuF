import Params from "./params";

const Parameters = require("./parameters");
import Feature from './feature';

const Registry = require("./registry");

import Layer from './layer';
import Component from './component';
import Connection from "./connection";

const StringValue = Parameters.StringValue;

/**
 * The Device stores information about a design.
 */
export default class Device {
    constructor(values, name = "New Device") {
        this.layers = [];
        this.textLayers = [];
        this.params = new Params(values, Device.getUniqueParameters(), Device.getHeritableParameters());
        // this.setXSpan(values.width);
        // this.setYSpan(values.length);

        this.name = StringValue(name);
        this.__components = [];
        this.__nameMap = new Map();
        this.__connections = [];

        //Map to store <componentID, connectionID>
        this.__valveMap = new Map();
    }

    getName(){
        return this.name.getValue();
    }

    /**
     * Returns the list of layers in the device
     * @return {Array}
     */
    getLayers(){
        return this.layers;
    }

    /**
     * Adds a connection to the device
     * @param connection
     */
    addConnection(connection){
        this.__connections.push(connection);
    }

    /**
     * Removes a connection from the device
     * @param connection
     */
    removeConnection(connection){
        let i = this.__connections.indexOf(connection);
        if(i != -1) {
            this.__connections.splice(i, 1);
        }

    }

    /**
     * Adds a component to the device
     * @param component
     */
    addComponent(component){
        if(component instanceof Component){
            this.__components.push(component);
        }else{
            throw new Error("Tried to add a component that isn't a component to the device");
        }
    }

    /**
     * Removes a component from the device
     * @param component
     */
    removeComponent(component){
        //Remove the component from the map
        let trydelete;
        let componentid = component.getID();
        let connectiontorefresh = null;

        //Remove component from connections
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            try{
                trydelete = connection.tryDeleteConnectionTarget(componentid);
                if(trydelete){
                    console.log("Removed Component from Connection : " , connection.getID());
                }
            }catch (e) {
                console.error(e);
            }
        }
        //Check if the valve map has the component
        if(this.__valveMap.has(componentid)){
            connectiontorefresh = this.getConnectionByID(this.__valveMap.get(componentid));
            this.__valveMap.delete(componentid);
        }

        let i = this.__components.indexOf(component);
        if(i != -1) {
            this.__components.splice(i, 1);
        }

        if(connectiontorefresh){
            Registry.viewManager.updatesConnectionRender(connectiontorefresh);
        }
    }

    /**
     * Returns the list of components from the device
     * @return {Array}
     */
    getComponents(){
        return this.__components;
    }

    /**
     * Sets the name of the device
     * @param name
     */
    setName(name){
        this.name = StringValue(name);
        this.updateView();
    }

    /**
     * Updates the parameter
     * @param key
     * @param value
     */
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

    /**
     * Returns the ayer that contains the feature with the given feature ID
     * @param featureID
     * @return Layer
     */
    getLayerFromFeatureID(featureID){
        for (let i = 0; i < this.layers.length; i ++){
            let layer = this.layers[i];
            if (layer.containsFeatureID(featureID)){
                return layer;
            } 
        } 
        for (let i = 0; i < this.textLayers.length; i ++){
            let layer = this.textLayers[i];
            if (layer.containsFeatureID(featureID)){
                return layer;
            }
        }
        throw new Error("FeatureID " + featureID + " not found in any layer.");
    }

    /**
     * Checks if feature with given feature id is part of the device
     * @param featureID
     * @return {boolean}
     */
    containsFeatureID(featureID){
        for (let i = 0; i < this.layers.length; i ++){
            if (this.layers[i].containsFeatureID(featureID)) return true;
        }
        return false;
    }

    /**
     * Returns a list of all the features in the device
     * @return {Array}
     */
    getAllFeaturesFromDevice() {
        let features = [];
        for (let i in this.layers) {
            //features.push.apply(features, layer.features);
            let layer = this.layers[i];
            for(let j in layer.features){
                // console.log(layer.features[j]);
                features.push(layer.features[j]);
            }
        }
        return features;
    }

    /**
     * Returns the feature with the given feature id
     * @param featureID
     * @return Feature
     */
    getFeatureByID(featureID){
        let layer =  this.getLayerFromFeatureID(featureID);
        return layer.getFeature(featureID);
    }

    /* Add a layer, and re-sort the layers array.*/
    addLayer(layer) {
        layer.device = this;
        this.layers.push(layer);
        //this.sortLayers();
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
            "length": "Float",
            "width": "Float"
        }
    }

    /**
     * Update the cross-reference
     * @param objectID
     * @param featureID
     */
    updateObjectReference(objectID, featureID){
        //Goes through the components to update the reference
        let component;
        let foundflag = false;
        for(let i in this.__components){
            component = this.__components[i];
            // console.log(objectID, component.getID());
            if(objectID == component.getID()){
                component.addFeatureID(featureID);
                component.placed = true;
                foundflag = true;
            }
        }

        //Goes through the connection to update the reference
        let connection;
        for(let i in this.__connections){
            connection = this.__connections[i];
            if(objectID == connection.getID()){
                connection.addFeatureID(featureID);
                connection.routed = true;
                foundflag = true;
            }
        }

        if(!foundflag){
            console.error("Could not find object to update reference: " + featureID);
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


    __componentsToInterchangeV1() {
        let output = [];
        for(let i in this.__components){
            output.push(this.__components[i].toInterchangeV1());
        }
        return output;
    }

    __connectionToInterchangeV1() {
        let output = [];
        for(let i in this.__connections){
            output.push(this.__connections[i].toInterchangeV1());
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

    /**
     * Loads the JSON Component object into the device object
     * @param components
     * @private
     */
    __loadComponentsFromInterchangeV1(components) {
        let componenttoadd;

        for(let i in components){
            componenttoadd = Component.fromInterchangeV1(components[i]);
            this.__components.push(componenttoadd);
        }
    }


    __loadConnectionsFromInterchangeV1(connections) {
        let connectiontoload;
        for(let i in connections){
            connectiontoload = Connection.fromInterchangeV1(this, connections[i]);
            this.__connections.push(connectiontoload);
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
        output.name = this.name;
        output.params = {
            "width":this.getXSpan(),
            "length":this.getYSpan()
        };
        //TODO: Use this to dynamically create enough layers to scroll through
        // output.layers = this.__layersToInterchangeV1();
        output.components = this.__componentsToInterchangeV1();
        output.connections = this.__connectionToInterchangeV1();
        //TODO: Use this to render the device features
        output.features = this.__featureLayersToInterchangeV1();
        output.version = 1;
        output.groups = this.__groupsToJSON();
        return output;
    }

    static fromJSON(json) {
        let defaults = json.defaults;
        let newDevice = new Device({
            "width": json.params.width,
            "length": json.params.length
        }, json.name);
        newDevice.__loadLayersFromJSON(json.layers);
        return newDevice;
    }

    static fromInterchangeV1(json) {
        let newDevice;
        if(json.hasOwnProperty("params")){
            if (json.params.hasOwnProperty("width") && json.params.hasOwnProperty("length")) {
                newDevice = new Device({
                    "width": json.params.width,
                    "length": json.params.length
                }, json.name);
            }
        }else{
            console.warn("Could not find device params, using some default values for device size");
            newDevice = new Device({
                "width": 135000,
                "length": 85000
            }, json.name);

        }
        //TODO: Use this to dynamically create enough layers to scroll through
        //newDevice.__loadLayersFromInterchangeV1(json.layers);
        //TODO: Use these two generate a rat's nest
        newDevice.__loadComponentsFromInterchangeV1(json.components);
        newDevice.__loadConnectionsFromInterchangeV1(json.connections);
        //TODO: Use this to render the device features

        //Check if JSON has features else mark
        if(json.hasOwnProperty("features")){
            newDevice.__loadFeatureLayersFromInterchangeV1(json.features);
        }else{
            //We need to add a default layer
            let newlayer = new Layer(null, "flow");
            newDevice.addLayer(newlayer);
            newlayer = new Layer(null, "control");
            newDevice.addLayer(newlayer);

        }

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        let feature;
        for(let i in features){
            //console.log("Feature:", features[i]);
            feature = features[i];
            if(feature.referenceID != null){
                newDevice.updateObjectReference(feature.referenceID, feature.getID());
            }
        }

        return newDevice;
    }

    render2D(){
        return this.__renderLayers2D();
    }

    /**
     * Set the X-Span Value
     * @param value
     */
    setXSpan(value){
        this.params.updateParameter("width", value);
    }

    /**
     * Set the Y-Span Value
     * @param value
     */
    setYSpan(value){
        this.params.updateParameter("length", value);
    }

    /**
     * Returns the X-Span Value
     * @return {*}
     */
    getXSpan(){
        return this.params.getValue("width");
    }

    /**
     * Returns the Y-Span Value
     * @return {*}
     */
    getYSpan(){
        return this.params.getValue("length");
    }

    /**
     * Create the layers necessary for creating a new level
     * @return {*[]} returns a the layer objects created
     */
    createNewLayerBlock(){
        let flowlayer = new Layer({"z_offset": 0, "flip": false}, "flow");
        let controllayer = new Layer({"z_offset": 0, "flip": false}, "control");
        //TODO: remove cell layer from the whole system
        let cell = new Layer({"z_offset": 0, "flip": false}, "cell");

        this.addLayer(flowlayer);
        this.addLayer(controllayer);

        //TODO:Remove Cell layer from the whole system
        this.addLayer(cell);

        return [flowlayer, controllayer, cell];
    }

    /**
     * Deletes the layer defined by the index
     * @param index
     */
    deleteLayer(index){

        if(index != -1) {
            this.layers.splice(index, 1);
        }

    }

    /**
     * Returns the component identified by the id
     * @param id
     * @return Component
     */
    getComponentForFeatureID(id){
        for(let i in this.__components){
            let component = this.__components[i];
            //go through each component's features
            for(let j in component.features){
                let feature = component.features[j];
                if(feature === id){
                    return component;
                }
            }
        }

        return null;
    }

    generateNewName(type) {
        if (this.__nameMap.has(type)) {
            let value = this.__nameMap.get(type);
            this.__nameMap.set(type, value + 1);
            return type + "_" + String(value + 1);
        } else {
            this.__nameMap.set(type, 1);
            return type + "_1";
        }
    }

    /**
     * Returns the connection identified by the id
     * @param id
     * @return Connection
     */
    getConnectionForFeatureID(id){
        for(let i in this.__connections){
            let connection = this.__connections[i];
            //go through each component's features
            for(let j in connection.features){
                let feature = connection.features[j];
                if(feature === id){
                    return connection;
                }
            }
        }

        return null;

    }

    /**
     * Insert a connection between a valve component and the connection component
     * @param valve
     * @param connection
     */
    insertValve(valve, connection){
        this.__valveMap.set(valve.getID(), connection.getID());
    }

    getConnections(){
        return this.__connections;
    }

    //Returns a list of valves mapped onto the connection
    getValvesForConnection(connection){
        let connectionid = connection.getID();
        let ret = [];
        for (let [key, value] of this.__valveMap) {
            // let  = pair;
            if(connectionid == value){
                ret.push(this.getComponentByID(key));
            }
        }

        return ret;
    }

    /**
     * Returns component that is identified by the given key
     * @param key String
     * @return Component
     */
    getComponentByID(key) {
        for(let i in this.__components){
            let component = this.__components[i];
            if(component.getID() === key){
                return component;
            }
        }
    }

    /**
     * Returns connection that is identified by the given key
     * @param key String
     * @return Connection
     */
    getConnectionByID(key){
        for(let i in this.__connections){
            let connection = this.__connections[i];
            if(connection.getID() === key){
                return connection;
            }
        }
    }

    /**
     * Returns the component given by the user friendly name parameter
     * return null if nothing is found
     * @param name
     * @return {*}
     */
    getComponentByName(name){
        let components = this.getComponents();
        for(let i in components){
            if(name == components[i].getName()){
                return components[i];
            }
        }
        return null;
    }

    /**
     * Returns a list of connections that have not been routed yet
     * @return {Array}
     */
    getUnroutedConnections(){
        let ret = [];
        let connections = this.getConnections();
        for(let i in connections){
            if(!connections[i].routed){
                ret.push(connections[i]);
            }
        }
        return ret;
    }


    getPositionOfComponentPort(componentport){
        let component;
        let components = this.getComponents();
        for (let i in components) {
            component = components[i];
            for(let key of component.ports.keys()){
                if (componentport.id == component.ports.get(key).id){
                    //Found the component so return the position
                    return componentport.calculateAbsolutePosition(component)

                }
            }
        }
    }
}
