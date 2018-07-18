// const Registry = require("./registry");
import * as Registry from './registry';

export default class Parameter {
    constructor(type, value) {
        Parameter.checkValue(type, value);
        this.__type = type;
        this.__value = value;
    }

    toJSON() {
        return this.__value;
    }

    getValue(){
        return this.__value;
    }

    getType(){
        return this.__type;
    }

    static checkValue(type, value){
        let paramType = Registry.registeredParams[type];
        if (paramType.isValid(value)) return true;
        else throw new Error("Saw value: " + value +". " + paramType.description);
    }

    updateValue(value){
        Parameter.checkValue(this.__type, value);
        this.__value = value;
    }
    resetValue(){

    }

    //Takes a typestring to recognize that param type, and
    // an isValid function which returns true if a value is OK for
    // that type.
    static registerParamType(typeString, isValid, description) {
        Registry.registeredParams[typeString] = {
            isValid: isValid,
            description: description
        }
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
}

