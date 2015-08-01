var Parameter = require("../parameter");
var NumberUtils = require("../../utils/numberUtils");

class FloatValue extends Parameter {
    constructor(value) {
        super(FloatValue.typeString(), value);
        if (FloatValue.isInvalid(value)) throw new Error("FloatValue must be a finite number >= 0. Saw: " + value);
    }

    static isInvalid(value) {
        //if (!Number.isFinite(value) || value < 0) return true;
        if (value < 0 || !NumberUtils.isFloat(value) && !NumberUtils.isInteger(value)) return true;
        else return false;
    }

    static typeString() {
        return "Float";
    }
}

Parameter.registerParamType(FloatValue.typeString(), FloatValue);
module.exports = FloatValue;