import Parameter from "../parameter";
import Registry from "../registry";
import pointValue from "./pointValue";

export default class PointArray extends Parameter {
    static readonly typeString: string = "PointArray";
    static readonly description: string = "Should be an array of points";

    constructor(value: Array<Array<number>>) {
        super("PointArray",value);
    }

    static isValid(value: any) {
        if (value instanceof Array) {
            if (value.length == 0) {
                return true;
            }
            for (var i in value) {
                if (!pointValue.isValid(i)) {
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
