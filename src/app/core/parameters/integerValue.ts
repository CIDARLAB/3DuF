import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";

export default class IntegerValue extends Parameter {
    static readonly typeString: string = "Integer";
    static readonly description: string = "FloatValue must be an integer >= 0.";

    constructor(value: number) {
        super("Integer",value);
    }

    static isValid(value: any): boolean {
        if (typeof value === "number" && NumberUtils.isInteger(value) && value >= 0) return true;
        else return false;
    }
}