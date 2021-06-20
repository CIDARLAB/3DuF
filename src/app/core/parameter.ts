import Registry from './registry';
import * as NumberUtils from "../utils/numberUtils";

/**
 * Parameter class
 */
export default class Parameter {
    private type: string;
    private value: any;

    /**
     * Default Constructor of the Parameter object
     * @param {String} type 
     * @param {*} value 
     */
    constructor(type:string, value: any) {
        //Check value if its parsable string
        if (typeof value === "string" && type === "Float") {
            value = parseInt(value);
        } else if (typeof value === "string" && type === "Integer") {
            value = parseInt(value);
        }
        Parameter.checkValue(type, value);
        this.type = type;
        this.value = value;
    }
    /**
     * @returns {}
     * @memberof Parameter
     */
    toJSON() {
        return this.value;
    }
    /**
     * Gets value of parameter
     * @returns {} Returns value of the parameter
     * @memberof Parameter
     */
    public get getValue() {
        return this.value;
    }
    /**
     * Gets type of parameter
     * @returns {String} Returns the type of parameter
     * @memberof Parameter
     */
    public get getType() {
        return this.type;
    }
    /**
     * Checks if value of the parameter is valid or not
     * @param {String} type Type of the parameter
     * @param {*} value Value of the parameter
     * @memberof Parameter
     * @returns {void}
     */
    static checkValue(type: string, value: any) {
        /*let paramType = Registry.registeredParams[type];
        if (paramType.isValid(value)){
            return true;
        }*/
        throw new Error("checkValue is inoperable due to registeredParams deletion");
    }
    
    /**
     * Updates the value of parameter
     * @param {*} value New value of the parameter
     * @memberof Parameter
     * @returns {void}
     */
    updateValue(value: any) {
        Parameter.checkValue(this.type, value);
        this.value = value;
    }
    
    resetValue() {}

    /**
     * Creates a parameter from a JSON format
     * @param {JSON} json JSON format file with the parameters loaded
     * @returns {Parameter} Returns a new parameter
     * @memberof Parameter
     */
    static fromJSON(json: any) {
        return new Parameter(json.type, json.value);
    }
    /**
     * Generates a new parameter with a specific component
     * @param {String} key Identifier of the parameter
     * @param {*} value Value of the parameter
     * @returns {Parameter} Returns a new parameter 
     * @memberof Parameter
     */
    static generateComponentParameter(key: string, value: any) {
        let ret;

        if (key == "position") {
            ret = new Parameter("Point", value);
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value == "string" || value instanceof String) {
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
    static generateConnectionParameter(key: string, value: any) {
        let ret;

        if (key == "paths") {
            ret = [];
            let point;
            for (let i in value) {
                point = value[i];
                ret.push(new Parameter("Point", point));
            }
        } else if (key == "segments") {
            //Something goes here
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value == "string" || value instanceof String) {
            ret = new Parameter("String", value);
        }

        return ret;
    }
}
