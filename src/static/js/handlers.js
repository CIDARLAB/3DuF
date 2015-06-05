'use strict';

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
				throw "Feature has the correct parameter target, but it is of the wrong type."
			} else if (!this.__featureHasTargetParam(param)){
				throw "Feature does not have the correct target parameter."
			} else {
				this.__associateParam(param);
			}
		}
	}

	__getParamValue(param){
		return this.feature.params[this.paramTargets[param]];
	}

	__associateParam(param){
		this.paramTargets[param] = this.feature[this.handlerClass].params[param];
	}

	__featureHasTargetParam(param){
		return this.feature.paramTypes.hasOwnProperty(this.feature[this.handlerClass].params[param]);
	}

	__featureHasHandlerParam(param){
		return this.feature[this.handlerClass].params.hasOwnProperty(param);
	}

	__isCorrectParamType(param){
		return this.feature.paramTypes[param] == this.handlerParams[param];
	}

	__isCorrectHandlerType(){
		return this.feature[this.handlerClass].type == this.type;
	}
} 

class Handler2D extends Handler {
	constructor(feature, type, handlerParams){
		super(feature, type, handlerParams, "handler2D");
	}
}

class CircleHandler extends Handler2D{
	constructor(feature){
		super(feature, "CircleHandler", {
			position: "position",
			radius: "number",
		});
	}
}

class TwoPointRectHandler extends Handler2D{
	constructor(feature){
		super(feature, "TwoPointRectHandler", {
			start: "position",
			end: "position", 
			width: "number"
		});
	}
}

class RectHandler extends Handler2D{
	constructor(feature){
		super(feature, "RectHandler", {
			position: "position",
			width: "number",
			length: "number"
		});
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