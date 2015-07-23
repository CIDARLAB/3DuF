var values = require('./values.js');
var Params = values.Params;
var Feature = require('./feature')

/* The Device stores information about the physical properties of a given design. */
class Device {
	constructor(width, height, name = "New Device"){
		this.defaults = {};
		this.layers = [];
		this.groups = [];
		this.params = {};
		this.name = new values.StringValue(name);
		this.params.width = new values.FloatValue(width);
		this.params.height = new values.FloatValue(height);
	}

	/* Sort the layers such that they are ordered from lowest to highest z_offset. */
	sortLayers(){
		this.layers.sort(function(a, b){
			return a.params.z_offset.value - b.params.z_offset.value;
		});
	}

	/* Add a layer, and re-sort the layers array.*/
	addLayer(layer){
		this.layers.push(layer);
		this.sortLayers();
	}

	addGroup(group){
		this.groups.push(group);
		//TODO: Check to make sure that's OK!
	}

	addDefault(def){
		this.defaults.push(def);
		//TODO: Establish what defaults are. Params?
	}

	__groupsToJSON(){
		let output = [];
		for (let i in this.groups){
			output.push(this.groups[i].toJSON());
		}
		return output;
	}

	__layersToJSON(){
		let output = [];
		for (let i in this.layers){
			output.push(this.layers[i].toJSON());
		}
		return output;
	}

	__loadLayersFromJSON(json){
		for (let i in json){
			this.addLayer(Layer.fromJSON(json[i]));
		}
	}

	//TODO: Figure this out!
	__loadGroupsFromJSON(json){
		/*
		for (let i in json){
			this.addGroup(Group.fromJSON(json[i]));
		}
		*/
	}

	//TODO: Figure this out!
	__loadDefaultsFromJSON(json){
		/*
		for(let i in json){
			this.addDefault(json[i]);
		}
		*/
	}

	//TODO: Replace Params and remove static method
	toJSON(){
		let output = {};
		output.name = this.name.toJSON();
		output.params = Params.toJSON(this.params);
		output.layers = this.__layersToJSON();
		output.groups = this.__groupsToJSON();
		output.defaults = this.defaults;
		return output;
	}

	static fromJSON(json){
		let params = Params.fromJSON(json.params);
		let name = values.JSONToParam(json.name).value;
		let defaults = json.defaults;
		let newDevice = new Device(params.width.value, params.height.value, name);
		newDevice.__loadLayersFromJSON(json.layers);
		newDevice.__loadGroupsFromJSON(json.groups);
		newDevice.__loadDefaultsFromJSON(json.defaults);
		return newDevice;
	}
}

class Layer {
	constructor(z_offset, flip, name = "New Layer"){
		this.params = {};
		if (z_offset == undefined || flip == undefined || name == undefined){
			throw new Error("Cannot create feature with undefined values. z_offset: "+  z_offset + "flip: "+ flip + "name: " + name);
		}
		if (z_offset <0 ){
			throw new Error("Layer z_offset must be >= 0.");
		}
		this.params.z_offset = new values.FloatValue(z_offset);
		this.params.flip = new values.BooleanValue(flip);
		this.name = new values.StringValue(name);
		this.features = {};
		this.featureCount = 0;
	}

	addFeature(feature){
		this.__ensureIsAFeature(feature);
		this.features[feature.id] = feature;
		this.featureCount += 1;
	}

	__ensureIsAFeature(feature){
		if (!(feature instanceof Feature)) throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
	}

	__ensureFeatureExists(feature){
		if (!this.containsFeature(feature)) throw new Error("Layer does not contain the specified feature!");
	}

	__ensureFeatureIDExists(featureID){
		if (!this.containsFeatureID(featureID)) throw new Error("Layer does not contain a feature with the specified ID!");
	}

	getFeature(featureID){
		this.__ensureFeatureIDExists(featureID)
		return this.features[featureID];
	}

	removeFeature(feature){
		this.__ensureFeatureExists(feature);
		this.features[feature.id] = undefined;
		this.featureCount -= 1;
	}

	containsFeature(feature){
		this.__ensureIsAFeature(feature);
		return (this.features.hasOwnProperty(feature.id));
	}

	containsFeatureID(featureID){
		return this.features.hasOwnProperty(featureID);
	}

	__featuresToJSON(){
		let output = {};
		for (let i in this.features){
			output[i] = this.features[i].toJSON();
		}
	}

	__loadFeaturesFromJSON(json){
		for (let i in json){
			this.addFeature(Feature.fromJSON(json[i]));
		}
	}

	//TODO: Replace Params and remove static method
	toJSON(){
		let output = {};
		output.name = this.name.toJSON();
		output.params = Params.toJSON(this.params);
		output.features = this.__featuresToJSON();
		return output;
	}

	static fromJSON(json){
		if (!json.hasOwnProperty("features")){
			throw new Error("JSON layer has no features!");
		}
		let jsonParams = Params.fromJSON(json.params);
		let newLayer = new Layer(jsonParams.z_offset.value, jsonParams.flip.value, json.name.value);
		newLayer.__loadFeaturesFromJSON(json.features);
		return newLayer;
	}
}

class Group {
	constructor(name = "New Group"){
		this.params = {};
		this.parent = null;
		this.name = new values.StringValue(name);
	}

	//TODO: Write code for handling groups and decide on a data model!
	//TODO: Replace Params with non-static method.
	toJSON(){
		let output = {};
		output.params = Params.toJSON(this.params);
		output.name = this.name;
		//output.parent should be an index, but that won't work for this internal method!
		return output;
	}

	//TODO: fromJSON()
}

exports.Device = Device;
exports.Layer = Layer;
exports.Group = Group;
exports.Feature = Feature;

