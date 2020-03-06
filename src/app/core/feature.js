import CustomComponent from "./customComponent";
import Params from "./params";
import Device from "./device";

import * as Parameters from "./parameters";
const StringValue = Parameters.StringValue;
import * as FeatureSets from "../featureSets";
import * as Registry from "./registry";

/**
 * Represents the object from which we generate a render
 */
export default class Feature {
    /**
     * Feature Object
     * @param type
     * @param set
     * @param params
     * @param name
     * @param id
     * @param fabtype
     */
    constructor(type, set, params, name, id = Feature.generateID(), fabtype = "XY") {
        this.__type = type;
        this.__params = params;
        this.__name = name;
        this.__id = id;
        this.__type = type;
        this.__set = set;
        this.__fabtype = fabtype;
        this.__dxfObjects = [];
        this.__referenceID = null;
    }

    /**
     * Returns the reference object id
     * @return {null}
     * @private
     */
    get referenceID() {
        return this.__referenceObject;
    }

    /**
     * Sets the reference object id
     * @param value
     * @private
     */
    set referenceID(value) {
        if (typeof value != "string" && !(value instanceof String)) {
            throw new Error("The reference object value can only be a string");
        }
        this.__referenceObject = value;
    }

    set dxfObjects(dxfdata) {
        this.__dxfObjects = dxfdata;
    }

    /**
     * Returns a string that describes the fabrication type
     * @return {string|*}
     */
    get fabType() {
        return this.__fabtype;
    }

    /**
     * Generates an unique feature id
     * @return {*}
     */
    static generateID() {
        return Registry.generateID();
    }

    /**
     * Updates the parameter stored for the given key
     * @param key
     * @param value
     */
    updateParameter(key, value) {
        this.__params.updateParameter(key, value);
        this.updateView();
    }

    /**
     * Generates the serial version of this object
     */
    toJSON() {
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.type = this.__type;
        output.set = this.__set;
        output.params = this.__params.toJSON();
        return output;
    }

    /**
     * Generates the serial version of this object but conforms
     * to the interchange format
     */
    toInterchangeV1() {
        //TODO: We need to figure out what to do and what the final feature format will be
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.macro = this.__type;
        output.set = this.__set;
        output.referenceID = this.referenceID;

        if (this.__params) {
            output.params = this.__params.toJSON();
        }

        output.dxfData = [];

        if (this.__dxfObjects) {
            for (let i in this.__dxfObjects) {
                output.dxfData.push(this.__dxfObjects[i].toJSON());
            }
        }

        output.type = this.__fabtype;
        // console.log("serialized feature: ", output);
        return output;
    }

    get dxfObjects() {
        return this.__dxfObjects;
    }

    getSet() {
        return this.__set;
    }

    getID() {
        return this.__id;
    }

    setName(name) {
        this.__name = StringValue(name);
    }

    getName() {
        return this.__name;
    }

    getType() {
        return this.__type;
    }

    static getFeatureGenerator(typeString, setString) {
        return function(values) {
            return Device.makeFeature(typeString, setString, values);
        };
    }

    getValue(key) {
        try {
            return this.__params.getValue(key);
        } catch (err) {
            if (this.hasDefaultParam(key)) return this.getDefaults()[key];
            else throw new Error("Unable to get value for key: " + key);
        }
    }

    hasDefaultParam(key) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    hasUniqueParam(key) {
        return this.__params.isUnique(key);
    }

    hasHeritableParam(key) {
        return this.__params.isHeritable(key);
    }

    getHeritableParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).heritable;
    }

    getUniqueParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).unique;
    }

    getDefaults() {
        return Feature.getDefaultsForType(this.getType(), this.getSet());
    }

    getParams() {
        return this.__params.parameters;
    }

    setParams(params) {
        this.__params.parameters = params;
    }

    replicate(xpos, ypos) {
        let paramscopy = this.__params;
        let replicaparams = {};
        for (let key in this.__params.parameters) {
            replicaparams[key] = this.getValue(key);
        }
        replicaparams["position"] = [xpos, ypos];
        let ret = Device.makeFeature(this.__type, this.__set, replicaparams, this.__name, Feature.generateID(), this.__dxfObjects);

        return ret;
    }

    static getDefaultsForType(typeString, setString) {
        return Registry.featureDefaults[setString][typeString];
    }

    static getDefinitionForType(typeString, setString) {
        return FeatureSets.getDefinition(typeString, setString);
    }

    static checkDefaults(values, heritable, defaults) {
        for (let key in heritable) {
            if (!values.hasOwnProperty(key)) values[key] = defaults[key];
        }
        return values;
    }

    static fromJSON(json) {
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        return Device.makeFeature(json.type, set, json.params, json.name, json.id);
    }

    static fromInterchangeV1(json) {
        let ret;
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        //TODO: This will have to change soon when the thing is updated
        ret = Device.makeFeature(json.macro, set, json.params, json.name, json.id, json.type, json.dxfData);
        if (json.hasOwnProperty("referenceID")) {
            ret.referenceID = json.referenceID;
            // Registry.currentDevice.updateObjectReference(json.id, json.referenceID);
        }
        return ret;
    }

    static makeCustomComponentFeature(customcomponent, setstring, paramvalues, name = "New Feature", id = undefined) {
        let definitions = CustomComponent.defaultParameterDefinitions();
        Feature.checkDefaults(paramvalues, definitions.heritable, Feature.getDefaultsForType(customcomponent.type, setstring));
        let params = new Params(paramvalues, definitions.unique, definitions.heritable);
        let ret = new Feature(customcomponent.type, setstring, params, name, id);
        ret.dxfObjects = customcomponent.dxfData;
        return ret;
    }

    updateView() {
        if (Registry.viewManager) Registry.viewManager.updateFeature(this);
    }

    //I wish I had abstract methods. :(
    render2D() {
        throw new Error("Base class Feature cannot be rendered in 2D.");
    }

    /**
     * Returns the array of dxf objects
     * @return {Array}
     */
    getDXFObjects() {
        return this.__dxfObjects;
    }

    /**
     * Add a DXF object
     * @param dxfobject
     */
    addDXFObject(dxfobject) {
        this.__dxfObjects.push(dxfobject);
    }
}
