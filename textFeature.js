//TODO: Restructure the TextFeature and all its implementation
import * as Parameters from "./parameters";
var StringValue = Parameters.StringValue;
import * as Registry from "./registry";
/**
 * TextFeature object.
 */
export default class TextFeature {
    /**
     * Default Constructor of the TextFeature object.
     * @param {*} text 
     * @param {*} params 
     * @param {*} id 
     */
    constructor(text, params, id = TextFeature.generateID()) {
        // super("TEXT", "Basic", params, id, id);
        this.__text = text;
        this.__params.updateParameter("text", text);
    }
    /**
     * Generates an ID.
     * @returns Returns the generated ID.
     */
    static generateID() {
        return Registry.generateID();
    }
    /**
     * Converts to JSON format.
     * @returns {JSON} Returns object in JSON.
     */
    toJSON() {
        let output = {};
        output.id = this.__id;
        output.name = this.__name.toJSON();
        output.type = this.__type;
        output.set = this.__set;
        output.params = this.__params.toJSON();
        return output;
    }
    /**
     * Converts to Interchange format.
     * @returns {*} Returns object in Interchange.
     */
    toInterchangeV1() {
        //TODO: We need to figure out what to do and what the final feature format will be
        let output = {};
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
     * @returns {string} Returns the ID of the object.
     */
    getID() {
        return this.__id;
    }
    /**
     * Sets the name for the object.
     * @param {string} name Name we want to assign to the object.
     */
    setName(name) {
        this.__name = StringValue(name);
    }
    /**
     * Gets the name of the object.
     * @returns {string} Returns the name of the object.
     */
    getName() {
        return this.__name.getValue();
    }
    /**
     * Gets what type is the object.
     * @returns Returns the type of the object.
     */
    getType() {
        return this.__type;
    }
    /**
     * Gets the text in the TextFeature object.
     * @returns {string} Returns the text of the TextFeature object.
     */
    getText() {
        return this.__text;
    }
    /**
     * Generates a feature.
     * @param {*} typeString 
     * @param {*} setString
     * @returns {Object}  Returns a feature object.
     */
    static getFeatureGenerator(typeString, setString) {
        return function(values) {
            return Feature.makeFeature(typeString, setString, values);
        };
    }
    /**
     * Gets the value of a given parameter.
     * @param {string} key The key is use to identify the parameter we want to modify it's value.
     * @returns Returns the value of the parameter.
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
     * @param {string} key 
     * @returns {boolean} true if it has default parameters
     */
    hasDefaultParam(key) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }
    /**
     * Checks whether the object has unique parameters.
     * @param {string} key 
     * @returns {boolean} Returns true if it has unique parameters
     */
    hasUniqueParam(key) {
        return this.__params.isUnique(key);
    }
    /**
     * Checks whether the object has heritable parameters.
     * @param {string} key 
     * @returns {boolean} Returns true if it has heritable parameters.
     */
    hasHeritableParam(key) {
        return this.__params.isHeritable(key);
    }
    /**
     * Gets the heritable parameters of the object.
     * @returns
     */
    getHeritableParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).heritable;
    }
    /**
     * Gets the unique parameters of the object.
     * @returns
     */
    getUniqueParams() {
        return Feature.getDefinitionForType(this.getType(), this.getSet()).unique;
    }
    /**
     * Gets the default parameters of the object.
     * @returns
     */
    getDefaults() {
        return Feature.getDefaultsForType(this.getType(), this.getSet());
    }
    /**
     * Gets the parameters of the object.
     * @returns
     */
    getParams() {
        return this.__params.parameters;
    }
    /**
     * Sets the parameters of the object.
     * @param {*} params 
     */
    setParams(params) {
        this.__params.parameters = params;
    }
    /**
     * Creates a feature from a JSON format.
     * @param {JSON} json 
     * @returns
     */
    static fromJSON(json) {
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        return Feature.makeFeature(json.type, set, json.params, json.name, json.id);
    }
    /**
     * Creates a feature from an Interchange format.
     * @param {*} json 
     * @returns
     */
    static fromInterchangeV1(json) {
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        //TODO: This will have to change soon when the thing is updated
        return Feature.makeFeature(json.macro, set, json.params, json.name, json.id, json.type);
    }
    /**
     * Creates a new TextFeature object.
     * @param {*} textcontent 
     * @param {*} typeString 
     * @param {*} setString 
     * @param {*} values 
     * @param {string} name 
     * @param {string} id 
     * @returns {Object} Returns new TextFeature object.
     */
    static makeFeature(textcontent, typeString, setString, values, name = "New Feature", id = undefined) {
        // let featureType = FeatureSets.getDefinition(typeString, setString);
        // Feature.checkDefaults(values, featureType.heritable, Feature.getDefaultsForType(typeString, setString));
        // let params = new Params(values, featureType.unique, featureType.heritable);
        return new TextFeature(textcontent, values, id);
    }
    /**
     * Updates the feature
     */
    updateView() {
        if (Registry.viewManager) Registry.viewManager.updateFeature(this);
    }

    //I wish I had abstract methods. :(
    render2D() {
        throw new Error("Base class Feature cannot be rendered in 2D.");
    }
}
