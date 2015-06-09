(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var uFab = require('./uFab');

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

},{"./uFab":7}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

var uFab = require('./uFab');
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

},{"./defaultFeatures.js":2,"./handlers":5,"./uFab":7}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var uFabUtils = require('./uFabUtils.js');

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
				top: params.position[1],
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
				position: [left, top],
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
				top: params.position[1],
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

	_inherits(uFabTwoPointRect, _fabric$Rect2);

	_createClass(uFabTwoPointRect, [{
		key: '__computePositionalState',
		value: function __computePositionalState(start, end) {
			return {
				left: start[0],
				top: start[1],
				length: uFabUtils.computeDistanceBetweenPoints(start, end),
				angle: uFabUtils.computeAngleFromPoints(start, end)
			};
		}
	}, {
		key: 'setState',
		value: function setState(params) {
			var posState = this.__computePositionalState(params.start, params.end);
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
				start: [left, top],
				end: [eLeft, eTop],
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

},{"./uFabUtils.js":9}],5:[function(require,module,exports){
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

},{"./features2D.js":4}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var uFab = require('./uFab');
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
		key: 'makeFeatures',
		value: function makeFeatures() {
			this.updateValues();
			this.makeValves();
			this.makeVias();
			this.makeChannels();
			this.makePneumaticChannels();
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
		key: 'makeChannels',
		value: function makeChannels() {}
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
			var pExitMid = [x.valveMid, y.pneuExit];
			var pExitRight = [x.pneuRight, y.pneuExit];
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
			var buff = this.transposerParams.buffer;

			var flowBot = this.transposerParams.position[0];
			var pneuBot = flowBot - valveWidth - buff - pneuWidth;
			var valveLow = valveWidth + buff + pneuWidth;
			var pneuMid = valveLow + valveWidth + buff + viaWidth;
			var valveHigh = pneuMid + pneuWidth + buff + valveWidth;
			var valveTop = valveHigh + valveWidth + buff + pneuWidth;
			var pneuTop = valveTop + valveWidth + buff + pneuWidth;
			var exitTop = pneuTop + buff;

			return {
				'flowBot': flowBot,
				'pneuBot': pneuBot,
				'valveLow': valveLow,
				'pneuMid': pneuMid,
				'valveHigh': valveHigh,
				'valveTop': valveTop,
				'pneuTop': pneuTop,
				'exitTop': exitTop
			};
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

//TODO: Make the flow channels!
// Don't forget that these go in two different layers!

},{"./Module":1,"./uFab":7}],7:[function(require,module,exports){
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
		this.features = [];
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
		key: 'addFeature',
		value: function addFeature(feature) {
			feature.layer = this;
			this.features.push(feature);
			this.device.__addFeature(feature);
			return feature;
		}
	}, {
		key: 'featuresToJSON',
		value: function featuresToJSON() {
			var data = [];
			for (var feature in this.features) {
				data.push(this.features[feature].ID);
			}
			return data;
		}
	}, {
		key: 'render2D',
		value: function render2D() {
			for (var feature in this.features) {
				this.features[feature].render2D();
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

},{}],8:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var uFab = require('./uFab');

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
	}

	_inherits(uFabCanvas, _fabric$CanvasWithViewport);

	_createClass(uFabCanvas, [{
		key: 'setDevice',
		value: function setDevice(device) {
			this.device = device;
			this.resetZoom();
			this.resetViewPosition();
		}
	}, {
		key: 'resetViewPosition',
		value: function resetViewPosition() {
			this.viewport.position = new fabric.Point(this.DEVICE_MARGIN_X, this.DEVICE_MARGIN_Y);
		}
	}, {
		key: 'increaseZoom',
		value: function increaseZoom(zoom) {
			setZoom(this.viewport.zoom * 1.1);
		}
	}, {
		key: 'decreaseZoom',
		value: function decreaseZoom() {
			setZoom(this.viewport.zoom * 0.9);
		}
	}, {
		key: 'setZoom',
		value: function setZoom(zoom) {
			this.viewport.zoom = zoom;
		}
	}, {
		key: 'resetZoom',
		value: function resetZoom() {
			setZoom(this.computeOptimalZoom());
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

},{"./uFab":7}],9:[function(require,module,exports){
'use strict';

var degToRad = function degToRad(degrees) {
	return degrees / 180 * Math.PI;
};

var radToDeg = function radToDeg(radians) {
	return radians * 180 / Math.PI;
};

var computeAngleFromPoints = function computeAngleFromPoints(start, end) {
	var dX = end[0] - start[0];
	var dY = end[1] - end[0];
	return computeAngle(dX, dY);
};

var computeAngle = function computeAngle(dX, dY) {
	return radToDeg(Math.atan2(dX, dY));
};

var computeDistanceBetweenPoints = function computeDistanceBetweenPoints(start, end) {
	return computeDistance(end[1] - end[0], start[1] - start[0]);
};

var computeDistance = function computeDistance(dX, dY) {
	return Math.sqrt(Math.pow(dX, 2), Math.pow(dY, 2));
};

var computeEndPoint = function computeEndPoint(start, angle, length) {
	var rad = degToRad(angle);
	dX = length * Math.cos(rad);
	dY = length * Math.sin(rad);
	return [start[0] + dX, start[1] + dY];
};

exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.computeAngleFromPoints = computeAngleFromPoints;
exports.computeAngle = computeAngle;
exports.computeDistance = computeDistance;
exports.computeDistanceBetweenPoints = computeDistanceBetweenPoints;
exports.computeEndPoint = computeEndPoint;

},{}],10:[function(require,module,exports){
//watchify uFab_test.js -t babelify -v --outfile bundle.js
//watchify uFab_test.js -t babelify -v --outfile ../../renderer/static/js/uFabApp.js

'use strict';

var uFab = require('./uFab');
var handlers = require('./handlers');
var featureLoader = require('./featureLoader');
var uFabCanvas = require('./uFabCanvas').uFabCanvas;
var Transposer = require('./transposerModule').Transposer;

document.getElementById('c').width = document.getElementById('canvas_block').clientWidth;
document.getElementById('c').height = document.getElementById('canvas_block').clientHeight;
var canvas = new uFabCanvas('c');

var Device = uFab.Device;
var Layer = uFab.Layer;

var dev = new Device({ height: 50, width: 100, ID: 'test_device' });
dev.canvas = canvas;
var flow = new Layer({ z_offset: 0, color: 'blue', ID: 'flow' });
var control = new Layer({ z_offset: 1.4, color: 'red', ID: 'control' });

var featureDefaults = {
	Channel: {
		height: 0.2,
		width: 0.41
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
		radius2: 1.2
	}
};

var transposerParams = {
	position: [50, 50],
	buffer: 1,
	flowLayer: flow,
	controlLayer: control
};

dev.addLayer(flow);
dev.addLayer(control);

featureLoader.loadDefaultFeatures();

var trans = new Transposer(featureDefaults, transposerParams);

/*
var valve = new CircleValve({
	position: [100, 50],
	radius1: 30,
	radius2: 40,
	height: 5});

var foo = new Port({
	position: [200,10],
	radius: 10,
	height: 5});

var bar = new Channel({
	start: [200, 50],
	end: [200, 30],
	height: 5,
	width: 20});

flow.addFeature(foo);
flow.addFeature(bar);
flow.addFeature(valve);

console.log(valve);

*/

dev.render2D();

},{"./featureLoader":3,"./handlers":5,"./transposerModule":6,"./uFab":7,"./uFabCanvas":8}]},{},[10]);
