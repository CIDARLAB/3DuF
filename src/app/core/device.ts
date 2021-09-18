/// <reference types="node" />

import Params from "./params";

import Feature from "./feature";
import { DeviceInterchangeV1, DeviceInterchangeV1_1, LogicalLayerType, Point } from "./init";
import { ComponentInterchangeV1 } from "./init";
import { ConnectionInterchangeV1 } from "./init";
import { LayerInterchangeV1 } from "./init";

import Layer from "./layer";
import Component from "./component";
import Connection from "./connection";
import EdgeFeature from "./edgeFeature";
import DXFObject from "./dxfObject";
import ComponentPort from "./componentPort";
import * as IOUtils from "../utils/ioUtils";

import DeviceUtils from "@/app/utils/deviceUtils";
import { ComponentAPI } from "@/componentAPI";
import MapUtils from "../utils/mapUtils";

/**
 * The Device stores information about a design.
 */
export default class Device {
    private __layers: Array<Layer>;
    private __textLayers: Array<Layer>;
    private __params: Params;
    private __name: string;
    private __components: Array<Component>;
    private __nameMap: Map<string, number>;
    private __connections: Array<Connection>;
    private __valveMap: Map<string, string>;
    private __valveIs3DMap: Map<string, boolean>;
    private __groups: Array<string>;
    //private __features: Array<Feature>;
    private __version: number;

    /**
     * Default Constructor
     * @param {*} values
     * @param {string} name Name of the Device
     */
    constructor(values: { [index: string]: any }, name: string = "New Device") {
        this.__layers = [];
        this.__textLayers = [];
        //this.__features = [];
        this.__groups = [];
        this.__params = new Params(values, Device.getUniqueParameters(), Device.getHeritableParameters());
        // this.setXSpan(values.width);
        // this.setYSpan(values.length);

        this.__name = name;
        this.__components = [];
        this.__nameMap = new Map();
        this.__connections = [];

        //Map to store <componentID, connectionID>
        this.__valveMap = new Map();
        this.__valveIs3DMap = new Map();

        this.__version = 1;
    }
    /**
     * Returns a string with the name of the Device
     * @returns {string}
     * @memberof Device
     */
    setValveMap(valvemap: Map<string, string>, isvalve3Ddata: Map<string, boolean>): void {
        this.__valveMap = valvemap;
        this.__valveIs3DMap = isvalve3Ddata;
    }

    /**
     * Returns the name of the device
     *
     * @returns {String}
     * @memberof Device
     */
    get name(): string {
        return this.__name;
    }

    /**
     * Sets the map used for naming objects
     * @param {Map<string, number>}
     * @memberof Device
     */
    set nameMap(nameMap: Map<string, number>) {
        this.__nameMap = nameMap;
    }

    /**
     * Returns the list of layers in the device
     * @return {Array}
     * @memberof Device
     */
    get layers(): Array<Layer> {
        return this.__layers;
    }

    /**
     * Adds a connection to the device
     * @param {Connection} connection
     * @memberof Device
     * @returns {void}
     */
    addConnection(connection: Connection): void {
        this.__connections.push(connection);
    }

    /**
     * Removes a connection from the device
     * @param {Connection} connection
     * @memberof Device
     * @returns {void}
     */
    removeConnection(connection: Connection): void {
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
    addComponent(component: Component): void {
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
    removeComponent(component: Component): null | Connection {
        //Remove the component from the map
        let trydelete;
        let componentid = component.id;
        let connectiontorefresh = null;

        //Remove component from connections
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            try {
                trydelete = connection.tryDeleteConnectionTarget(componentid);
                if (trydelete) {
                    console.log("Removed Component from Connection : ", connection.id);
                }
            } catch (e) {
                console.error(e);
            }
        }
        //Check if the valve map has the component
        let checkConnection: string | undefined = this.__valveMap.get(componentid);
        if (checkConnection != undefined) {
            connectiontorefresh = this.getConnectionByID(checkConnection);
            this.__valveMap.delete(componentid);
        }

        let i = this.__components.indexOf(component);
        if (i != -1) {
            this.__components.splice(i, 1);
        }

        return connectiontorefresh;
    }

    /**
     * Returns the list of components from the device
     * @return {Array<Component>} Array with the components of the device
     * @memberof Device
     */
    get components(): Array<Component> {
        return this.__components;
    }

    /**
     * Sets the name of the device
     * @param {string} name Name of the device
     * @memberof Device
     */
    set name(name: string) {
        this.__name = name;
    }

    /**
     * Updates the parameter
     * @param {string} key Key to identigy the parameter
     * @param {} value Parameter's value
     * @memberof Device
     * @returns {void}
     */
    updateParameter(key: string, value: any): void {
        this.__params.updateParameter(key, value);
    }

    /**
     * Returns the layer with the given ID
     *
     * @param {string} id
     * @returns {(Layer | null)}
     * @memberof Device
     */
    getLayer(id: string): Layer | null {
        for (let i in this.__layers) {
            let layer = this.__layers[i];
            if (layer.id == id) {
                return layer;
            }
        }
        return null;
    }

    /**
     * Returns the layer that contains the feature with the given feature ID
     * @param {string} featureID ID of the feature to search for it
     * @return {Layer} Returns the layer
     * @memberof Device
     */
    getLayerFromFeatureID(featureID: string): Layer {
        for (let i = 0; i < this.__layers.length; i++) {
            let layer = this.__layers[i];
            if (layer.containsFeatureID(featureID)) {
                return layer;
            }
        }
        for (let i = 0; i < this.__textLayers.length; i++) {
            let layer = this.__textLayers[i];
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
    containsFeatureID(featureID: string): boolean {
        for (let i = 0; i < this.__layers.length; i++) {
            if (this.__layers[i].containsFeatureID(featureID)) return true;
        }
        return false;
    }

    /**
     * Returns a list of all the features in the device
     * @return {Array<Feature>} Array with all the features of the device
     * @memberof Device
     */
    getAllFeaturesFromDevice(): Array<Feature> {
        let features: Array<Feature> = [];
        for (let i in this.__layers) {
            //features.push.apply(features, layer.features);
            let layer: Layer = this.__layers[i];
            for (let j in layer.features) {
                // console.log(layer.features[j]);
                features.push(layer.getFeature(j));
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
    getFeatureByID(featureID: string): Feature {
        let layer = this.getLayerFromFeatureID(featureID);
        return layer.getFeature(featureID);
    }

    /**
     * Returns the feature with the given name
     * @param {string} name Name of the feature to be search
     * @return {Feature}
     * @memberof Device
     */
    getFeatureByName(name: string): Feature {
        let layer;
        let features;
        for (let i = 0; i < this.__layers.length; i++) {
            layer = this.__layers[i];
            features = layer.getAllFeaturesFromLayer();
            for (let ii in features) {
                let feature = features[ii];
                if (feature.getName() === name) {
                    return feature;
                }
            }
        }
        for (let i = 0; i < this.__textLayers.length; i++) {
            layer = this.__layers[i];
            features = layer.getAllFeaturesFromLayer();
            for (let ii in features) {
                let feature = features[ii];
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
    addLayer(layer: Layer): void {
        layer.device = this;
        this.__layers.push(layer);
        //this.sortLayers();
        // TODO: Fix layer system
        DeviceUtils.addLayer(layer, this.__layers.indexOf(layer));
    }

    /**
     * Add a layer to specific index, and re-sort the layers array
     * @param {Layer} layer Layer to add
     * @param {number} index The index into which to add the layer
     * @memberof Device
     * @returns {void}
     */
    addLayerAtIndex(layer: Layer, index: number): void {
        layer.device = this;
        this.__layers.splice(index, 0, layer);
        //this.sortLayers();
        // TODO: Fix layer system
        DeviceUtils.addLayer(layer, this.__layers.indexOf(layer));
    }

    /**
     * Removes feature of the Device
     * @param {Feature} feature Feature to be removed
     * @memberof Device
     * @returns {void}
     */
    removeFeature(feature: Feature): void {
        if (feature.type == "Connection") {
            for (let i = 0; i < this.__connections.length; i++) {
                let featIDs = this.__connections[i].featureIDs;
                for (let j = 0; j < featIDs.length; j++) {
                    if (this.__connections[i].featureIDs[j] == feature.ID) {
                        this.__connections[i].featureIDs.splice(j, 1);
                        if (this.__connections[i].featureIDs.length == 0) {
                            this.__connections.splice(i, 1);
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < this.__components.length; i++) {
                let featIDs = this.__components[i].featureIDs;
                for (let j = 0; j < featIDs.length; j++) {
                    if (this.__components[i].featureIDs[j] == feature.ID) {
                        this.__components[i].featureIDs.splice(j, 1);
                        if (this.__components[i].featureIDs.length == 0) {
                            this.__components.splice(i, 1);
                        }
                    }
                }
            }
        }
    }

    /**
     * Gets the unique parameters
     * @returns {Object}
     */
    static getUniqueParameters(): Map<string, string> {
        let unique: Map<string, string> = new Map();
        unique.set("length", "Float");
        unique.set("width", "Float");
        return unique;
    }

    /**
     * Update the cross-reference
     * @param {String} objectID ID of the object to search for
     * @param {String} featureID ID of the feature to search in the given object
     * @memberof Device
     * @returns {void}
     */
    updateObjectReference(objectID: string, featureID: string): void {
        //Goes through the components to update the reference
        let component: Component;
        let foundflag = false;
        for (let i in this.__components) {
            component = this.__components[i];
            // console.log(objectID, component.id);
            if (objectID == component.id) {
                component.addFeatureID(featureID);
                component.placed = true;
                foundflag = true;
            }
        }

        //Goes through the connection to update the reference
        let connection;
        for (let i in this.__connections) {
            connection = this.__connections[i];
            if (objectID == connection.id) {
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
    static getHeritableParameters(): Map<string, string> {
        return new Map();
    }
    /**
     * Converts groups to JSON
     * @returns {JSON}
     * @memberof Device
     */
    __groupsToJSON(): Array<string> {
        let output: Array<string> = [];
        for (let i in this.__groups) {
            output.push(this.__groups[i]);
        }
        return output;
    }
    /**
     * Converts layers to JSON
     * @returns {JSON}
     * @memberof Device
     */
    __layersToJSON(): Array<{ [index: string]: any }> {
        let output: Array<{ [index: string]: any }> = [];
        for (let i in this.__layers) {
            output.push(this.__layers[i].toJSON());
        }
        return output;
    }
    /**
     * Returns an array with the components
     * @returns {Array<ComponentInterchangeV1>}
     * @memberof Device
     */
    __componentsToInterchangeV1(): Array<ComponentInterchangeV1> {
        let output: Array<ComponentInterchangeV1> = [];
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
    __connectionToInterchangeV1(): Array<ConnectionInterchangeV1> {
        let output: Array<ConnectionInterchangeV1> = [];
        for (let i in this.__connections) {
            output.push(this.__connections[i].toInterchangeV1());
        }
        return output;
    }
    /**
     * Converts feature layers to InterchangeV1
     * @return {Array<LayerInterchangeV1>} Returns an array with the feature layers
     * @memberof Device
     */
    __featureLayersToInterchangeV1(): Array<LayerInterchangeV1> {
        let output: Array<LayerInterchangeV1> = [];
        for (let i in this.__layers) {
            output.push(this.__layers[i].toInterchangeV1());
        }
        return output;
    }
    /**
     * Converts layers to InterchangeV1
     * @return {Array<LayerInterchangeV1>} Returns an array with the layers
     * @memberof Device
     */
    __layersToInterchangeV1(): Array<LayerInterchangeV1> {
        const output: Array<LayerInterchangeV1> = [];
        for (const i in this.__layers) {
            output.push(this.__layers[i].toInterchangeV1());
        }
        return output;
    }

    /**
     * Loads feature layers from a Interchange format into the device object
     * @param {*} json
     * @memberof Device
     * @returns {void}
     */
    __loadLayersFromInterchangeV1(json: Array<LayerInterchangeV1>): void {
        for (let i in json) {
            let newLayer = Layer.fromInterchangeV1(json[i], this);
            this.addLayer(newLayer);
        }
    }

    /**
     * Loads the JSON Component object into the device object
     * @param {ComponentInterchangeV1} components
     * @memberof Device
     * @returns {void}
     * @private
     */
    __loadComponentsFromInterchangeV1(components: Array<ComponentInterchangeV1>): void {
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
    __loadConnectionsFromInterchangeV1(connections: Array<ConnectionInterchangeV1>): void {
        let connectiontoload;
        for (let i in connections) {
            connectiontoload = Connection.fromInterchangeV1(this, connections[i]);
            this.__connections.push(connectiontoload);
        }
    }

    /**
     * Converts to Interchange V1 format
     * @returns {Device} Returns an Device object in Interchange V1 format
     * @memberof Device
     */
    toInterchangeV1(): DeviceInterchangeV1 {
        let output: DeviceInterchangeV1 = {
            name: this.__name,
            params: {
                width: this.getXSpan(),
                length: this.getYSpan()
            },
            //TODO: Use this to dynamically create enough layers to scroll through
            layers: this.__layersToInterchangeV1(),
            components: this.__componentsToInterchangeV1(),
            connections: this.__connectionToInterchangeV1(),
            version: 1,
            groups: this.__groupsToJSON()
        };
        return output;
    }

    toInterchangeV1_1(): DeviceInterchangeV1_1 {
        let output: DeviceInterchangeV1_1 = {
            name: this.__name,
            params: {
                width: this.getXSpan(),
                length: this.getYSpan()
            },
            //TODO: Use this to dynamically create enough layers to scroll through
            layers: this.__layersToInterchangeV1(),
            components: this.__componentsToInterchangeV1(),
            connections: this.__connectionToInterchangeV1(),
            version: 1,
            groups: this.__groupsToJSON()
        };
        return output;
    }

    static fromInterchangeV1(json: DeviceInterchangeV1): Device {
        let newDevice: Device;
        if (Object.prototype.hasOwnProperty.call(json, "params")) {
            if (Object.prototype.hasOwnProperty.call(json.params, "width") && Object.prototype.hasOwnProperty.call(json.params, "length")) {
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
        //TODO: Use this to render the device features

        //Check if JSON has features else mark
        if (Object.prototype.hasOwnProperty.call(json, "layers")) {
            newDevice.__loadLayersFromInterchangeV1(json.layers);
        } else {
            //We need to add a default layer
            let newlayer = new Layer({}, "flow", LogicalLayerType.FLOW, "0", newDevice);
            newDevice.addLayer(newlayer);
            newlayer = new Layer({}, "control", LogicalLayerType.CONTROL, "0", newDevice);
            newDevice.addLayer(newlayer);
        }

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        let feature;
        for (let i in features) {
            //console.log("Feature:", features[i]);
            feature = features[i];
            if (feature.referenceID !== null) {
                newDevice.updateObjectReference(feature.referenceID, feature.ID);
            }
        }

        return newDevice;
    }

    static fromInterchangeV1_1(json: DeviceInterchangeV1): Device {
        IOUtils.sanitizeV1Plus(json);
        let newDevice;

        if (Object.prototype.hasOwnProperty.call(json, "params")) {
            if (Object.prototype.hasOwnProperty.call(json.params, "xspan") && Object.prototype.hasOwnProperty.call(json.params, "yspan")) {
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
        newDevice.__loadConnectionsFromInterchangeV1(json.connections);

        let valve_map, valve_type_map;
        //Import ValveMap
        if (Object.prototype.hasOwnProperty.call(json.params, "valveMap") && Object.prototype.hasOwnProperty.call(json.params, "valveTypeMap")) {
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
        if (Object.prototype.hasOwnProperty.call(json, "features")) {
            newDevice.__loadLayersFromInterchangeV1(json.layers);
        } else {
            //We need to add a default layer
            let newlayer = new Layer({}, "flow", LogicalLayerType.FLOW, "0", newDevice);
            newDevice.addLayer(newlayer);
            newlayer = new Layer({}, "control", LogicalLayerType.CONTROL, "0", newDevice);
            newDevice.addLayer(newlayer);
        }

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        let feature;
        for (let i in features) {
            //console.log("Feature:", features[i]);
            feature = features[i];
            if (feature.referenceID !== null) {
                newDevice.updateObjectReference(feature.referenceID, feature.ID);
            }
        }

        return newDevice;
    }

    /**
     * Set the X-Span Value
     * @param {number} value
     * @memberof Device
     * @returns {void}
     */
    setXSpan(value: number): void {
        this.__params.updateParameter("x-span", value);
    }

    /**
     * Set the Y-Span Value
     * @param {number} value
     * @memberof Device
     * @returns {void}
     */
    setYSpan(value: number): void {
        this.__params.updateParameter("y-span", value);
    }

    /**
     * Returns the X-Span Value
     * @return {number}
     * @memberof Device
     */
    getXSpan(): number {
        return this.__params.getValue("x-span");
    }

    /**
     * Returns the Y-Span Value
     * @return {number}
     * @memberof Device
     */
    getYSpan(): number {
        return this.__params.getValue("y-span");
    }

    /**
     * Create the layers necessary for creating a new level
     * @return {Array<Layer>} Returns a the layer objects created
     * @memberof Device
     */
    createNewLayerBlock(layers: Array<Layer>): void {
        for (let i in layers) {
            this.addLayer(layers[i]);
        }
    }

    /**
     * Deletes the layer defined by the index
     * @param {number} index
     * @memberof Device
     * @returns {void}
     */
    deleteLayer(index: number): void {
        let layer = this.__layers[index];
        for (let feature in layer.features) {
            this.removeFeature(layer.features[feature]);
        }
        if (index != -1) {
            this.__layers.splice(index, 1);
        }
    }

    /**
     * Returns the component identified by the id
     * @param {string} id ID of the feature to get the component
     * @return {Component|null}
     * @memberof Device
     */
    getComponentForFeatureID(id: string): Component | null {
        for (let i in this.__components) {
            let component = this.__components[i];
            //go through each component's features
            for (let j in component.featureIDs) {
                let featureid = component.featureIDs[j];
                if (featureid === id) {
                    return component;
                }
            }
        }

        return null;
    }

    /**
     * Generates a new new name for the type, use this to autogenerate the names for components that are typespecific
     * @param {string} type
     * @return {string}
     * @memberof Device
     */
    generateNewName(type: string): string {
        let value: number | undefined = this.__nameMap.get(type);
        if (value != undefined) {
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
    getConnectionForFeatureID(id: string): Connection | null {
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            //go through each component's features
            for (let j in connection.featureIDs) {
                let featureid = connection.featureIDs[j];
                if (featureid === id) {
                    return connection;
                }
            }
        }

        return null;
    }

    /**
     * Insert a connection between a valve component and the connection component
     * @param {Component} valve Valve object
     * @param {Connection} connection Connection object
     * @memberof Device
     * @returns {void}
     */
    insertValve(valve: Component, connection: Connection, is3D: boolean = false): void {
        this.__valveMap.set(valve.id, connection.id);
        this.__valveIs3DMap.set(valve.id, is3D);
    }
    /**
     * Returns connections of the device
     * @returns {Connections} Connections object
     * @memberof Device
     */
    get connections(): Array<Connection> {
        return this.__connections;
    }

    /**
     * Returns a list of valves mapped onto the connection
     * @param {Connection} connection Connection object
     * @return {Array<values>}
     * @memberof Device
     */
    getValvesForConnection(connection: Connection): Array<Component | null> {
        let connectionid: string = connection.id;
        let ret: Array<Component | null> = [];
        for (let [key, value] of this.__valveMap) {
            // let  = pair;
            if (connectionid === value) {
                ret.push(this.getComponentByID(key));
            }
        }

        return ret;
    }

    /**
     * Returns whether or not the valve generates a break
     * @param {Component} valve Valve device
     * @return {any}
     * @memberof Device
     */
    getIsValve3D(valve: Component): boolean | undefined {
        let valveid = valve.id;
        return this.__valveIs3DMap.get(valveid);
    }

    /**
     * Returns component object that is identified by the given key
     * @param {String} key Key to  the component
     * @return {Component}
     * @memberof Device
     */
    getComponentByID(key: string): Component | null {
        for (let i in this.__components) {
            let component = this.__components[i];
            if (component.id === key) {
                return component;
            }
        }
        return null;
        //throw new Error("Component with ID " + key + " does not exist");
    }

    /**
     * Returns connection object which is identified by a given key
     * @param {String} key Key to identify the connection
     * @return {Connection}
     * @memberof Device
     */
    getConnectionByID(key: string): Connection | null {
        for (let i in this.__connections) {
            let connection = this.__connections[i];
            if (connection.id === key) {
                return connection;
            }
        }
        return null;
        //throw new Error("Connection with ID " + key + " does not exist");
    }

    /**
     * Returns the component given by the user friendly name parameter. Returns null if nothing is found
     * @param {String} name
     * @return {Component|null}
     * @memberof Device
     */
    getComponentByName(name: string): Component {
        let components = this.__components;
        for (let i in components) {
            if (name == components[i].name) {
                return components[i];
            }
        }
        throw new Error("Component with name " + name + "does not exist");
    }

    /**
     * Returns a list of connections that have not been routed yet
     * @return {Array<Connection>}
     * @memberof Device
     */
    getUnroutedConnections(): Array<Connection> {
        let ret: Array<Connection> = [];
        let connections = this.__connections;
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
    getPositionOfComponentPort(componentport: ComponentPort): Point | undefined {
        let component: Component;
        let components: Array<Component> = this.__components;
        for (let i in components) {
            component = components[i];
            for (const key of component.ports.keys()) {
                let port: undefined | ComponentPort = component.ports.get(key);
                if (port != undefined) {
                    if (componentport.id == port.id) {
                        //Found the component so return the position
                        return ComponentPort.calculateAbsolutePosition(componentport, component);
                    }
                }
            }
        }
    }

    /**
     * This is the method that is called when one needs to make the feature object. The static function encapsulates
     * all the functionality that needs to be implemented.
     * @param {string} typeString
     * @param {string} setString
     * @param {} paramvalues
     * @param {string} name
     * @param {string} id
     * @param {} fabtype
     * @param {DXFObject} dxfdata
     * @return {EdgeFeature|Feature}
     * @memberof Device
     */
    static makeFeature(typeString: string, paramvalues: any, name: string = "New Feature", id: string | undefined = undefined, fabtype: string, dxfdata: Array<JSON>): Feature {
        let params: Params = new Params(new Map(), new Map(), new Map());

        if (typeString === "EDGE") {
            //TODO: Put in params initialization
            return new EdgeFeature(fabtype, params, id);
        }
        let featureType = ComponentAPI.getDefinition(typeString);
        if (paramvalues && featureType) {
            Feature.checkDefaults(paramvalues, featureType.heritable, ComponentAPI.getDefaultsForType(typeString));
            params = new Params(paramvalues, MapUtils.toMap(featureType.unique), MapUtils.toMap(featureType.heritable));
        } else {
            let unique: Map<string, string> = new Map();
            params = new Params(paramvalues, unique.set("position", "Point"), new Map());
        }

        let feature = new Feature(typeString, params, name, id);

        for (let i in dxfdata) {
            feature.addDXFObject(DXFObject.fromJSON(dxfdata[i]));
        }

        return feature;
    }

    get textLayers(): Array<Layer> {
        return this.__textLayers;
    }
}
