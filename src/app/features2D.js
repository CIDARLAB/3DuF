'use strict';

var utils = require('./geometryUtils.js');
var paperFunctions = require('./paperFunctions.js');

var getGroupOffset = function(feature){
	if (feature.hasOwnProperty(group) && feature.group != undefined && feature.group != null){
		return [feature.group.left + feature.group.width/2, feature.group.top + feature.group.height/2];
	}
	else return [0,0];
}

class uFabCircle extends fabric.Circle{
	constructor(){
		super({
			lockRotation: true,
			originX: 'center',
			originY: 'center',
			centeredScaling: true,
			lockUniScaling: true,
			hasRotatingPoint: false,
			strokeWidth: 0,
			transparentCorners: false
		})
		this.handler = null;
	}	

	setState(params){
		this.set({
			left: params.position[0],
			top: this.handler.invertY(params.position)[1],
			radius: params.radius,
			fill: params.color
		});
	}

	getState(){
		var offset = getGroupOffset(this);
		var left = this.left + offset[0];
		var top = this.top + offset[1];
		return {
			position: this.handler.invertY([left, top]),
			radius: this.radius,
			color: this.fill
		}
	}
}

class uFabRect extends fabric.Rect{
	constructor(){
		super({
			top: position[1],
			left: position[0],
			lockRotation: true,
			originX: 'center',
			originY: 'center',
			centeredScaling: true,
			lockUniScaling: true,
			hasRotatingPoint: false,
			strokeWidth: 0,
			transparentCorners: false
		})
		this.handler = null;
	}	

	setState(params){
		this.set({
			left: params.position[0],
			top: this.handler.invertY(params.position)[1],
			height: params.width,
			width: params.length,
			fill: params.color
		});
	}

	getState(){
		var offset = getGroupOffset(this);
		var left = this.left + offset[0];
		var top = this.top + offset[1];
		return {
			position: [left, top],
			width: this.height,
			length: this.width,
			color: this.fill
		}
	}
}

class uFabTwoPointRect extends fabric.Rect{
	constructor(){
		super({
			lockRotation: true,
			originX: 'left',
			originY: 'center',
			centeredScaling: true,
			lockUniScaling: true,
			hasRotatingPoint: false,
			strokeWidth: 0,
			transparentCorners: false
		})
		this.handler = null;
	}

	__computePositionalState(start, end){
		var len = utils.computeDistanceBetweenPoints(start, end);
		return {
			left: start[0] ,
			top: start[1],
			length: utils.computeDistanceBetweenPoints(start, end),
			angle: utils.computeAngleFromPoints(start, end)
		}
	}

	setState(params){
		var posState = this.__computePositionalState(this.handler.invertY(params.start), this.handler.invertY(params.end));
		this.set({
			left: posState.left,
			top: posState.top,
			width: posState.length,
			angle: posState.angle,
			height: params.width,
			fill: params.color
		});
	}

	getState(){
		var offset = getGroupOffset(this);
		var left = this.left + offset[0];
		var top = this.top + offset[1];
		var eLeft = endPoint[0] + offset[0];
		var eTop = endPoint[1] + offset[1];
		return {
			start: this.handler.invertY([left, top]),
			end: this.handler.invertY([eLeft, eTop]),
			width: this.height,
			color: this.color
		}
	}
}

exports.uFabRect = uFabRect;
exports.uFabCircle = uFabCircle;
exports.uFabTwoPointRect = uFabTwoPointRect;