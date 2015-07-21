var values = require('./values.js');
var uuid = require('node-uuid');

/* The Device stores information about the physical properties of a given design. */
class Device {
	constructor(width, height, name = "New Device"){
		this.defaults = {};
		this.layers = [];
		this.groups = [];
		this.params = {};
		this.params.name = new values.StringValue(name);
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
}

class Layer {
	constructor(z_offset, flip, name = "New Layer"){
		this.params = {};
		if (z_offset <0 ){
			throw new Error("Layer z_offset must be >= 0.");
		}
		this.params.z_offset = new values.FloatValue(z_offset);
		this.params.flip = new values.BooleanValue(flip);
		this.params.name = new values.StringValue(name);
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
}

class Group {
	constructor(){
		this.name = "";
		this.parent = null;
	}
}

class Feature {
	constructor(type, params, name = "New Feature"){
		this.id = this.generateID();
		this.name = name;
		this.connections = {};
		this.type = type;
		this.params = params;
		this.group = null;
	}

	generateID(){
		return uuid.v1();
	}
}

exports.Device = Device;
exports.Layer = Layer;
exports.Group = Group;
exports.Feature = Feature;

