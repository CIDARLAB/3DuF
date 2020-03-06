import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";

let typeString = "Point";
let description = "PointValue must be an array containing exactly two numbers, such as [3,-5]";

function isValid(value) {
    if (value instanceof Array && value.length == 2 && NumberUtils.isFloatOrInt(value[0]) && NumberUtils.isFloatOrInt(value[1])) return true;
    else return false;
}

Parameter.registerParamType(typeString, isValid, description);
