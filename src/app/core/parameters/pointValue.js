var Parameter = require("../parameter");
var NumberUtils = require("../../utils/numberUtils");

class PointValue extends Parameter {
    constructor(value, reference) {
        super(PointValue.typeString(), value);
        if (PointValue.isInvalid(value)) throw new Error("PointValue must be a coordinate represented by a two-member array of finite numbers, ex. [1,3]");
    }

    static isInvalid(value) {
        if (value.length != 2 || !NumberUtils.isFloatOrInt(value[0]) || !NumberUtils.isFloatOrInt(value[1])) return true;
        else return false;
    }

    static typeString() {
        return "Point";
    }
}

Parameter.registerParamType(PointValue.typeString(), PointValue);
module.exports = PointValue;
