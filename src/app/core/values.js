var Registry = require('./registry');
var Parameter = require('./parameter');

function registerType(type, func) {
    Registry.registeredParams[type] = func;
}

function makeParam(type, value) {
    if (Registry.registeredParams.hasOwnProperty(type)) {
        return new Registry.registeredParams[type](value);
    } else {
        throw new Error("Type " + type + " has not been registered.");
    }
}

function JSONToParam(json) {
    return makeParam(json.type, json.value);
}

//TODO: Replace all generic params object with Params, and make output non-static
class Params {
    static toJSON(params) {
        let output = {};
        for (let i in params) {
            output[i] = params[i].toJSON();
        }
        return output;
    }

    static fromJSON(json) {
        let output = {};
        for (let i in json) {
            output[i] = JSONToParam(json[i]);
        }
        return output;
    }
}

class ParamTypes {
    constructor(unique, heritable) {
        this.unique = unique;
        this.heritable = heritable;
    }

    isUnique(key) {
        return (this.unique.hasOwnProperty(key));
    }

    isHeritable(key) {
        return (this.heritable.hasOwnProperty(key));
    }

    uniquesExist(params) {
        for (let key in this.unique)
            if (!params.hasOwnProperty(key)) return false;
        return true;
    }

    wrongType(key, expected, actual) {
        throw new Error("Parameter " + key + " is the wrong type. " +
            "Expected: " + this.unique[key] + ", Actual: " + param.type);
    }

    /* Turns the raw key:value pairs passed into a user-written Feature declaration
    into key:Parameter pairs. This forces the checks for each Parameter type
    to execute on the provided values, and should throw an error for mismatches. */
    sanitizeParams(params) {
        let newParams = {};
        for (let key in params) {
            let oldParam = params[key];
            if (this.isUnique(key)) {
                newParams[key] = makeParam(this.unique[key], oldParam);
            } else if (this.isHeritable) {
                newParams[key] = makeParam(this.heritable[key], oldParam);
            } else {
                throw new Error(key + " does not exist in this set of ParamTypes.");
            }
        }
        this.checkParams(newParams);
        return newParams;
    }

    /* Checks to make sure the set of sanitized parameters matches the expected ParamTypes.
    This method also checks to make sure that all unique (required) params are present.*/
    checkParams(params) {
        for (let key in params) {
            let param = params[key];
            if (!(param instanceof Parameter)) {
                throw new Error(key + " is not a ParameterValue.");
            } else if (this.isUnique(key)) {
                if (param.type != this.unique[key]) {
                    wrongType(key, this.unique[key], param.type);
                }
            } else if (this.isHeritable(key)) {
                if (params[key].type != this.heritable[key]) {
                    wrongType(key, this.heritable[key], param.type);
                }
            } else {
                throw new Error(key + " does not exist in this set of ParamTypes.");
            }
        }
        if (!this.uniquesExist(params)) {
            throw new Error("Unique values were not present in the provided parameters.");
        }
    }
}

exports.ParamTypes = ParamTypes;
exports.makeParam = makeParam;
exports.Params = Params;
exports.JSONToParam = JSONToParam;