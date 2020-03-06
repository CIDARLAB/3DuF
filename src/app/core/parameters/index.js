import Parameter from "../parameter";

import "./floatValue";
import "./booleanValue";
import "./integerValue";
import "./pointValue";
import "./stringValue";
import "./pointArray";
import "./segmentArray";

export function BooleanValue(value) {
    return Parameter.makeParam("Boolean", value);
}
export function FloatValue(value) {
    return Parameter.makeParam("Float", value);
}
export function IntegerValue(value) {
    return Parameter.makeParam("Integer", value);
}
export function PointValue(value) {
    return Parameter.makeParam("Point", value);
}
export function StringValue(value) {
    return Parameter.makeParam("String", value);
}
export function PointArray(value) {
    return Parameter.makeParam("PointArray", value);
}
export function SegmentArray(value) {
    return Parameter.makeParam("SegmentArray", value);
}
