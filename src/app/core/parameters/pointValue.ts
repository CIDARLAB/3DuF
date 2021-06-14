import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";

export default class PointValue extends Parameter {
    typeString: string = "Point";
    description: string = "PointValue must be an array containing exactly two numbers, such as [3,-5]";

    constructor(value: Array<number>) {
        super("Point",value);
        Parameter.registerParamType(this.typeString, true, this.description);
    }

    isValid(value: any) {
        if (value instanceof Array && value.length == 2 && NumberUtils.isFloatOrInt(value[0]) && NumberUtils.isFloatOrInt(value[1])) return true;
        else return false;
    }
}