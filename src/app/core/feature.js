var uuid = require('node-uuid');
var Params = require('./values').Params;
var StringValue = require('./values').StringValue;

class Feature {
	constructor(type, params, name = new StringValue("New Feature"), id = Feature.generateID(), group = null){
		if (id == undefined || name == undefined || type == undefined){
			throw new Error("Cannot create feature with undefined values. id: "+  id + "name: "+ name + "type: " + type);
		}
		this.id = id;
		this.name = name;
		this.connections = {};
		this.type = type;
		this.params = params;
		this.group = group;
	}

	static generateID(){
		return uuid.v1();
	}

	toJSON(){
		let output = {};
		output.id = this.id;
		output.name = this.name.toJSON();
		output.type = this.type;
		output.params = Params.toJSON(this.params);
		//output.group = this.group.toJSON();
		return output;
	}

	static fromJSON(json){
		return new Feature(json.type, Params.fromJSON(json.params), json.name, json.id);
	}
}

module.exports = Feature;