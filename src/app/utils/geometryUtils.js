'use strict';

/* Returns the the radian value of the specified degrees in the range of (-PI, PI] */
var degToRad = function(degrees) {
    var res = degrees / 180 * Math.PI;
    return res;
}

/* Returns the radian value of the specified radians in the range of [0,360), to a precision of four decimal places.*/
var radToDeg = function(radians) {
    var res = radians * 180 / Math.PI;
    return res;
}

var computeAngleFromPoints = function(start, end) {
    var dX = end[0] - start[0];
    var dY = end[1] - start[1];
    return computeAngle(dX, dY);
}

var computeAngle = function(dX, dY) {
    return radToDeg(Math.atan2(dY, dX));
}

var computeDistanceBetweenPoints = function(start, end) {
    return computeDistance(end[0] - start[0], end[1] - start[1]);
}

var computeDistance = function(dX, dY) {
    return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
}

var computeEndPoint = function(start, angle, length) {
    length = parseFloat(length);
    var rad = degToRad(angle);
    var dX = length * Math.cos(rad);
    var dY = length * Math.sin(rad);
    return [start[0] + dX, start[1] + dY];
}

exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.computeAngleFromPoints = computeAngleFromPoints;
exports.computeAngle = computeAngle;
exports.computeDistance = computeDistance;
exports.computeDistanceBetweenPoints = computeDistanceBetweenPoints;
exports.computeEndPoint = computeEndPoint;