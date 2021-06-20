import Parameter from "../parameter";

import Registry from "../registry";

const typeString = "PointArray";
const description = "Should be an array of points";

function isValid(value) {
    if (value instanceof Array) {
        if (value.length == 0) {
            return true;
        }
        for (const i in value) {
            const paramType = Registry.registeredParams.Point;
            if (!paramType.isValid(value[i])) {
                console.log("Does not contain a valid point");
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
}

Parameter.registerParamType(typeString, isValid, description);
