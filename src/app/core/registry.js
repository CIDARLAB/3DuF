var registeredParams = {};
var featureRenderers = {};
var registeredFeatures = {};
var currentDevice = null;
var canvasManager = null;
var currentLayer = null;
var currentGrid = null;
var view = null;
var viewManager = null;
var id_counter = 0;

var generateID = function(){
	let id = id_counter;
	id_counter ++;
	return id;
}

exports.generateID = generateID;
exports.featureRenderers = featureRenderers;
exports.registeredFeatures = registeredFeatures;
exports.registeredParams = registeredParams;
exports.currentDevice = currentDevice;
exports.currentLayer = currentLayer;
exports.canvasManager = canvasManager;
exports.viewManager = viewManager;
exports.currentGrid = currentGrid;