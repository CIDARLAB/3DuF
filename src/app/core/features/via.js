var Feature = require('../feature');
var values = require('../values');
var registry = require('../Registry');
var PointValue = values.PointValue;
var FloatValue = values.FloatValue;
var StringValue = values.StringValue;

class Via extends Feature{
	constructor(params, name = "New Via"){
		let sanitized = Via.getParamTypes().sanitizeParams(params);
		super(Via.typeString(), sanitized, new StringValue(name));
	}

	static typeString(){
		return "Via";
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
		return {"radius1": .6, "radius2": .4, "height": .8};
	}
}

registry.registeredFeatures[Via.typeString()] = Via;

module.exports = Via;