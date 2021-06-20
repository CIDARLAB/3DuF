import Parameter from "../parameter";

const typeString = "String";
const description = "StringValue must be a String, such as 'foobar'";

function isValid(value) {
    if (typeof value === "string") return true;
    else return false;
}

Parameter.registerParamType(typeString, isValid, description);
