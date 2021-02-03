import CustomComponent from "./customComponent";
import Params from "./params";
import Device from "./device";

import * as Parameters from "./parameters";
const StringValue = Parameters.StringValue;
import * as FeatureSets from "../featureSets";
import * as Registry from "./registry";
import DXFObject from "./dxfObject";

/**
 * Feature class
 */
export default class Feature {
    /**
     * Feature Object
     * @param {String} type
     * @param {} set
     * @param {Params} params
     * @param {String} name
     * @param {String} id
     * @param {} fabtype
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
     * @return {String}
     * @memberof Feature
     * @private
     */
    get referenceID() {
        return this.__referenceObject;
    }

    /**
     * Sets the reference object id
     * @param {} value
     * @memberof Feature
     * @returns {void}
     * @private
     */
    set referenceID(value) {
        if (typeof value != "string" && !(value instanceof String)) {
            throw new Error("The reference object value can only be a string");
        }
        this.__referenceObject = value;
    }
    /**
     * Sets dxf object
     * @param {} dxfdata
     * @memberof Feature
     * @returns {void}
     */
    set dxfObjects(dxfdata) {
        this.__dxfObjects = dxfdata;
    }

    /**
     * Returns a string that describes the fabrication type
     * @return {string|*}
     * @memberof Feature
     */
    get fabType() {
        return this.__fabtype;
    }

    /**
     * Generates an unique feature id
     * @return {String}
     */
    static generateID() {
        return Registry.generateID();
    }

    /**
     * Updates the parameter stored for the given key
     * @param {String} key Key to identify the parameter
     * @param {} value New value to be assigned to the parameter
     * @memberof Feature
     * @returns {void}
     */
    updateParameter(key, value) {
        this.__params.updateParameter(key, value);
        this.updateView();
    }

    /**
     * Generates the serial version of this object
     * @returns {Feature} Returns Feature object in JSON format
     * @memberof Feature
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
     * Generates the serial version of this object but conforms to the interchange format
     * @returns {}
     * @memberof Feature
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
    /**
     * Gets dxfObject
     * @returns {DXFObject}
     * @memberof Feature
     */
    get dxfObjects() {
        return this.__dxfObjects;
    }
    /**
     * Gets the set of the feature
     * @returns {}
     * @memberof Feature
     */
    getSet() {
        return this.__set;
    }
    /**
     * Gets the ID of the object
     * @returns {String} Returns the ID
     * @memberof Feature
     */
    getID() {
        return this.__id;
    }
    /**
     * Set the name of the object
     * @param {String} name 
     * @memberof Feature
     * @returns {void}
     */
    setName(name) {
        this.__name = StringValue(name);
    }
    /**
     * Gets the name of the feature object
     * @returns {String} Returns the name of the feature object
     * @memberof Feature
     * 
     */
    getName() {
        return this.__name;
    }
    /**
     * Gets type of the feature object
     * @returns {String} Returns the type of the object
     * @memberof Feature
     */
    getType() {
        return this.__type;
    }
    /**
     * Generates a feature for a Device object
     * @param {String} typeString 
     * @param {String} setString 
     * @returns {Feature} Returns a device feature object
     * @memberof Feature
     */
    static getFeatureGenerator(typeString, setString) {
        return function(values) {
            return Device.makeFeature(typeString, setString, values);
        };
    }
    /**
     * Gets the value of certain feature by passing a key identifier
     * @param {String} key  Key is use to identify the desire feature
     * @returns {} Returns the value of the parameters
     * @memberof Feature
     */
    getValue(key) {
        try {
            return this.__params.getValue(key);
        } catch (err) {
            if (this.hasDefaultParam(key)) return this.getDefaults()[key];
            else throw new Error("Unable to get value for key: " + key + " Type: " + this.getType());
        }
    }
    /**
     * Checks if the feature object corresponding to the key passed has default parameters. 
     * @param {String} key 
     * @returns {boolean} Returns true if it has default parameters
     * @memberof Feature
     */
    hasDefaultParam(key) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }
    /**
     * Checks if the feature object has unique parameters. To select object, a key identifier is requiered
     * @param {String} key 
     * @returns {boolean}
     * @memberof Feature
     */
    hasUniqueParam(key) {
        return this.__params.isUnique(key);
    }
    /**
     * Checks if the feature object has heritable parameters. To select object, a key identifier is requiered
     * @param {String} key 
     * @returns {boolean}
     * @memberof Feature
     */
    hasHeritableParam(key) {
        return this.__params.isHeritable(key);
    }
    /**
     * Gets the heritable parameters of the feature object
     * @returns {Array<Feature.parameters.heritable>} Returns the heritable parameters of the feature object
     * @memberof Feature
     */
    getHeritableParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).heritable;
    }
    /**
     * Gets the unique parameters of the feature object
     * @returns {Array<Feature.parameters.unique>} Returns the unique parameters of the feature object
     * @memberof Feature
     */
    getUniqueParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).unique;
    }
    /**
     * Gets the default parameters of the feature object
     * @returns {Array<Feature.parameters.defaults>} Returns the default paramets of the feature object
     * @memberof Feature
     */
    getDefaults() {
        return Feature.getDefaultsForType(this.getType(), this.getSet());
    }
    /**
     * Gets the parameters of the feature object
     * @returns {Array<Feature.parameters>} Returns the parameters of the feature object
     * @memberof Feature
     */
    getParams() {
        return this.__params.parameters;
    }
    /**
     * Sets the passed parameter as a parameter of the feature object
     * @param {Params} params New parameter to the object
     * @memberof Feature
     * @returns {void}
     */
    setParams(params) {
        this.__params.parameters = params;
    }
    /**
     * Replicates the position 
     * @param {Number} xpos X coordinate to replicate
     * @param {Number} ypos Y coordinate to replicate
     * @returns {Feature}
     * @memberof Feature
     */
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
    /**
     * ?
     * @param {String} typeString 
     * @param {String} setString 
     * @returns {Feature.defaults}
     * @memberof Feature
     */
    static getDefaultsForType(typeString, setString) {
        return Registry.featureDefaults[setString][typeString];
    }
    /**
     * Gets the definition for a certain type of feture object
     * @param {String} typeString 
     * @param {String} setString 
     * @returns {Feature.definitions}
     * @memberof Feature
     */
    static getDefinitionForType(typeString, setString) {
        return FeatureSets.getDefinition(typeString, setString);
    }
    /**
     * Checks whether the values do not have an own property and assigns them a default value.
     * @param {*} values 
     * @param {*} heritable 
     * @param {*} defaults 
     * @returns Returns the values
     * @memberof Feature
     */
    static checkDefaults(values, heritable, defaults) {
        for (let key in heritable) {
            if (!values.hasOwnProperty(key)) values[key] = defaults[key];
        }
        return values;
    }
    /**
     * Loads from JSON format the features for a device
     * @param {JSON} json 
     * @returns {Device} Returns a Device object with the features in the JSON
     * @memberof Feature
     */
    static fromJSON(json) {
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        return Device.makeFeature(json.type, set, json.params, json.name, json.id);
    }
    /**
     * Loads from an InetchangeV1 format the features for a device object
     * @param {*} json 
     * @returns {Device}
     * @memberof Feature
     */
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
    /**
     * Creates a custom feature for the component based on the parameters values
     * @returns {Feature} Returns a new feature object
     * @memberof Feature
     */
    static makeCustomComponentFeature(customcomponent, setstring, paramvalues, name = "New Feature", id = undefined) {
        let definitions = CustomComponent.defaultParameterDefinitions();
        Feature.checkDefaults(paramvalues, definitions.heritable, Feature.getDefaultsForType(customcomponent.type, setstring));
        let params = new Params(paramvalues, definitions.unique, definitions.heritable);
        let ret = new Feature(customcomponent.type, setstring, params, name, id);
        ret.dxfObjects = customcomponent.dxfData;
        return ret;
    }
    /**
     * Updates the view
     * @memberof Feature
     * @returns {void}
     */
    updateView() {
        if (Registry.viewManager) Registry.viewManager.updateFeature(this);
    }

    //I wish I had abstract methods. :(
    /**
     * @memberof Feature
     * @returns {void}
     */
    render2D() {
        throw new Error("Base class Feature cannot be rendered in 2D.");
    }

    /**
     * Returns the dxf objects
     * @return {DXFObject}
     * @memberof Feature
     */
    getDXFObjects() {
        return this.__dxfObjects;
    }

    /**
     * Add a DXF object
     * @param {DXFObject} dxfobject
     * @memberof Feature
     * @returns {void}
     */
    addDXFObject(dxfobject) {
        this.__dxfObjects.push(dxfobject);
    }
}
