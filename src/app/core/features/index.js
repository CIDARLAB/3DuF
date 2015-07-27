var appRoot = "../../";
var capitalizeFirstLetter = require(appRoot + "/utils/stringUtils").capitalizeFirstLetter;
var requireDirectory = require('require-directory');
module.exports = requireDirectory(module, {rename: capitalizeFirstLetter});