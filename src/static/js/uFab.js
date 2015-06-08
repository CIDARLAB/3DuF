'use strict'; //for Browserify

class Feature{
	constructor(featureData){
		this.ID = Feature.__parseOptionalID(featureData);
		this.color = Feature.__parseOptionalColor(featureData);
		this.params = featureData.params;
		this.classData = featureData.classData;
		this.handler2D = null;
		this.handler3D = null;
		this.layer = null;
	}

	//From: http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/
	static generateID(){
   		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        	var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        	return v.toString(16);
    	});
   	}

   	static __fromJSON(featureJSON){
   		var feat = new Feature({
   			ID: featureJSON.ID,
   			color: featureJSON.color,
   			type: featureJSON.type,
   			params: featureJSON.feature_params,
   		});
   		return feat;
   	}

   	static __parseOptionalColor(featureData){
		if (!featureData.hasOwnProperty("color") || featureData.color == undefined || featureData.color == null){
			return "layer";
		}
		else {
			return featureData.color;
		}
   	}

   	static __parseOptionalID(featureData){
		if (!featureData.hasOwnProperty("ID") || featureData.ID === null || featureData.ID === undefined){
			return Feature.generateID();
		} else {
			return featureData.ID;
		}
   	}

   	toJSON(){
   		return {
   			ID: this.ID,
   			color: this.color, 
   			type: this.type,
   			layer: this.layer.ID,
   			feature_params: this.params
   		}
   	}

   	render2D(){
   		this.handler2D.render();
   	}
}

class Layer {
	constructor(layerData){
		this.color = layerData.color;
		this.ID = layerData.ID;
		this.ZOffset = layerData.z_offset;
		this.flip = layerData.flip;
		this.features = [];
		this.device = null;
	}

	static __fromJSON(layerJSON){
		return new Layer({
			color: layerJSON.color,
			ID: layerJSON.ID,
			z_offset: layerJSON.z_offset
		});
	}

	toJSON(){
		return {
			features: this.featuresToJSON(),
			z_offset: this.ZOffset,
			ID: this.ID
		}
	}

	addFeature(feature){
		feature.layer = this;
		this.features.push(feature);
		this.device.__addFeature(feature);
		return feature;
	}

	featuresToJSON(){
		var data = [];
		for (var feature in this.features)
		{
			data.push(this.features[feature].ID);
		}
		return data;
	}

	render2D(){
		for (var feature in features){
			features[feature].render2D();
		}
	}
}

class Device {
	constructor(deviceData){
		this.height = deviceData.height;
		this.width = deviceData.width;
		this.ID = deviceData.ID;
		this.layers = {};
		this.features = {};
		this.canvas = null;
	}

	static fromJSON(deviceJSON){
		var devData = {
			height: deviceJSON.device.height,
			width: deviceJSON.device.width,
			ID: deviceJSON.device.name,
		}
		var dev = new Device(devData);

		for (var layerID in deviceJSON.layers){
			dev.addLayer(Layer.__fromJSON(deviceJSON.layers[layerID]));
		}

		for (var featureID in deviceJSON.features){
			var featData = deviceJSON.features[featureID];
			dev.layers[featData.layer].addFeature(Feature.__fromJSON(featData));
		}
		return dev;
	}

	addLayer(layer) {
		if (this.layers.hasOwnProperty(layer.ID)){
			throw `layer ID ${layer.ID} already exists in device ${this.ID}`;
		}
		else {
			this.layers[layer.ID] = layer;
			layer.device = this;
		}
		return layer;
	}

	__addFeature(feature){
		if (this.features.hasOwnProperty(feature.ID)){

			throw `Feature with ID ${feature.ID} already exists in device ${this.ID}`;
		}
		else if (!this.layers.hasOwnProperty(feature.layer.ID)){
			throw `Layer ${feature.layer.ID} does not exist in device ${this.ID}`;
		}
		else {
			this.features[feature.ID] = feature;
		}
	}

	render2D(){
		for (var layer in layers){
			layers[layer].render2D();
		}
	}

	toJSON(){
		return {
			device_data: this.deviceData,
			layers: this.__layersToJSON(),
			features: this.__featuresToJSON(),
		}
	}

	__featuresToJSON(){
		var data = {};
		for (var featureID in this.features){
			data[featureID] = this.features[featureID].toJSON();
		}
		return data;
	}

	__layersToJSON(){
		var data = {};
		for (var layerID in this.layers){
			data[layerID] = this.layers[layerID].toJSON();
		}
		return data;
	}
}

exports.Device = Device;
exports.Layer = Layer;
exports.Feature = Feature;