import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";

export default class FloatValue extends Parameter {
    typeString: string = "Float";
    description: string = "FloatValue must be a number >= 0, such as 3.827";

    constructor(value: number) {
        super("Float",value);
    }

    isValid(value: any) {
        if (typeof value === "number" && NumberUtils.isFloatOrInt(value) && value >= 0) return true;
        else return false;
    }
    
}