import Parameter from "@/app/core/parameter"
import Params from "@/app/core/params"

import StringValue from '@/app/core/parameters/stringValue';
import FloatValue from '@/app/core/parameters/floatValue';
import SegmentArray from '@/app/core/parameters/segmentArray';
import PointArray from '@/app/core/parameters/pointArray';
import PointValue from '@/app/core/parameters/pointValue';
import IntegerValue from '@/app/core/parameters/integerValue';
import BooleanValue from '@/app/core/parameters/booleanValue';
import * as NumberUtils from "@/app/utils/numberUtils";

    /**
     * Creates a parameter from a JSON format
     * @param {JSON} json JSON format file with the parameters loaded
     * @returns {Parameter} Returns a new parameter
     * @memberof Parameter
     */
    export function fromJSON(json: {type:string, value:any}): Parameter {
        if (json.type == "String") {
            return new StringValue(json.value);
        } else if (json.type == "Float") {
            return new FloatValue(json.value);
        } else if (json.type == "Integer") {
            return new IntegerValue(json.value);
        } else if (json.type == "Point") {
            return new PointValue(json.value);
        } else if (json.type == "PointArray") {
            return new PointArray(json.value);
        } else if (json.type == "SegmentArray") {
            return new SegmentArray(json.value);
        } else if (json.type == "Boolean") {
            return new BooleanValue(json.value);
        } else {
            throw new Error("json contains invalid type");
        }
    }
/**
 * Generates a new parameter with a specific component
 * @param {String} key Identifier of the parameter
 * @param {*} value Value of the parameter
 * @returns {Parameter} Returns a new parameter 
 * @memberof Parameter
 */
export function generateComponentParameter(key: string, value: any): Parameter | Parameter[] {
    let ret;

    if (key == "position") {
        ret = new PointValue(value);
    } else if (NumberUtils.isFloatOrInt(value)) {
        ret = new FloatValue(value);
    } else if (typeof value == "string" || value instanceof String) {
        ret = new StringValue(value);
    } else {
        throw new Error("Non-component passed to generateComponentParameter");
    }

    return ret;
}
/**
 * Parameter for the connection object?
 * @param {String} key Identifier of the parameter
 * @param {*} value Value of the parameters
 * @returns {Parameter} Returns a parameter object
 * @memberof Parameter
 */
 export function generateConnectionParameter(key: string, value: any): Parameter | Parameter[] {
    let ret;

    if (key == "paths") {
        ret = [];
        let point;
        for (let i in value) {
            point = value[i];
            ret.push(new PointValue(point));
        }
    } else if (key == "segments") {
        ret = new SegmentArray(value);
    } else if (NumberUtils.isFloatOrInt(value)) {
        ret = new FloatValue(value);
    } else if (typeof value == "string" || value instanceof String) {
        ret = new StringValue(value);
    } else {
        throw new Error("Non-connection passed to generateConnectionParameter");
    }

    return ret;
}
