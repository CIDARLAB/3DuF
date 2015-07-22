var feature = require('./device');
var values = require('./values');
var registry = require('./Registry');
var PointValue = values.PointValue;
var FloatValue = values.FloatValue;
var StringValue = values.StringValue;

class CircleValve extends feature.Feature{
	constructor(params, name = "New CircleValve"){
		let sanitized = CircleValve.getParamTypes().sanitizeParams(params);
		super(CircleValve.typeString(), sanitized, new StringValue(name));
	}

	static typeString(){
		return "CircleValve";
	}

	static getParamTypes(){
		let unique = {"position": PointValue.typeString()};
		let heritable = {
			"radius1": FloatValue.typeString(),
		 	"radius2": FloatValue.typeString(),
		  	"height": FloatValue.typeString()
	  	};
		return new values.ParamTypes(unique, heritable);
	}

	static getDefaultParams(){
		return {"radius1": 1.2, "radius2": 1, "height": .4};
	}
}

registry.registeredFeatures[CircleValve.typeString()] = CircleValve;

exports.CircleValve = CircleValve;