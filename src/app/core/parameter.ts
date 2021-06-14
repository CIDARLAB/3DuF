import Registry from './registry';
import * as NumberUtils from "../utils/numberUtils";

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
}
