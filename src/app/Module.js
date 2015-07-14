'use strict';

var uFab = require('./uFab');

class Module{
	constructor(featureDefaults){
		this.featureDefaults = featureDefaults;
		this.features = [];
	}

	makeFeature(type, params){
	params = {};
	
	for (param in this.featureDefaults[type])
		{
			// TODO: general method for modules to make prims of known params
		}
	}

}

exports.Module = Module;