import Parameter from '../parameter';
var NumberUtils = require("../../utils/numberUtils");

let typeString = "Float";

let description='FloatValue must be a number >= 0, such as 3.827';

function isValid(value){
    if (typeof value === "number" && NumberUtils.isFloatOrInt(value) && value >= 0) return true;
    else return false;
}

Parameter.registerParamType(typeString, isValid, description);