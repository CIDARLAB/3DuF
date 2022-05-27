import CustomComponent from "./customComponent";
import Params from "./params";
import Device from "./device";
import Layer from "./layer";
import DXFObject from "./dxfObject";
import { ComponentAPI } from "@/componentAPI";
import MapUtils from "../utils/mapUtils";
import { FeatureInterchangeV0, LogicalLayerType } from "./init";
import Parameter from "./parameter";
import EventBus from "@/events/events";
import RenderLayer from "../view/renderLayer";
import { DFMType, ManufacturingInfo } from "../manufacturing/manufacturingInfo";
import FeatureUtils from "@/app/utils/featureUtils";

/**
 * Feature class
 */
export default class Feature {
    protected _type: string;
    protected _params: Params;
    protected _name: string;
    protected _id: string;
    protected _fabtype: DFMType;
    protected _dxfObjects: Array<DXFObject>;
    protected _referenceID: string | null;
    public layer: RenderLayer | Layer | null;
    protected _manufacturingInfo: ManufacturingInfo;

    /**
     * Feature Object
     * @param {String} type
     * @param {} set
     * @param {Params} params
     * @param {String} name
     * @param {String} id
     * @param {} fabtype
     */
    constructor(type: string, params: Params, name: string, id: string = ComponentAPI.generateID(), fabtype: DFMType = DFMType.XY) {
        this._type = type;
        this._params = params;
        this._name = name;
        this._id = id;
        this._type = type;
        this._fabtype = fabtype;
        this._dxfObjects = [];
        this._referenceID = null;
        this.layer = null;
        const tempRenderName: string = this.deriveRenderName();
        let modifierName: string;
        if (this.type == "Port") modifierName = "PORT";
        else modifierName = "COMPONENT";
        console.log("rendName: ", tempRenderName);
        console.log("z-offset-key: ", ComponentAPI.library[this.type].object.zOffsetKey(tempRenderName));
        this._manufacturingInfo = {
            fabtype: fabtype,
            layertype: null,
            rendername: tempRenderName,
            "z-offset-key": ComponentAPI.library[this.type].object.zOffsetKey(tempRenderName),
            depth: this.getValue(ComponentAPI.library[this.type].object.zOffsetKey(tempRenderName)),
            "substrate-offset": ComponentAPI.library[this.type].object.substrateOffset(tempRenderName),
            substrate: null,
            modifier: modifierName
        };
    }

    get type(): string {
        return this._type;
    }

    /**
     * Returns the reference object id
     * @return {String}
     * @memberof Feature
     */
    get referenceID(): string | null {
        return this._referenceID;
    }

    /**
     * Sets the reference object id
     * @param {} value
     * @memberof Feature
     * @returns {void}
     * @private
     */
    set referenceID(value: string | null) {
        this._referenceID = value;
    }

    /**
     * Sets dxf object
     * @param {} dxfdata
     * @memberof Feature
     * @returns {void}
     */
    set dxfObjects(dxfdata: Array<DXFObject>) {
        this._dxfObjects = dxfdata;
    }

    /**
     * Returns a string that describes the fabrication type
     * @return {DFMType|*}
     * @memberof Feature
     */
    get fabType(): DFMType {
        return this._fabtype;
    }

    /**
     * Returns the manufacturing information
     * @return {ManufacturingInfo}
     * @memberof Feature
     */
    get manufacturingInfo(): ManufacturingInfo {
        this.setManufacturingInfoLayer();
        return this._manufacturingInfo;
    }

    /**
     * Ensures that layer and substrate values in manufacturingInfo have been set
     * @return {void}
     * @memberof Feature
     */
    setManufacturingInfoLayer(): void {
        this._manufacturingInfo.depth = this.getValue(ComponentAPI.library[this.type].object.zOffsetKey(this.deriveRenderName()));
        if (this.layer != null) {
            this._manufacturingInfo.layertype = this.layer.type;
            this._manufacturingInfo.substrate = FeatureUtils.setSubstrate(this, this._manufacturingInfo["substrate-offset"]);
        } else {
            throw new Error("Layer not set in feature " + this.ID + " so manufacturingInfo cannot be set");
        }
    }

    /**
     * Updates the parameter stored for the given key
     * @param {String} key Key to identify the parameter
     * @param {} value New value to be assigned to the parameter
     * @memberof Feature
     * @returns {void}
     */
    updateParameter(key: string, value: any): void {
        this._params.updateParameter(key, value);
        EventBus.get().emit(EventBus.UPDATE_RENDERS, this);
    }

    /**
     * Generates the serial version of this object
     * @returns {Feature} Returns Feature object in JSON format
     * @memberof Feature
     */
    toJSON() {
        const output = {
            id: this._id,
            name: this._name,
            type: this._type,
            params: this._params.toJSON()
        };

        return output;
    }

    /**
     * Generates the serial version of this object but conforms to the interchange format
     * @returns {}
     * @memberof Feature
     */
    toInterchangeV1(): FeatureInterchangeV0 {
        // TODO: We need to figure out what to do and what the final feature format will be
        const output = {
            id: this._id,
            name: this._name,
            macro: this._type,
            params: this._params.toJSON(),
            type: this._fabtype,
            referenceID: this._referenceID,
            dxfData: this._dxfObjects.map(function(dxfObject) {
                return dxfObject.toJSON();
            })
        };
        return output;
    }

    /**
     * Gets dxfObject
     * @returns {DXFObject}
     * @memberof Feature
     */
    get dxfObjects() {
        return this._dxfObjects;
    }

    /**
     * Gets the ID of the object
     * @returns {String} Returns the ID
     * @memberof Feature
     */
    get ID() {
        return this._id;
    }

    /**
     * Set the name of the object
     * @param {String} name
     * @memberof Feature
     * @returns {void}
     */
    setName(name: string): void {
        this._name = name;
    }

    /**
     * Gets the name of the feature object
     * @returns {String} Returns the name of the feature object
     * @memberof Feature
     *
     */
    getName(): string {
        return this._name;
    }

    /**
     * Gets type of the feature object
     * @returns {String} Returns the type of the object
     * @memberof Feature
     */
    getType(): string {
        return this._type;
    }

    /**
     * Gets the value of certain feature by passing a key identifier
     * @param {String} key  Key is use to identify the desire feature
     * @returns {} Returns the value of the parameters
     * @memberof Feature
     */
    getValue(key: string) {
        try {
            return this._params.getValue(key);
        } catch (err) {
            if (this.hasDefaultParam(key)) return this.getDefaults()[key];
            else throw new Error("Unable to get value for key: " + key);
        }
    }

    /**
     * Checks if the feature object corresponding to the key passed has default parameters.
     * @param {String} key
     * @returns {boolean} Returns true if it has default parameters
     * @memberof Feature
     */
    hasDefaultParam(key: string): boolean {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Checks if the feature object has unique parameters. To select object, a key identifier is requiered
     * @param {String} key
     * @returns {boolean}
     * @memberof Feature
     */
    hasUniqueParam(key: string): boolean {
        return this._params.isUnique(key);
    }

    /**
     * Checks if the feature object has heritable parameters. To select object, a key identifier is requiered
     * @param {String} key
     * @returns {boolean}
     * @memberof Feature
     */
    hasHeritableParam(key: string): boolean {
        return this._params.isHeritable(key);
    }

    /**
     * Gets the heritable parameters of the feature object
     * @returns {Array<Feature.parameters.heritable>} Returns the heritable parameters of the feature object
     * @memberof Feature
     */
    getHeritableParams(): { [key: string]: string } {
        return ComponentAPI.getHeritableForType(this.getType());
    }

    /**
     * Gets the unique parameters of the feature object
     * @returns {Array<Feature.parameters.unique>} Returns the unique parameters of the feature object
     * @memberof Feature
     */
    getUniqueParams(): { [key: string]: string } {
        return ComponentAPI.getUniqueForType(this.getType());
    }

    /**
     * Gets the default parameters of the feature object
     * @returns {Array<Feature.parameters.defaults>} Returns the default paramets of the feature object
     * @memberof Feature
     */
    getDefaults(): { [key: string]: number } {
        return ComponentAPI.getDefaultsForType(this.getType());
    }

    /**
     * Gets the parameters of the feature object
     * @returns {Array<Feature.parameters>} Returns the parameters of the feature object
     * @memberof Feature
     */
    getParams(): { [index: string]: Parameter } {
        return this._params.parameters;
    }

    /**
     * Sets the passed parameter as a parameter of the feature object
     * @param {Params} params New parameter to the object
     * @memberof Feature
     * @returns {void}
     */
    setParams(params: { [index: string]: Parameter }): void {
        this._params.loadParameters(params);
    }

    /**
     * Replicates the position
     * @param {Number} xpos X coordinate to replicate
     * @param {Number} ypos Y coordinate to replicate
     * @returns {Feature}
     * @memberof Feature
     */
    replicate(xpos: number, ypos: number): Feature {
        const paramscopy = this._params;
        const replicaparams: { [key: string]: any } = {
            position: [xpos, ypos]
        };
        for (const key in this._params.parameters) {
            replicaparams[key] = this.getValue(key);
        }

        const ret = Device.makeFeature(
            this._type,
            replicaparams,
            this._name,
            ComponentAPI.generateID(),
            "XY",
            this._dxfObjects.map(function(dxfObject) {
                return dxfObject.toJSON();
            })
        );

        return ret;
    }

    /**
     * Determines the string which should be used for the renderName
     * @returns Returns the render name
     * @memberof Feature
     */

    deriveRenderName(): string {
        if (!ComponentAPI.library[this.type]) {
            console.error("Type unrecognized, defaulting to template.");
            this._type = "Template";
        }
        return ComponentAPI.library[this.type].key;
    }

    /**
     * Checks whether the values do not have an own property and assigns them a default value.
     * @param {*} values
     * @param {*} heritable
     * @param {*} defaults
     * @returns Returns the values
     * @memberof Feature
     */
    static checkDefaults(values: { [key: string]: number }, heritable: { [key: string]: string }, defaults: { [key: string]: number }) {
        for (const key in heritable) {
            if (!Object.prototype.hasOwnProperty.call(values, key)) values[key] = defaults[key];
        }
        return values;
    }

    /**
     * Loads from JSON format the features for a device
     * @param {JSON} json
     * @returns {Feature} Returns a Device object with the features in the JSON
     * @memberof Feature
     */
    static fromJSON(json: any) {
        return Device.makeFeature(json.type, json.params, json.name, json.id, "XY", []);
    }

    /**
     * Loads from an InetchangeV1 format the features for a device object
     * @param {*} json
     * @returns {Feature}
     * @memberof Feature
     */
    static fromInterchangeV1(json: any) {
        let ret;
        // TODO: This will have to change soon when the thing is updated
        ret = Device.makeFeature(json.macro, json.params, json.name, json.id, json.type, json.dxfData);
        if (Object.prototype.hasOwnProperty.call(json, "referenceID")) {
            ret.referenceID = json.referenceID;
            // Registry.currentDevice.updateObjectReference(json.id, json.referenceID);
        }
        return ret;
    }

    /**
     * Creates a custom feature for the component based on the parameters values
     * @returns {Feature} Returns a new feature object
     * @memberof Feature
     */
    static makeCustomComponentFeature(customcomponent: CustomComponent, setstring: string, paramvalues: { [key: string]: any }, name = "New Feature", id = undefined) {
        const definitions = CustomComponent.defaultParameterDefinitions();
        Feature.checkDefaults(paramvalues, definitions.heritable, ComponentAPI.getDefaultsForType(customcomponent.type));
        const params = new Params(paramvalues, MapUtils.toMap(definitions.unique), MapUtils.toMap(definitions.heritable));
        const ret = new Feature(customcomponent.type, params, name, id, DFMType.XY);
        ret.dxfObjects = customcomponent.dxfData;
        return ret;
    }

    /**
     * Returns the dxf objects
     * @return {DXFObject}
     * @memberof Feature
     */
    getDXFObjects(): Array<DXFObject> {
        return this._dxfObjects;
    }

    /**
     * Add a DXF object
     * @param {DXFObject} dxfobject
     * @memberof Feature
     * @returns {void}
     */
    addDXFObject(dxfobject: DXFObject): void {
        this._dxfObjects.push(dxfobject);
    }
}
