import * as Registry from "./registry";
import * as NumberUtils from "../utils/numberUtils";

export default class Parameter {
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

    toJSON() {
        return this.__value;
    }

    getValue() {
        return this.__value;
    }

    getType() {
        return this.__type;
    }

    static checkValue(type, value) {
        let paramType = Registry.registeredParams[type];
        if (paramType.isValid(value)) return true;
        else throw new Error("Saw value: " + value + ". " + paramType.description);
    }

    updateValue(value) {
        Parameter.checkValue(this.__type, value);
        this.__value = value;
    }
    resetValue() {}

    //Takes a typestring to recognize that param type, and
    // an isValid function which returns true if a value is OK for
    // that type.
    static registerParamType(typeString, isValid, description) {
        Registry.registeredParams[typeString] = {
            isValid: isValid,
            description: description
        };
    }

    static makeParam(type, value) {
        if (Registry.registeredParams.hasOwnProperty(type)) {
            return new Parameter(type, value);
        } else {
            throw new Error("Type " + type + " has not been registered.");
        }
    }

    static fromJSON(json) {
        return Parameter.makeParam(json.type, json.value);
    }

    static generateComponentParameter(key, value) {
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

    static generateConnectionParameter(key, value) {
        let ret;

        if (key == "paths") {
            ret = [];
            let point;
            for (let i in value) {
                point = value[i];
                ret.push(new Parameter("Point", point));
            }
        } else if (key == "segments") {
        } else if (NumberUtils.isFloatOrInt(value)) {
            ret = new Parameter("Float", value);
        } else if (typeof value == "string" || value instanceof String) {
            ret = new Parameter("String", value);
        }

        return ret;
    }
}
