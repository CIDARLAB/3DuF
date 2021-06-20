import Parameter from "./parameter";
/**
 * Params class
 */
export default class Params {
    private unique: boolean;
    private heritable: boolean;
    parameters: any;
    

    /**
     * Default constructor create a Params object.
     * @param {} values Values of the params
     * @param {Boolean} unique Boolean if it's unique
     * @param {} heritable Boolean if it's heritable
     * @param {} rawparameters ?
     */
    constructor(values: any, unique: boolean, heritable: boolean) { 
        this.unique = unique;
        this.heritable = heritable;
    }
    /**
     * Updates parameter value.
     * @param {String} key Identifier of the parameter
     * @param {*} value New value of the parameter
     * @memberof Params
     * @returns {void}
     */
    updateParameter(key: string, value: any) {
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
    __ensureHasKey(key: string) {
        if (!this.parameters.hasOwnProperty(key)) throw new Error(key + " parameter not found in Params object.");
    }
    /**
     * Gets the value of the selected parameter.
     * @param {String} key The key is needed to identify the parameter
     * @returns Returns parameter value
     * @memberof Params
     */
    getValue(key: string) {
        this.__ensureHasKey(key);
        return this.parameters[key].getValue();
    }

    /**
     * Checks if param object has unique key.
     * @param {String} key Key to identify the param
     * @returns {boolean} 
     * @memberof Params
     */
    isUnique(key: string) {
        //return this.unique.hasOwnProperty(key);
        throw new Error("isUnique inoperable");
        return true;
    }
    /**
     * Checks if param object has heritable attribute.
     * @param {String} key Key to identify the param
     * @returns {boolean}
     * @memberof Params
     */
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
    }

    /* Checks to make sure the set of sanitized parameters matches the expected ParamTypes.
    This method also checks to make sure that all unique (required) params are present.*/
    /**
     * Checks to make sure the set of sanitized parameters matches the expected ParamTypes.
    This method also checks to make sure that all unique (required) params are present.
     * @param {Params} parameters 
     * @memberof Params
     * @returns {void}
     */
    __checkParams(parameters: {[index: string]: Parameter}) {
        for (let key in parameters) {
            let param = parameters[key];
            if (!(param instanceof Parameter)) {
                throw new Error(key + " is not a ParameterValue.");
            } else if (this.isUnique(key)) {
                /*if (param.__type != this.unique[key]) {
                    this.wrongTypeError(key, this.unique[key], param.__type);
                }*/
                throw new Error("Unique check inoperable");
            } else if (this.isHeritable(key)) {
                /*if (param.__type != this.heritable[key]) {
                    this.wrongTypeError(key, this.heritable[key], param.__type);
                }*/
                throw new Error("Heritable check inoperable");
            } else {
                throw new Error(key + " does not exist in this set of ParamTypes.");
            }
        }
        if (!this.hasAllUniques(parameters)) {
            throw new Error("Unique values were not present in the provided parameters. Expected: " + Object.keys(this.unique) + ", saw: " + Object.keys(parameters));
        }
    }
    /**
     * Converts to JSON format.
     * @returns {JSON}  Returns JSON format.
     * @memberof Params
     */
    toJSON() {
        let json: {[index:string]: any} = {};
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                json[key] = this.parameters[key].getValue(); 
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
    static fromJSON(json: any, unique: boolean, heritable: boolean) {
        return new Params(json, unique, heritable); 
    }
    /**
     * Checks if it has parameters.
     * @param {String} key The key is use to identify the desire parameter.
     * @returns {boolean}
     * @memberof Params
     */
    hasParam(key: string) {
        return this.parameters.hasOwnProperty(key);
    }

    /**
     * Returns a ES6 Map() type object with keys and values.
     * @return {Map<key, value>}
     * @memberof Params
     */
    toMap() {
        let ret = new Map();
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                ret.set(key, this.parameters[key].getValue());
            }
        }
        return ret;
    }
}