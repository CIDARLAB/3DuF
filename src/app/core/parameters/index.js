import Parameter from '../parameter';

require("./floatValue");
require("./booleanValue");
require("./integerValue");
require("./pointValue");
require("./stringValue");
require("./pointArray");
require('./segmentArray');

module.exports.BooleanValue = function(value) {
	return Parameter.makeParam("Boolean", value);
};
module.exports.FloatValue = function(value) {
	return Parameter.makeParam("Float", value);
};
module.exports.IntegerValue = function(value) {
	return Parameter.makeParam("Integer", value);
};
module.exports.PointValue = function(value) {
	return Parameter.makeParam("Point", value);
};
module.exports.StringValue = function(value) {
	return Parameter.makeParam("String", value);
};
module.exports.PointArray = function(value) {
	return Parameter.makeParam("PointArray", value);
};
module.exports.SegmentArray = function (value) {
	return Parameter.makeParam("SegmentArray", value);
};