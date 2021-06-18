import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";

export default class IntegerValue extends Parameter {
    typeString: string = "Integer";
    description: string = "FloatValue must be an integer >= 0.";

    constructor(value: number) {
        super("Integer",value);
    }

    static isValid(value: any) {
        if (typeof value === "number" && NumberUtils.isInteger(value) && value >= 0) return true;
        else return false;
    }
}