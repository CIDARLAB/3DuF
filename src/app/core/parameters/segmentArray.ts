import Parameter from "../parameter";
import Registry from "../registry";
import pointArray from "./pointArray"

export default class SegmentArray extends Parameter {
    typeString: string = "SegmentArray";
    description: string = "Should be an array of PointArrays";

    constructor(value: Array<Array<Array<number>>>) {
        super("SegmentArray",value);
    }

    static isValid(value: any) {
        if (value instanceof Array) {
            if (value.length == 0) {
                return true;
            }
            for (var i in value) {
                if (!pointArray.isValid(i)) {
                    console.log("Does not contain a valid point");
                    return false;
                }
            }
            throw new Error("isValid partially inoperable due to registeredParams deletion");
        } else {
            return false;
        }
        return true;
    }
}
