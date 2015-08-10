var Feature = require("../feature");

require("./channel");
require("./hollowChannel");
require("./circleValve");
require("./chamber");
require("./port");
require("./via");

module.exports.Channel = function(values, name = "New Channel") {
	return Feature.makeFeature("Channel", values, name);
}
module.exports.HollowChannel = function(values, name="New HollowChannel") {
	return Feature.makeFeature("HollowChannel", values, name);
}
module.exports.Chamber = function(values, name="New Chamber") {
	return Feature.makeFeature("Chamber", values, name);
}
module.exports.Port = function(values, name="New Port") {
	return Feature.makeFeature("Port", values, name);
}
module.exports.Via = function(values, name="New Via") {
	return Feature.makeFeature("Via", values, name);
}
module.exports.CircleValve = function(values, name="New CircleValve") {
	return Feature.makeFeature("CircleValve", values, name);
}