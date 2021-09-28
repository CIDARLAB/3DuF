import uuid from "node-uuid";
import Feature from "../core/feature";
import EdgeFeature from "../core/edgeFeature";

import { RenderLayerInterchangeV1, FeatureInterchangeV0, LayerInterchangeV1, LogicalLayerType } from "../core/init";
import Layer from "../core/layer";
import Params from "../core/params";

export default class RenderLayer {
    features: { [index: string]: Feature };
    featureCount: number;
    color: string | undefined;
    private __id: string;
    private __type: LogicalLayerType;
    name: string;
    protected _physicalLayer: Layer | null;
    protected params: Params;

    constructor(name: string = "New Layer", modellayer: Layer | null = null, type: LogicalLayerType = LogicalLayerType.FLOW) {
        this.__type = type;
        this.features = {};
        this.featureCount = 0;
        this.name = name;
        if (modellayer) this.params = modellayer.params;
        else this.params = new Params([], Layer.getUniqueParameters(), new Map());
        this._physicalLayer = modellayer;
        if (type == LogicalLayerType.FLOW) {
            this.color = "indigo";
        } else if (type == LogicalLayerType.CONTROL) {
            this.color = "red";
        } else if (type == LogicalLayerType.INTEGRATION) {
            this.color = "green";
        } else {
            this.color = undefined;
        }
        this.__id = RenderLayer.generateID();
    }

    /**
     * Sets the render layer
     *
     * @memberof RenderLayer
     */
    set physicalLayer(layer: Layer | null) {
        this._physicalLayer = layer;
    }

    /**
     * returns the render layer
     *
     * @type {(Layer | null)}
     * @memberof RenderLayer
     */
    get physicalLayer(): Layer | null {
        return this._physicalLayer;
    }

    /**
     * Returns the type of the render layer
     *
     * @readonly
     * @type {string}
     * @memberof RenderLayer
     */
    get type(): LogicalLayerType {
        return this.__type;
    }

    /**
     * Returns id of the render layer
     *
     * @readonly
     * @type {string}
     * @memberof RenderLayer
     */
    get id(): string {
        return this.__id;
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
    addFeature(feature: Feature, physfeat: boolean = true): void {
        this.__ensureIsAFeature(feature);
        this.features[feature.ID] = feature;
        this.featureCount += 1;
        if (this.physicalLayer !== null && physfeat == true) {
            this.physicalLayer.addFeature(feature);
            feature.layer = this.physicalLayer;
        } else {
            feature.layer = this;
        }
    }

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
        this.featureCount -= 1;
        let physLayer = this._physicalLayer;
        if (physLayer !== null) {
            if (physLayer.containsFeatureID(featureID)) physLayer.removeFeatureByID(featureID);
        }
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
     * @param {FeatureInterchangeV0} json Interchange format file
     * @memberof RenderLayer
     */
    __loadFeaturesFromInterchangeV1(json: Array<FeatureInterchangeV0>): void {
        for (const i in json) {
            this.addFeature(Feature.fromInterchangeV1(json[i]));
        }
    }

    /**
     * Converts the model layer into Interchange format
     * @returns {LayerInterchangeV1 | null} Returns a Interchange format with the attributes of the object
     * @memberof RenderLayer
     */
    __layerToInterchangeV1(): LayerInterchangeV1 | null {
        if (this._physicalLayer !== null) {
            return this._physicalLayer.toInterchangeV1();
        }
        return null;
    }

    // /**
    //  * Loads physical layer from json format
    //  * @param {json} json format file
    //  * @memberof RenderLayer
    //  */
    // __loadLayerFromJSON(json: { [index: string]: any }): void {
    //     this.physicalLayer = Layer.fromJSON(json);
    // }

    // /**
    //  * Loads physical layer from Interchange format
    //  * @param {LayerInterchangeV1} json Interchange format file
    //  * @memberof RenderLayer
    //  */
    // __loadLayerFromInterchange(json: LayerInterchangeV1): void {
    //     this.physicalLayer = Layer.fromInterchangeV1(json);
    // }

    /**
     * Converts the attributes of the object into Interchange format
     * @returns {LayerInterchangeV1} Returns a Interchange format with the attributes of the object
     * @memberof Layer
     */
    toInterchangeV1(): RenderLayerInterchangeV1 {
        let physlayer;
        if (this.physicalLayer) {
            physlayer = this.physicalLayer.id;
        } else {
            physlayer = null;
        }
        const output: RenderLayerInterchangeV1 = {
            id: this.__id,
            name: this.name,
            //name: this.name,
            // TODO - Add group and unique name parameters to the system and do type checking
            // against type and not name in the future
            modellayer: physlayer,
            type: this.__type,
            //params: this.params.toJSON(),
            features: this.__featuresInterchangeV1(),
            color: this.color
        };
        return output;
    }

    /**
     * Load from a JSON format a new layer object
     * @param {JSON} json JSON format
     * @returns {Layer} Returns a new layer object
     * @memberof Layer
     */
    static fromJSON(json: { [index: string]: any }): RenderLayer {
        //Effectively defunct, use loadUtils version
        if (!Object.prototype.hasOwnProperty.call(json, "features")) {
            throw new Error("JSON layer has no features!");
        }
        const newLayer = new RenderLayer(json.name, null, json.type);
        newLayer.__loadFeaturesFromJSON(json.features);
        //if (json.modellayer) newLayer.__loadLayerFromJSON(json.modellayer);
        if (json.color) newLayer.color = json.color;
        return newLayer;
    }

    /**
     * Load from an Interchange format a new layer object
     * @param {*} json
     * @returns {Layer} Returns a new layer object
     * @memberof Layer
     */
    static fromInterchangeV1(json: RenderLayerInterchangeV1): RenderLayer {
        //Effectively defunct, use loadUtils version
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

        newLayer.__loadFeaturesFromInterchangeV1(json.features);

        //if (json.modellayer) newLayer.__loadLayerFromInterchange(json.modellayer);
        if (json.color) newLayer.color = json.color; // TODO: Figure out if this needs to change in the future
        return newLayer;
    }
}
