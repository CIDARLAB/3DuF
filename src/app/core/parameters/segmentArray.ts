import Parameter from "../parameter";
import Registry from "../registry";
import pointArray from "./pointArray"

export default class SegmentArray extends Parameter {
    static readonly typeString: string = "SegmentArray";
    static readonly description: string = "Should be an array of PointArrays";

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
        } else {
            return false;
        }
        return true;
    }
}
