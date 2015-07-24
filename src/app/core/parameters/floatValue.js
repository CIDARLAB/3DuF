var appRoot = "../../";
var Parameter = require(appRoot + "/core/parameter");
var Registry = require(appRoot + "/core/registry");

class FloatValue extends Parameter {
    constructor(value) {
        super(FloatValue.typeString(), value);
        if (FloatValue.isInvalid(value)) throw new Error("FloatValue must be a finite number >= 0.");
    }

    static isInvalid(value) {
        if (!Number.isFinite(value) || value < 0) return true;
        else return false;
    }

    static typeString() {
        return "Float";
    }
}

Parameter.registerParamType(FloatValue.typeString(), FloatValue);
module.exports = FloatValue;