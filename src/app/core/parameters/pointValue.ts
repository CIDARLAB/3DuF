import Parameter from "../parameter";
import * as NumberUtils from "../../utils/numberUtils";
import {Point} from "@/app/core/init"

export default class PointValue extends Parameter {
    static readonly typeString: string = "Point";
    static readonly description: string = "PointValue must be an array containing exactly two numbers, such as [3,-5]";

    constructor(value: Point) {
        super("Point",value);
    }

    static isValid(value: any) {
        if (value instanceof Array && value.length == 2 && NumberUtils.isFloatOrInt(value[0]) && NumberUtils.isFloatOrInt(value[1])) return true;
        else return false;
    }
}