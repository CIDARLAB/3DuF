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
import MapUtils from "../utils/mapUtils";

import ConnectionUtils from "@/app/utils/connectionUtils";
import ComponentUtils from "@/app/utils/componentUtils";

import {
    ScratchInterchangeV1,
    DeviceInterchangeV1,
    LayerInterchangeV1,
    RenderLayerInterchangeV1,
    FeatureInterchangeV0,
    ComponentInterchangeV1,
    ConnectionInterchangeV1,
    ComponentPortInterchangeV1,
    LogicalLayerType
} from "@/app/core/init";

export default class LoadUtils {
    constructor() {}

    static loadFromScratch(json: ScratchInterchangeV1): [Device, Array<RenderLayer>] {
        const newDevice: Device = LoadUtils.loadDeviceFromInterchangeV1(json);
        let newRenderLayers: Array<RenderLayer> = [];
        if (json.renderLayers) {
            for (let i = 0; i < json.renderLayers.length; i++) {
                newRenderLayers.push(LoadUtils.loadRenderLayerFromInterchangeV1(json.renderLayers[i], newDevice));
            }
        } else {
            for (let i = 0; i < json.layers.length; i++) {
                newRenderLayers.push(LoadUtils.generateRenderLayerFromLayerInterchangeV1(json.renderLayers[i], newDevice));
            }
        }
        return [newDevice, newRenderLayers];
    }

    static loadDeviceFromInterchangeV1(json: DeviceInterchangeV1): Device {
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
        //TODO: Use these to generate a rat's nest
        for (const i in json.components) {
            LoadUtils.loadComponentFromInterchangeV1(json.components[i]);
        }

        for (const i in json.connections) {
            LoadUtils.loadConnectionFromInterchangeV1(newDevice, json.connections[i]);
        }

        //Check if JSON has layers else mark
        if (Object.prototype.hasOwnProperty.call(json, "layers")) {
            for (const i in json.layers) {
                newDevice.addLayer(LoadUtils.loadLayerFromInterchangeV1(json.layers[i], newDevice));
            }
        } else {
            //We need to add a default layer
            let newlayer = new Layer({}, "flow", LogicalLayerType.FLOW, "0", newDevice);
            newDevice.addLayer(newlayer);
            newlayer = new Layer({}, "control", LogicalLayerType.CONTROL, "0", newDevice);
            newDevice.addLayer(newlayer);
            newlayer = new Layer({}, "integration", LogicalLayerType.INTEGRATION, "0", newDevice);
            newDevice.addLayer(newlayer);
        }

        //Updating cross-references
        let features = newDevice.getAllFeaturesFromDevice();
        let feature;
        for (let i in features) {
            feature = features[i];
            if (feature.referenceID !== null) {
                newDevice.updateObjectReference(feature.referenceID, feature.ID);
            }
        }

        return newDevice;
    }

    /**
     * Loads the layer information from the interchange format
     *
     * @static
     * @param {LayerInterchangeV1} json
     * @param {Device} device
     * @returns {Layer}
     * @memberof LoadUtils
     */
    static loadLayerFromInterchangeV1(json: LayerInterchangeV1, device: Device): Layer {
        let layerType = LogicalLayerType.FLOW;
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
        const newLayer: Layer = new Layer(json.params, json.name, layerType, json.group, device);
        for (const i in json.features) {
            newLayer.features[json.features[i].id] = LoadUtils.loadFeatureFromInterchangeV1(json.features[i]);
        }
        newLayer.device = device;
        newLayer.id = json.id;
        return newLayer;
    }

    /**
     * Loads the features from the interchange format
     *
     * @static
     * @param {FeatureInterchangeV0} json
     * @returns {Feature}
     * @memberof LoadUtils
     */
    static loadFeatureFromInterchangeV1(json: FeatureInterchangeV0): Feature {
        // TODO: This will have to change soon when the thing is updated
        let ret = Device.makeFeature(json.macro, json.params, json.name, json.id, json.type, json.dxfData);
        if (Object.prototype.hasOwnProperty.call(json, "referenceID")) {
            ret.referenceID = json.referenceID;
            // Registry.currentDevice.updateObjectReference(json.id, json.referenceID);
        }
        return ret;
    }

    /**
     * Loads the connections from the interchange format
     *
     * @static
     * @param {Device} device
     * @param {ConnectionInterchangeV1} json
     * @returns {Connection}
     * @memberof LoadUtils
     */
    static loadConnectionFromInterchangeV1(device: Device, json: ConnectionInterchangeV1): Connection {
        const name = json.name;
        const id = json.id;
        const entity = json.entity;
        const params = json.params;
        const layer = device.getLayer(json.layer);
        if (layer === null) {
            throw new Error("Could not find layer with id: " + json.layer);
        }
        // Check if the params have the other unique elements necessary otherwise add them as null
        if (!Object.prototype.hasOwnProperty.call(params, "start")) {
            // Setting this value to origin
            params.start = [0, 0];
        }
        if (!Object.prototype.hasOwnProperty.call(params, "end")) {
            // Setting this value to origin
            params.end = [0, 0];
        }
        if (!Object.prototype.hasOwnProperty.call(params, "wayPoints")) {
            // TODO: setting a single waypoint at origin
            params.wayPoints = [
                [0, 0],
                [1, 2]
            ];
        }
        if (!Object.prototype.hasOwnProperty.call(params, "segments")) {
            // TODO: Setting a default segment from origin to origin
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
        let definition;
        if (ConnectionUtils.hasFeatureSet()) {
            definition = ConnectionUtils.getDefinition("Connection");
        }
        if (definition === null || definition === undefined) {
            throw new Error("Could not find the definition for the Connection");
        }
        const paramstoadd = new Params(params, MapUtils.toMap(definition.unique), MapUtils.toMap(definition.heritable));

        const connection = new Connection(entity, paramstoadd, name, entity, id, layer);
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
                    connection.addWayPoints(json.paths[i]);
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
        const iscustomcompnent = false;
        const name = json.name;
        const id = json.id;
        const entity = json.entity;

        // Idk whether this is correct
        // It was originially this._span = this.span which threw several errors so I patterned in off the above const var
        const xspan = json.xspan;
        const yspan = json.yspan;

        const params = json.params;

        console.log("new entity:", entity);

        // TODO - remove this dependency
        // iscustomcompnent = Registry.viewManager.customComponentManager.hasDefinition(entity);

        let definition;

        if (iscustomcompnent) {
            definition = CustomComponent.defaultParameterDefinitions();
        } else {
            definition = ComponentAPI.getDefinitionForMINT(entity);
        }

        if (definition === null) {
            throw Error("Could not find definition for type: " + entity);
        }

        // console.log(definition);
        let type;
        let value;
        for (const key in json.params) {
            // console.log("key:", key, "value:", json.params[key]);
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

        // Do another check and see if position is present or not
        if (!Object.prototype.hasOwnProperty.call(params, "position")) {
            params.position = [0.0, 0.0];
        }
        const unique_map = MapUtils.toMap(definition.unique);
        const heritable_map = MapUtils.toMap(definition.heritable);
        const paramstoadd = new Params(params, unique_map, heritable_map);
        const component = new Component(paramstoadd, name, entity, id);

        // Deserialize the component ports
        const portdata = new Map();
        for (const i in json.ports) {
            const componentport = LoadUtils.loadComponentPortFromInterchangeV1(json.ports[i]);
            portdata.set(componentport.label, componentport);
        }

        component.ports = portdata;

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
        return new ComponentPort(json.x, json.y, json.label, json.layer);
    }

    /**
     * Loads the renderlayers from the interchange format
     *
     * @static
     * @param {RenderLayerInterchangeV1} json
     * @param {Device} device
     * @returns {RenderLayer}
     * @memberof LoadUtils
     */
    static loadRenderLayerFromInterchangeV1(json: RenderLayerInterchangeV1, device: Device): RenderLayer {
        const newLayer: RenderLayer = new RenderLayer(json.name, null, json.type, json.group);

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
        const newLayer: RenderLayer = new RenderLayer(json.name, null, json.type, json.group);

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
