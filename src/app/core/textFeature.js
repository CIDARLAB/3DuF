// TODO: Restructure the TextFeature and all its implementation
import Parameter from "./parameter";
import StringValue from "./parameters/stringValue";
import Registry from "./registry";
import { ComponentAPI } from "@/componentAPI";
import Feature from "@/app/core/feature";

/**
 * Text Feature class
 */
export default class TextFeature {
    /**
     * Default Constructor of the TextFeature object.
     * @param {String} text
     * @param {Parameter} params
     * @param {String} id
     */
    constructor(text, params, id = ComponentAPI.generateID()) {
        // super("TEXT", "Basic", params, id, id);
        this.__text = text;
        this.__params.updateParameter("text", text);
    }

    /**
     * Converts to JSON format.
     * @returns {JSON} Returns object in JSON.
     * @memberof TextFeature
     */
    toJSON() {
        const output = {};
        output.id = this.__id;
        output.name = this.__name.toJSON();
        output.type = this.__type;
        output.set = this.__set;
        output.params = this.__params.toJSON();
        return output;
    }

    /**
     * Converts to Interchange format.
     * @returns {TextFeature} Returns object in Interchange.
     * @memberof TextFeature
     */
    toInterchangeV1() {
        // TODO: We need to figure out what to do and what the final feature format will be
        const output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.macro = this.__type;
        output.set = this.__set;
        output.params = this.__params.toJSON();
        output.type = this.__fabtype;
        return output;
    }

    /**
     * Gets the ID of the object.
     * @returns {String} Returns the ID of the object.
     * @memberof TextFeature
     */
    getID() {
        return this.__id;
    }

    /**
     * Sets the name for the object.
     * @param {String} name Name we want to assign to the object.
     * @memberof TextFeature
     * @returns {void}
     */
    setName(name) {
        this.__name = new StringValue(name);
    }

    /**
     * Gets the name of the object.
     * @returns {String} Returns the name of the object.
     * @memberof TextFeature
     */
    getName() {
        return this.__name.getValue();
    }

    /**
     * Gets what type is the object.
     * @returns {} Returns the type of the object.
     * @memberof TextFeature
     */
    getType() {
        return this.__type;
    }

    /**
     * Gets the text in the TextFeature object.
     * @returns {String} Returns the text of the TextFeature object.
     * @memberof TextFeature
     */
    getText() {
        return this.__text;
    }

    /**
     * Gets the value of a given parameter.
     * @param {String} key The key is use to identify the parameter we want to modify it's value.
     * @returns {} Returns the value of the parameter.
     * @memberof TextFeature
     */
    getValue(key) {
        try {
            return this.__params.getValue(key);
        } catch (err) {
            if (this.hasDefaultParam(key)) return this.getDefaults()[key];
            else throw new Error("Unable to get value for key: " + key);
        }
    }

    /**
     * Checks whether the object has default parameters.
     * @param {String} key
     * @returns {Boolean} true if it has default parameters
     * @memberof TextFeature
     */
    hasDefaultParam(key) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Checks whether the object has unique parameters.
     * @param {String} key
     * @returns {Boolean} Returns true if it has unique parameters
     * @memberof TextFeature
     */
    hasUniqueParam(key) {
        return this.__params.isUnique(key);
    }

    /**
     * Checks whether the object has heritable parameters.
     * @param {string} key
     * @returns {Boolean} Returns true if it has heritable parameters.
     * @memberof TextFeature
     */
    hasHeritableParam(key) {
        return this.__params.isHeritable(key);
    }

    /**
     * Gets the heritable parameters of the object.
     * @returns {Feature.heritable}
     * @memberof TextFeature
     */
    getHeritableParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).heritable;
    }

    /**
     * Gets the unique parameters of the object.
     * @returns {Feature.unique}
     * @memberof TextFeature
     */
    getUniqueParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).unique;
    }

    /**
     * Gets the default parameters of the object.
     * @returns {Feature}
     * @memberof TextFeature
     */
    getDefaults() {
        return Feature.getDefaultsForType(this.getType(), this.getSet());
    }

    /**
     * Sets the parameters of the object.
     * @param {Params} params
     * @memberof TextFeature
     * @returns {void}
     */
    setParams(params) {
        this.__params.parameters = params;
    }

    /**
     * Creates a feature from a JSON format.
     * @param {JSON} json
     * @returns {Feature}
     * @memberof TextFeature
     */
    static fromJSON(json) {
        let set;
        if (Object.prototype.hasOwnProperty.call(json, "set")) set = json.set;
        else set = "Basic";
        return Feature.makeFeature(json.type, json.params, json.name, json.id);
    }

    /**
     * Creates a feature from an Interchange format.
     * @param {*} json
     * @returns {Feature}
     * @memberof TextFeature
     */
    static fromInterchangeV1(json) {
        let set;
        if (Object.prototype.hasOwnProperty.call(json, "set")) set = json.set;
        else set = "Basic";
        // TODO: This will have to change soon when the thing is updated
        return Feature.makeFeature(json.macro, json.params, json.name, json.id, json.type);
    }

    /**
     * Creates a new TextFeature object.
     * @param {*} textcontent
     * @param {String} typeString
     * @param {String} setString
     * @param {*} values
     * @param {string} name
     * @param {string} id
     * @returns {TextFeature} Returns new TextFeature object.
     * @memberof TextFeature
     */
    static makeFeature(textcontent, typeString, setString, values, name = "New Feature", id = undefined) {
        // let featureType = FeatureSets.getDefinition(typeString, setString);
        // Feature.checkDefaults(values, featureType.heritable, Feature.getDefaultsForType(typeString, setString));
        // let params = new Params(values, featureType.unique, featureType.heritable);
        return new TextFeature(textcontent, values, id);
    }

    // I wish I had abstract methods. :(
    /**
     * @memberof TextFeature
     * @returns {void}
     */
    render2D() {
        throw new Error("Base class Feature cannot be rendered in 2D.");
    }
}
