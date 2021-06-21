import Registry from './registry';
import * as NumberUtils from "../utils/numberUtils";

import StringValue from './parameters/stringValue';


/**
 * Parameter class
 */
export default class Parameter {
    private __type: string;
    private __value: any;

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
        //Parameter.checkValue(type, value);
        this.__type = type;
        this.__value = value;
    }
    /**
     * @returns {}
     * @memberof Parameter
     */
    toJSON(): any {
        return this.__value;
    }
    /**
     * Gets value of parameter
     * @returns {} Returns value of the parameter
     * @memberof Parameter
     */
    public get value(): any {
        return this.__value;
    }
    /**
     * Gets type of parameter
     * @returns {String} Returns the type of parameter
     * @memberof Parameter
     */
    public get type(): string {
        return this.__type;
    }

    
    /**
     * Updates the value of parameter
     * @param {*} value New value of the parameter
     * @memberof Parameter
     * @returns {void}
     */
    updateValue(value: any): void {
        //Parameter.checkValue(this.__type, value);
        this.__value = value;
    }
    
    resetValue(): void {}

    /**
     * Creates a parameter from a JSON format
     * @param {JSON} json JSON format file with the parameters loaded
     * @returns {Parameter} Returns a new parameter
     * @memberof Parameter
     */
    static fromJSON(json: any): Parameter {
        return new Parameter(json.type, json.value);
    }
    /**
     * Generates a new parameter with a specific component
     * @param {String} key Identifier of the parameter
     * @param {*} value Value of the parameter
     * @returns {Parameter} Returns a new parameter 
     * @memberof Parameter
     */
    static generateComponentParameter(key: string, value: any): Parameter | Parameter[] {
        let ret;

        if (key == "position") {
            ret = new Parameter("Point", value);
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value == "string" || value instanceof String) {
            ret = new Parameter("String", value);
        } else {
            throw new Error("Non-component passed to generateComponentParameter");
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
    static generateConnectionParameter(key: string, value: any): Parameter | Parameter[] {
        let ret;

        if (key == "paths") {
            ret = [];
            let point;
            for (let i in value) {
                point = value[i];
                ret.push(new Parameter("Point", point));
            }
        } else if (key == "segments") {
            ret = new Parameter("SegmentArray", value)
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value == "string" || value instanceof String) {
            //ret = new Parameter("String", value);
            ret = new StringValue(value);
        } else {
            throw new Error("Non-connection passed to generateConnectionParameter");
        }

        return ret;
    }
}
