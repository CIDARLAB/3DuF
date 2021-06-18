import Parameter from "../parameter";
import Registry from "../registry";
import pointValue from "./pointValue";

export default class PointArray extends Parameter {
    typeString: string = "PointArray";
    description: string = "Should be an array of points";

    constructor(value: Array<Array<number>>) {
        super("PointArray",value);
    }

    isValid(value: any) {
        if (value instanceof Array) {
            if (value.length == 0) {
                return true;
            }
            let pointTest = new pointValue([0,0]);
            for (var i in value) {
                if (!pointTest.isValid(i)) {
                    console.log("Does not contain a valid point");
                    return false;
                }
            }
            throw new Error("isValid is partially inoperable due to registeredParams deletion");
        } else {
            return false;
        }
        return true;
    }
}
