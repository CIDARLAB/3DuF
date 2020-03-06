import Parameter from "./parameter";

export default class Params {
    /**
     * Default constructor create a Params object
     * @param values
     * @param unique
     * @param heritable
     * @param rawparameters
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

    updateParameter(key, value) {
        if (this.parameters.hasOwnProperty(key)) {
            this.parameters[key].updateValue(value);
        } else {
            if (this.isHeritable(key)) {
                this.parameters[key] = Parameter.makeParam(this.heritable[key], value);
            } else throw new Error(key + "parameter does not exist in Params object");
        }
    }

    __ensureHasKey(key) {
        if (!this.parameters.hasOwnProperty(key)) throw new Error(key + " parameter not found in Params object.");
    }

    getValue(key) {
        this.__ensureHasKey(key);
        return this.parameters[key].getValue();
    }

    getParameter(key) {
        this.__ensureHasKey(key);
        return this.parameters[key];
    }

    isUnique(key) {
        return this.unique.hasOwnProperty(key);
    }

    isHeritable(key) {
        return this.heritable.hasOwnProperty(key);
    }

    hasAllUniques(params) {
        for (let key in this.unique) if (!params.hasOwnProperty(key)) return false;
        return true;
    }
    wrongTypeError(key, expected, actual) {
        return new Error("Parameter " + key + " is the wrong type. " + "Expected: " + this.unique[key] + ", Actual: " + actual);
    }

    /* Turns the raw key:value pairs passed into a user-written Feature declaration
    into key:Parameter pairs. This forces the checks for each Parameter type
    to execute on the provided values, and should throw an error for mismatches. */
    __sanitizeValues(values) {
        let newParams = {};
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
    }

    /* Checks to make sure the set of sanitized parameters matches the expected ParamTypes.
    This method also checks to make sure that all unique (required) params are present.*/
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

    toJSON() {
        let json = {};
        for (let key in this.parameters) {
            if (this.parameters[key] != undefined) {
                json[key] = this.parameters[key].getValue();
            }
        }
        return json;
    }

    static fromJSON(json, unique, heritable) {
        return new Params(json, unique, heritable);
    }

    hasParam(key) {
        return this.parameters.hasOwnProperty(key);
    }

    /**
     * Returns a ES6 Map() type object with keys and values
     * @return {Map<key, value>}
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
