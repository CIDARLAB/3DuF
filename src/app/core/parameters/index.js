/*

var capitalizeFirstLetter = require("../../utils/stringUtils").capitalizeFirstLetter;
var requireDirectory = require('require-directory');
module.exports = requireDirectory(module, {rename: capitalizeFirstLetter});

*/

module.exports.BooleanValue = require("./booleanValue");
module.exports.FloatValue = require("./floatValue");
module.exports.IntegerValue = require("./integerValue");
module.exports.PointValue = require("./pointValue");
module.exports.StringValue = require("./stringValue");