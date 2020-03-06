import Parameter from "../parameter";

let typeString = "String";
let description = "StringValue must be a String, such as 'foobar'";

function isValid(value) {
    if (typeof value === "string") return true;
    else return false;
}

Parameter.registerParamType(typeString, isValid, description);
