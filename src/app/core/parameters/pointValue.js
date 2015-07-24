var appRoot = "../../";
var Parameter = require(appRoot + "/core/parameter");
var Registry = require(appRoot + "/core/registry");

class PointValue extends Parameter {
    constructor(value, reference) {
        super(PointValue.typeString(), value);
        if (PointValue.isInvalid(value)) throw new Error("PointValue must be a coordinate represented by a two-member array of finite numbers, ex. [1,3]");
    }

    static isInvalid(value) {
        if (value.length != 2 || !Number.isFinite(value[0]) || !Number.isFinite(value[1])) return true;
        else return false;
    }

    static typeString() {
        return "Point";
    }
}

Parameter.registerParamType(PointValue.typeString(), PointValue);
module.exports = PointValue;
