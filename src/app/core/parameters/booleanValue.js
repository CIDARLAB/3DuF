import Parameter from "../parameter";

let typeString = "Boolean";

let description = "BooleanValue must be true or false.";

function isValid(value) {
    if (typeof value === "boolean") return true;
    else return false;
}

Parameter.registerParamType(typeString, isValid, description);
