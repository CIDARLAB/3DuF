import Parameter from "../parameter";

import * as Registry from "../registry";

let typeString = "SegmentArray";
let description = "Should be an array of PointArrays";

function isValid(value) {
    if (value instanceof Array) {
        if (value.length === 0) {
            return true;
        }
        for (var i in value) {
            let paramType = Registry.registeredParams["PointArray"];
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
