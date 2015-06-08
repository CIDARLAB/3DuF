'use strict';

var uFab = require('./uFab');
var getDefaultFeatures = require('./defaultFeatures.js').getDefaultFeatures; // currently a hack, to avoid UI interaction for now
var handlers = require('./handlers')

var makeFeatureClass = function(featureJSON){
	window[featureJSON.name] = function(params, color, ID)
	{
		var newFeat = new uFab.Feature({
			ID: ID,
			color: color,
			classData: {
				type: featureJSON.name,
				paramTypes: featureJSON.paramTypes,
				handler2D: featureJSON.handler2D,
				handler3D: featureJSON.handler3D
			},
			params: params
		});
		// Placeholders, figure out your naming conventions!
		newFeat.handler2D = new handlers[newFeat.classData.handler2D.type](newFeat);
		newFeat.handler3D = new handlers[newFeat.classData.handler3D.type](newFeat);
		return newFeat;
	}
}

var parseFeatureList = function(featureList)
{
	for (var feature in featureList){
		makeFeatureClass(featureList[feature]);
	}
}

var loadDefaultFeatures = function(){
	parseFeatureList(getDefaultFeatures());
}

exports.makeFeatureClass = makeFeatureClass;
exports.parseFeatureList = parseFeatureList;
exports.loadDefaultFeatures = loadDefaultFeatures;