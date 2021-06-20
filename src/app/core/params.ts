/// <reference types="node" />
import Parameter from "./parameter";
/**
 * Params class
 */
export default class Params {
    private unique: Array<string>;
    private heritable: Array<string>;
    private parameters: {[index: string]: Parameter};
    

    /**
     * Default constructor create a Params object.
     * @param {} values Values of the params
     * @param {Boolean} unique Boolean if it's unique
     * @param {} heritable Boolean if it's heritable
     * @param {} rawparameters ?
     */
<<<<<<< HEAD
    constructor(values: any, unique: Array<string>, heritable: Array<string>) { 
=======
    constructor(values: any, unique: boolean, heritable: boolean) { 
>>>>>>> Functions removed, properties modified
        this.unique = unique;
        this.heritable = heritable;
        this.parameters = {};
        for (let key in values) {
            this.parameters[key] = new Parameter(values[key],key);
        }
    }
    /**
     * Updates parameter value.
     * @param {String} key Identifier of the parameter
     * @param {*} value New value of the parameter
     * @memberof Params
     * @returns {void}
     */
    updateParameter(key: string, value: any): void {
        if (this.parameters.hasOwnProperty(key)) {
            this.parameters[key].updateValue(value);
        } else {
            throw new Error(key + "parameter does not exist in Params object");
        }
    }
    /**
     * Checks if the object has certain parameter.
     * @param {String} key The key is use to identify the parameter 
     * @memberof Params
     * @returns {void}
     */
    __ensureHasKey(key: string): void {
        if (!this.parameters.hasOwnProperty(key)) throw new Error(key + " parameter not found in Params object.");
    }
    /**
     * Gets the value of the selected parameter.
     * @param {String} key The key is needed to identify the parameter
     * @returns Returns parameter value
     * @memberof Params
     */
    getValue(key: string): any {
        this.__ensureHasKey(key);
<<<<<<< HEAD
        return this.parameters[key].value;
=======
        return this.parameters[key].getValue();
>>>>>>> Functions removed, properties modified
    }

    /**
     * Checks if param object has unique key.
     * @param {String} key Key to identify the param
     * @returns {boolean} 
     * @memberof Params
     */
    isUnique(key: string): boolean {
        return this.unique.includes(key);
    }
    /**
     * Checks if param object has heritable attribute.
     * @param {String} key Key to identify the param
     * @returns {boolean}
     * @memberof Params
     */
<<<<<<< HEAD
    isHeritable(key: string): boolean {
        return this.heritable.includes(key);
=======
    isHeritable(key: string) {
        //return this.heritable.hasOwnProperty(key);
        throw new Error("isHeritable inoperable");
        return false;
    }

    /**
     * Returns the expected type for a specific param.
     * @param {String} key Identifier of the param
     * @param {*} expected 
     * @param {*} actual 
     * @memberof Params
     * @returns {void}
     */
    wrongTypeError(key: string, expected: string, actual: string) {
        return new Error("Parameter " + key + " is the wrong type. " + "Expected: " + expected + ", Actual: " + actual);
    }
    /**
     * Turns the raw key:value pairs passed into a user-written Feature declaration
    into key:Parameter pairs. This forces the checks for each Parameter type
    to execute on the provided values, and should throw an error for mismatches.
     * @param {*} values 
     * @returns {Parameters} Returns a parameters object
     * @memberof Params
     */
    __sanitizeValues(values: any) {
        /*let newParams: any = {};
        for (let key in values) {
            let oldParam = values[key];
            if (this.isUnique(key)) {
                newParams[key] = Parameter.makeParam(this.unique[key], oldParam);
            } else if (this.isHeritable(key)) {
                if (values[key]) {
                    newParams[key] = Parameter.makeParam(this.heritable[key], oldParam);
                }
            } else {
                throw new Error(key + " does not exist in this set of ParamTypes: " + Object.keys(this.unique) + Object.keys(this.heritable));
            }
        }
        this.__checkParams(newParams);
        return newParams;
        */
       throw new Error("Sanitize values inoperable.");
>>>>>>> Functions removed, properties modified
    }

    /**
     * Converts to JSON format.
     * @returns {JSON}  Returns JSON format.
     * @memberof Params
     */
    toJSON(): {[index: string]: any} {
        let json: {[index:string]: any} = {};
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                json[key] = this.parameters[key].value; 
            }
        }
        return json;
    }
    /**
     * Creates new params object from a JSON format.
     * @param {JSON} json 
     * @param {*} unique 
     * @param {*} heritable 
     * @returns {Params} Returns a new params object.
     * @memberof Params
     */
    static fromJSON(json: JSON, unique: any, heritable: any): Params {
        return new Params(json, unique, heritable); 
    }
    /**
     * Checks if it has parameters.
     * @param {String} key The key is use to identify the desire parameter.
     * @returns {boolean}
     * @memberof Params
     */
    hasParam(key: string): boolean {
        return this.parameters.hasOwnProperty(key);
    }

    /**
     * Returns a ES6 Map() type object with keys and values.
     * @return {Map<key, value>}
     * @memberof Params
     */
    toMap(): Map<string,any> {
        let ret = new Map();
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                ret.set(key, this.parameters[key].value);
            }
        }
        return ret;
    }
}