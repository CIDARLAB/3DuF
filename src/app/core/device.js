import Params from "./params";

import * as Parameters from "./parameters";
import Feature from "./feature";

import * as Registry from "./registry";

import Layer from "./layer";
import Component from "./component";
import Connection from "./connection";
import EdgeFeature from "./edgeFeature";
import DXFObject from "./dxfObject";
import * as FeatureSets from "../featureSets";
import Valve from "../library/valve";
import ComponentPort from "./componentPort";
import * as IOUtils from "../utils/ioUtils";

const StringValue = Parameters.StringValue;

/**
 * The Device stores information about a design.
 */
export default class Device {
    /**
     * Default Constructor
     * @param {*} values
     * @param {string} name Name of the Device
     */
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
        this.__valveIs3DMap = new Map();

        //New layerblock indices for naming, etc.
        // TODO - Figure out how to handle this in the case
        // where things are imported from other tools because
        // this will not work anymore
        this.__layerBlockIndex = 0;
    }
    /**
     * Returns a string with the name of the Device
     * @returns {string}
     * @memberof Device
     */
    setValveMap(valvemap, isvalve3Ddata) {
        this.__valveMap = valvemap;
        this.__valveIs3DMap = isvalve3Ddata;
    }

    /**
     * Returns the name of the device
     *
     * @returns {String}
     * @memberof Device
     */
    getName() {
        return this.name.getValue();
    }

    /**
     * Returns the list of layers in the device
     * @return {Array}
     * @memberof Device
     */
    getLayers() {
        return this.layers;
    }

    /**
     * Adds a connection to the device
     * @param {Connection} connection
     * @memberof Device
     * @returns {void}
     */
    addConnection(connection) {
        this.__connections.push(connection);
    }

    /**
     * Removes a connection from the device
     * @param {Connection} connection
     * @memberof Device
     * @returns {void}
     */
    removeConnection(connection) {
        let i = this.__connections.indexOf(connection);
        if (i != -1) {
            this.__connections.splice(i, 1);
        }
    }

    /**
     * Adds a component to the device
     * @param {Component} component Component to be added to the device
     * @memberof Device
     * @returns {void}
     */
    addComponent(component) {
        if (component instanceof Component) {
            this.__components.push(component);
        } else {
            throw new Error("Tried to add a component that isn't a component to the device");
        }
    }

    /**
     * Removes a component from the device
     * @param {Component} component Component to remove from the device
     * @memberof Device
     * @returns {void}
     */
    removeComponent(component) {
        //Remove the component from the map
        let trydelete;
        let componentid = component.getID();
        let connectiontorefresh = null;

        //Remove component from connections
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            try {
                trydelete = connection.tryDeleteConnectionTarget(componentid);
                if (trydelete) {
                    console.log("Removed Component from Connection : ", connection.getID());
                }
            } catch (e) {
                console.error(e);
            }
        }
        //Check if the valve map has the component
        if (this.__valveMap.has(componentid)) {
            connectiontorefresh = this.getConnectionByID(this.__valveMap.get(componentid));
            this.__valveMap.delete(componentid);
        }

        let i = this.__components.indexOf(component);
        if (i != -1) {
            this.__components.splice(i, 1);
        }

        if (connectiontorefresh) {
            Registry.viewManager.updatesConnectionRender(connectiontorefresh);
        }
    }

    /**
     * Returns the list of components from the device
     * @return {Array<Component>} Array with the components of the device
     * @memberof Device
     */
    getComponents() {
        return this.__components;
    }

    /**
     * Sets the name of the device
     * @param {string} name Name of the device
     * @memberof Device
     */
    setName(name) {
        this.name = StringValue(name);
        this.updateView();
    }

    /**
     * Updates the parameter
     * @param {string} key Key to identigy the parameter
     * @param {} value Parameter's value
     * @memberof Device
     * @returns {void}
     */
    updateParameter(key, value) {
        this.params.updateParameter(key, value);
        this.updateView();
    }

    /**
     * Sort the layers such that they are ordered from lowest to highest z_offset
     * @returns {void}
     * @memberof Device
     */
    sortLayers() {
        this.layers.sort(function(a, b) {
            return a.params.getValue("z_offset") - b.params.getValue("z_offset");
        });
    }

    /**
     * Returns the layer that contains the feature with the given feature ID
     * @param {string} featureID ID of the feature to search for it
     * @return {Layer} Returns the layer
     * @memberof Device
     */
    getLayerFromFeatureID(featureID) {
        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            if (layer.containsFeatureID(featureID)) {
                return layer;
            }
        }
        for (let i = 0; i < this.textLayers.length; i++) {
            let layer = this.textLayers[i];
            if (layer.containsFeatureID(featureID)) {
                return layer;
            }
        }
        throw new Error("FeatureID " + featureID + " not found in any layer.");
    }

    /**
     * Checks if feature with given feature id is part of the device
     * @param {string} featureID ID of the feature to search for it
     * @return {boolean}
     * @memberof Device
     */
    containsFeatureID(featureID) {
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].containsFeatureID(featureID)) return true;
        }
        return false;
    }

    /**
     * Returns a list of all the features in the device
     * @return {Array<Feature>} Array with all the features of the device
     * @memberof Device
     */
    getAllFeaturesFromDevice() {
        let features = [];
        for (let i in this.layers) {
            //features.push.apply(features, layer.features);
            let layer = this.layers[i];
            for (let j in layer.features) {
                // console.log(layer.features[j]);
                features.push(layer.features[j]);
            }
        }
        return features;
    }

    /**
     * Returns the feature with the given feature id
     * @param {string} featureID ID of the feature to search
     * @return {Feature}
     * @memberof Device
     */
    getFeatureByID(featureID) {
        let layer = this.getLayerFromFeatureID(featureID);
        return layer.getFeature(featureID);
    }

    /**
     * Returns the feature with the given name
     * @param {string} name Name of the feature to be search
     * @return {Feature}
     * @memberof Device
     */
    getFeatureByName(name) {
        let layer;
        let features;
        for (let i = 0; i < this.layers.length; i++) {
            layer = this.layers[i];
            features = layer.getAllFeaturesFromLayer();
            for (let ii in features) {
                let feature = features[ii];
                if (feature.getName() === name) {
                    return feature;
                }
            }
        }
        for (let i = 0; i < this.textLayers.length; i++) {
            layer = this.layers[i];
            features = layer.getAllFeaturesFromLayer();
            for (let ii in features) {
                let feature = features[i];
                if (feature.getName() === name) {
                    return feature;
                }
            }
        }
        throw new Error("FeatureID " + name + " not found in any layer.");
    }

    /**
     * Add a layer, and re-sort the layers array
     * @param {Layer} layer Layer to add
     * @memberof Device
     * @returns {void}
     */
    addLayer(layer) {
        layer.device = this;
        this.layers.push(layer);
        //this.sortLayers();
        if (Registry.viewManager) Registry.viewManager.addLayer(this.layers.indexOf(layer));
    }
    /**
     * Removes feature of the Device
     * @param {Feature} feature Feature to be removed
     * @memberof Device
     * @returns {void}
     */
    removeFeature(feature) {
        this.removeFeatureByID(feature.getID());
    }
    /**
     * Removes feature with the corresponding ID
     * @param {string} featureID ID of the feature to search
     * @memberof Device
     * @returns {void}
     */
    removeFeatureByID(featureID) {
        let layer = this.getLayerFromFeatureID(featureID);
        layer.removeFeatureByID(featureID);
    }
    /**
     * Updates view layers
     * @memberof Device
     * @returns {void}
     */
    updateViewLayers() {
        if (Registry.viewManager) Registry.viewManager.updateLayers(this);
    }
    /**
     * Updates view of the Device
     * @memberof Device
     * @returns {void}
     */
    updateView() {
        if (Registry.viewManager) Registry.viewManager.updateDevice(this);
    }
    /**
     * Gets the unique parameters
     * @returns {Object}
     */
    static getUniqueParameters() {
        return {
            length: "Float",
            width: "Float"
        };
    }

    /**
     * Update the cross-reference
     * @param {String} objectID ID of the object to search for
     * @param {String} featureID ID of the feature to search in the given object
     * @memberof Device
     * @returns {void}
     */
    updateObjectReference(objectID, featureID) {
        //Goes through the components to update the reference
        let component;
        let foundflag = false;
        for (let i in this.__components) {
            component = this.__components[i];
            // console.log(objectID, component.getID());
            if (objectID == component.getID()) {
                component.addFeatureID(featureID);
                component.placed = true;
                foundflag = true;
            }
        }

        //Goes through the connection to update the reference
        let connection;
        for (let i in this.__connections) {
            connection = this.__connections[i];
            if (objectID == connection.getID()) {
                connection.addFeatureID(featureID);
                connection.routed = true;
                foundflag = true;
            }
        }

        if (!foundflag) {
            console.error("Could not find object to update reference: " + featureID);
        }
    }
    /**
     * ?
     */
    static getHeritableParameters() {
        return {};
    }
    /**
     * Renders layers
     * @returns {Array<Layer>} Returns an array with the layers
     * @memberof Device
     */
    __renderLayers2D() {
        let output = [];
        for (let i = 0; i < this.layers.length; i++) {
            output.push(this.layers[i].render2D());
        }
        return output;
    }
    /**
     * Converts groups to JSON
     * @returns {JSON}
     * @memberof Device
     */
    __groupsToJSON() {
        let output = [];
        for (let i in this.groups) {
            output.push(this.groups[i].toJSON());
        }
        return output;
    }
    /**
     * Converts layers to JSON
     * @returns {JSON}
     * @memberof Device
     */
    __layersToJSON() {
        let output = [];
        for (let i in this.layers) {
            output.push(this.layers[i].toJSON());
        }
        return output;
    }
    /**
     * Returns an array with the components
     * @returns {Array<Component>}
     * @memberof Device
     */
    __componentsToInterchangeV1() {
        let output = [];
        for (let i in this.__components) {
            output.push(this.__components[i].toInterchangeV1());
        }
        return output;
    }
    /**
     * Converts connection to InterchangeV1
     * @returns {Array} Returns an array with the connections
     * @memberof Device
     */
    __connectionToInterchangeV1() {
        let output = [];
        for (let i in this.__connections) {
            output.push(this.__connections[i].toInterchangeV1());
        }
        return output;
    }

    /**
     * Converts the layer object into  interchagne v1
     *
     * @returns
     * @memberof Device
     */
    __layersToInterchangeV1() {
        let output = [];
        for (let i in this.layers) {
            output.push(this.layers[i].toInterchangeV1());
        }
        return output;
    }

    /**
     * Converts feature layers to InterchangeV1
     * @return {Array<Layer>} Returns an array with the feature layers
     * @memberof Device
     */
    __featureLayersToInterchangeV1() {
        let output = [];
        for (let i in this.layers) {
            output.push(this.layers[i].toInterchangeV1());
        }
        return output;
    }
    /**
     * Loads layers from a JSON format into the device object
     * @param {JSON} json
     * @memberof Device
     * @returns {void}
     */
    __loadLayersFromJSON(json) {
        for (let i in json) {
            let newLayer = Layer.fromJSON(json[i]);
            this.addLayer(newLayer);
        }
    }
    /**
     * Loads feature layers from a Interchange format into the device object
     * @param {*} json
     * @memberof Device
     * @returns {void}
     */
    __loadFeatureLayersFromInterchangeV1(json) {
        for (let i in json) {
            let newLayer = Layer.fromInterchangeV1(json[i]);
            this.addLayer(newLayer);
        }
    }

    /**
     * Loads the JSON Component object into the device object
     * @param {Component} components
     * @memberof Device
     * @returns {void}
     * @private
     */
    __loadComponentsFromInterchangeV1(components) {
        let componenttoadd;

        for (let i in components) {
            componenttoadd = Component.fromInterchangeV1(components[i]);
            this.__components.push(componenttoadd);
        }
    }

    /**
     * Loads connections to the device object
     * @param {Connection} connections Connections to add to the device
     * @memberof Device
     * @returns {void}
     */
    __loadConnectionsFromInterchangeV1(connections) {
        let connectiontoload;
        for (let i in connections) {
            connectiontoload = Connection.fromInterchangeV1(this, connections[i]);
            this.__connections.push(connectiontoload);
        }
    }

    /**
     * Loads connections to the device object
     * @param {Connection} connections Connections to add to the device
     * @memberof Device
     * @returns {void}
     */
    __loadConnectionsFromInterchangeV1_1(connections) {
        let connectiontoload;
        for (let i in connections) {
            connectiontoload = Connection.fromInterchangeV1_1(this, connections[i]);
            this.__connections.push(connectiontoload);
        }
    }

    __loadLayersFromInterchangeV1(layers) {
        //Generate all the layer block ID's first
        let layerblockids = [];

        for (let layer of layers) {
            if (!layerblockids.includes(layer.group)) {
                layerblockids.push(layer.group);
            }
        }

        //For each layer block ID, we generate the layers
        for (let layerblockid of layerblockids) {
            for (let layer of layers) {
                if (layerblockid == layer.group) {
                    let layerobject = Layer.fromInterchangeV1(layer);
                    this.addLayer(layerobject);
                }
            }
        }
    }

    /**
     * Converts the properties of the device to JSON
     * @returns {JSON} Returns a JSON format with the properties of the device
     * @memberof Device
     */
    toJSON() {
        let output = {};
        output.name = this.name.toJSON();
        output.params = this.params.toJSON();
        output.layers = this.__layersToJSON();
        output.groups = this.__groupsToJSON();
        output.defaults = this.defaults;
        return output;
    }
    /**
     * Converts to Interchange V1 format
     * @returns {Device} Returns an Device object in Interchange V1 format
     * @memberof Device
     */
    toInterchangeV1() {
        let output = {};
        output.name = this.name;
        output.params = {
            width: this.getXSpan(),
            length: this.getYSpan()
        };
        //TODO: Use this to dynamically create enough layers to scroll through
        // output.layers = this.__layersToInterchangeV1();
        output.components = this.__componentsToInterchangeV1();
        output.connections = this.__connectionToInterchangeV1();
        output.layers = this.__layersToInterchangeV1();
        //TODO: Use this to render the device features
        output.features = this.__featureLayersToInterchangeV1();
        output.version = 1;
        output.groups = this.__groupsToJSON();
        return output;
    }

    toInterchangeV1_1() {
        let output = {};
        output.name = this.name;

        let valvetypemap = {};
        for (let [key, value] of this.__valveIs3DMap) {
            if (value) {
                //3D Valve
                valvetypemap[key] = "NORMALLY_CLOSED";
            } else {
                valvetypemap[key] = "NORMALLY_OPEN";
            }
        }

        output.params = {
            xspan: this.getXSpan(),
            yspan: this.getYSpan(),
            valveMap: IOUtils.mapToJson(this.__valveMap),
            valveTypeMap: valvetypemap
        };
        //TODO: Use this to dynamically create enough layers to scroll through
        output.components = this.__componentsToInterchangeV1();
        output.connections = this.__connectionToInterchangeV1();
        output.layers = this.__layersToInterchangeV1();
        //TODO: Use this to render the device features
        output.features = this.__featureLayersToInterchangeV1();
        output.version = 1.1;
        output.groups = this.__groupsToJSON();
        return output;
    }

    /**
     * Creates a new device object from a JSON format
     * @param {JSON} json
     * @returns {Device} Returns a device object
     * @memberof Device
     */
    static fromJSON(json) {
        let defaults = json.defaults;
        let newDevice = new Device(
            {
                width: json.params.width,
                length: json.params.length
            },
            json.name
        );
        newDevice.__loadLayersFromJSON(json.layers);
        return newDevice;
    }

    static fromInterchangeV1(json) {
        IOUtils.sanitizeV1Plus(json);

        let newDevice;
        if (json.hasOwnProperty("params")) {
            if (json.params.hasOwnProperty("width") && json.params.hasOwnProperty("length")) {
                newDevice = new Device(
                    {
                        width: json.params.width,
                        length: json.params.length
                    },
                    json.name
                );
            } else {
                newDevice = new Device(
                    {
                        width: 135000,
                        length: 85000
                    },
                    json.name
                );
            }
        } else {
            console.warn("Could not find device params, using some default values for device size");
            newDevice = new Device(
                {
                    width: 135000,
                    length: 85000
                },
                json.name
            );
        }
        //TODO: Use this to dynamically create enough layers to scroll through
        //newDevice.__loadLayersFromInterchangeV1(json.layers);
        //TODO: Use these two generate a rat's nest
        newDevice.__loadComponentsFromInterchangeV1(json.components);
        newDevice.__loadConnectionsFromInterchangeV1(json.connections);
        newDevice.__loadFeatureLayersFromInterchangeV1(json.layers);
        //TODO: Use this to render the device features

        //Check if JSON has features else mark
        if (json.hasOwnProperty("features")) {
            newDevice.__loadFeatureLayersFromInterchangeV1(json.features);
        } else {
            //We need to add a default layer
            let newlayer = new Layer(null, "flow" + this.__layerBlockIndex.toString(), "FLOW", this.__layerBlockIndex.toString());
            newDevice.addLayer(newlayer);
            newlayer = new Layer(null, "control" + this.__layerBlockIndex.toString(), "CONTROL", this.__layerBlockIndex.toString());
            newDevice.addLayer(newlayer);

            this.__layerBlockIndex += 1;
        }

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        let feature;
        for (let i in features) {
            //console.log("Feature:", features[i]);
            feature = features[i];
            if (feature.referenceID != null) {
                newDevice.updateObjectReference(feature.referenceID, feature.getID());
            }
        }

        return newDevice;
    }

    static fromInterchangeV1_1(json) {
        IOUtils.sanitizeV1Plus(json);
        let newDevice;

        if (json.hasOwnProperty("params")) {
            if (json.params.hasOwnProperty("xspan") && json.params.hasOwnProperty("yspan")) {
                newDevice = new Device(
                    {
                        width: json.params.xspan,
                        length: json.params.yspan
                    },
                    json.name
                );
            } else {
                newDevice = new Device(
                    {
                        width: 135000,
                        length: 85000
                    },
                    json.name
                );
            }
        } else {
            console.warn("Could not find device params, using some default values for device size");
            newDevice = new Device(
                {
                    width: 135000,
                    length: 85000
                },
                json.name
            );
        }
        //TODO: Use this to dynamically create enough layers to scroll through
        //newDevice.__loadLayersFromInterchangeV1(json.layers);
        //TODO: Use these two generate a rat's nest
        newDevice.__loadComponentsFromInterchangeV1(json.components);
        newDevice.__loadConnectionsFromInterchangeV1_1(json.connections);
        newDevice.__loadLayersFromInterchangeV1(json.layers);

        let valve_map, valve_type_map;
        //Import ValveMap
        if (json.params.hasOwnProperty("valveMap") && json.params.hasOwnProperty("valveTypeMap")) {
            valve_map = IOUtils.jsonToMap(json.params.valveMap);
            console.log("Imported valvemap", valve_map);

            console.log("Loaded valvetypemap", json.params.valveTypeMap);
            valve_type_map = IOUtils.jsonToMap(json.params.valveTypeMap);

            console.log(json.params.valveTypeMap, valve_type_map);
            let valveis3dmap = new Map();
            for (let [key, value] of valve_type_map) {
                console.log("Setting type:", key, value);
                switch (value) {
                    case "NORMALLY_OPEN":
                        valveis3dmap.set(key, false);
                        break;
                    case "NORMALLY_CLOSED":
                        valveis3dmap.set(key, true);
                        break;
                }
            }
            console.log("Imported valvemap", valve_map, valveis3dmap);
            newDevice.setValveMap(valve_map, valveis3dmap);
        }

        //TODO: Use this to render the device features

        //Check if JSON has features else mark
        if (json.hasOwnProperty("features")) {
            newDevice.__loadFeatureLayersFromInterchangeV1(json.features);
        } else {
            // // //We need to add a default layer
            // // let newlayer = new Layer(null, "flow"+this.__layerBlockIndex.toString(), "FLOW", this.__layerBlockIndex.toString());
            // // newDevice.addLayer(newlayer);
            // // newlayer = new Layer(null, "control"+this.__layerBlockIndex.toString(), "CONTROL", this.__layerBlockIndex.toString());
            // // newDevice.addLayer(newlayer);
            // // this.__layerBlockIndex += 1;
            // // TODO - We go though the layers and create a collection of layerblock ID's and then start creating all the layers based
            // // on the different layers. Since they're typically just called control and flow this should be fairly simple
            // let layerblockids = [];
            // if (Object.hasOwnProperty("layers", json)){
            //     for(let layer of json["layers"]){
            //         if(!layerblockids.includes(layer.group)){
            //             layerblockids.push(layer.group);
            //         }
            //     }
            // }else{
            //     throw new Error("Incoming JSON has no saved layers, incorrect Parchmint Format");
            // }
        }

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        let feature;
        for (let i in features) {
            //console.log("Feature:", features[i]);
            feature = features[i];
            if (feature.referenceID != null) {
                newDevice.updateObjectReference(feature.referenceID, feature.getID());
            }
        }

        return newDevice;
    }

    render2D() {
        return this.__renderLayers2D();
    }

    /**
     * Set the X-Span Value
     * @param {number} value
     * @memberof Device
     * @returns {void}
     */
    setXSpan(value) {
        this.params.updateParameter("width", value);
    }

    /**
     * Set the Y-Span Value
     * @param {number} value
     * @memberof Device
     * @returns {void}
     */
    setYSpan(value) {
        this.params.updateParameter("length", value);
    }

    /**
     * Returns the X-Span Value
     * @return {number}
     * @memberof Device
     */
    getXSpan() {
        return this.params.getValue("width");
    }

    /**
     * Returns the Y-Span Value
     * @return {number}
     * @memberof Device
     */
    getYSpan() {
        return this.params.getValue("length");
    }

    /**
     * Create the layers necessary for creating a new level
     * @return {Array<Layer>} Returns a the layer objects created
     * @memberof Device
     */
    createNewLayerBlock() {
        let flowlayer = new Layer({ z_offset: 0, flip: false }, "flow" + this.__layerBlockIndex.toString(), "FLOW", this.__layerBlockIndex.toString());
        let controllayer = new Layer({ z_offset: 0, flip: false }, "control" + this.__layerBlockIndex.toString(), "CONTROL", this.__layerBlockIndex.toString());
        //TODO: remove cell layer from the whole system
        let cell = new Layer({ z_offset: 0, flip: false }, "cell" + this.__layerBlockIndex.toString(), "FLOW", this.__layerBlockIndex.toString());

        this.addLayer(flowlayer);
        this.addLayer(controllayer);

        //TODO:Remove Cell layer from the whole system
        this.addLayer(cell);

        this.__layerBlockIndex += 1;

        return [flowlayer, controllayer, cell];
    }

    /**
     * Deletes the layer defined by the index
     * @param {number} index
     * @memberof Device
     * @returns {void}
     */
    deleteLayer(index) {
        if (index != -1) {
            this.layers.splice(index, 1);
        }
    }

    /**
     * Returns the component identified by the id
     * @param {string} id ID of the feature to get the component
     * @return {Component|null}
     * @memberof Device
     */
    getComponentForFeatureID(id) {
        for (let i in this.__components) {
            let component = this.__components[i];
            //go through each component's features
            for (let j in component.features) {
                let feature = component.features[j];
                if (feature === id) {
                    return component;
                }
            }
        }

        return null;
    }

    /**
     * Generates a new new name for the type, use this to autogenerate the names for components that are typespecific
     * @param {String} type
     * @return {string}
     * @memberof Device
     */
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
     * Returns a connection object corresponding to the ID
     * @param {String} id ID of feature to get the connection
     * @return {Connection|null}
     * @memberof Device
     */
    getConnectionForFeatureID(id) {
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            //go through each component's features
            for (let j in connection.features) {
                let feature = connection.features[j];
                if (feature === id) {
                    return connection;
                }
            }
        }

        return null;
    }

    /**
     * Insert a connection between a valve component and the connection component
     * @param {Valve} valve Valve object
     * @param {Connection} connection Connection object
     * @memberof Device
     * @returns {void}
     */
    insertValve(valve, connection, is3D = false) {
        this.__valveMap.set(valve.getID(), connection.getID());
        this.__valveIs3DMap.set(valve.getID(), is3D);
    }
    /**
     * Returns connections of the device
     * @returns {Connections} Connections object
     * @memberof Device
     */
    getConnections() {
        return this.__connections;
    }

    /**
     * Returns a list of valves mapped onto the connection
     * @param {Connection} connection Connection object
     * @return {Array<values>}
     * @memberof Device
     */
    getValvesForConnection(connection) {
        let connectionid = connection.getID();
        let ret = [];
        for (let [key, value] of this.__valveMap) {
            // let  = pair;
            if (connectionid == value) {
                ret.push(this.getComponentByID(key));
            }
        }

        return ret;
    }

    /**
     * Returns whether or not the valve generates a break
     * @param {Valve} valve Valve device
     * @return {any}
     * @memberof Device
     */
    getIsValve3D(valve) {
        let valveid = valve.getID();
        return this.__valveIs3DMap.get(valveid);
    }

    /**
     * Returns component object that is identified by the given key
     * @param {String} key Key to  the component
     * @return {Component}
     * @memberof Device
     */
    getComponentByID(key) {
        for (let i in this.__components) {
            let component = this.__components[i];
            if (component.getID() === key) {
                return component;
            }
        }
    }

    /**
     * Returns connection object which is identified by a given key
     * @param {String} key Key to identify the connection
     * @return {Connection}
     * @memberof Device
     */
    getConnectionByID(key) {
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            if (connection.getID() === key) {
                return connection;
            }
        }
    }

    /**
     * Returns the component given by the user friendly name parameter. Returns null if nothing is found
     * @param {String} name
     * @return {Component|null}
     * @memberof Device
     */
    getComponentByName(name) {
        let components = this.getComponents();
        for (let i in components) {
            if (name == components[i].getName()) {
                return components[i];
            }
        }
        return null;
    }

    /**
     * Returns a list of connections that have not been routed yet
     * @return {Array<Connection>}
     * @memberof Device
     */
    getUnroutedConnections() {
        let ret = [];
        let connections = this.getConnections();
        for (let i in connections) {
            if (!connections[i].routed) {
                ret.push(connections[i]);
            }
        }
        return ret;
    }
    /**
     * Gets the position of the component port based depending which port you selected
     * @param {ComponentPort} componentport Component port object
     * @memberof Device
     * @returns {Array<number>} Returns array with the absolute positions of the component port
     */
    getPositionOfComponentPort(componentport) {
        let component;
        let components = this.getComponents();
        for (let i in components) {
            component = components[i];
            for (let key of component.ports.keys()) {
                if (componentport.id == component.ports.get(key).id) {
                    //Found the component so return the position
                    return componentport.calculateAbsolutePosition(component);
                }
            }
        }
    }

    /**
     * This is the method that is called when one needs to make the feature object. The static function encapsulates
     * all the functionality that needs to be implemented.
     * @param {String} typeString
     * @param {String} setString
     * @param {} paramvalues
     * @param {String} name
     * @param {String} id
     * @param {} fabtype
     * @param {DXFObject} dxfdata
     * @return {EdgeFeature|Feature}
     * @memberof Device
     */
    static makeFeature(typeString, setString, paramvalues, name = "New Feature", id = undefined, fabtype, dxfdata) {
        let params;

        if (typeString === "EDGE") {
            return new EdgeFeature(fabtype, params, id);
        }
        let featureType = FeatureSets.getDefinition(typeString, setString);
        if (paramvalues && featureType) {
            Feature.checkDefaults(paramvalues, featureType.heritable, Feature.getDefaultsForType(typeString, setString));
            params = new Params(paramvalues, featureType.unique, featureType.heritable);
        } else {
            params = new Params(paramvalues, { position: "Point" }, null);
        }

        let feature = new Feature(typeString, setString, params, name, id);

        for (let i in dxfdata) {
            feature.addDXFObject(DXFObject.fromJSON(dxfdata[i]));
        }

        return feature;
    }
}
