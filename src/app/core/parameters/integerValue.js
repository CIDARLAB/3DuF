var appRoot = "../../";
var Parameter = require(appRoot + "/core/parameter");
var Registry = require(appRoot + "/core/registry");

class IntegerValue extends Parameter {
    constructor(value) {
        super(IntegerValue.typeString(), value);
        if (IntegerValue.isInvalid(value)) throw new Error("IntegerValue must be an integer >= 0.");
    }

    static isInvalid(value) {
        if (!Number.isInteger(value) || value < 0) return true;
        else return false;
    }

    static typeString() {
        return "Integer";
    }
}

Parameter.registerParamType(IntegerValue.typeString(), IntegerValue);
module.exports = IntegerValue;
