import Parameter from "../parameter";
import Registry from "../registry";

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
            /*for (var i in value) {
                let paramType = Registry.registeredParams["Point"];
                if (!paramType.isValid(value[i])) {
                    console.log("Does not contain a valid point");
                    return false;
                }
            }*/
            throw new Error("isValid is partially inoperable due to registeredParams deletion");
        } else {
            return false;
        }
        return true;
    }
}
