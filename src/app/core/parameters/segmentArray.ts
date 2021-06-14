import Parameter from "../parameter";
import Registry from "../registry";

export default class SegmentArray extends Parameter {
    typeString: string = "SegmentArray";
    description: string = "Should be an array of PointArrays";

    constructor(value: Array<Array<Array<number>>>) {
        super("SegmentArray",value);
        Parameter.registerParamType(this.typeString, true, this.description);
    }

    isValid(value: any) {
        if (value instanceof Array) {
            if (value.length == 0) {
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
}
