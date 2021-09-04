import uuid from "node-uuid";
import EdgeFeature from "./edgeFeature";
import Feature from "./feature";
import Params from "./params";
import Device from "./device";
import { FeatureInterchangeV0 } from "./init";
import { LayerInterchangeV1, LogicalLayerType } from "./init";

/**
 * Layer class
 */
export default class Layer {
    params: Params;
    name: string;
    features: { [index: string]: Feature };
    featureCount: number;
    device: Device;
    private __id: string;
    private __type: string;
    private __group: string;

    /**
     * Default Constructor for the layer
     * @param {*} values Value of the layer
     * @param {String} name Name of the layer
     */
    constructor(values: { [index: string]: any }, name: string = "New Layer", type: LogicalLayerType = LogicalLayerType.FLOW, group: string = "0", device: Device) {
        this.params = new Params(values, Layer.getUniqueParameters(), Layer.getHeritableParameters());
        this.name = name;
        this.features = {};
        this.featureCount = 0;
        this.device = device;
        this.__id = Layer.generateID();
        this.__type = type;
        this.__group = group;
    }

    get type(): string {
        return this.__type;
    }

    get id(): string {
        return this.__id;
    }

    set id(ID: string) {
        this.__id = ID;
    }

    get group(): string {
        return this.__group;
    }

    /**
     * Generates a random id
     * @returns {String} Random ID string
     */
    static generateID(): string {
        return uuid.v1();
    }

    /**
     * Adds a feature to the layer
     * @param {Feature} feature Feature to pass to add to the layer
     * @memberof Layer
     * @returns {void}
     */
    addFeature(feature: Feature): void {
        this.__ensureIsAFeature(feature);
        this.features[feature.ID] = feature;
        this.featureCount += 1;
        //TODO - Verify that this is not a problem anymore
        feature.layer = this;
    }

    /**
     * Returns index of layer
     * @returns {Number}
     * @memberof Layer
     */
    getIndex(): number {
        if (this.device) {
            return this.device.layers.indexOf(this);
        } else {
            throw new Error("No device referenced on this layer");
        }
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
     * @param {Feature} feature Feature object
     * @memberof Layer
     * @returns {void}
     */
    __ensureIsAFeature(feature: any): void {
        if (!(feature instanceof Feature) && !(feature instanceof EdgeFeature)) {
            throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
        }
    }

    /**
     * Checks whether the feature already exist
     * @param {Feature} feature Feature object
     * @memberof Layer
     * @returns {void}
     */
    __ensureFeatureExists(feature: Feature): void {
        if (!this.containsFeature(feature)) throw new Error("Layer does not contain the specified feature!");
    }

    /**
     * Checks if feature exist based on it's ID
     * @param {String} featureID ID of the feature to search for
     * @memberof Layer
     * @returns {void}
     */
    __ensureFeatureIDExists(featureID: string): void {
        if (!this.containsFeatureID(featureID)) throw new Error("Layer does not contain a feature with the specified ID!");
    }

    /**
     * Returns unique parameters
     * @returns {Map<string,string>}
     * @memberof Layer
     * @returns {void}
     */
    static getUniqueParameters(): Map<string, string> {
        let unique: Map<string, string> = new Map();
        unique.set("z_offset", "Float");
        unique.set("flip", "Boolean");
        return unique;
    }

    /**
     * Returns heritable parameters
     * @returns {Map<string,string>}
     * @memberof Layer
     * @returns {void}
     */
    static getHeritableParameters(): Map<string, string> {
        return new Map();
    }

    /**
     * Returns feature based on it's ID
     * @param {String} featureID
     * @returns {Feature}
     * @memberof Layer
     */
    getFeature(featureID: string): Feature {
        this.__ensureFeatureIDExists(featureID);
        return this.features[featureID];
    }

    /**
     * Removes selected feature
     * @param {Feature} feature Feature object
     * @memberof Layer
     * @returns {void}
     */
    removeFeature(feature: Feature): void {
        this.removeFeatureByID(feature.ID);
        console.log("Device: ", this.device);
        if (this.device !== null || this.device !== undefined) {
            this.device.removeFeature(feature);
        }
    }

    // TODO: Stop using delete, it's slow!
    /**
     * Removes a feature by passing it's ID as a parameter
     * @param {string} featureID ID of the feature
     * @memberof Layer
     * @returns {void}
     */
    removeFeatureByID(featureID: string): void {
        this.__ensureFeatureIDExists(featureID);
        const feature: Feature = this.features[featureID];
        this.featureCount -= 1;
        delete this.features[featureID];
    }

    /**
     * Checks if object contains a feature
     * @param {Feature} feature Feature object
     * @returns {Boolean} true if it has the feature
     * @memberof Layer
     */
    containsFeature(feature: Feature): boolean {
        this.__ensureIsAFeature(feature);
        return this.features.hasOwnProperty(feature.ID);
    }

    /**
     * Checks if object contains a feature based on the feature's ID
     * @param {String} featureID ID of the feature to search for
     * @returns {Boolean} true if it has the feature
     * @memberof Layer
     */
    containsFeatureID(featureID: string): boolean {
        return this.features.hasOwnProperty(featureID);
    }

    /**
     * Gets all features from the layers
     * @returns {Array} Returns all features from the layers
     * @memberof Layer
     */
    getAllFeaturesFromLayer(): { [index: string]: Feature } {
        return this.features;
    }

    /**
     * Convers features to JSON format
     * @returns {JSON} Returns a JSON format with the features in a JSON format
     * @memberof Layer
     */
    __featuresToJSON(): { [index: string]: any } {
        const output: { [index: string]: any } = {};
        for (const i in this.features) {
            output[i] = this.features[i].toJSON();
        }
        return output;
    }

    /**
     * Converts features to Interchange format
     * @returns {Array} Returns an array with the features in Interchange format
     * @memberof Layer
     */
    __featuresInterchangeV1(): Array<FeatureInterchangeV0> {
        const output: Array<FeatureInterchangeV0> = [];
        for (const i in this.features) {
            output.push(this.features[i].toInterchangeV1());
        }
        return output;
    }

    /**
     * Loads features from JSON format
     * @param {JSON} json JSON format file
     * @memberof Layer
     */
    __loadFeaturesFromJSON(json: { [index: string]: any }): void {
        for (const i in json) {
            this.addFeature(Feature.fromJSON(json[i]));
        }
    }

    /**
     * Loads features from Interchange format
     * @param {*} json Interchange format file
     * @memberof Layer
     */
    __loadFeaturesFromInterchangeV1(json: { [index: string]: any }): void {
        for (const i in json) {
            this.addFeature(Feature.fromInterchangeV1(json[i]));
        }
    }

    // TODO: Replace Params and remove static method
    /**
     * Converts the attributes of the object into a JSON format
     * @returns {JSON} Returns a JSON format with the attributes of the object
     * @memberof Layer
     */
    toJSON(): { [index: string]: any } {
        const output: { [index: string]: any } = {};
        output.name = this.name;
        output.params = this.params.toJSON();
        output.features = this.__featuresToJSON();
        return output;
    }

    /**
     * Converts the attributes of the object into Interchange format
     * @returns {LayerInterchangeV1} Returns a Interchange format with the attributes of the object
     * @memberof Layer
     */
    toInterchangeV1(): LayerInterchangeV1 {
        let layerType = "FLOW";
        if (this.type === LogicalLayerType.FLOW) {
            layerType = "FLOW";
        } else if (this.type === LogicalLayerType.CONTROL) {
            layerType = "CONTROL";
        } else if (this.type === LogicalLayerType.INTEGRATION) {
            layerType = "INTEGRATION";
        } else {
            throw new Error("Unknown layer type: " + this.type);
        }

        const output: LayerInterchangeV1 = {
            id: this.__id,
            name: this.name,
            type: layerType,
            // TODO - Add group and unique name parameters to the system and do type checking
            // against type and not name in the future
            group: this.__group,
            params: this.params.toJSON(),
            features: this.__featuresInterchangeV1()
        };
        return output;
    }

    /**
     * Generate the feature layer json that is neccissary for
     * seriailizing the visual of the 3DuF designs
     *
     * @returns {*} json of the features
     * @memberof Layer
     */
    toFeatureLayerJSON(): { [index: string]: any } {
        const output: { [index: string]: any } = {};
        output.name = this.name;
        output.params = this.params.toJSON();
        output.features = this.__featuresInterchangeV1();
        return output;
    }

    /**
     * Load from an Interchange format a new layer object
     * @param {*} json
     * @returns {Layer} Returns a new layer object
     * @memberof Layer
     */
    static fromInterchangeV1(json: LayerInterchangeV1, device: Device): Layer {
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
        newLayer.__loadFeaturesFromInterchangeV1(json.features);
        return newLayer;
    }
}
