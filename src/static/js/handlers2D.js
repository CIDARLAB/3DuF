'use strict';

class Handler{
	constructor(feature, type, handlerParams, handlerClass){
		this.feature = feature;
		this.type = type;
		this.handlerClass = handlerClass;
		this.handlerParams = handlerParams;
		this.paramTargets = {};
	}

	associateParams(){
		if (!this.__isCorrectHandlerType(handlerClass)){
			throw `Wrong ${handlerClass} used for this feature!`
		}
		for (param in this.handlerParams){
			if (!this.__featureHasHandlerParam(param, this.handlerClass)){
				throw "Feature does not have the correct 2D Handler parameter target."
			} else if (!this.__isCorrectParamType(param)){
				throw "Feature does not have the correct 2D Handler parameter target."
			} else if (!this.__featureHasTargetParam(param, this.handlerClass)){
				throw "Feature does not have the correct 2D Handler parameter target."
			} else {
				this.__associateParam(param, this.handlerClass);
			}
		}
	}

	__getParamValue(param){
		return this.feature.params[this.paramTargets[param]];
	}

	__associateParam(param, handlerClass){
		this.paramTargets[param] = this.feature[handlerClass].params[param];
	}

	__featureHasTargetParam(param, handlerClass){
		return this.feature.params.hasOwnProperty(this.feature.2DHandler.params[param]);
	}

	__featureHasHandlerParam(param, handlerClass){
		return this.feature[handlerClass].params.hasOwnProperty(param);
	}

	__isCorrectParamType(param){
		return this.feature.params[param] == this.handlerParams[param];
	}

	__isCorrectHandlerType(handlerClass){
		return this.feature[handlerClass].type == this.type;
	}
} 

class Handler2D extends Handler {
	constructor(feature, type, handlerParams){
		super(feature, type, handlerParams, "2DHandler");
	}
}

class Handler3D extends Handler {
	constructor(feature, type, handlerParams){
		super(feature, type, handlerParams, "3DHandler");
	}
}

class CircleHandler extends Handler2D{
	constructor(feature){
		super(feature, "CircleHandler", {
			position: "position",
			radius: "number"
		});
	}
}

class TwoPointRectHandler extends Handler2D{
	constructor(feature){
		super(feature, "TwoPointRectHandler", {
			start: "position",
			end: "position", 
			width: "number"
		})
	}
}

class RectHandler extends Handler2D{
	constructor(feature){
		super(feature, "RectHandler", {
			position: "position",
			width: "number",
			length: "number"
		})
	}
}

exports.CircleHandler = CircleHandler;