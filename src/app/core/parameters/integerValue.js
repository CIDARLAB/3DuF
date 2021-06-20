import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";

const typeString = "Integer";

const description = "FloatValue must be an integer >= 0.";

function isValid(value) {
    if (typeof value === "number" && NumberUtils.isInteger(value) && value >= 0) return true;
    else return false;
}

Parameter.registerParamType(typeString, isValid, description);
