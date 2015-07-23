var Feature = require('../feature');
var values = require('../values');
var registry = require('../Registry');
var PointValue = values.PointValue;
var FloatValue = values.FloatValue;
var StringValue = values.StringValue;

class Channel extends Feature{
	constructor(params, name = "New Channel"){
		let sanitized = Channel.getParamTypes().sanitizeParams(params);
		super(Channel.typeString(), sanitized, new StringValue(name));
	}

	static typeString(){
		return "Channel";
	}

	static getParamTypes(){
		let unique = {"start": PointValue.typeString(), "end": PointValue.typeString()};
		let heritable = {"width": FloatValue.typeString(), "height": FloatValue.typeString()};
		return new values.ParamTypes(unique, heritable);
	}

	static getDefaultParams(){
		return {"width": .4, "height": .4};
	}
}

registry.registeredFeatures[Channel.typeString()] = Channel;

module.exports = Channel;