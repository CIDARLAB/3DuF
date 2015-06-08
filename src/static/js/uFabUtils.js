'use strict';

var degToRad = function(degrees){
	return degrees/180 * Math.PI;
}

var radToDeg = function(radians){
	return radians * 180 / Math.PI;
}

var computeAngleFromPoints = function(start, end){
	var dX = end[0] - start[0];
	var dY = end[1] - end[0];
	return computeAngle(dX, dY);
}

var computeAngle = function(dX, dY){
	return radToDeg(Math.atan2(dX, dY));
}

var computeDistanceBetweenPoints = function(start, end){
	return computeDistance(end[1]-end[0], start[1]-start[0]);
}

var computeDistance = function(dX, dY){
	return Math.sqrt(Math.pow(dX,2), Math.pow(dY, 2));
}

var computeEndPoint = function(start, angle, length){
	var rad = degToRad(angle);
	dX = length * Math.cos(rad);
	dY = length * Math.sin(rad);
	return [start[0] + dX, start[1] + dY]
}

exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.computeAngleFromPoints = computeAngleFromPoints;
exports.computeAngle = computeAngle;
exports.computeDistance = computeDistance;
exports.computeDistanceBetweenPoints = computeDistanceBetweenPoints;
exports.computeEndPoint = computeEndPoint;