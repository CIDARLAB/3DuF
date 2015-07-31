var Registry = require("./registry");

class Parameter {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    toJSON() {
        return this.value;
    }

    updateValue(value){
        if (Registry.registeredParams[this.type].isInvalid(value)) throw new Error("Input value " + value + "does not match the type: " + this.type);
        else this.value = value;
    }

    static registerParamType(type, func) {
        Registry.registeredParams[type] = func;
    }

    static makeParam(type, value) {
        if (Registry.registeredParams.hasOwnProperty(type)) {
            return new Registry.registeredParams[type](value);
        } else {
            throw new Error("Type " + type + " has not been registered.");
        }
    }

    static fromJSON(json) {
        return Parameter.makeParam(json.type, json.value);
    }
}

module.exports = Parameter;