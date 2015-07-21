var feature = require('./device');
var values = require('./values');
var registry = require('./Registry');
var PointValue = values.PointValue;
var FloatValue = values.FloatValue;

class Port extends feature.Feature{
	constructor(params, name = "New Port"){
		let sanitized = Port.getParamTypes().sanitizeParams(params);
		super(Port.typeString(), sanitized, name);
	}

	static typeString(){
		return "Port";
	}

	static getParamTypes(){
		let unique = {"position": PointValue.typeString()};
		let heritable = {
		 	"radius": FloatValue.typeString(),
		  	"height": FloatValue.typeString()
	  	};
		return new values.ParamTypes(unique, heritable);
	}

	static getDefaultParams(){
		return {"radius1": .6, "radius2": .6, "height": .8};
	}
}

registry.registeredFeatures[Port.typeString()] = Port;

exports.Port = Port;