import * as Registry from "./registry";
import * as NumberUtils from "../utils/numberUtils";

/**
 * Parameter class
 */
export default class Parameter {
    /**
     * Default Constructor of the Parameter object
     * @param {String} type 
     * @param {*} value 
     */
    constructor(type, value) {
        //Check value if its parsable string
        if (typeof value === "string" && type === "Float") {
            value = parseInt(value);
        } else if (typeof value === "string" && type === "Integer") {
            value = parseInt(value);
        }
        Parameter.checkValue(type, value);
        this.__type = type;
        this.__value = value;
    }
    /**
     * @returns {}
     * @memberof Parameter
     */
    toJSON() {
        return this.__value;
    }
    /**
     * Gets value of parameter
     * @returns {} Returns value of the parameter
     * @memberof Parameter
     */
    getValue() {
        return this.__value;
    }
    /**
     * Gets type of parameter
     * @returns {String} Returns the type of parameter
     * @memberof Parameter
     */
    getType() {
        return this.__type;
    }
    /**
     * Checks if value of the parameter is valid or not
     * @param {String} type Type of the parameter
     * @param {*} value Value of the parameter
     * @memberof Parameter
     * @returns {void}
     */
    static checkValue(type, value) {
        let paramType = Registry.registeredParams[type];
        if (paramType.isValid(value)){
            return true;
        }
    }
    
    /**
     * Updates the value of parameter
     * @param {*} value New value of the parameter
     * @memberof Parameter
     * @returns {void}
     */
    updateValue(value) {
        Parameter.checkValue(this.__type, value);
        this.__value = value;
    }
    
    resetValue() {}

    //Takes a typestring to recognize that param type, and
    // an isValid function which returns true if a value is OK for
    // that type.
    /**
     * Registers a parameter
     * @param {String} typeString Type of string ?
     * @param {Boolean} isValid Boolean to asure the parameter is valid
     * @param {String} description Description of the parameter
     * @memberof Parameter
     * @returns {void}
     */
    static registerParamType(typeString, isValid, description) {
        Registry.registeredParams[typeString] = {
            isValid: isValid,
            description: description
        };
    }
    /**
     * Creates a new type of parameter with a specified value
     * @param {String} type Type of the new parameter
     * @param {*} value Value of the new parameter
     * @returns {Parameter} Returns a parameter object
     * @memberof Parameter
     */
    static makeParam(type, value) {
        if (Object.prototype.hasOwnProperty.call(Registry.registeredParams, type)) {
            return new Parameter(type, value);
        } else {
            throw new Error("Type " + type + " has not been registered.");
        }
    }
    /**
     * Creates a parameter from a JSON format
     * @param {JSON} json JSON format file with the parameters loaded
     * @returns {Parameter} Returns a new parameter
     * @memberof Parameter
     */
    static fromJSON(json) {
        return Parameter.makeParam(json.type, json.value);
    }
    /**
     * Generates a new parameter with a specific component
     * @param {String} key Identifier of the parameter
     * @param {*} value Value of the parameter
     * @returns {Parameter} Returns a new parameter 
     * @memberof Parameter
     */
    static generateComponentParameter(key, value) {
        let ret;

        if (key === "position") {
            ret = new Parameter("Point", value);
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value === "string" || value instanceof String) {
            ret = new Parameter("String", value);
        }

        return ret;
    }
    /**
     * Parameter for the connection object?
     * @param {String} key Identifier of the parameter
     * @param {*} value Value of the parameters
     * @returns {Parameter} Returns a parameter object
     * @memberof Parameter
     */
    static generateConnectionParameter(key, value) {
        let ret;

        if (key === "paths") {
            ret = [];
            let point;
            for (let i in value) {
                point = value[i];
                ret.push(new Parameter("Point", point));
            }
        } else if (key === "segments") {
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value === "string" || value instanceof String) {
            ret = new Parameter("String", value);
        }

        return ret;
    }
}
