var Parameter = require("../parameter");

class BooleanValue extends Parameter {
    constructor(value, reference) {
        super(BooleanValue.typeString(), value);
        if (BooleanValue.isInvalid(value)) throw new Error("BooleanValue must be true or false.");
    }

    static isInvalid(value) {
        if (value === false || value === true) return false;
        else return true;
    }

    static typeString() {
        return "Boolean";
    }
}

Parameter.registerParamType(BooleanValue.typeString(), BooleanValue);
module.exports = BooleanValue;