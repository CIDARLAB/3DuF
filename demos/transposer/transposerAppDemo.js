(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

//for Browserify

var Feature = (function () {
	function Feature(featureData) {
		_classCallCheck(this, Feature);

		this.ID = Feature.__parseOptionalID(featureData);
		this.color = Feature.__parseOptionalColor(featureData);
		this.params = featureData.params;
		this.classData = featureData.classData;
		this.handler2D = null;
		this.handler3D = null;
		this.layer = null;
	}

	_createClass(Feature, [{
		key: 'destroy',
		value: function destroy() {
			this.layer.removeFeature(this.ID);
			delete this;
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return {
				ID: this.ID,
				color: this.color,
				type: this.type,
				layer: this.layer.ID,
				feature_params: this.params
			};
		}
	}, {
		key: 'render2D',
		value: function render2D() {
			this.handler2D.render();
		}
	}], [{
		key: 'generateID',

		//From: http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/
		value: function generateID() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				    v = c === 'x' ? r : r & 3 | 8;
				return v.toString(16);
			});
		}
	}, {
		key: '__fromJSON',
		value: function __fromJSON(featureJSON) {
			var feat = new Feature({
				ID: featureJSON.ID,
				color: featureJSON.color,
				type: featureJSON.type,
				params: featureJSON.feature_params });
			return feat;
		}
	}, {
		key: '__parseOptionalColor',
		value: function __parseOptionalColor(featureData) {
			if (!featureData.hasOwnProperty('color') || featureData.color == undefined || featureData.color == null) {
				return 'layer';
			} else {
				return featureData.color;
			}
		}
	}, {
		key: '__parseOptionalID',
		value: function __parseOptionalID(featureData) {
			if (!featureData.hasOwnProperty('ID') || featureData.ID === null || featureData.ID === undefined) {
				return Feature.generateID();
			} else {
				return featureData.ID;
			}
		}
	}]);

	return Feature;
})();

var Layer = (function () {
	function Layer(layerData) {
		_classCallCheck(this, Layer);

		this.color = layerData.color;
		this.ID = layerData.ID;
		this.ZOffset = layerData.z_offset;
		this.flip = layerData.flip;
		this.features = {};
		this.device = null;
	}

	_createClass(Layer, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				features: this.featuresToJSON(),
				z_offset: this.ZOffset,
				ID: this.ID
			};
		}
	}, {
		key: 'removeFeature',
		value: function removeFeature(feature) {
			delete this.features[feature];
			this.device.__removeFeature(feature);
		}
	}, {
		key: 'addFeature',
		value: function addFeature(feature) {
			feature.layer = this;
			this.features[feature.ID] = feature;
			this.device.__addFeature(feature);
			return feature;
		}
	}, {
		key: 'featuresToJSON',
		value: function featuresToJSON() {
			var data = [];
			for (var feature in this.features) {
				data.push(feature);
			}
			return data;
		}
	}, {
		key: 'render2D',
		value: function render2D() {
			for (var feature in this.features) {
				var feat = this.features[feature];
				if (feat != undefined) {
					feat.render2D();
				}
			}
		}
	}], [{
		key: '__fromJSON',
		value: function __fromJSON(layerJSON) {
			return new Layer({
				color: layerJSON.color,
				ID: layerJSON.ID,
				z_offset: layerJSON.z_offset
			});
		}
	}]);

	return Layer;
})();

var Device = (function () {
	function Device(deviceData) {
		_classCallCheck(this, Device);

		this.height = deviceData.height;
		this.width = deviceData.width;
		this.ID = deviceData.ID;
		this.layers = {};
		this.features = {};
		this.canvas = null;
	}

	_createClass(Device, [{
		key: 'addLayer',
		value: function addLayer(layer) {
			if (this.layers.hasOwnProperty(layer.ID)) {
				throw 'layer ID ' + layer.ID + ' already exists in device ' + this.ID;
			} else {
				this.layers[layer.ID] = layer;
				layer.device = this;
			}
			return layer;
		}
	}, {
		key: '__removeFeature',
		value: function __removeFeature(feature) {
			delete this.features[feature];
		}
	}, {
		key: '__addFeature',
		value: function __addFeature(feature) {
			if (this.features.hasOwnProperty(feature.ID)) {
				throw 'Feature with ID ' + feature.ID + ' already exists in device ' + this.ID;
			} else if (!this.layers.hasOwnProperty(feature.layer.ID)) {
				throw 'Layer ' + feature.layer.ID + ' does not exist in device ' + this.ID;
			} else {
				this.features[feature.ID] = feature;
			}
		}
	}, {
		key: 'render2D',
		value: function render2D() {
			this.canvas.clear();
			for (var layer in this.layers) {
				this.layers[layer].render2D();
			}
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return {
				device_data: this.deviceData,
				layers: this.__layersToJSON(),
				features: this.__featuresToJSON() };
		}
	}, {
		key: '__featuresToJSON',
		value: function __featuresToJSON() {
			var data = {};
			for (var featureID in this.features) {
				data[featureID] = this.features[featureID].toJSON();
			}
			return data;
		}
	}, {
		key: '__layersToJSON',
		value: function __layersToJSON() {
			var data = {};
			for (var layerID in this.layers) {
				data[layerID] = this.layers[layerID].toJSON();
			}
			return data;
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(deviceJSON) {
			var devData = {
				height: deviceJSON.device.height,
				width: deviceJSON.device.width,
				ID: deviceJSON.device.name };
			var dev = new Device(devData);

			for (var layerID in deviceJSON.layers) {
				dev.addLayer(Layer.__fromJSON(deviceJSON.layers[layerID]));
			}

			for (var featureID in deviceJSON.features) {
				var featData = deviceJSON.features[featureID];
				dev.layers[featData.layer].addFeature(Feature.__fromJSON(featData));
			}
			return dev;
		}
	}]);

	return Device;
})();

exports.Device = Device;
exports.Layer = Layer;
exports.Feature = Feature;

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var uFab = require('./3DuFCore');

var Module = (function () {
	function Module(featureDefaults) {
		_classCallCheck(this, Module);

		this.featureDefaults = featureDefaults;
		this.features = [];
	}

	_createClass(Module, [{
		key: 'makeFeature',
		value: function makeFeature(type, params) {
			params = {};

			for (param in this.featureDefaults[type]) {}
		}
	}]);

	return Module;
})();

exports.Module = Module;

// TODO: general method for modules to make prims of known params

},{"./3DuFCore":1}],3:[function(require,module,exports){
"use strict";

var getDefaultFeatures = function getDefaultFeatures() {
  return {
    "Channel": {
      "name": "Channel",
      "paramTypes": {
        "start": "position",
        "end": "position",
        "width": "number",
        "height": "number"
      },
      "handler2D": {
        "type": "TwoPointRectHandler",
        "params": {
          "start": "start",
          "end": "end",
          "width": "width"
        }
      },
      "handler3D": {
        "type": "TwoPointBoxHandler",
        "params": {
          "start": "start",
          "end": "end",
          "width": "width",
          "height": "height"
        }
      }
    },
    "Via": {
      "name": "Via",
      "paramTypes": {
        "position": "position",
        "radius1": "number",
        "radius2": "number",
        "height": "number"
      },
      "handler2D": {
        "type": "CircleHandler",
        "params": {
          "position": "position",
          "radius": "radius1"
        }
      },
      "handler3D": {
        "type": "ConeHandler",
        "params": {
          "position": "position",
          "radius1": "radius1",
          "radius2": "radius2",
          "height": "height"
        }
      }
    },
    "SquareValve": {
      "name": "SquareValve",
      "paramTypes": {
        "position": "position",
        "width": "number",
        "length": "number",
        "height": "number"
      },
      "handler2D": {
        "type": "RectHandler",
        "params": {
          "position": "position",
          "width": "width",
          "length": "length"
        }
      },
      "handler3D": {
        "type": "BoxHandler",
        "params": {
          "position": "position",
          "width": "width",
          "length": "length",
          "height": "height"
        }
      }
    },
    "Standoff": {
      "name": "Standoff",
      "paramTypes": {
        "position": "position",
        "radius1": "number",
        "radius2": "number",
        "height": "number"
      },
      "handler2D": {
        "type": "CircleHandler",
        "params": {
          "position": "position",
          "radius": "radius1"
        }
      },
      "handler3D": {
        "type": "ConeHandler",
        "params": {
          "position": "position",
          "radius1": "radius1",
          "radius2": "radius2",
          "height": "height"
        }
      }
    },
    "CircleValve": {
      "name": "CircleValve",
      "paramTypes": {
        "position": "position",
        "radius1": "number",
        "radius2": "number",
        "height": "number"
      },
      "handler2D": {
        "type": "CircleHandler",
        "params": {
          "position": "position",
          "radius": "radius1"
        }
      },
      "handler3D": {
        "type": "ConeHandler",
        "params": {
          "position": "position",
          "radius1": "radius1",
          "radius2": "radius2",
          "height": "height"
        }
      }
    },
    "Port": {
      "name": "Port",
      "paramTypes": {
        "position": "position",
        "radius": "number",
        "height": "number"
      },
      "handler2D": {
        "type": "CircleHandler",
        "params": {
          "position": "position",
          "radius": "radius"
        }
      },
      "handler3D": {
        "type": "ConeHandler",
        "params": {
          "position": "position",
          "radius1": "radius",
          "radius2": "radius",
          "height": "height"
        }
      }
    }
  };
};

exports.getDefaultFeatures = getDefaultFeatures;

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var uFab = require('./3DuFCore');

var uFabCanvas = (function (_fabric$CanvasWithViewport) {
	function uFabCanvas(id) {
		_classCallCheck(this, uFabCanvas);

		_get(Object.getPrototypeOf(uFabCanvas.prototype), 'constructor', this).call(this, id);
		this.resizeCanvasElement();
		this.device = null;

		//I want these to be constant class variables, but I don't know how to do that. :(
		this.DEVICE_MARGIN_X = 5;
		this.DEVICE_MARGIN_Y = 5;
		this.DEFAULT_ZOOM = 0.95;
		this.isDrawingMode = false;
		this.isGrabMode = false;
	}

	_inherits(uFabCanvas, _fabric$CanvasWithViewport);

	_createClass(uFabCanvas, [{
		key: 'setDevice',
		value: function setDevice(device) {
			this.clear();
			this.device = device;
			this.device.canvas = this;
			this.resetZoom();
			//this.resetViewPosition();
		}
	}, {
		key: 'resetViewPosition',
		value: function resetViewPosition() {
			this.viewport.position = new fabric.Point(this.DEVICE_MARGIN_X, this.DEVICE_MARGIN_Y);
		}
	}, {
		key: 'increaseZoom',
		value: function increaseZoom(zoom) {
			this.setZoom(this.viewport.zoom * 1.1);
		}
	}, {
		key: 'decreaseZoom',
		value: function decreaseZoom() {
			this.setZoom(this.viewport.zoom * 0.9);
		}
	}, {
		key: 'setZoom',
		value: function setZoom(zoom) {
			this.viewport.zoom = zoom;
		}
	}, {
		key: 'resetZoom',
		value: function resetZoom() {
			this.setZoom(this.computeOptimalZoom());
		}
	}, {
		key: 'resizeCanvasElement',
		value: function resizeCanvasElement() {
			var parent = $(this.ID).parent();
			var canvas = $(this.ID);
			canvas.width = parent.clientWidth;
			canvas.height = parent.clientHeight;
		}
	}, {
		key: 'computeOptimalZoom',
		value: function computeOptimalZoom() {
			var x_max = this.width * this.DEFAULT_ZOOM;
			var y_max = this.height * this.DEFAULT_ZOOM;
			var x_max_zoom = x_max / this.device.width;
			var y_max_zoom = y_max / this.device.height;
			if (x_max_zoom > y_max_zoom) {
				return y_max_zoom;
			} else {
				return x_max_zoom;
			}
		}
	}]);

	return uFabCanvas;
})(fabric.CanvasWithViewport);

exports.uFabCanvas = uFabCanvas;

},{"./3DuFCore":1}],5:[function(require,module,exports){
'use strict';

var uFab = require('./3DuFCore');
var getDefaultFeatures = require('./defaultFeatures.js').getDefaultFeatures; // currently a hack, to avoid UI interaction for now
var handlers = require('./handlers');

var makeFeatureClass = function makeFeatureClass(featureJSON) {
	window[featureJSON.name] = function (params, color, ID) {
		var newFeat = new uFab.Feature({
			ID: ID,
			color: color,
			classData: {
				type: featureJSON.name,
				paramTypes: featureJSON.paramTypes,
				handler2D: featureJSON.handler2D,
				handler3D: featureJSON.handler3D
			},
			params: params
		});
		// Placeholders, figure out your naming conventions!
		newFeat.handler2D = new handlers[newFeat.classData.handler2D.type](newFeat);
		newFeat.handler3D = new handlers[newFeat.classData.handler3D.type](newFeat);
		return newFeat;
	};
};

var parseFeatureList = function parseFeatureList(featureList) {
	for (var feature in featureList) {
		makeFeatureClass(featureList[feature]);
	}
};

var loadDefaultFeatures = function loadDefaultFeatures() {
	parseFeatureList(getDefaultFeatures());
};

exports.makeFeatureClass = makeFeatureClass;
exports.parseFeatureList = parseFeatureList;
exports.loadDefaultFeatures = loadDefaultFeatures;

},{"./3DuFCore":1,"./defaultFeatures.js":3,"./handlers":8}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var utils = require('./geometryUtils.js');
var paperFunctions = require('./paperFunctions.js');

var getGroupOffset = function getGroupOffset(feature) {
	if (feature.hasOwnProperty(group) && feature.group != undefined && feature.group != null) {
		return [feature.group.left + feature.group.width / 2, feature.group.top + feature.group.height / 2];
	} else return [0, 0];
};

var uFabCircle = (function (_fabric$Circle) {
	function uFabCircle() {
		_classCallCheck(this, uFabCircle);

		_get(Object.getPrototypeOf(uFabCircle.prototype), 'constructor', this).call(this, {
			lockRotation: true,
			originX: 'center',
			originY: 'center',
			centeredScaling: true,
			lockUniScaling: true,
			hasRotatingPoint: false,
			strokeWidth: 0,
			transparentCorners: false
		});
		this.handler = null;
	}

	_inherits(uFabCircle, _fabric$Circle);

	_createClass(uFabCircle, [{
		key: 'setState',
		value: function setState(params) {
			this.set({
				left: params.position[0],
				top: this.handler.invertY(params.position)[1],
				radius: params.radius,
				fill: params.color
			});
		}
	}, {
		key: 'getState',
		value: function getState() {
			var offset = getGroupOffset(this);
			var left = this.left + offset[0];
			var top = this.top + offset[1];
			return {
				position: this.handler.invertY([left, top]),
				radius: this.radius,
				color: this.fill
			};
		}
	}]);

	return uFabCircle;
})(fabric.Circle);

var uFabRect = (function (_fabric$Rect) {
	function uFabRect() {
		_classCallCheck(this, uFabRect);

		_get(Object.getPrototypeOf(uFabRect.prototype), 'constructor', this).call(this, {
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
		});
		this.handler = null;
	}

	_inherits(uFabRect, _fabric$Rect);

	_createClass(uFabRect, [{
		key: 'setState',
		value: function setState(params) {
			this.set({
				left: params.position[0],
				top: this.handler.invertY(params.position)[1],
				height: params.width,
				width: params.length,
				fill: params.color
			});
		}
	}, {
		key: 'getState',
		value: function getState() {
			var offset = getGroupOffset(this);
			var left = this.left + offset[0];
			var top = this.top + offset[1];
			return {
				position: [left, top],
				width: this.height,
				length: this.width,
				color: this.fill
			};
		}
	}]);

	return uFabRect;
})(fabric.Rect);

var uFabTwoPointRect = (function (_fabric$Rect2) {
	function uFabTwoPointRect() {
		_classCallCheck(this, uFabTwoPointRect);

		_get(Object.getPrototypeOf(uFabTwoPointRect.prototype), 'constructor', this).call(this, {
			lockRotation: true,
			originX: 'left',
			originY: 'center',
			centeredScaling: true,
			lockUniScaling: true,
			hasRotatingPoint: false,
			strokeWidth: 0,
			transparentCorners: false
		});
		this.handler = null;
	}

	_inherits(uFabTwoPointRect, _fabric$Rect2);

	_createClass(uFabTwoPointRect, [{
		key: '__computePositionalState',
		value: function __computePositionalState(start, end) {
			var len = utils.computeDistanceBetweenPoints(start, end);
			return {
				left: start[0],
				top: start[1],
				length: utils.computeDistanceBetweenPoints(start, end),
				angle: utils.computeAngleFromPoints(start, end)
			};
		}
	}, {
		key: 'setState',
		value: function setState(params) {
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
	}, {
		key: 'getState',
		value: function getState() {
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
			};
		}
	}]);

	return uFabTwoPointRect;
})(fabric.Rect);

exports.uFabRect = uFabRect;
exports.uFabCircle = uFabCircle;
exports.uFabTwoPointRect = uFabTwoPointRect;

},{"./geometryUtils.js":7,"./paperFunctions.js":9}],7:[function(require,module,exports){
'use strict';

/* Returns the the radian value of the specified degrees in the range of (-PI, PI] */
var degToRad = function degToRad(degrees) {
	var res = degrees / 180 * Math.PI;
	return res;
};

/* Returns the radian value of the specified radians in the range of [0,360), to a precision of four decimal places.*/
var radToDeg = function radToDeg(radians) {
	var res = radians * 180 / Math.PI;
	return res;
};

var computeAngleFromPoints = function computeAngleFromPoints(start, end) {
	var dX = end[0] - start[0];
	var dY = end[1] - start[1];
	return computeAngle(dX, dY);
};

var computeAngle = function computeAngle(dX, dY) {
	return radToDeg(Math.atan2(dY, dX));
};

var computeDistanceBetweenPoints = function computeDistanceBetweenPoints(start, end) {
	return computeDistance(end[0] - start[0], end[1] - start[1]);
};

var computeDistance = function computeDistance(dX, dY) {
	return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
};

var computeEndPoint = function computeEndPoint(start, angle, length) {
	length = parseFloat(length);
	var rad = degToRad(angle);
	var dX = length * Math.cos(rad);
	var dY = length * Math.sin(rad);
	return [start[0] + dX, start[1] + dY];
};

exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.computeAngleFromPoints = computeAngleFromPoints;
exports.computeAngle = computeAngle;
exports.computeDistance = computeDistance;
exports.computeDistanceBetweenPoints = computeDistanceBetweenPoints;
exports.computeEndPoint = computeEndPoint;

},{}],8:[function(require,module,exports){
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var features2D = require('./features2D.js');

var Handler = (function () {
	function Handler(feature, type, handlerParams, handlerClass) {
		_classCallCheck(this, Handler);

		this.feature = feature;
		this.type = type;
		this.handlerClass = handlerClass;
		this.handlerParams = handlerParams;
		this.paramTargets = {};
		this.associateParams();
	}

	_createClass(Handler, [{
		key: 'printParams',
		value: function printParams() {
			for (var param in this.paramTargets) {
				console.log('Param: ' + param + ', Target: ' + this.paramTargets[param] + ', Value: ' + this.__getParamValue(param));
			}
		}
	}, {
		key: 'associateParams',
		value: function associateParams() {
			var targets = {};
			if (!this.__isCorrectHandlerType()) {
				throw 'Wrong ' + handlerClass + ' used for this feature!';
			}
			for (var param in this.handlerParams) {
				if (!this.__featureHasHandlerParam(param)) {
					throw 'Feature does not have the correct 2D Handler parameter.';
				} else if (!this.__isCorrectParamType(param)) {
					throw 'Feature has the correct parameter target ' + param + ', but it is of the wrong type. ' + this.feature.paramTypes.param;
				} else if (!this.__featureHasTargetParam(param)) {
					throw 'Feature does not have the correct target parameter.';
				} else {
					this.__associateParam(param);
				}
			}
		}
	}, {
		key: 'invertY',
		value: function invertY(position) {
			return [position[0], this.feature.layer.device.width - position[1]];
		}
	}, {
		key: '__getParamValue',
		value: function __getParamValue(param) {
			return this.feature.params[this.paramTargets[param]];
		}
	}, {
		key: '__associateParam',
		value: function __associateParam(param) {
			this.paramTargets[param] = this.feature.classData[this.handlerClass].params[param];
		}
	}, {
		key: '__featureHasTargetParam',
		value: function __featureHasTargetParam(param) {
			return this.feature.classData.paramTypes.hasOwnProperty(this.feature.classData[this.handlerClass].params[param]);
		}
	}, {
		key: '__featureHasHandlerParam',
		value: function __featureHasHandlerParam(param) {
			return this.feature.classData[this.handlerClass].params.hasOwnProperty(param);
		}
	}, {
		key: '__isCorrectParamType',
		value: function __isCorrectParamType(param) {
			var type = this.handlerParams[param];
			var target = this.feature.classData[this.handlerClass].params[param];
			var targetType = this.feature.classData.paramTypes[target];
			return type == targetType;
		}
	}, {
		key: '__isCorrectHandlerType',
		value: function __isCorrectHandlerType() {
			return this.feature.classData[this.handlerClass].type == this.type;
		}
	}]);

	return Handler;
})();

var Handler2D = (function (_Handler) {
	function Handler2D(feature, type, handlerParams) {
		_classCallCheck(this, Handler2D);

		_get(Object.getPrototypeOf(Handler2D.prototype), 'constructor', this).call(this, feature, type, handlerParams, 'handler2D');
		this.fab = null;
	}

	_inherits(Handler2D, _Handler);

	_createClass(Handler2D, [{
		key: 'updateFab',
		value: function updateFab() {
			var fabParams = {};
			for (var param in this.paramTargets) {
				fabParams[param] = this.__getParamValue(param);
			}
			if (this.feature.color == 'layer') {
				fabParams['color'] = this.feature.layer.color;
			} else {
				fabParams['color'] = this.feature.color;
			}
			this.fab.setState(fabParams);
		}
	}, {
		key: 'updateJSON',
		value: function updateJSON() {
			var fabState = this.fab.getState();
			for (var param in this.handlerParams) {
				this.feature.params[this.paramTargets[param]] = fabState[param];
			}
		}
	}, {
		key: 'render',
		value: function render() {
			this.updateFab();
			this.feature.layer.device.canvas.add(this.fab);
		}
	}]);

	return Handler2D;
})(Handler);

var CircleHandler = (function (_Handler2D) {
	function CircleHandler(feature) {
		_classCallCheck(this, CircleHandler);

		_get(Object.getPrototypeOf(CircleHandler.prototype), 'constructor', this).call(this, feature, 'CircleHandler', {
			position: 'position',
			radius: 'number' });
		this.fab = new features2D.uFabCircle();
		this.fab.handler = this;
	}

	_inherits(CircleHandler, _Handler2D);

	return CircleHandler;
})(Handler2D);

var TwoPointRectHandler = (function (_Handler2D2) {
	function TwoPointRectHandler(feature) {
		_classCallCheck(this, TwoPointRectHandler);

		_get(Object.getPrototypeOf(TwoPointRectHandler.prototype), 'constructor', this).call(this, feature, 'TwoPointRectHandler', {
			start: 'position',
			end: 'position',
			width: 'number'
		});
		this.fab = new features2D.uFabTwoPointRect();
		this.fab.handler = this;
	}

	_inherits(TwoPointRectHandler, _Handler2D2);

	return TwoPointRectHandler;
})(Handler2D);

var RectHandler = (function (_Handler2D3) {
	function RectHandler(feature) {
		_classCallCheck(this, RectHandler);

		_get(Object.getPrototypeOf(RectHandler.prototype), 'constructor', this).call(this, feature, 'RectHandler', {
			position: 'position',
			width: 'number',
			length: 'number'
		});
		this.fab = new features2D.uFabRect();
		this.fab.handler = this;
	}

	_inherits(RectHandler, _Handler2D3);

	return RectHandler;
})(Handler2D);

var Handler3D = (function (_Handler2) {
	function Handler3D(feature, type, handlerParams) {
		_classCallCheck(this, Handler3D);

		_get(Object.getPrototypeOf(Handler3D.prototype), 'constructor', this).call(this, feature, type, handlerParams, 'handler3D');
	}

	_inherits(Handler3D, _Handler2);

	return Handler3D;
})(Handler);

var TwoPointBoxHandler = (function (_Handler3D) {
	function TwoPointBoxHandler(feature) {
		_classCallCheck(this, TwoPointBoxHandler);

		_get(Object.getPrototypeOf(TwoPointBoxHandler.prototype), 'constructor', this).call(this, feature, 'TwoPointBoxHandler', {
			start: 'position',
			end: 'position',
			width: 'number',
			height: 'number'
		});
	}

	_inherits(TwoPointBoxHandler, _Handler3D);

	return TwoPointBoxHandler;
})(Handler3D);

var BoxHandler = (function (_Handler3D2) {
	function BoxHandler(feature) {
		_classCallCheck(this, BoxHandler);

		_get(Object.getPrototypeOf(BoxHandler.prototype), 'constructor', this).call(this, feature, 'BoxHandler', {
			position: 'position',
			length: 'number',
			width: 'number',
			height: 'number'
		});
	}

	_inherits(BoxHandler, _Handler3D2);

	return BoxHandler;
})(Handler3D);

var ConeHandler = (function (_Handler3D3) {
	function ConeHandler(feature) {
		_classCallCheck(this, ConeHandler);

		_get(Object.getPrototypeOf(ConeHandler.prototype), 'constructor', this).call(this, feature, 'ConeHandler', {
			position: 'position',
			radius1: 'number',
			radius2: 'number'
		});
	}

	_inherits(ConeHandler, _Handler3D3);

	return ConeHandler;
})(Handler3D);

exports.TwoPointRectHandler = TwoPointRectHandler;
exports.CircleHandler = CircleHandler;
exports.ConeHandler = ConeHandler;
exports.BoxHandler = BoxHandler;
exports.TwoPointBoxHandler = TwoPointBoxHandler;
exports.RectHandler = RectHandler;

},{"./features2D.js":6}],9:[function(require,module,exports){

// Keep global references to both tools, so the HTML
// links below can access them.
"use strict";

var tool1, tool2;
var start;
var current_stroke;
var width = 20;
var cornerWidth = width / 2;
var gridSize = 20;
var strokes = [];
var strokeHistory = [];
//console.log(strokeHistory);
var forceSnap = true;
var forceSharpCorners = false;
var forceHit = true;
var ctrl = false;
var vert;
var horiz;
var gridGroup;
var highlightGroup;
var intersectionGroup;
var background;

var hitOptions;
var view;

function setup() {

    view = paper.view;

    hitOptions = {
        stroke: true,
        ends: false,
        fill: false,
        segments: false,
        center: true,
        "class": Path,
        tolerance: 8
    };

    intersectionGroup = new Group();
    highlightGroup = new Group();
    gridGroup = new Group();

    background = new Path.Rectangle(view.bounds);
    //background.fillColor = 'grey';

    vert = new Symbol(vertGridLine());
    horiz = new Symbol(horizGridLine());

    makeGrid();

    view.update(true);

    tool1 = new Tool();
    tool1.onMouseDown = onMouseDown;
    tool1.onKeyDown = onKeyDown;
    tool1.onMouseMove = onMouseMove;

    tool1.onMouseDrag = function (event) {
        clearStroke();
        var target = targetHandler(event);
        current_stroke = makeChannel(start, target);
        current_stroke.insertBelow(intersectionGroup);
        current_stroke.selected = true;
    };

    tool1.onMouseUp = function (event) {
        strokes.push(current_stroke);
        strokeHistory.push([current_stroke.start.x, current_stroke.start.y, current_stroke.end.x, current_stroke.end.y]);
        saveStrokes();
        current_stroke.selected = false;
        start = null;
    };
}

function makeGrid() {
    vertGrid();
    horizGrid();
    gridGroup.insertBelow(intersectionGroup);
}

function vertGrid() {
    for (var i = 0; i < view.bounds.width; i += gridSize) {
        var p = new Point(i + gridSize / 2, view.bounds.height / 2);
        var s = vert.place(p);
        gridGroup.addChild(s);
    }
}

function horizGrid() {
    for (var i = 0; i < view.bounds.height; i += gridSize) {
        var p = new Point(view.bounds.width / 2, i + gridSize / 2);
        var s = horiz.place(p);
        gridGroup.addChild(s);
    }
}

// Create two drawing tools.
// tool1 will draw straight lines,
// tool2 will draw clouds.

// Both share the mouseDown event:

//loadStrokes();

function gridLine(start, end) {
    var line = new Path.Line(start, end);
    line.strokeColor = "lightblue";
    line.strokeWidth = 1;
    line.remove();
    line.guide = true;
    return line;
}

function vertGridLine() {
    return gridLine(view.bounds.bottomLeft, view.bounds.topLeft);
}

function horizGridLine() {
    return gridLine(view.bounds.topLeft, view.bounds.topRight);
}

function loadStrokes() {
    console.log(localStorage.strokes);
    strokeHistory = JSON.parse(localStorage.strokes);
    if (strokeHistory == null) {
        strokeHistory = [];
    }
    for (var stroke in strokeHistory) {
        st = strokeHistory[stroke];
        var sta = new Point(st[0], st[1]);
        var end = new Point(st[2], st[3]);
        var c = makeChannel(sta, end);
        strokes.push(c);
    }
}

function saveStrokes() {
    localStorage.setItem("strokes", JSON.stringify(strokeHistory));
    //console.log(localStorage.strokes);
}

function removeLastStroke() {
    var last;
    if (strokes.length > 1) {
        last = strokes.pop();
        strokeHistory.pop();
    } else if (strokes.length == 1) {
        last = strokes[0];
    }
    if (last) {
        last.remove();
    }
    saveStrokes();
}

function onKeyDown(event) {
    // When a key is pressed, set the content of the text item:
    if (event.key.charCodeAt(0) == 26) {
        removeLastStroke();
        console.log("removing stroke");
    }
}

function XOR(bool1, bool2) {
    if (bool1 && !bool2 || bool2 && !bool1) {
        return true;
    } else {
        return false;
    }
}

function highlightTarget(target) {
    highlightGroup.removeChildren();
    var highlight = new Path.Circle(target, 15);
    highlight.fillColor = "purple";
    highlight.opacity = 0.5;
    highlight.parent = highlightGroup;
    highlight.removeOnMove();
}

function onMouseMove(event) {
    selectStroke(event);
    highlightTarget(targetHandler(event));
}

function getTarget(point, snap, sharp, hit) {
    var start = arguments[4] === undefined ? null : arguments[4];

    //first snap the target point to x/y if sharp corners are enforced
    if (start && sharp) {
        point = snapXY(start, point);
    }

    var hitResult = project.hitTest(point, hitOptions);

    if (!hitResult || !hit) {
        if (snap) {
            return snapToGrid(point, gridSize);
        } else {
            return point;
        }
    } else {
        if (snap) {
            var snapPoint = snapToGrid(point, gridSize);
            var snapResult = project.hitTest(snapPoint, hitOptions);
            if (snapResult) {
                return snapResult.point;
            } else {
                return hitResult.point;
            }
        } else {
            return hitResult.point;
        }
    }
}

function targetHandler(event) {
    var snapGrid = XOR(event.modifiers.control, forceSnap);
    var sharpCorners = XOR(event.modifiers.shift, forceSharpCorners);
    var hitStrokes = XOR(event.modifiers.option, forceHit);
    var point = event.point;
    return getTarget(point, snapGrid, sharpCorners, hitStrokes, start);
}

function onMouseDown(event) {
    start = targetHandler(event);
    if (current_stroke) {
        current_stroke.selected = false;
        current_stroke = null;
    }
}

function selectStroke(event) {
    project.activeLayer.selected = false;
    if (event.item && event.item != background) {
        event.item.selected = true;
    }
}

function hitTestAll(point) {
    var hitResult = project.hitTest(point, hitOptions);
    if (hitResult) {
        console.log(hitResult.type);
    }
}

function showIntersections(path1, path2) {
    var intersections = path1.getIntersections(path2);
    for (var i = 0; i < intersections.length; i++) {
        var c = new Path.Circle({
            center: intersections[i].point,
            radius: 5,
            fillColor: "#009dec",
            parent: intersectionGroup
        }).removeOnMove();
    }
}

function clearStroke() {
    if (current_stroke) {
        current_stroke.remove();
    }
}

function channel(start, end, width) {
    var color = arguments[3] === undefined ? "purple" : arguments[3];

    start = new Point(start[0], start[1]);
    end = new Point(end[0], end[1]);
    var s = makeRoundedLine(start, end, width);
    var c1 = new Path.Circle(start, width / 2);
    var c2 = new Path.Circle(end, width / 2);
    var l = new makeGuideLine(start, end);
    var g = new Group([s, c1, c2, l]);
    g.start = start;
    g.end = end;
    g.fillColor = color;
    g.strokeColor = color;
    view.update(true);
    return g;
}

function makeChannel(start, end) {
    var s = makeRoundedLine(start, end, width);

    var c1 = new Path.Circle(start, cornerWidth);
    c1.fillColor = "black";
    var c2 = new Path.Circle(end, cornerWidth);
    c2.fillColor = "black";
    var l = makeGuideLine(start, end);

    var g = new Group([s, c1, c2, l]);
    g.start = start;
    g.end = end;

    return g;
}

function snapToGrid(target, gridSize) {
    var newTarget = new Point();
    newTarget.x = Math.round(target.x / gridSize) * gridSize;
    newTarget.y = Math.round(target.y / gridSize) * gridSize;
    return newTarget;
}

function makeGuideLine(start, end) {
    var l = new Path.Line(start, end);
    l.strokeWidth = 1;
    l.strokeColor = "none";
    return l;
}

function makeHollowLine(start, end) {
    var l1 = makeLine(start, end, width);
    var l2 = makeLine(start, end, width / 2);
    return new CompoundPath({
        children: [l1, l2],
        fillColor: "black"
    });
}

function makeRoundedLine(start, end, thickness) {
    /*
    var l = new Path.Line(start, end);
    l.strokeColor = 'black';
    l.strokeWidth = width;
    return l;
    */
    var vec = end.subtract(start);
    var rec = new Path.Rectangle({
        size: [vec.length, thickness],
        point: start,
        fillColor: "black"
    });
    rec.translate([0, -thickness / 2]);
    rec.rotate(vec.angle, start);
    return rec;
}

function snapXY(start, end) {
    var vec = start.subtract(end);
    if (Math.abs(vec.x) > Math.abs(vec.y)) {
        vec.y = 0;
    } else {
        vec.x = 0;
    }
    return start.subtract(vec);

    //loadStrokes()
}

function changeZoom(oldZoom, delta) {
    var factor = 1.05;
    if (delta < 0) {
        return oldZoom * factor;
    }
    if (delta > 0) {
        return oldZoom / factor;
    }
    return oldZoom;
}

function changeZoomStable(oldZoom, delta, c, p) {
    var newZoom = changeZoom(oldZoom, delta);
    var beta = oldZoom / newZoom;
    var pc = p.subtract(c);
    var a = p.subtract(pc.multiply(beta)).subtract(c);
    return [newZoom, a];
}

function changeCenter(oldCenter, deltaX, deltaY, factor) {
    var offset = new paper.Point(deltaX, -deltaY);
    offset = offset.multiply(factor);
    oldCenter.add(offset);
}

exports.setup = setup;
exports.channel = channel;
exports.changeZoom = changeZoom;
exports.changeCenter = changeCenter;

},{}],10:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var uFab = require('./3DuFCore');
var Module = require('./Module').Module;

var Transposer = (function (_Module) {
	function Transposer(featureDefaults, transposerParams) {
		_classCallCheck(this, Transposer);

		_get(Object.getPrototypeOf(Transposer.prototype), 'constructor', this).call(this, featureDefaults);
		this.transposerParams = transposerParams;
		this.makeFeatures();
	}

	_inherits(Transposer, _Module);

	_createClass(Transposer, [{
		key: 'refresh',
		value: function refresh() {
			this.clearFeatures();
			this.makeFeatures();
		}
	}, {
		key: 'clearFeatures',
		value: function clearFeatures() {
			for (var feature in this.features) {
				this.features[feature].destroy();
			}
			this.features = [];
		}
	}, {
		key: 'makeFeatures',
		value: function makeFeatures() {
			this.updateValues();
			this.makeValves();
			this.makeVias();
			this.makeChannels();
			this.makePneumaticChannels();
			this.makePorts();
		}
	}, {
		key: 'makeValves',
		value: function makeValves() {
			var x = this.xValues;
			var y = this.yValues;
			var positions = [[x.valveMid, y.flowBot], [x.valveLeft, y.valveLow], [x.valveRight, y.valveLow], [x.valveLeft, y.valveHigh], [x.valveMid, y.valveTop], [x.valveRight, y.valveHigh]];

			for (var pos in positions) {
				var v = this.makeValve(positions[pos]);
				this.features.push(v);
				this.transposerParams.controlLayer.addFeature(v);
			}
		}
	}, {
		key: 'makeVias',
		value: function makeVias() {
			var x = this.xValues;
			var y = this.yValues;
			var positions = [[x.valveLeft, y.pneuMid], [x.valveRight, y.pneuMid]];

			for (var pos in positions) {
				var v = this.makeVia(positions[pos]);
				this.features.push(v);
				this.transposerParams.flowLayer.addFeature(v);
			}
		}
	}, {
		key: 'makePorts',
		value: function makePorts() {
			var x = this.xValues;
			var y = this.yValues;

			var viaLeft = [x.valveLeft, y.pneuMid];
			var viaRight = [x.valveRight, y.pneuMid];

			var v1 = this.makePort(viaLeft);
			var v2 = this.makePort(viaRight);
			this.features.push(v1);
			this.transposerParams.controlLayer.addFeature(v1);
			this.features.push(v2);
			this.transposerParams.controlLayer.addFeature(v2);
		}
	}, {
		key: 'makeChannels',
		value: function makeChannels() {
			var x = this.xValues;
			var y = this.yValues;

			var fBotLeft = [x.flowLeft, y.flowBot];
			var fBotRight = [x.flowRight, y.flowBot];
			var fTopLeft = [x.flowLeft, y.valveTop];
			var fTopRight = [x.flowRight, y.valveTop];
			var fBotValveLeft = [x.valveLeft, y.flowBot];
			var fBotValveRight = [x.valveRight, y.flowBot];
			var fTopValveLeft = [x.valveLeft, y.valveTop];
			var fTopValveRight = [x.valveRight, y.valveTop];
			var fLowerValveLeft = [x.valveLeft, y.valveLow];
			var fLowerValveRight = [x.valveRight, y.valveLow];
			var fUpperValveLeft = [x.valveLeft, y.valveHigh];
			var fUpperValveRight = [x.valveRight, y.valveHigh];
			var fLowerMid = [x.valveMid, y.valveLow];
			var fUpperMid = [x.valveMid, y.valveHigh];
			var viaLeft = [x.valveLeft, y.pneuMid];
			var viaRight = [x.valveRight, y.pneuMid];

			var positionPairs = [[fBotLeft, fBotRight], [fTopLeft, fTopRight], [fBotValveLeft, viaLeft], [fTopValveRight, viaRight], [fTopValveLeft, fUpperValveLeft], [fUpperValveLeft, fUpperMid], [fUpperMid, fLowerMid], [fLowerMid, fLowerValveRight], [fLowerValveRight, fBotValveRight]];

			for (var pos in positionPairs) {
				var start = positionPairs[pos][0];
				var end = positionPairs[pos][1];
				var f = this.makeChannel(start, end);
				this.features.push(f);
				this.transposerParams.flowLayer.addFeature(f);
			}

			var f = this.makeChannel(viaLeft, viaRight);
			this.features.push(f);
			this.transposerParams.controlLayer.addFeature(f);
		}
	}, {
		key: 'makePneumaticChannels',
		value: function makePneumaticChannels() {
			var x = this.xValues;
			var y = this.yValues;

			var vBot = [x.valveMid, y.flowBot];
			var vBelow = [x.valveMid, y.pneuBot];
			var pBotLeft = [x.pneuLeft, y.pneuBot];
			var pTopLeft = [x.pneuLeft, y.pneuTop];
			var pTopMid = [x.valveMid, y.pneuTop];
			var vTopMid = [x.valveMid, y.valveTop];
			var pExitMid = [x.valveMid, y.exitTop];
			var pExitRight = [x.pneuRight, y.exitTop];
			var vTopLeft = [x.valveLeft, y.valveHigh];
			var pTopRight = [x.pneuRight, y.valveHigh];
			var vBotLeft = [x.valveLeft, y.valveLow];
			var pBotRight = [x.pneuRight, y.valveLow];

			var positionPairs = [[vBot, vBelow], [vBelow, pBotLeft], [pBotLeft, pTopLeft], [pTopLeft, pTopMid], [vTopMid, pExitMid], [pExitRight, pBotRight], [vTopLeft, pTopRight], [vBotLeft, pBotRight]];

			for (var pos in positionPairs) {
				var start = positionPairs[pos][0];
				var end = positionPairs[pos][1];
				var p = this.makePneumaticChannel(start, end);
				this.features.push(p);
				this.transposerParams.controlLayer.addFeature(p);
			}
		}
	}, {
		key: 'updateValues',
		value: function updateValues() {
			this.xValues = this.computeXValues();
			this.yValues = this.computeYValues();
		}
	}, {
		key: 'computeXValues',
		value: function computeXValues() {
			var pneuWidth = this.featureDefaults.PneumaticChannel.width / 2;
			var valveWidth = this.featureDefaults.CircleValve.radius1;
			var buff = this.transposerParams.buffer;

			var flowLeft = this.transposerParams.position[0];
			var pneuLeft = flowLeft + pneuWidth + buff;
			var valveLeft = pneuLeft + pneuWidth + buff + valveWidth;
			var valveMid = valveLeft + buff + valveWidth * 2;
			var valveRight = valveMid + buff + valveWidth * 2;
			var pneuRight = valveRight + valveWidth + buff + pneuWidth;
			var flowRight = pneuRight + pneuWidth + buff;

			return {
				'flowLeft': flowLeft,
				'pneuLeft': pneuLeft,
				'valveLeft': valveLeft,
				'valveMid': valveMid,
				'valveRight': valveRight,
				'pneuRight': pneuRight,
				'flowRight': flowRight
			};
		}
	}, {
		key: 'computeYValues',
		value: function computeYValues() {
			var pneuWidth = this.featureDefaults.PneumaticChannel.width / 2;
			var valveWidth = this.featureDefaults.CircleValve.radius1;
			var flowWidth = this.featureDefaults.Channel.width / 2;
			var viaWidth = this.featureDefaults.Via.radius1;
			var portWidth = this.featureDefaults.Port.radius;
			var buff = this.transposerParams.buffer;

			var flowBot = this.transposerParams.position[1];
			var pneuBot = flowBot - valveWidth - buff - pneuWidth;
			var valveLow = flowBot + valveWidth + buff + pneuWidth;
			var pneuMid = valveLow + valveWidth + buff + viaWidth;
			var valveHigh = pneuMid + viaWidth + buff + valveWidth;
			var valveTop = valveHigh + valveWidth + buff + pneuWidth;
			var pneuTop = valveTop + valveWidth + buff + pneuWidth;
			var exitTop = pneuTop + pneuWidth + buff;

			var pos = {
				'flowBot': flowBot,
				'pneuBot': pneuBot,
				'valveLow': valveLow,
				'pneuMid': pneuMid,
				'valveHigh': valveHigh,
				'valveTop': valveTop,
				'pneuTop': pneuTop,
				'exitTop': exitTop
			};

			return pos;
		}
	}, {
		key: 'makePort',
		value: function makePort(position) {
			return new Port({
				'position': position,
				'radius': this.featureDefaults.Port.radius,
				'height': this.featureDefaults.Port.height
			});
		}
	}, {
		key: 'makeValve',
		value: function makeValve(position) {
			return new CircleValve({
				'position': position,
				'radius1': this.featureDefaults.CircleValve.radius1,
				'radius2': this.featureDefaults.CircleValve.radius2,
				'height': this.featureDefaults.CircleValve.height
			});
		}
	}, {
		key: 'makeChannel',
		value: function makeChannel(start, end) {
			return new Channel({
				'start': start,
				'end': end,
				'width': this.featureDefaults.Channel.width,
				'height': this.featureDefaults.Channel.height
			});
		}
	}, {
		key: 'makePneumaticChannel',
		value: function makePneumaticChannel(start, end) {
			return new Channel({
				'start': start,
				'end': end,
				'width': this.featureDefaults.PneumaticChannel.width,
				'height': this.featureDefaults.PneumaticChannel.height
			});
		}
	}, {
		key: 'makeVia',
		value: function makeVia(position) {
			return new Via({
				'position': position,
				'height': this.featureDefaults.Via.height,
				'radius1': this.featureDefaults.Via.radius1,
				'radius2': this.featureDefaults.Via.radius2
			});
		}
	}]);

	return Transposer;
})(Module);

exports.Transposer = Transposer;

},{"./3DuFCore":1,"./Module":2}],11:[function(require,module,exports){
// Run: watchify transposerTest.js -t babelify -v --outfile "../../demos/transposer/transposerAppDemo.js

'use strict';

var uFab = require('./3DuFCore');
var handlers = require('./handlers');
var featureLoader = require('./featureLoader');
var uFabCanvas = require('./fabricFunctions').uFabCanvas;
var Transposer = require('./transposerModule').Transposer;

document.getElementById('c').width = document.getElementById('canvas_block').clientWidth;
document.getElementById('c').height = document.getElementById('canvas_block').clientHeight;
var canvas = new uFabCanvas('c');

var Device = uFab.Device;
var Layer = uFab.Layer;

var dev = new Device({
    width: 75.8,
    height: 51,
    ID: 'test_device'
});
var flow = new Layer({
    z_offset: 0,
    color: 'blue',
    ID: 'flow'
});
var control = new Layer({
    z_offset: 1.4,
    color: 'red',
    ID: 'control'
});

var featureDefaults = {
    Channel: {
        height: 0.2,
        width: 0.21
    },
    PneumaticChannel: {
        height: 0.4,
        width: 0.4
    },
    Via: {
        height: 1,
        radius1: 0.8,
        radius2: 0.7
    },
    CircleValve: {
        height: 0.9,
        radius1: 1.4,
        radius2: 1.2 },
    Port: {
        height: 0.4,
        radius: 0.7
    }
};

var transposerParams = {
    position: [dev.width / 2, dev.height],
    buffer: 0.5,
    flowLayer: flow,
    controlLayer: control
};

var transposerParams2 = {
    position: [dev.width / 2 - 20, dev.height],
    buffer: 0.5,
    flowLayer: flow,
    controlLayer: control
};

dev.addLayer(flow);
dev.addLayer(control);

var updateParam = function updateParam(list, parent, child, value) {
    list[parent][child] = Number(value);
    trans.refresh();
    trans2.refresh();
    dev.render2D();
};

featureLoader.loadDefaultFeatures();

var trans = new Transposer(featureDefaults, transposerParams);
var trans2 = new Transposer(featureDefaults, transposerParams2);

canvas.setDevice(dev);

var getSetterFunction = function getSetterFunction(params, linker, id) {
    var setterFunction = function setterFunction() {
        var link = linker[id];
        updateParam(params, link.parent, link.child, document.getElementById(id).get());
    };
    return setterFunction;
};

var makeSliders = function makeSliders(params, linker) {
    for (var param in params) {
        /* Make a container and label for each feature. */
        var container = $('<div></div>').addClass('param-slider-container');
        var string = '<h5>' + param + '</h5>';
        var label = $(string);
        label.appendTo(container);
        container.appendTo('#param-controls');

        /* For each parameter within each feature, generate a slider
        with some default parameters and attach it to the parent container. */

        for (var subparam in params[param]) {
            if (subparam != 'height' && subparam != 'radius2') {
                (function () {
                    //ignore these subparams
                    var subContainer = $('<div></div>').addClass('param-slider-subcontainer');
                    var subString = '<h6>' + subparam + '<h6>';
                    var subLabel = $(subString);
                    var subSliderID = param + subparam;
                    var subSlider = $('<div></div>');
                    subSlider.attr('id', subSliderID);
                    subLabel.appendTo(subContainer);
                    subSlider.appendTo(subContainer);
                    subContainer.appendTo(container);

                    /* Grab the HTML element by the unique subSliderID */

                    var slider = document.getElementById(subSliderID);

                    /* Initialize the slider */

                    noUiSlider.create(slider, {
                        start: params[param][subparam],
                        range: {
                            'min': 0,
                            'max': 2
                        }
                    });
                    linker[subSliderID] = {
                        params: params,
                        parent: param,
                        child: subparam
                    };

                    /* Event handlers attempt to reference each slider 
                    by its unique ID, but all point to the same variable,
                    which is overwritten by the end of the loop.*/

                    //slider.noUiSlider.on('slide', getSetterFunction(params, linker, subSliderID));
                    //slider.noUiSlider.on('change', getSetterFunction(params, linker, subSliderID));

                    var updateFromSliderValue = function updateFromSliderValue() {};

                    slider.noUiSlider.on('change', function () {
                        var thisThing = document.getElementById(subSliderID);
                        var link = linker[thisThing.id];
                        updateParam(params, link.parent, link.child, thisThing.noUiSlider.get());
                    });

                    slider.noUiSlider.on('slide', function () {
                        var thisThing = document.getElementById(subSliderID);
                        var link = linker[thisThing.id];
                        updateParam(params, link.parent, link.child, thisThing.noUiSlider.get());
                    });
                })();
            }
        }
    }
};

//$("<input id='test'/>").appendTo("#param-controls");

var links = {};

makeSliders(featureDefaults, links);

dev.render2D();

},{"./3DuFCore":1,"./fabricFunctions":4,"./featureLoader":5,"./handlers":8,"./transposerModule":10}]},{},[11]);
