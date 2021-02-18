import Parameter from "./parameter";
/**
 * Params class
 */
export default class Params {
    /**
     * Default constructor create a Params object.
     * @param {} values Values of the params
     * @param {Boolean} unique Boolean if it's unique
     * @param {} heritable Boolean if it's heritable
     * @param {} rawparameters ?
     */
    constructor(values, unique, heritable, rawparameters) {
        this.unique = unique;
        this.heritable = heritable;
        if (values != null) {
            this.parameters = this.__sanitizeValues(values);
        } else {
            let value;
            for (let key in rawparameters) {
                value = rawparameters[key];
                this.parameters[key] = Parameter.makeParam(this.unique[key], oldParam);
            }

            this.parameters = rawparameters;
        }
    }
    /**
     * Updates parameter value.
     * @param {String} key Identifier of the parameter
     * @param {*} value New value of the parameter
     * @memberof Params
     * @returns {void}
     */
    updateParameter(key, value) {
        if (this.parameters.hasOwnProperty(key)) {
            this.parameters[key].updateValue(value);
        } else {
            if (this.isHeritable(key)) {
                this.parameters[key] = Parameter.makeParam(this.heritable[key], value);
            } else throw new Error(key + "parameter does not exist in Params object");
        }
    }
    /**
     * Checks if the object has certain parameter.
     * @param {String} key The key is use to identify the parameter
     * @memberof Params
     * @returns {void}
     */
    __ensureHasKey(key) {
        if (!this.parameters.hasOwnProperty(key)) throw new Error(key + " parameter not found in Params object.");
    }
    /**
     * Gets the value of the selected parameter.
     * @param {String} key The key is needed to identify the parameter
     * @returns Returns parameter value
     * @memberof Params
     */
    getValue(key) {
        this.__ensureHasKey(key);
        return this.parameters[key].getValue();
    }
    /**
     * Gets the paramter.
     * @param {String} key The key is needed to search and identify the parameter
     * @returns Returns parameter
     * @memberof Params
     */
    getParameter(key) {
        this.__ensureHasKey(key);
        return this.parameters[key];
    }
    /**
     * Checks if param object has unique key.
     * @param {String} key Key to identify the param
     * @returns {boolean}
     * @memberof Params
     */
    isUnique(key) {
        return this.unique.hasOwnProperty(key);
    }
    /**
     * Checks if param object has heritable attribute.
     * @param {String} key Key to identify the param
     * @returns {boolean}
     * @memberof Params
     */
    isHeritable(key) {
        return this.heritable.hasOwnProperty(key);
    }
    /**
     * Checks if param has unique key.
     * @param {Parameters} params Param to check if it is unique
     * @returns {boolean}
     * @memberof Params
     */
    hasAllUniques(params) {
        for (let key in this.unique) if (!params.hasOwnProperty(key)) return false;
        return true;
    }
    /**
     * Returns the expected type for a specific param.
     * @param {String} key Identifier of the param
     * @param {*} expected
     * @param {*} actual
     * @memberof Params
     * @returns {void}
     */
    wrongTypeError(key, expected, actual) {
        return new Error("Parameter " + key + " is the wrong type. " + "Expected: " + this.unique[key] + ", Actual: " + actual);
    }
    /**
     * Turns the raw key:value pairs passed into a user-written Feature declaration
    into key:Parameter pairs. This forces the checks for each Parameter type
    to execute on the provided values, and should throw an error for mismatches.
     * @param {*} values 
     * @returns {Parameters} Returns a parameters object
     * @memberof Params
     */
    __sanitizeValues(values) {
        let newParams = {};
        for (let key in values) {
            let oldParam = values[key];
            if (this.isUnique(key)) {
                newParams[key] = Parameter.makeParam(this.unique[key], oldParam);
            } else if (this.isHeritable(key)) {
                if (values[key] != undefined || values[key] != null) {
                    newParams[key] = Parameter.makeParam(this.heritable[key], oldParam);
                }
            } else {
                throw new Error(key + " does not exist in this set of ParamTypes: " + Object.keys(this.unique) + Object.keys(this.heritable));
            }
        }
        this.__checkParams(newParams);
        return newParams;
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
    __checkParams(parameters) {
        for (let key in parameters) {
            let param = parameters[key];
            if (!(param instanceof Parameter)) {
                throw new Error(key + " is not a ParameterValue.");
            } else if (this.isUnique(key)) {
                if (param.type != this.unique[key]) {
                    this.wrongTypeError(key, this.unique[key], param.type);
                }
            } else if (this.isHeritable(key)) {
                if (param.type != this.heritable[key]) {
                    this.wrongTypeError(key, this.heritable[key], param.type);
                }
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
        let json = {};
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
    static fromJSON(json, unique, heritable) {
        return new Params(json, unique, heritable);
    }
    /**
     * Checks if it has parameters.
     * @param {String} key The key is use to identify the desire parameter.
     * @returns {boolean}
     * @memberof Params
     */
    hasParam(key) {
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
