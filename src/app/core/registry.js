var uuid = require('node-uuid');

var registeredParams = {};
var featureDefaults = {};
var currentDevice = null;
var canvasManager = null;
var currentLayer = null;
var currentTextLayer = null;
var currentGrid = null;
var view = null;
var viewManager = null;
let featureSet = null;

/*
Place where we store the data necessary for the text label
TODO: Change this from this awful hacky implementation
 */
var text = "";

//TODO: Convert this into multiple text layers for use with multiple layers
var textLayer = null;
var id_counter = 0;
var threeRenderer = null;

var generateID = function() {
    return uuid.v1();
};

exports.generateID = generateID;
exports.registeredParams = registeredParams;
exports.currentDevice = currentDevice;
exports.currentLayer = currentLayer;
exports.canvasManager = canvasManager;
exports.viewManager = viewManager;
exports.currentGrid = currentGrid;
exports.featureDefaults = featureDefaults;
exports.threeRenderer = threeRenderer;
exports.text = text;
exports.featureSet = featureSet;