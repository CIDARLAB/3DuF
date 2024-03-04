import Device from "@/app/core/device";
import Layer from "@/app/core/layer";
import Connection from "@/app/core/connection";
import Component from "@/app/core/component";
import Feature from "@/app/core/feature";
import Params from "@/app/core/params";
import RenderLayer from "@/app/view/renderLayer";

import CustomComponent from "@/app/core/customComponent";
import ComponentPort from "@/app/core/componentPort";
import { ComponentAPI } from "@/componentAPI";
import MapUtils from "./mapUtils";

import ConnectionUtils from "@/app/utils/connectionUtils";

import {
    InterchangeV1_2,
    DeviceInterchangeV1,
    LayerInterchangeV1,
    RenderLayerInterchangeV1_2,
    FeatureInterchangeV1_2,
    ComponentInterchangeV1,
    ConnectionInterchangeV1_2,
    ComponentPortInterchangeV1,
    LogicalLayerType,
    ValveType,
    DeviceInterchangeV1_1
} from "@/app/core/init";

export default class LoadUtils {
    constructor() {}

    static loadFromScratch(json: InterchangeV1_2): [Device, Array<RenderLayer>] {
        const newDevice: Device = LoadUtils.loadDeviceFromInterchangeV1_2(json);
        let newRenderLayers: Array<RenderLayer> = [];
        if (json.renderLayers) {
            for (let i = 0; i < json.renderLayers.length; i++) {
                newRenderLayers.push(LoadUtils.loadRenderLayerFromInterchangeV1(json.renderLayers[i], newDevice));
            }
        } else if (Object.prototype.hasOwnProperty.call(json, "layers")) {
            for (let i = 0; i < json.layers.length; i++) {
                newRenderLayers.push(LoadUtils.generateRenderLayerFromLayerInterchangeV1(json.layers[i], newDevice));
            }
        } else {
            newRenderLayers.push(new RenderLayer(newDevice.generateNewName("RenderLayerFlow"), newDevice.layers[0], LogicalLayerType.FLOW));
            newRenderLayers.push(new RenderLayer(newDevice.generateNewName("RenderLayerControl"), newDevice.layers[1], LogicalLayerType.CONTROL));
            newRenderLayers.push(new RenderLayer(newDevice.generateNewName("RenderLayerIntegration"), newDevice.layers[0], LogicalLayerType.INTEGRATION));
        }

        // Ensures that there are three layers per group
        let layerGroups: Map<string, number> = new Map();
        for (let i = 0; i < newDevice.layers.length; i++) {
            if (layerGroups.has(newDevice.layers[i].group)) {
                const currentVal = layerGroups.get(newDevice.layers[i].group);
                if (currentVal) layerGroups.set(newDevice.layers[i].group, currentVal + 1);
            } else {
                layerGroups.set(newDevice.layers[i].group, 1);
            }
        }

        layerGroups.forEach((value, key) => {
            const keyVal = parseInt(key, 10);

            if (value == 3) {
                console.log("All layers accounted for in group " + key);
            } else {
                const layerTypes: Array<string> = ["FLOW", "CONTROL", "INTEGRATION"];
                for (const i in json.layers) {
                    const index = layerTypes.indexOf(json.layers[i].type);
                    layerTypes.splice(index, 1);
                }
                console.log(layerTypes.length + " layers missing from group " + key + ", these will be generated");
                for (const j in layerTypes) {
                    const featuresToAdd = LoadUtils.generateMissingLayerFeaturesV1(json, layerTypes[j], key);
                    if (layerTypes[j] == "FLOW") {
                        const newLayer = new Layer({}, newDevice.generateNewName("LayerFlow"), LogicalLayerType.FLOW, key, newDevice);
                        for (const k in featuresToAdd) {
                            newLayer.features[featuresToAdd[k].ID] = featuresToAdd[k];
                        }
                        newLayer.featureCount = featuresToAdd.length;
                        newDevice.addLayerAtIndex(newLayer, keyVal * 3);
                        newRenderLayers.splice(keyVal * 3, 0, new RenderLayer(newDevice.generateNewName("RenderLayerFlow"), newDevice.layers[keyVal * 3], LogicalLayerType.FLOW));
                    }
                    else if (layerTypes[j] == "CONTROL") {
                        const newLayer = new Layer({}, newDevice.generateNewName("LayerControl"), LogicalLayerType.CONTROL, key, newDevice);
                        for (const k in featuresToAdd) {
                            newLayer.features[featuresToAdd[k].ID] = featuresToAdd[k];
                        }
                        newLayer.featureCount = featuresToAdd.length;
                        newDevice.addLayerAtIndex(newLayer, keyVal * 3 + 1);
                        newRenderLayers.splice(keyVal * 3 + 1, 0, new RenderLayer(newDevice.generateNewName("RenderLayerControl"), newDevice.layers[keyVal * 3 + 1], LogicalLayerType.CONTROL));
                    }
                    else if (layerTypes[j] == "INTEGRATION") {
                        const newLayer = new Layer({}, newDevice.generateNewName("LayerIntegration"), LogicalLayerType.INTEGRATION, key, newDevice);
                        for (const k in featuresToAdd) {
                            newLayer.features[featuresToAdd[k].ID] = featuresToAdd[k];
                        }
                        newLayer.featureCount = featuresToAdd.length;
                        newDevice.addLayerAtIndex(newLayer, keyVal * 3 + 2);
                        newRenderLayers.splice(keyVal * 3 + 2, 0, new RenderLayer(newDevice.generateNewName("RenderLayerIntegration"), newDevice.layers[keyVal * 3 + 2], LogicalLayerType.INTEGRATION));
                    }
                }
            }
        });

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        for (let i in features) {
            const feature = features[i];
            if (feature.referenceID !== null) {
                newDevice.updateObjectReference(feature.referenceID, feature.ID);
            }
        }

        return [newDevice, newRenderLayers];
    }

    static loadDeviceFromInterchangeV1_2(json: InterchangeV1_2): Device {
        let newDevice: Device;
        if (Object.prototype.hasOwnProperty.call(json, "params")) {
            if (Object.prototype.hasOwnProperty.call(json.params, "width") && Object.prototype.hasOwnProperty.call(json.params, "length")) {
                newDevice = new Device(
                    {
                        "x-span": json.params.width,
                        "y-span": json.params.length
                    },
                    json.name
                );
            } else {
                newDevice = new Device(
                    {
                        "x-span": 135000,
                        "y-span": 85000
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

        //Check if JSON has layers else mark
        if (Object.prototype.hasOwnProperty.call(json, "layers")) {
            for (const i in json.layers) {
                newDevice.addLayer(LoadUtils.loadLayerFromInterchangeV1(json, json.layers[i], newDevice));
            }
        } else {
            //We need to add a default layer
            let newlayer = new Layer({}, newDevice.generateNewName("LayerFlow"), LogicalLayerType.FLOW, "0", newDevice);
            newDevice.addLayer(newlayer);
            newlayer = new Layer({}, newDevice.generateNewName("LayerControl"), LogicalLayerType.CONTROL, "0", newDevice);
            newDevice.addLayer(newlayer);
            newlayer = new Layer({}, newDevice.generateNewName("LayerIntegration"), LogicalLayerType.INTEGRATION, "0", newDevice);
            newDevice.addLayer(newlayer);
        }

        //TODO: Use this to dynamically create enough layers to scroll through
        //TODO: Use these to generate a rat's nest
        for (const i in json.components) {
            const newComponent = LoadUtils.loadComponentFromInterchangeV1(json.components[i]);
            newDevice.addComponent(newComponent);
        }

        for (const i in json.connections) {
            const newConnection = LoadUtils.loadConnectionFromInterchangeV1(newDevice, json.connections[i]);
            newDevice.addConnection(newConnection);
        }

        if (Object.prototype.hasOwnProperty.call(json, "valves")) {
            for (const i in json.valves) {
                const newValve = json.valves[i];
                const component = newDevice.getComponentByID(newValve.componentid);
                const connection = newDevice.getConnectionByID(newValve.connectionid);
                if (component === null){
                    console.warn("Could not find component with ID " + newValve.componentid + " for valve " + newValve.componentid);
                    throw new Error("Could not find component with ID " + newValve.componentid + " for valve " + newValve.componentid);
                }
                if (connection === null){
                    console.warn("Could not find connection with ID " + newValve.connectionid + " for valve " + newValve.componentid);
                    throw new Error("Could not find connection with ID " + newValve.connectionid + " for valve " + newValve.componentid);
                }
                newDevice.insertValve(component, connection, newValve.type);
            }
        } else {
            console.warn("Could not find valve map, using default valve map");
        }

        return newDevice;
    }

    /**
     * Loads the layer information from the interchange format
     *
     * @static
     * @param {LayerInterchangeV1} jsonlayer
     * @param {Device} device
     * @returns {Layer}
     * @memberof LoadUtils
     */
    static loadLayerFromInterchangeV1(json: DeviceInterchangeV1, jsonlayer: LayerInterchangeV1, device: Device): Layer {
        let layerType = LogicalLayerType.FLOW;
        if (Object.prototype.hasOwnProperty.call(jsonlayer, "type")) {
            if (jsonlayer.type === "FLOW") {
                layerType = LogicalLayerType.FLOW;
            } else if (jsonlayer.type === "CONTROL") {
                layerType = LogicalLayerType.CONTROL;
            } else if (jsonlayer.type === "INTEGRATION") {
                layerType = LogicalLayerType.INTEGRATION;
            } else {
                throw new Error("Unknown layer type: " + jsonlayer.type);
            }
        }
        const newLayer: Layer = new Layer(jsonlayer.params, jsonlayer.name, layerType, jsonlayer.group, device);

        if (jsonlayer.features) {
            for (const i in jsonlayer.features) {
                newLayer.features[jsonlayer.features[i].id] = LoadUtils.loadFeatureFromInterchangeV1(jsonlayer.features[i]);
            }
            newLayer.featureCount = jsonlayer.features.length;
        } else {
            //Generate features

            //Generate feature from components
            const componentFeats: Array<Feature> = LoadUtils.loadFeaturesFromComponentInterchangeV1(json, jsonlayer);
            for (const k in componentFeats) {
                newLayer.features[componentFeats[k].ID] = componentFeats[k];
            }
            newLayer.featureCount = componentFeats.length;

            //Genereate feature from connection
            const connectionFeats: Array<Feature> = LoadUtils.loadFeaturesFromConnectionInterchangeV1(json, jsonlayer);
            for (const k in connectionFeats) {
                newLayer.features[connectionFeats[k].ID] = connectionFeats[k];
            }
            newLayer.featureCount = newLayer.featureCount + connectionFeats.length;
        }
        newLayer.id = jsonlayer.id;
        
        return newLayer;
    }

    /**
     * Loads the features from the interchange format
     *
     * @static
     * @param {FeatureInterchangeV1_2} json
     * @returns {Feature}
     * @memberof LoadUtils
     */
    static loadFeatureFromInterchangeV1(json: FeatureInterchangeV1_2): Feature {
        // TODO: This will have to change soon when the thing is updated
        console.log("PARAMS: ", json.params);
        let ret = Device.makeFeature(json.macro, json.params, json.name, json.id, json.type, json.dxfData);
        if (Object.prototype.hasOwnProperty.call(json, "referenceID")) {
            ret.referenceID = json.referenceID;
            // Registry.currentDevice.updateObjectReference(json.id, json.referenceID);
        }
        return ret;
    }

    /**
     * Loads the features for layers with no feature category from component entries
     *
     * @static
     * @param {DeviceInterchangeV1} json
     * @param {LayerInterchangeV1} jsonlayer
     * @returns {Array<Feature>}
     * @memberof LoadUtils
     */
    static loadFeaturesFromComponentInterchangeV1(json: DeviceInterchangeV1, jsonlayer: LayerInterchangeV1): Array<Feature> {
        const ret: Array<Feature> = [];
        for (const i in json.components) {
            const typestring = ComponentAPI.getTypeForMINT(json.components[i].entity);
            if (typestring !== null) {
                let feat: Feature;
                const renderKeys: Array<string> = ComponentAPI.getAllRenderKeys(typestring);
                let group: string | null = null;
                for (const j in json.layers) {
                    if (json.layers[j].id == json.components[i].layers[0]) group = json.layers[j].group;
                }
                if (group !== null) {
                    if (renderKeys.length == 1) {
                        if (json.components[i].layers[0] == jsonlayer.id) {
                            console.log("Assuming default type feature can be placed on current layer");
                            const paramstoadd = json.components[i].params;
                            if (!Object.prototype.hasOwnProperty.call(json.components[i].params, "position")) {
                                paramstoadd.position = [0.0, 0.0];
                            }
                            feat = Device.makeFeature(typestring, paramstoadd);
                            feat.referenceID = json.components[i].id;
                            ret.push(feat);
                        }
                    } else {
                        for (const j in renderKeys) {
                            if (renderKeys[j] == jsonlayer.type) {
                                if (group == jsonlayer.group) {
                                    const paramstoadd = json.components[i].params;
                                    if (!Object.prototype.hasOwnProperty.call(json.components[i].params, "position")) {
                                        paramstoadd.position = [0.0, 0.0];
                                    }
                                    if (ComponentAPI.library[typestring].key == jsonlayer.type) {
                                        feat = Device.makeFeature(typestring, paramstoadd);
                                    } else if (ComponentAPI.library[typestring + "_" + jsonlayer.type.toLowerCase()]) {
                                        feat = Device.makeFeature(typestring + "_" + jsonlayer.type.toLowerCase(), paramstoadd);
                                    } else {
                                        console.log("Assuming default type feature can be placed on current layer");
                                        feat = Device.makeFeature(typestring, paramstoadd);
                                    }
                                    feat.referenceID = json.components[i].id;
                                    ret.push(feat);
                                }
                            }
                        }
                    }
                }
            } else {
                console.log("Mint " + json.components[i].entity + "not supported");
            }
        }
        return ret;
    }

    /**
     * Loads the features for layers with no feature category from connection entries
     *
     * @static
     * @param {DeviceInterchangeV1} json
     * @param {LayerInterchangeV1} jsonlayer
     * @returns {Array<Feature>}
     * @memberof LoadUtils
     */
    static loadFeaturesFromConnectionInterchangeV1(json: DeviceInterchangeV1, jsonlayer: LayerInterchangeV1): Array<Feature> {
        const ret: Array<Feature> = [];
        for (const i in json.connections) {
            if (jsonlayer.id == json.connections[i].layer) {
                const mint = json.connections[i].entity;
                let typestring: string | null = null;
                if (mint && mint != "CHANNEL") typestring = ComponentAPI.getTypeForMINT(json.connections[i].entity);
                if (typestring === null) typestring = "Connection";

                let feat: Feature; 
                let rawParams = json.connections[i].params;
                if (rawParams.start) {
                    feat = Device.makeFeature(typestring, rawParams);
                    feat.referenceID = json.connections[i].id;
                    ret.push(feat);
                } else {
                    if (json.connections[i].paths[0]) {
                        const wayPoints = json.connections[i].paths[0].wayPoints;
                        const segments: Array<[[number, number],[number,number]]> = [];
                        for (let k = 0; k < wayPoints.length - 1; k++) {
                            segments[k] = [wayPoints[k], wayPoints[k + 1]];
                        }
                        const newParams = {
                            start: ["Point", wayPoints[0][0], wayPoints[0][1]],
                            end: wayPoints[wayPoints.length - 1],
                            wayPoints: wayPoints,
                            segments: segments,
                            connectionSpacing: rawParams.connectionSpacing,
                            channelWidth: rawParams.channelWidth,
                            height: ComponentAPI.getDefaultsForType(typestring).height
                        };
                        feat = Device.makeFeature(typestring, newParams);
                        feat.referenceID = json.connections[i].id;
                        ret.push(feat);
                    } else {
                        console.log("Connection missing path description");
                    }
                }                          
            }
        }
        return ret;
    }

    /**
     * Loads the features from component entries for layers missing from a group
     * Assumes no connections present on undescribed layers
     * Purpose is to fill in parts of components added later (e.g., integration layer part of picoinjector)
     * @static
     * @param {InterchangeV1_2} json
     * @param {string} type
     * @param {string} layerGroup
     * @returns {Array<Feature>}
     * @memberof LoadUtils
     */
    static generateMissingLayerFeaturesV1(json: InterchangeV1_2, type: string, layerGroup: string): Array<Feature> {
        const ret: Array<Feature> = [];
        for (const i in json.components) {
            const typestring = ComponentAPI.getTypeForMINT(json.components[i].entity);
            if (typestring !== null) {
                if (type == "FLOW") {
                    const libEntry = ComponentAPI.library[typestring];
                    if (libEntry != undefined && libEntry.key == "FLOW") {
                        let componentGroup: string | null = null;
                        for (const j in json.layers) {
                            if (json.layers[j].id == json.components[i].layers[0]) componentGroup = json.layers[j].group;
                        }
                        if (componentGroup !== null && componentGroup == layerGroup) {
                            const feat: Feature = Device.makeFeature(typestring, json.components[i].params);
                            feat.referenceID = json.components[i].id;
                            ret.push(feat);
                        }
                    }
                } else {
                    if (ComponentAPI.library[typestring + "_" + type.toLowerCase()]) {
                        let componentGroup: string | null = null;
                        for (const j in json.layers) {
                            if (json.layers[j].id == json.components[i].layers[0]) componentGroup = json.layers[j].group;
                        }
                        if (componentGroup !== null && componentGroup == layerGroup) {
                            const feat: Feature = Device.makeFeature(typestring + "_" + type.toLowerCase(), json.components[i].params);
                            feat.referenceID = json.components[i].id;
                            ret.push(feat);
                        }
                    }
                }
            } else {
                console.log("Mint " + json.components[i].entity + "not supported");
            }
        }
        return ret;
    }

    /**
     * Loads the connections from the interchange format
     *
     * @static
     * @param {Device} device
     * @param {ConnectionInterchangeV1_2} json
     * @returns {Connection}
     * @memberof LoadUtils
     */
    static loadConnectionFromInterchangeV1(device: Device, json: ConnectionInterchangeV1_2): Connection {
        const name = json.name;
        const id = json.id;
        const entity = json.entity;
        let params = json.params;
        const layer = device.getLayer(json.layer);
        if (layer === null) {
            throw new Error("Could not find layer with id: " + json.layer);
        }
        if (entity) {
            // Check if the params have the other unique elements necessary otherwise add them as null
            if (!Object.prototype.hasOwnProperty.call(params, "start")) {
                if (json.paths[0]) {
                    params.start = ["Point", json.paths[0].wayPoints[0][0], json.paths[0].wayPoints[0][1]];
                } else {
                    // Setting this value to origin
                    params.start = [0, 0];
                }
            }
            if (!Object.prototype.hasOwnProperty.call(params, "end")) {
                if (json.paths) {
                    params.end = json.paths[0].wayPoints[json.paths[0].wayPoints.length - 1];
                } else {
                    // Setting this value to origin
                    params.end = [0, 0];
                }
            }
            if (!Object.prototype.hasOwnProperty.call(params, "wayPoints")) {
                // TODO: setting a single waypoint at origin
                if (json.paths[0]) {
                    params.wayPoints = json.paths[0].wayPoints;
                } else {
                    params.wayPoints = [
                        [0, 0],
                        [1, 2]
                    ];
                }
            }
            if (!Object.prototype.hasOwnProperty.call(params, "segments")) {
                // TODO: Setting a default segment from origin to origin
                if (json.paths[0]) {
                    const segments: Array<[[number, number],[number,number]]> = [];
                    for (let k = 0; k < json.paths[0].wayPoints.length - 1; k++) {
                        segments[k] = [json.paths[0].wayPoints[k], json.paths[0].wayPoints[k + 1]];
                    }
                    params.segments = segments;
                } else {
                    params.segments = [
                        [
                            [0, 0],
                            [0, 0]
                        ],
                        [
                            [0, 0],
                            [0, 0]
                        ]
                    ];
                }
            }
            if (!Object.prototype.hasOwnProperty.call(params, "height")) {
                params.height = ComponentAPI.getDefaultsForType("Connection").height;
            }
        } else {
            if (json.paths[0]) {
                const wayPoints = json.paths[0].wayPoints;
                const rawParams = json.params;
                const segments: Array<[[number, number],[number,number]]> = [];
                                for (let k = 0; k < wayPoints.length - 1; k++) {
                                    segments[k] = [wayPoints[k], wayPoints[k + 1]];
                                }
                const typestring = "Connection";
                params = {
                    start: ["Point", wayPoints[0][0], wayPoints[0][1]],
                    end: wayPoints[wayPoints.length - 1],
                    wayPoints: wayPoints,
                    segments: segments,
                    connectionSpacing: rawParams.connectionSpacing,
                    channelWidth: rawParams.channelWidth,
                    height: ComponentAPI.getDefaultsForType(typestring).height
                };
            } else {
                console.log("Connection missing path description");
            }
        }

        let definition = ConnectionUtils.getDefinition("Connection");

        if (definition === null || definition === undefined) {
            throw new Error("Could not find the definition for the Connection");
        }
        const paramstoadd = new Params(params, MapUtils.toMap(definition.unique), MapUtils.toMap(definition.heritable));
        const connection = new Connection(entity, paramstoadd, name, entity, layer, id);
        if (Object.prototype.hasOwnProperty.call(json, "source")) {
            if (json.source !== null && json.source !== undefined) {
                connection.setSourceFromJSON(device, json.source);
            }
        }
        if (Object.prototype.hasOwnProperty.call(json, "sinks")) {
            if (json.sinks !== null && json.sinks !== undefined) {
                for (const i in json.sinks) {
                    const sink = json.sinks[i];
                    connection.addSinkFromJSON(device, sink);
                }
            }
        }
        if (Object.prototype.hasOwnProperty.call(json, "paths")) {
            if (json.paths !== null && json.paths !== undefined) {
                for (const i in json.paths) {
                    connection.addWayPoints(json.paths[i].wayPoints);
                }
            }
        }

        return connection;
    }

    /**
     * Loads the components from the interchange format
     *
     * @static
     * @param {ComponentInterchangeV1} json
     * @returns {Component}
     * @memberof LoadUtils
     */
    static loadComponentFromInterchangeV1(json: ComponentInterchangeV1): Component {
        let iscustomcomponent;
        const name = json.name;
        const id = json.id;
        const entity = json.entity;

        console.log("Entity here:")
        console.log(entity);

        if (ComponentAPI.getComponentWithMINT(entity) === null) {
            iscustomcomponent = true;
            console.log("is custom component");
        } else {
            iscustomcomponent = false;
            console.log("is not custom component");
        }

        // Idk whether this is correct
        // It was originially this._span = this.span which threw several errors so I patterned in off the above const var
        const xspan = json["x-span"];
        const yspan = json["y-span"];

        const params = json.params;

        // TODO - remove this dependency
        // iscustomcomponent = Registry.viewManager.customComponentManager.hasDefinition(entity);

        let definition;

        if (iscustomcomponent) {
            //Grab the black box definition (Eric)
            definition = CustomComponent.defaultParameterDefinitions();
        } else {
            definition = ComponentAPI.getDefinitionForMINT(entity);

        }

        if (definition === null) {
            //Is this the way to do this?
            definition = ComponentAPI.getDefinition("Template");
            console.log("Def: ", definition);
        }

        if (definition === null) {
            throw Error("Could not find definition for type: " + entity);
        }

        let type;
        let value;
        for (const key in json.params) {
            //What does this do (Eric)?
            if (Object.prototype.hasOwnProperty.call(definition.heritable, key)) {
                type = definition.heritable[key];
            } else if (Object.prototype.hasOwnProperty.call(definition.unique, key)) {
                type = definition.unique[key];
            }
            // let paramobject = Parameter.generateComponentParameter(key, json.params[key]);
            // Check if the value type is float and convert the value from string
            value = json.params[key];
            if (type === "Float" && typeof value === "string") {
                value = parseFloat(value);
            }

            // let paramobject = new Parameter(type, value);
            params[key] = value;
        }

        //Need to do this since component may not have length and width (probably need special name for them)
        if(!iscustomcomponent){
            params.blackBoxLength = xspan;
            params.blackBoxWidth = yspan;

            console.log("Params here:");
            console.log(params);
            console.log(xspan);
            console.log(yspan);
        }

        // Do another check and see if position is present or not
        if (!Object.prototype.hasOwnProperty.call(params, "position")) {
            params.position = [0.0, 0.0];
        }

        //What is this doing? (Eric)
        const unique_map = MapUtils.toMap(definition.unique);
        const heritable_map = MapUtils.toMap(definition.heritable);
        //Assuming I just have to change the params to match the black box params (Eric) !!!
        const paramstoadd = new Params(params, unique_map, heritable_map);
        //Creates component based off entity (Eric)
        //Just change the entity to black box if is custom component (Eric) !!!
        //Also change the paramstoadd to match params of black box (Eric) !!!
        const component = new Component(paramstoadd, name, entity, id);

        // Deserialize the component ports
        const portdata = new Map();
        for (const i in json.ports) {
            const componentport = LoadUtils.loadComponentPortFromInterchangeV1(json.ports[i]);
            portdata.set(componentport.label, componentport);
        }

        component.ports = portdata;

        console.log("Component here")
        console.log(component)

        return component;
    }

    /**
     * Loads the component port from the interchange format
     *
     * @static
     * @param {ComponentPortInterchangeV1} json
     * @returns {ComponentPort}
     * @memberof LoadUtils
     */
    static loadComponentPortFromInterchangeV1(json: ComponentPortInterchangeV1): ComponentPort {
        let layer_type = LogicalLayerType.FLOW;
        if (json.layer === "FLOW"){
            layer_type = LogicalLayerType.FLOW;
        } else if (json.layer === "CONTROL") {
            layer_type = LogicalLayerType.CONTROL;
        } else if (json.layer === "INTEGRATION") {
            layer_type = LogicalLayerType.INTEGRATION;
        }
        return new ComponentPort(json.x, json.y, json.label, layer_type);
    }

    /**
     * Loads the renderlayers from the interchange format
     *
     * @static
     * @param {RenderLayerInterchangeV1_2} json
     * @param {Device} device
     * @returns {RenderLayer}
     * @memberof LoadUtils
     */
    static loadRenderLayerFromInterchangeV1(json: RenderLayerInterchangeV1_2, device: Device): RenderLayer {
        let layerType: LogicalLayerType | undefined;
        if (Object.prototype.hasOwnProperty.call(json, "type")) {
            if (json.type === "FLOW") {
                layerType = LogicalLayerType.FLOW;
            } else if (json.type === "CONTROL") {
                layerType = LogicalLayerType.CONTROL;
            } else if (json.type === "INTEGRATION") {
                layerType = LogicalLayerType.INTEGRATION;
            } else {
                throw new Error("Unknown layer type: " + json.type);
            }
        }
        const newLayer: RenderLayer = new RenderLayer(json.name, null, layerType);

        for (const i in json.features) {
            newLayer.features[json.features[i].id] = LoadUtils.loadFeatureFromInterchangeV1(json.features[i]);
        }

        if (json.modellayer) {
            for (let i = 0; i < device.layers.length; i++) {
                if (device.layers[i].id == json.modellayer) newLayer.physicalLayer = device.layers[i];
            }
        }
        if (json.color) newLayer.color = json.color; // TODO: Figure out if this needs to change in the future
        return newLayer;
    }

    /**
     * Generates the render layers from the layer information. Typically used to generate all the render layers
     * for the device.
     *
     * @static
     * @param {LayerInterchangeV1} json
     * @param {Device} device
     * @returns {RenderLayer}
     * @memberof LoadUtils
     */
    static generateRenderLayerFromLayerInterchangeV1(json: LayerInterchangeV1, device: Device): RenderLayer {
        let layerType: LogicalLayerType | undefined;
        if (Object.prototype.hasOwnProperty.call(json, "type")) {
            if (json.type === "FLOW") {
                layerType = LogicalLayerType.FLOW;
            } else if (json.type === "CONTROL") {
                layerType = LogicalLayerType.CONTROL;
            } else if (json.type === "INTEGRATION") {
                layerType = LogicalLayerType.INTEGRATION;
            } else {
                throw new Error("Unknown layer type: " + json.type);
            }
        }
        const newLayer: RenderLayer = new RenderLayer(json.name, null, layerType);

        for (const i in json.features) {
            newLayer.features[json.features[i].id] = LoadUtils.loadFeatureFromInterchangeV1(json.features[i]);
        }

        for (let i = 0; i < device.layers.length; i++) {
            if (device.layers[i].id == json.id) newLayer.physicalLayer = device.layers[i];
        }

        if (Object.prototype.hasOwnProperty.call(json, "type")) {
            if (json.type === "FLOW") {
                newLayer.color = "indigo";
            } else if (json.type === "CONTROL") {
                newLayer.color = "red";
            } else if (json.type === "INTEGRATION") {
                newLayer.color = "green";
            } else {
                throw new Error("Unknown layer type: " + json.type);
            }
        }
        return newLayer;
    }
}
