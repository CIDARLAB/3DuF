var Parameter = require("../parameter");

class StringValue extends Parameter {
    constructor(value) {
        super(StringValue.typeString(), value);
        if (StringValue.isInvalid(value)) throw new Error("StringValue must be a string, got: " + value);
    }

    static isInvalid(value) {
        if (typeof value != "string") return true;
        else return false;
    }

    static typeString() {
        return "String";
    }
}

Parameter.registerParamType(StringValue.typeString(), StringValue);
module.exports = StringValue;
