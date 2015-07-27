var Registry = require('./registry');
var Parameter = require('./parameter');

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
                newParams[key] = Parameter.makeParam(this.unique[key], oldParam);
            } else if (this.isHeritable) {
                newParams[key] = Parameter.makeParam(this.heritable[key], oldParam);
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