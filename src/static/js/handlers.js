'use strict';

var features2D = require('./features2D.js');

class Handler{
	constructor(feature, type, handlerParams, handlerClass){
		this.feature = feature;
		this.type = type;
		this.handlerClass = handlerClass;
		this.handlerParams = handlerParams;
		this.paramTargets = {};
		this.associateParams();
	}

	printParams(){
		for (var param in this.paramTargets){
			console.log("Param: " + param + ", Target: " + this.paramTargets[param] + ", Value: " + this.__getParamValue(param));
		}
	}

	associateParams(){
		var targets = {};
		if (!this.__isCorrectHandlerType()){
			throw `Wrong ${handlerClass} used for this feature!`
		}
		for (var param in this.handlerParams){
			if (!this.__featureHasHandlerParam(param)){
				throw "Feature does not have the correct 2D Handler parameter."
			} else if (!this.__isCorrectParamType(param)){
				throw `Feature has the correct parameter target ${param}, but it is of the wrong type. ${this.feature.paramTypes.param}`
			} else if (!this.__featureHasTargetParam(param)){
				throw "Feature does not have the correct target parameter."
			} else {
				this.__associateParam(param);
			}
		}
	}

	invertY(position){
		return [position[0], this.feature.layer.device.width - position[1]];
	}

	__getParamValue(param){
		return this.feature.params[this.paramTargets[param]];
	}

	__associateParam(param){
		this.paramTargets[param] = this.feature.classData[this.handlerClass].params[param];
	}

	__featureHasTargetParam(param){
		return this.feature.classData.paramTypes.hasOwnProperty(this.feature.classData[this.handlerClass].params[param]);
	}

	__featureHasHandlerParam(param){
		return this.feature.classData[this.handlerClass].params.hasOwnProperty(param);
	}

	__isCorrectParamType(param){
		var type = this.handlerParams[param];
		var target = this.feature.classData[this.handlerClass].params[param];
		var targetType = this.feature.classData.paramTypes[target];
		return type == targetType;
	}

	__isCorrectHandlerType(){
		return this.feature.classData[this.handlerClass].type == this.type;
	}
} 

class Handler2D extends Handler {
	constructor(feature, type, handlerParams){
		super(feature, type, handlerParams, "handler2D");
		this.fab = null;
	}

	updateFab(){
		var fabParams = {};
		for (var param in this.paramTargets){
			fabParams[param] = this.__getParamValue(param);
		}
		if (this.feature.color == 'team'){
			fabParams["color"] = this.feature.layer.color;
		} else{
			fabParams["color"] = this.feature.color;
		}
		this.fab.setState(fabParams);
	}

	updateJSON(){
		var fabState = this.fab.getState();
		for (var param in this.handlerParams){
			this.feature.params[this.paramTargets[param]] = fabState[param];
		}
	}

	render(){
		this.feature.layer.device.canvas.add(this.fab);
	}
}

class CircleHandler extends Handler2D{
	constructor(feature){
		super(feature, "CircleHandler", {
			position: "position",
			radius: "number",
		});
		this.fab = new features2D.uFabCircle();
		this.updateFab();
	}
}

class TwoPointRectHandler extends Handler2D{
	constructor(feature){
		super(feature, "TwoPointRectHandler", {
			start: "position",
			end: "position", 
			width: "number"
		});
		this.fab = new features2D.uFabTwoPointRect();
		this.updateFab();
	}
}

class RectHandler extends Handler2D{
	constructor(feature){
		super(feature, "RectHandler", {
			position: "position",
			width: "number",
			length: "number"
		});
		this.fab = new features2D.uFabRect();
		this.updateFab();
	}
}

class Handler3D extends Handler {
	constructor(feature, type, handlerParams){
		super(feature, type, handlerParams, "handler3D");
	}
}

class TwoPointBoxHandler extends Handler3D {
	constructor(feature){
		super(feature, "TwoPointBoxHandler", {
			start: "position",
			end: "position",
			width: "number",
			height: "number"
		});
	}
}

class BoxHandler extends Handler3D {
	constructor(feature){
		super(feature, "BoxHandler", {
			position: "position",
			length: "number",
			width: "number",
			height: "number"
		});
	}
}

class ConeHandler extends Handler3D {
	constructor(feature){
		super(feature, "ConeHandler", {
			position: "position",
			radius1: "number",
			radius2: "number"
		});
	}
}

exports.TwoPointRectHandler = TwoPointRectHandler;
exports.CircleHandler = CircleHandler;
exports.ConeHandler = ConeHandler;
exports.BoxHandler = BoxHandler;
exports.TwoPointBoxHandler = TwoPointBoxHandler;
exports.RectHandler = RectHandler;