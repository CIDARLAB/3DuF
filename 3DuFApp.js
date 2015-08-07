(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
 

  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],2:[function(require,module,exports){
"use strict";

var CanvasManager = require("./graphics/CanvasManager");
//var CanvasManager = require("./graphics/CanvasManager");
var Registry = require("./core/registry");
var Device = require('./core/device');
var Layer = require('./core/layer');
var Features = require('./core/features');
var PaperView = require("./view/paperView");
var ViewManager = require("./view/viewManager");
var AdaptiveGrid = require("./view/grid/adaptiveGrid");
var PageSetup = require("./view/pageSetup");
var Colors = require("./view/colors");

var Channel = Features.Channel;
var CircleValve = Features.CircleValve;
var HollowChannel = Features.HollowChannel;

var manager;
var view;
var viewManager;
var grid;

var dev = new Device({
    "width": 75.8 * 1000,
    "height": 51 * 1000
}, "My Device");
var flow = new Layer({
    "z_offset": 0,
    "flip": false
}, "flow");
var control = new Layer({
    "z_offset": 1.2 * 1000,
    "flip": true
}, "control");
dev.addLayer(flow);
dev.addLayer(control);
var chan1 = new Channel({
    "start": [20 * 1000, 20 * 1000],
    "end": [40 * 1000, 40 * 1000]
});
flow.addFeature(chan1);
var circ1 = new CircleValve({
    "position": [30 * 1000, 30 * 1000]
});
control.addFeature(circ1);
var chan2 = new Channel({
    "start": [25 * 1000, 20 * 1000],
    "end": [45 * 1000, 40 * 1000],
    "width": 10
});
flow.addFeature(chan2);

paper.setup("c");

flow.setColor("indigo");
control.setColor("red");

window.onload = function () {
    manager = new CanvasManager(document.getElementById("c"));
    view = new PaperView(document.getElementById("c"));
    viewManager = new ViewManager(view);
    grid = new AdaptiveGrid();

    Registry.viewManager = viewManager;

    manager.loadDeviceFromJSON(dev.toJSON());

    viewManager.updateGrid();
    Registry.currentDevice.updateView();

    window.dev = Registry.currentDevice;
    window.Channel = Channel;
    window.man = manager;
    window.Features = Features;
    window.Registry = Registry;

    PageSetup.setupAppPage();
};

},{"./core/device":3,"./core/features":10,"./core/layer":12,"./core/registry":21,"./graphics/CanvasManager":22,"./view/colors":35,"./view/grid/adaptiveGrid":45,"./view/pageSetup":46,"./view/paperView":48,"./view/viewManager":55}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Params = require("./params");
var Parameters = require("./parameters");
var Parameter = require("./parameter");
var Feature = require('./feature');
var Layer = require('./layer');
var Group = require('./group');
var Registry = require("./registry");

var StringValue = Parameters.StringValue;
var FloatValue = Parameters.FloatValue;

/* The Device stores information about a design. */

var Device = (function () {
    function Device(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New Device" : arguments[1];

        _classCallCheck(this, Device);

        this.defaults = {};
        this.layers = [];
        this.groups = [];
        this.params = new Params(values, Device.getUniqueParameters(), Device.getHeritableParameters());
        this.name = new StringValue(name);
    }

    _createClass(Device, [{
        key: "setName",
        value: function setName(name) {
            this.name = new StringValue(name);
            this.updateView();
        }
    }, {
        key: "updateParameter",
        value: function updateParameter(key, value) {
            this.params.updateParameter(key, value);
            this.updateView();
        }

        /* Sort the layers such that they are ordered from lowest to highest z_offset. */
    }, {
        key: "sortLayers",
        value: function sortLayers() {
            this.layers.sort(function (a, b) {
                return a.params.getValue("z_offset") - b.params.getValue("z_offset");
            });
        }
    }, {
        key: "getLayerFromFeatureID",
        value: function getLayerFromFeatureID(featureID) {
            for (var i = 0; i < this.layers.length; i++) {
                var layer = this.layers[i];
                if (layer.containsFeatureID(featureID)) {
                    return layer;
                }
            }
            throw new Error("FeatureID " + featureID + " not found in any layer.");
        }
    }, {
        key: "getFeatureByID",
        value: function getFeatureByID(featureID) {
            var layer = this.getLayerFromFeatureID(featureID);
            return layer.getFeature(featureID);
        }

        /* Add a layer, and re-sort the layers array.*/
    }, {
        key: "addLayer",
        value: function addLayer(layer) {
            layer.device = this;
            this.layers.push(layer);
            this.sortLayers();
            if (Registry.viewManager) Registry.viewManager.addLayer(this.layers.indexOf(layer));
        }
    }, {
        key: "removeFeature",
        value: function removeFeature(feature) {
            this.removeFeatureByID(feature.id);
        }
    }, {
        key: "removeFeatureByID",
        value: function removeFeatureByID(featureID) {
            var layer = this.getLayerFromFeatureID(featureID);
            layer.removeFeatureByID(featureID);
        }
    }, {
        key: "addGroup",
        value: function addGroup(group) {
            this.groups.push(group);
            //TODO: Check to make sure that's OK!
        }
    }, {
        key: "addDefault",
        value: function addDefault(def) {
            this.defaults.push(def);
            //TODO: Establish what defaults are. Params?
        }
    }, {
        key: "updateViewLayers",
        value: function updateViewLayers() {
            if (Registry.viewManager) Registry.viewManager.updateLayers(this);
        }
    }, {
        key: "updateView",
        value: function updateView() {
            if (Registry.viewManager) Registry.viewManager.updateDevice(this);
        }
    }, {
        key: "__renderLayers2D",
        value: function __renderLayers2D() {
            var output = [];
            for (var i = 0; i < this.layers.length; i++) {
                output.push(this.layers[i].render2D());
            }
            return output;
        }
    }, {
        key: "__groupsToJSON",
        value: function __groupsToJSON() {
            var output = [];
            for (var i in this.groups) {
                output.push(this.groups[i].toJSON());
            }
            return output;
        }
    }, {
        key: "__layersToJSON",
        value: function __layersToJSON() {
            var output = [];
            for (var i in this.layers) {
                output.push(this.layers[i].toJSON());
            }
            return output;
        }
    }, {
        key: "__loadLayersFromJSON",
        value: function __loadLayersFromJSON(json) {
            for (var i in json) {
                var newLayer = Layer.fromJSON(json[i]);
                this.addLayer(newLayer);
            }
        }

        //TODO: Figure this out!
    }, {
        key: "__loadGroupsFromJSON",
        value: function __loadGroupsFromJSON(json) {}
        /*
        for (let i in json){
            this.addGroup(Group.fromJSON(json[i]));
        }
        */

        //TODO: Figure this out!

    }, {
        key: "__loadDefaultsFromJSON",
        value: function __loadDefaultsFromJSON(json) {}
        /*
        for(let i in json){
            this.addDefault(json[i]);
        }
        */

        //TODO: Replace Params and remove static method

    }, {
        key: "toJSON",
        value: function toJSON() {
            var output = {};
            output.name = this.name.toJSON();
            output.params = this.params.toJSON();
            output.layers = this.__layersToJSON();
            output.groups = this.__groupsToJSON();
            output.defaults = this.defaults;
            return output;
        }
    }, {
        key: "render2D",
        value: function render2D(paperScope) {
            return this.__renderLayers2D();
        }
    }], [{
        key: "getUniqueParameters",
        value: function getUniqueParameters() {
            return {
                "height": FloatValue.typeString(),
                "width": FloatValue.typeString()
            };
        }

        //TODO: Figure out whether this is ever needed
    }, {
        key: "getHeritableParameters",
        value: function getHeritableParameters() {
            return {};
        }
    }, {
        key: "fromJSON",
        value: function fromJSON(json) {
            var defaults = json.defaults;
            var newDevice = new Device({
                "width": json.params.width,
                "height": json.params.height
            }, json.name);
            newDevice.__loadLayersFromJSON(json.layers);
            newDevice.__loadGroupsFromJSON(json.groups);
            newDevice.__loadDefaultsFromJSON(json.defaults);
            return newDevice;
        }
    }]);

    return Device;
})();

module.exports = Device;

},{"./feature":4,"./group":11,"./layer":12,"./parameter":13,"./parameters":16,"./params":20,"./registry":21}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var uuid = require('node-uuid');
var Params = require('./params');
var Parameters = require('./parameters');
var StringValue = Parameters.StringValue;
var Registry = require("./registry");

var Feature = (function () {
    function Feature(type, params, name) {
        var id = arguments.length <= 3 || arguments[3] === undefined ? Feature.generateID() : arguments[3];
        var group = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];

        _classCallCheck(this, Feature);

        this.type = type;
        this.params = params;
        this.name = new StringValue(name);
        this.id = id;
        this.group = group;
        this.type = type;
    }

    _createClass(Feature, [{
        key: 'updateParameter',
        value: function updateParameter(key, value) {
            this.params.updateParameter(key, value);
            this.updateView();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var output = {};
            output.id = this.id;
            output.name = this.name.toJSON();
            output.type = this.type;
            output.params = this.params.toJSON();
            //TODO: Fix groups!
            //output.group = this.group.toJSON();
            return output;
        }

        //TODO: This needs to return the right subclass of Feature, not just the right data!
    }, {
        key: 'updateView',
        value: function updateView() {
            if (Registry.viewManager) Registry.viewManager.updateFeature(this);
        }

        //I wish I had abstract methods. :(
    }, {
        key: 'render2D',
        value: function render2D() {
            throw new Error("Base class Feature cannot be rendered in 2D.");
        }
    }], [{
        key: 'generateID',
        value: function generateID() {
            //return uuid.v1();
            return Registry.generateID();
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(json) {
            return Feature.makeFeature(json.type, json.params, json.name);
        }
    }, {
        key: 'makeFeature',
        value: function makeFeature(type, values, name) {
            if (Registry.registeredFeatures.hasOwnProperty(type)) {
                return new Registry.registeredFeatures[type](values, name);
            } else {
                throw new Error("Feature " + type + " has not been registered.");
            }
        }
    }]);

    return Feature;
})();

module.exports = Feature;

},{"./parameters":16,"./params":20,"./registry":21,"node-uuid":1}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

var CircleValve = (function (_Feature) {
    _inherits(CircleValve, _Feature);

    function CircleValve(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New CircleValve" : arguments[1];

        _classCallCheck(this, CircleValve);

        var params = new Params(values, CircleValve.getUniqueParameters(), CircleValve.getHeritableParameters());
        _get(Object.getPrototypeOf(CircleValve.prototype), 'constructor', this).call(this, CircleValve.typeString(), params, name);
    }

    _createClass(CircleValve, null, [{
        key: 'typeString',
        value: function typeString() {
            return "CircleValve";
        }
    }, {
        key: 'getUniqueParameters',
        value: function getUniqueParameters() {
            return {
                "position": PointValue.typeString()
            };
        }
    }, {
        key: 'getHeritableParameters',
        value: function getHeritableParameters() {
            return {
                "radius1": FloatValue.typeString(),
                "radius2": FloatValue.typeString(),
                "height": FloatValue.typeString()
            };
        }
    }, {
        key: 'getDefaultValues',
        value: function getDefaultValues() {
            return {
                "radius1": 1.4 * 1000,
                "radius2": 1.2 * 1000,
                "height": 1 * 1000
            };
        }
    }]);

    return CircleValve;
})(Feature);

Registry.registeredFeatures[CircleValve.typeString()] = CircleValve;

module.exports = CircleValve;

},{"../feature":4,"../parameters":16,"../params":20,"../registry":21}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Feature = require("../feature");
var Registry = require("../registry");
var Params = require("../params");
var Parameters = require("../parameters");

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

var HollowChannel = (function (_Feature) {
    _inherits(HollowChannel, _Feature);

    function HollowChannel(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New HollowChannel" : arguments[1];

        _classCallCheck(this, HollowChannel);

        var params = new Params(values, HollowChannel.getUniqueParameters(), HollowChannel.getHeritableParameters());
        _get(Object.getPrototypeOf(HollowChannel.prototype), "constructor", this).call(this, HollowChannel.typeString(), params, name);
    }

    _createClass(HollowChannel, null, [{
        key: "getUniqueParameters",
        value: function getUniqueParameters() {
            return {
                "start": PointValue.typeString(),
                "end": PointValue.typeString()
            };
        }
    }, {
        key: "getHeritableParameters",
        value: function getHeritableParameters() {
            return {
                "width": FloatValue.typeString(),
                "height": FloatValue.typeString()
            };
        }
    }, {
        key: "getDefaultValues",
        value: function getDefaultValues() {
            return {
                "width": .4 * 1000,
                "height": .1 * 1000
            };
        }
    }, {
        key: "typeString",
        value: function typeString() {
            return "HollowChannel";
        }
    }]);

    return HollowChannel;
})(Feature);

Registry.registeredFeatures[HollowChannel.typeString()] = HollowChannel;

module.exports = HollowChannel;

},{"../feature":4,"../parameters":16,"../params":20,"../registry":21}],7:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

var Port = (function (_Feature) {
    _inherits(Port, _Feature);

    function Port(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New Port" : arguments[1];

        _classCallCheck(this, Port);

        var params = new Params(values, Port.getUniqueParameters(), Port.getHeritableParameters());
        _get(Object.getPrototypeOf(Port.prototype), 'constructor', this).call(this, Port.typeString(), params, name);
    }

    _createClass(Port, null, [{
        key: 'typeString',
        value: function typeString() {
            return "Port";
        }
    }, {
        key: 'getUniqueParameters',
        value: function getUniqueParameters() {
            return {
                "position": PointValue.typeString()
            };
        }
    }, {
        key: 'getHeritableParameters',
        value: function getHeritableParameters() {
            return {
                "radius": FloatValue.typeString(),
                "height": FloatValue.typeString()
            };
        }
    }, {
        key: 'getDefaultValues',
        value: function getDefaultValues() {
            return {
                "radius1": .7 * 1000,
                "radius2": .7 * 1000,
                "height": .1 * 1000
            };
        }
    }]);

    return Port;
})(Feature);

Registry.registeredFeatures[Port.typeString()] = Port;

module.exports = Port;

},{"../feature":4,"../parameters":16,"../params":20,"../registry":21}],8:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

var Via = (function (_Feature) {
    _inherits(Via, _Feature);

    function Via(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New Via" : arguments[1];

        _classCallCheck(this, Via);

        var params = new Params(values, Via.getUniqueParameters(), Via.getHeritableParameters());
        _get(Object.getPrototypeOf(Via.prototype), 'constructor', this).call(this, Via.typeString(), params, name);
    }

    _createClass(Via, null, [{
        key: 'typeString',
        value: function typeString() {
            return "Via";
        }
    }, {
        key: 'getUniqueParameters',
        value: function getUniqueParameters() {
            return {
                "position": PointValue.typeString()
            };
        }
    }, {
        key: 'getHeritableParameters',
        value: function getHeritableParameters() {
            return {
                "radius1": FloatValue.typeString(),
                "radius2": FloatValue.typeString(),
                "height": FloatValue.typeString()
            };
        }
    }, {
        key: 'getDefaultValues',
        value: function getDefaultValues() {
            return {
                "radius1": .8 * 1000,
                "radius2": .7 * 1000,
                "height": 1 * 1000
            };
        }
    }]);

    return Via;
})(Feature);

Registry.registeredFeatures[Via.typeString()] = Via;

module.exports = Via;

},{"../feature":4,"../parameters":16,"../params":20,"../registry":21}],9:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

var Channel = (function (_Feature) {
    _inherits(Channel, _Feature);

    function Channel(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New Channel" : arguments[1];

        _classCallCheck(this, Channel);

        var params = new Params(values, Channel.getUniqueParameters(), Channel.getHeritableParameters());
        _get(Object.getPrototypeOf(Channel.prototype), 'constructor', this).call(this, Channel.typeString(), params, name);
    }

    _createClass(Channel, null, [{
        key: 'typeString',
        value: function typeString() {
            return "Channel";
        }
    }, {
        key: 'getUniqueParameters',
        value: function getUniqueParameters() {
            return {
                "start": PointValue.typeString(),
                "end": PointValue.typeString()
            };
        }
    }, {
        key: 'getHeritableParameters',
        value: function getHeritableParameters() {
            return {
                "width": FloatValue.typeString(),
                "height": FloatValue.typeString()
            };
        }
    }, {
        key: 'getDefaultValues',
        value: function getDefaultValues() {
            return {
                "width": .4 * 1000,
                "height": .1 * 1000
            };
        }
    }]);

    return Channel;
})(Feature);

Registry.registeredFeatures[Channel.typeString()] = Channel;

module.exports = Channel;

},{"../feature":4,"../parameters":16,"../params":20,"../registry":21}],10:[function(require,module,exports){
/*
var capitalizeFirstLetter = require("../../utils/stringUtils").capitalizeFirstLetter;
var requireDirectory = require('require-directory');
module.exports = requireDirectory(module, {rename: capitalizeFirstLetter});

*/
"use strict";

module.exports.Channel = require("./channel");
module.exports.CircleValve = require("./CircleValve");
module.exports.Port = require("./Port");
module.exports.Via = require("./Via");
module.exports.HollowChannel = require("./HollowChannel");

},{"./CircleValve":5,"./HollowChannel":6,"./Port":7,"./Via":8,"./channel":9}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Group = (function () {
    function Group() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? "New Group" : arguments[0];

        _classCallCheck(this, Group);

        this.parent = null;
        this.name = new values.StringValue(name);
    }

    //TODO: Write code for handling groups and decide on a data model!
    //TODO: Replace Params with non-static method.

    _createClass(Group, [{
        key: "toJSON",
        value: function toJSON() {
            var output = {};
            output.name = this.name;
            //output.parent should be an index, but that won't work for this internal method!
            return output;
        }

        //TODO: fromJSON()
    }]);

    return Group;
})();

module.exports = Group;

},{}],12:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Params = require('./params');
var Parameters = require('./parameters');
var Feature = require('./feature');
var Registry = require("./registry");

var FloatValue = Parameters.FloatValue;
var BooleanValue = Parameters.BooleanValue;
var StringValue = Parameters.StringValue;

var Layer = (function () {
    function Layer(values) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? "New Layer" : arguments[1];

        _classCallCheck(this, Layer);

        this.params = new Params(values, Layer.getUniqueParameters(), Layer.getHeritableParameters());
        this.name = new StringValue(name);
        this.features = {};
        this.featureCount = 0;
        this.device = undefined;
        this.color = undefined;
    }

    _createClass(Layer, [{
        key: 'addFeature',
        value: function addFeature(feature) {
            this.__ensureIsAFeature(feature);
            this.features[feature.id] = feature;
            this.featureCount += 1;
            feature.layer = this;
            if (Registry.viewManager) Registry.viewManager.addFeature(feature);
        }
    }, {
        key: 'updateParameter',
        value: function updateParameter(key, value) {
            this.params.updateParameter(key, value);
            if (Registry.viewManager) Registry.viewManager.updateLayer(this);
        }
    }, {
        key: 'setColor',
        value: function setColor(layerColor) {
            this.color = layerColor;
            if (Registry.viewManager) Registry.viewManager.updateLayer(this);
        }
    }, {
        key: 'getIndex',
        value: function getIndex() {
            if (this.device) return this.device.layers.indexOf(this);
        }
    }, {
        key: 'estimateLayerHeight',
        value: function estimateLayerHeight() {
            var dev = this.device;
            var flip = this.params.getValue("flip");
            var offset = this.params.getValue("z_offset");
            if (dev) {
                var thisIndex = this.getIndex();
                var targetIndex = undefined;
                if (flip) targetIndex = thisIndex - 1;else targetIndex = thisIndex + 1;
                if (thisIndex >= 0 || thisIndex <= dev.layers.length - 1) {
                    var targetLayer = dev.layers[targetIndex];
                    return Math.abs(offset - targetLayer.params.getValue("z_offset"));
                } else {
                    if (thisIndex - 1 >= 0) {
                        var targetLayer = dev.layers[thisIndex - 1];
                        return targetLayer.estimateLayerHeight();
                    }
                }
            }
            return 0;
        }
    }, {
        key: '__ensureIsAFeature',
        value: function __ensureIsAFeature(feature) {
            if (!(feature.hasOwnProperty("id") && feature.hasOwnProperty("type") && feature.hasOwnProperty("params"))) {
                console.log(feature.toJSON());
                throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
            }
        }
    }, {
        key: '__ensureFeatureExists',
        value: function __ensureFeatureExists(feature) {
            if (!this.containsFeature(feature)) throw new Error("Layer does not contain the specified feature!");
        }
    }, {
        key: '__ensureFeatureIDExists',
        value: function __ensureFeatureIDExists(featureID) {
            if (!this.containsFeatureID(featureID)) throw new Error("Layer does not contain a feature with the specified ID!");
        }
    }, {
        key: 'getFeature',
        value: function getFeature(featureID) {
            this.__ensureFeatureIDExists(featureID);
            return this.features[featureID];
        }
    }, {
        key: 'removeFeature',
        value: function removeFeature(feature) {
            this.removeFeatureByID(feature.id);
        }

        //TODO: Stop using delete, it's slow!
    }, {
        key: 'removeFeatureByID',
        value: function removeFeatureByID(featureID) {
            this.__ensureFeatureIDExists(featureID);
            var feature = this.features[featureID];
            this.featureCount -= 1;
            if (Registry.viewManager) Registry.viewManager.removeFeature(feature);
            delete this.features[featureID];
        }
    }, {
        key: 'containsFeature',
        value: function containsFeature(feature) {
            this.__ensureIsAFeature(feature);
            return this.features.hasOwnProperty(feature.id);
        }
    }, {
        key: 'containsFeatureID',
        value: function containsFeatureID(featureID) {
            return this.features.hasOwnProperty(featureID);
        }
    }, {
        key: '__renderFeatures2D',
        value: function __renderFeatures2D() {
            var output = [];
            for (var i in this.features) {
                output.push(this.features[i].render2D());
            }
            return output;
        }
    }, {
        key: '__featuresToJSON',
        value: function __featuresToJSON() {
            var output = {};
            for (var i in this.features) {
                output[i] = this.features[i].toJSON();
            }
            return output;
        }
    }, {
        key: '__loadFeaturesFromJSON',
        value: function __loadFeaturesFromJSON(json) {
            for (var i in json) {
                this.addFeature(Feature.fromJSON(json[i]));
            }
        }

        //TODO: Replace Params and remove static method
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var output = {};
            output.name = this.name.toJSON();
            output.color = this.color;
            output.params = this.params.toJSON();
            output.features = this.__featuresToJSON();
            return output;
        }
    }, {
        key: 'render2D',
        value: function render2D(paperScope) {
            return this.__renderFeatures2D();
        }
    }], [{
        key: 'getUniqueParameters',
        value: function getUniqueParameters() {
            return {
                "z_offset": FloatValue.typeString(),
                "flip": BooleanValue.typeString()
            };
        }

        //TODO: Figure out whether this is ever needed
    }, {
        key: 'getHeritableParameters',
        value: function getHeritableParameters() {
            return {};
        }
    }, {
        key: 'fromJSON',
        value: function fromJSON(json) {
            if (!json.hasOwnProperty("features")) {
                throw new Error("JSON layer has no features!");
            }
            var newLayer = new Layer(json.params, json.name);
            newLayer.__loadFeaturesFromJSON(json.features);
            if (json.color) newLayer.color = json.color;
            return newLayer;
        }
    }]);

    return Layer;
})();

module.exports = Layer;

},{"./feature":4,"./parameters":16,"./params":20,"./registry":21}],13:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("./registry");

var Parameter = (function () {
    function Parameter(type, value) {
        _classCallCheck(this, Parameter);

        this.type = type;
        this.value = value;
    }

    _createClass(Parameter, [{
        key: "toJSON",
        value: function toJSON() {
            return this.value;
        }
    }, {
        key: "updateValue",
        value: function updateValue(value) {
            if (Registry.registeredParams[this.type].isInvalid(value)) throw new Error("Input value " + value + "does not match the type: " + this.type);else this.value = value;
        }
    }], [{
        key: "registerParamType",
        value: function registerParamType(type, func) {
            Registry.registeredParams[type] = func;
        }
    }, {
        key: "makeParam",
        value: function makeParam(type, value) {
            if (Registry.registeredParams.hasOwnProperty(type)) {
                return new Registry.registeredParams[type](value);
            } else {
                throw new Error("Type " + type + " has not been registered.");
            }
        }
    }, {
        key: "fromJSON",
        value: function fromJSON(json) {
            return Parameter.makeParam(json.type, json.value);
        }
    }]);

    return Parameter;
})();

module.exports = Parameter;

},{"./registry":21}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parameter = require("../parameter");

var BooleanValue = (function (_Parameter) {
    _inherits(BooleanValue, _Parameter);

    function BooleanValue(value, reference) {
        _classCallCheck(this, BooleanValue);

        _get(Object.getPrototypeOf(BooleanValue.prototype), "constructor", this).call(this, BooleanValue.typeString(), value);
        if (BooleanValue.isInvalid(value)) throw new Error("BooleanValue must be true or false.");
    }

    _createClass(BooleanValue, null, [{
        key: "isInvalid",
        value: function isInvalid(value) {
            if (value === false || value === true) return false;else return true;
        }
    }, {
        key: "typeString",
        value: function typeString() {
            return "Boolean";
        }
    }]);

    return BooleanValue;
})(Parameter);

Parameter.registerParamType(BooleanValue.typeString(), BooleanValue);
module.exports = BooleanValue;

},{"../parameter":13}],15:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parameter = require("../parameter");
var NumberUtils = require("../../utils/numberUtils");

var FloatValue = (function (_Parameter) {
    _inherits(FloatValue, _Parameter);

    function FloatValue(value) {
        _classCallCheck(this, FloatValue);

        _get(Object.getPrototypeOf(FloatValue.prototype), "constructor", this).call(this, FloatValue.typeString(), value);
        if (FloatValue.isInvalid(value)) throw new Error("FloatValue must be a finite number >= 0. Saw: " + value);
    }

    _createClass(FloatValue, null, [{
        key: "isInvalid",
        value: function isInvalid(value) {
            //if (!Number.isFinite(value) || value < 0) return true;
            if (value < 0 || !NumberUtils.isFloat(value) && !NumberUtils.isInteger(value)) return true;else return false;
        }
    }, {
        key: "typeString",
        value: function typeString() {
            return "Float";
        }
    }]);

    return FloatValue;
})(Parameter);

Parameter.registerParamType(FloatValue.typeString(), FloatValue);
module.exports = FloatValue;

},{"../../utils/numberUtils":32,"../parameter":13}],16:[function(require,module,exports){
/*

var capitalizeFirstLetter = require("../../utils/stringUtils").capitalizeFirstLetter;
var requireDirectory = require('require-directory');
module.exports = requireDirectory(module, {rename: capitalizeFirstLetter});

*/

"use strict";

module.exports.BooleanValue = require("./booleanValue");
module.exports.FloatValue = require("./floatValue");
module.exports.IntegerValue = require("./integerValue");
module.exports.PointValue = require("./pointValue");
module.exports.StringValue = require("./stringValue");

},{"./booleanValue":14,"./floatValue":15,"./integerValue":17,"./pointValue":18,"./stringValue":19}],17:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parameter = require("../parameter");
var NumberUtils = require("../../utils/numberUtils");

var IntegerValue = (function (_Parameter) {
    _inherits(IntegerValue, _Parameter);

    function IntegerValue(value) {
        _classCallCheck(this, IntegerValue);

        _get(Object.getPrototypeOf(IntegerValue.prototype), "constructor", this).call(this, IntegerValue.typeString(), value);
        if (IntegerValue.isInvalid(value)) throw new Error("IntegerValue must be an integer >= 0.");
    }

    _createClass(IntegerValue, null, [{
        key: "isInvalid",
        value: function isInvalid(value) {
            if (!NumberUtils.isInteger(value) || value < 0) return true;else return false;
        }
    }, {
        key: "typeString",
        value: function typeString() {
            return "Integer";
        }
    }]);

    return IntegerValue;
})(Parameter);

Parameter.registerParamType(IntegerValue.typeString(), IntegerValue);
module.exports = IntegerValue;

},{"../../utils/numberUtils":32,"../parameter":13}],18:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parameter = require("../parameter");
var NumberUtils = require("../../utils/numberUtils");

var PointValue = (function (_Parameter) {
    _inherits(PointValue, _Parameter);

    function PointValue(value, reference) {
        _classCallCheck(this, PointValue);

        _get(Object.getPrototypeOf(PointValue.prototype), "constructor", this).call(this, PointValue.typeString(), value);
        if (PointValue.isInvalid(value)) throw new Error("PointValue must be a coordinate represented by a two-member array of finite numbers, ex. [1,3]");
    }

    _createClass(PointValue, null, [{
        key: "isInvalid",
        value: function isInvalid(value) {
            if (value.length != 2 || !NumberUtils.isFloatOrInt(value[0]) || !NumberUtils.isFloatOrInt(value[1])) return true;else return false;
        }
    }, {
        key: "typeString",
        value: function typeString() {
            return "Point";
        }
    }]);

    return PointValue;
})(Parameter);

Parameter.registerParamType(PointValue.typeString(), PointValue);
module.exports = PointValue;

},{"../../utils/numberUtils":32,"../parameter":13}],19:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parameter = require("../parameter");

var StringValue = (function (_Parameter) {
    _inherits(StringValue, _Parameter);

    function StringValue(value) {
        _classCallCheck(this, StringValue);

        _get(Object.getPrototypeOf(StringValue.prototype), "constructor", this).call(this, StringValue.typeString(), value);
        if (StringValue.isInvalid(value)) throw new Error("StringValue must be a string, got: " + value);
    }

    _createClass(StringValue, null, [{
        key: "isInvalid",
        value: function isInvalid(value) {
            if (typeof value != "string") return true;else return false;
        }
    }, {
        key: "typeString",
        value: function typeString() {
            return "String";
        }
    }]);

    return StringValue;
})(Parameter);

Parameter.registerParamType(StringValue.typeString(), StringValue);
module.exports = StringValue;

},{"../parameter":13}],20:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parameter = require("./parameter");

var Params = (function () {
    function Params(values, unique, heritable) {
        _classCallCheck(this, Params);

        this.unique = unique;
        this.heritable = heritable;
        this.parameters = this.__sanitizeValues(values);
    }

    _createClass(Params, [{
        key: "updateParameter",
        value: function updateParameter(key, value) {
            if (this.parameters.hasOwnProperty(key)) this.parameters[key].updateValue(value);else {
                if (this.__isHeritable(key)) {
                    this.parameters[key] = Parameter.makeParam(this.heritable[key], value);
                } else throw new Error(key + "parameter does not exist in Params object");
            }
        }
    }, {
        key: "getValue",
        value: function getValue(key) {
            if (this.parameters.hasOwnProperty(key)) return this.parameters[key].value;else throw new Error(key + " parameter does not exist in Params object.");
        }
    }, {
        key: "getParameter",
        value: function getParameter(key) {
            if (this.parameters.hasOwnProperty(key)) return this.parameters[key];else throw new Error(key + " parameter does not exist in Params object.");
        }
    }, {
        key: "__isUnique",
        value: function __isUnique(key) {
            return this.unique.hasOwnProperty(key);
        }
    }, {
        key: "__isHeritable",
        value: function __isHeritable(key) {
            return this.heritable.hasOwnProperty(key);
        }
    }, {
        key: "hasAllUniques",
        value: function hasAllUniques(params) {
            for (var key in this.unique) {
                if (!params.hasOwnProperty(key)) return false;
            }return true;
        }
    }, {
        key: "WrongTypeError",
        value: function WrongTypeError(key, expected, actual) {
            return new Error("Parameter " + key + " is the wrong type. " + "Expected: " + this.unique[key] + ", Actual: " + param.type);
        }

        /* Turns the raw key:value pairs passed into a user-written Feature declaration
        into key:Parameter pairs. This forces the checks for each Parameter type
        to execute on the provided values, and should throw an error for mismatches. */
    }, {
        key: "__sanitizeValues",
        value: function __sanitizeValues(values) {
            var newParams = {};
            for (var key in values) {
                var oldParam = values[key];
                if (this.__isUnique(key)) {
                    newParams[key] = Parameter.makeParam(this.unique[key], oldParam);
                } else if (this.__isHeritable(key)) {
                    newParams[key] = Parameter.makeParam(this.heritable[key], oldParam);
                } else {
                    throw new Error(key + " does not exist in this set of ParamTypes.");
                }
            }
            this.__checkParams(newParams);
            return newParams;
        }

        /* Checks to make sure the set of sanitized parameters matches the expected ParamTypes.
        This method also checks to make sure that all unique (required) params are present.*/
    }, {
        key: "__checkParams",
        value: function __checkParams(parameters) {
            for (var key in parameters) {
                var _param = parameters[key];
                if (!(_param instanceof Parameter)) {
                    throw new Error(key + " is not a ParameterValue.");
                } else if (this.__isUnique(key)) {
                    if (_param.type != this.unique[key]) {
                        throw wrongTypeError(key, this.unique[key], _param.type);
                    }
                } else if (this.__isHeritable(key)) {
                    if (_param.type != this.heritable[key]) {
                        throw wrongTypeError(key, this.heritable[key], _param.type);
                    }
                } else {
                    throw new Error(key + " does not exist in this set of ParamTypes.");
                }
            }
            if (!this.hasAllUniques(parameters)) {
                throw new Error("Unique values were not present in the provided parameters. Expected: " + Object.keys(this.unique) + ", saw: " + Object.keys(parameters));
            }
        }
    }, {
        key: "toJSON",
        value: function toJSON() {
            var json = {};
            for (var key in this.parameters) {
                json[key] = this.parameters[key].value;
            }
            return json;
        }
    }], [{
        key: "fromJSON",
        value: function fromJSON(json, unique, heritable) {
            return new Params(json, unique, heritable);
        }
    }]);

    return Params;
})();

module.exports = Params;

},{"./parameter":13}],21:[function(require,module,exports){
"use strict";

var registeredParams = {};
var featureRenderers = {};
var registeredFeatures = {};
var currentDevice = null;
var canvasManager = null;
var currentLayer = null;
var currentGrid = null;
var view = null;
var viewManager = null;
var id_counter = 0;

var generateID = function generateID() {
	var id = id_counter;
	id_counter++;
	return id;
};

exports.generateID = generateID;
exports.featureRenderers = featureRenderers;
exports.registeredFeatures = registeredFeatures;
exports.registeredParams = registeredParams;
exports.currentDevice = currentDevice;
exports.currentLayer = currentLayer;
exports.canvasManager = canvasManager;
exports.viewManager = viewManager;
exports.currentGrid = currentGrid;

},{}],22:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../core/registry");
var GridGenerator = require("./gridGenerator");
var PanAndZoom = require("./panAndZoom");
var Features = require("../core/features");
var Tools = require("./tools");
var Device = require("../core/device");
var Colors = require("../view/colors");

var Channel = Features.Channel;
var HollowChannel = Features.HollowChannel;
var Port = Features.Port;
var CircleValve = Features.CircleValve;
var Via = Features.Via;

var ChannelTool = Tools.ChannelTool;
var ValveTool = Tools.ValveTool;
var PanTool = Tools.PanTool;
var SelectTool = Tools.SelectTool;

var CanvasManager = (function () {
    function CanvasManager(canvas) {
        _classCallCheck(this, CanvasManager);

        this.canvas = canvas;
        this.layers = [];
        this.backgroundLayer = new paper.Group();
        this.gridLayer = undefined;
        this.selectLayer = new paper.Group();
        this.tools = {};
        this.minPixelSpacing = 10;
        this.maxPixelSpacing = 100;
        this.gridSpacing = 1000;
        this.thickCount = 10;
        this.minZoom = .0001;
        this.maxZoom = 5;
        this.currentTool = null;
        //this.setupMouseEvents();
        //this.generateTools();
        //this.generateToolButtons();
        //this.selectTool("Select");

        if (!Registry.canvasManager) Registry.canvasManager = this;else throw new Error("Cannot register more than one CanvasManager");

        //this.setupZoomEvent();
        this.setupContextEvent();
        this.setupResizeEvent();
    }

    //TODO: Find a non-manual way to do this

    _createClass(CanvasManager, [{
        key: "generateTools",
        value: function generateTools() {
            this.tools[Channel.typeString()] = new ChannelTool(Channel);
            this.tools[HollowChannel.typeString()] = new ChannelTool(HollowChannel);
            this.tools[Port.typeString()] = new ValveTool(Port);
            this.tools[CircleValve.typeString()] = new ValveTool(CircleValve);
            this.tools[Via.typeString()] = new ValveTool(Via);
            this.tools["Pan"] = new PanTool();
            this.tools["Select"] = new SelectTool();
            //this.tools["none"] = new paper.Tool();
        }
    }, {
        key: "generateToolButtons",
        value: function generateToolButtons() {
            var target = document.getElementById("features-menu");

            for (var toolName in this.tools) {
                var btn = this.generateButton(toolName);
                target.appendChild(btn);
                componentHandler.upgradeElement(btn);
            }
        }
    }, {
        key: "generateButton",
        value: function generateButton(toolName) {
            var btn = document.createElement("li");
            var t = document.createTextNode(toolName);
            var manager = this;
            btn.appendChild(t);
            btn.onclick = function () {
                manager.selectTool(toolName);
            };
            btn.className = 'mdl-menu__item';
            return btn;
        }
    }, {
        key: "selectTool",
        value: function selectTool(typeString) {
            if (this.currentTool) this.currentTool.abort();
            this.tools[typeString].activate();
            this.currentTool = this.tools[typeString];
        }

        //TODO: Hit test only features instead of the whole device
    }, {
        key: "hitFeatureInDevice",
        value: function hitFeatureInDevice(point) {
            var hitOptions = {
                fill: true,
                tolerance: 5,
                guides: false
            };

            var output = [];

            for (var i = this.layers.length - 1; i >= 0; i--) {
                var layer = this.layers[i];
                var result = layer.hitTest(point, hitOptions);
                if (result) {
                    return result.item;
                }
            }
        }
    }, {
        key: "hitFeaturesWithPaperElement",
        value: function hitFeaturesWithPaperElement(paperElement) {
            var output = [];
            for (var i = 0; i < this.layers.length; i++) {
                var layer = this.layers[i];
                for (var j = 0; j < layer.children.length; j++) {
                    var child = layer.children[j];
                    if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                        output.push(child);
                    }
                }
            }
            return output;
        }
    }, {
        key: "snapToGrid",
        value: function snapToGrid(point) {
            return GridGenerator.snapToGrid(point, this.gridSpacing);
        }
    }, {
        key: "setupResizeEvent",
        value: function setupResizeEvent() {
            var man = this;
            paper.view.onResize = function (event) {
                man.render();
            };
        }
    }, {
        key: "setupMouseEvents",
        value: function setupMouseEvents() {
            var manager = this;
            this.canvas.onmousedown = function (e) {
                if (e.which == 2) {
                    manager.currentTool.abort();
                    manager.tools["Pan"].activate();
                    manager.tools["Pan"].startPoint = manager.canvasToProject(e.clientX, e.clientY);
                } else if (e.which == 3) {
                    man.currentTool.abort();
                    var point = manager.canvasToProject(e.clientX, e.clientY);
                    var target = manager.hitFeatureInDevice(point);
                    if (target) {
                        console.log(Registry.currentDevice.getFeatureByID(target.featureID));
                    }
                    manager.currentTool.abort();
                }
            };
            this.canvas.onmouseup = function (e) {
                if (e.which == 2 || 3) {
                    manager.currentTool.activate();
                }
            };
        }
    }, {
        key: "setupContextEvent",
        value: function setupContextEvent() {
            this.canvas.oncontextmenu = function (e) {
                e.preventDefault();
            };
        }
    }, {
        key: "setupZoomEvent",
        value: function setupZoomEvent() {
            var min = this.minZoom;
            var max = this.maxZoom;
            var canvas = this.canvas;
            var manager = this;

            this.canvas.addEventListener("wheel", function (event) {
                if (paper.view.zoom >= max && event.deltaY < 0) console.log("Whoa! Zoom is way too big.");else if (paper.view.zoom <= min && event.deltaY > 0) console.log("Whoa! Zoom is way too small.");else PanAndZoom.adjustZoom(event.deltaY, manager.canvasToProject(event.clientX, event.clientY));
            }, false);
        }
    }, {
        key: "canvasToProject",
        value: function canvasToProject(x, y) {
            var rect = this.canvas.getBoundingClientRect();
            var projX = x - rect.left;
            var projY = y - rect.top;
            return paper.view.viewToProject(new paper.Point(projX, projY));
        }
    }, {
        key: "renderFeature",
        value: function renderFeature(feature) {
            var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            feature.render2D();
            paper.view.update(forceUpdate);
        }
    }, {
        key: "renderBackground",
        value: function renderBackground() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this.backgroundLayer.clear();
            var width = Registry.currentDevice.params.getValue("width");
            var height = Registry.currentDevice.params.getValue("height");
            var border = new paper.Path.Rectangle(new paper.Point(0, 0), new paper.Point(width, height));
            border.fillColor = null;
            border.strokeColor = Colors.GREY_700;
            border.strokeWidth = 3 / paper.view.zoom;
            this.backgroundLayer.addChild(border);
            if (this.gridLayer) this.backgroundLayer.insertAbove(this.gridLayer);
            paper.view.update(forceUpdate);
        }
    }, {
        key: "render",
        value: function render() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
        }
    }, {
        key: "renderGrid",

        //this.renderBackground();
        //this.renderDevice();
        //this.renderGrid();
        //paper.view.update(forceUpdate);
        value: function renderGrid() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            if (this.gridLayer) {
                this.gridLayer.remove();
            }
            var grid = GridGenerator.makeGrid(this.gridSpacing, this.thickCount);
            this.gridLayer = new paper.Group(grid);
            if (this.layers.length > 0) this.gridLayer.insertBelow(this.layers[0]);
            if (this.backgroundLayer) this.gridLayer.insertBelow(this.backgroundLayer);

            paper.view.update(forceUpdate);
        }
    }, {
        key: "setGridSize",
        value: function setGridSize(size) {
            var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.gridSpacing = size;
            //this.renderGrid(forceUpdate);
        }

        //TODO: This is a hacky way to clear everything.
    }, {
        key: "clearLayers",
        value: function clearLayers() {
            for (var i = 0; i < this.layers.length; i++) {
                this.layers[i].remove();
            }
        }

        //TODO: Optimize this to re-render only things that changed?
        // Or write another partial-rendering procedure?
    }, {
        key: "renderDevice",
        value: function renderDevice() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this.clearLayers();
            var rendered = Registry.currentDevice.render2D(this.paper);
            var layers = [];
            for (var i = 0; i < rendered.length; i++) {
                var layer = rendered[i];
                var paperLayer = new paper.Group(layer);
                if (this.gridLayer) paperLayer.insertAbove(this.gridLayer);
                if (this.selectLayer) paperLayer.insertBelow(this.selectLayer);
                if (this.backgroundLayer) paperLayer.insertAbove(this.backgroundLayer);
                if (i > 0) {
                    paperLayer.insertAbove(layers[i - 1]);
                }
                layers.push(paperLayer);
            }
            this.layers = layers;
            paper.view.update(forceUpdate);
        }
    }, {
        key: "updateGridSpacing",
        value: function updateGridSpacing() {
            var min = this.minPixelSpacing / paper.view.zoom;
            var max = this.maxPixelSpacing / paper.view.zoom;
            while (this.gridSpacing < min) {
                this.gridSpacing = this.gridSpacing * 10;
            }
            while (this.gridSpacing > max) {
                this.gridSpacing = this.gridSpacing / 10;
            }
            //this.renderGrid();
        }
    }, {
        key: "adjustZoom",
        value: function adjustZoom(delta, position) {
            PanAndZoom.adjustZoom(delta, position);
        }
    }, {
        key: "setZoom",
        value: function setZoom(zoom) {
            paper.view.zoom = zoom;
            //this.updateGridSpacing();
            Registry.viewManager.updateGrid();
            //this.renderBackground();
        }
    }, {
        key: "calculateOptimalZoom",
        value: function calculateOptimalZoom() {
            var breathingRoom = 200; //pixels
            var dev = Registry.currentDevice;
            var width = dev.params.getValue("width");
            var height = dev.params.getValue("height");
            var rect = this.canvas.getBoundingClientRect();
            if (rect.width - breathingRoom <= 0 || rect.height - breathingRoom <= 0) breathingRoom = 0;
            var widthRatio = width / (rect.width - breathingRoom);
            var heightRatio = height / (rect.height - breathingRoom);
            var targetRatio = 0;
            if (widthRatio > heightRatio) return 1 / widthRatio;else return 1 / heightRatio;
        }
    }, {
        key: "calculateMidpoint",
        value: function calculateMidpoint() {
            var dev = Registry.currentDevice;
            var width = dev.params.getValue("width");
            var height = dev.params.getValue("height");
            return new paper.Point(width / 2, height / 2);
        }
    }, {
        key: "moveCenter",
        value: function moveCenter(delta) {
            var newCenter = paper.view.center.subtract(delta);
            this.setCenter(newCenter);
        }
    }, {
        key: "setCenter",
        value: function setCenter(x, y) {
            paper.view.center = new paper.Point(x, y);
            //this.renderGrid();
            Registry.viewManager.updateGrid();
            //this.renderBackground();
        }
    }, {
        key: "initializeView",
        value: function initializeView() {
            Registry.viewManager.setZoom(this.calculateOptimalZoom());
            Registry.viewManager.setCenter(this.calculateMidpoint());
        }
    }, {
        key: "loadDeviceFromJSON",
        value: function loadDeviceFromJSON(json) {
            Registry.currentDevice = Device.fromJSON(json);
            Registry.currentLayer = Registry.currentDevice.layers[0];
            Registry.viewManager.addDevice(Registry.currentDevice);
            this.initializeView();
            //this.updateGridSpacing();
            //this.render();
        }
    }, {
        key: "saveToStorage",
        value: function saveToStorage() {
            localStorage.setItem('currentDevice', JSON.stringify(Registry.currentDevice.toJSON()));
        }
    }, {
        key: "loadFromStorage",
        value: function loadFromStorage() {
            this.loadDeviceFromJSON(JSON.parse(localStorage.getItem("currentDevice")));
            this.viewManager.updateActiveLayer();
        }
    }]);

    return CanvasManager;
})();

module.exports = CanvasManager;

},{"../core/device":3,"../core/features":10,"../core/registry":21,"../view/colors":35,"./gridGenerator":23,"./panAndZoom":24,"./tools":27}],23:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Colors = require('../view/colors');
var lineColor = Colors.BLUE_100;

//TODO: Fix fifth-line highlighting at low/high zooms!

var GridGenerator = (function () {
    function GridGenerator() {
        _classCallCheck(this, GridGenerator);
    }

    _createClass(GridGenerator, null, [{
        key: 'makeGrid',
        value: function makeGrid(spacing, thickCount) {
            var vert = GridGenerator.makeVerticalGrid(spacing, thickCount);
            var horiz = GridGenerator.makeHorizontalGrid(spacing, thickCount);
            return new paper.Group([vert, horiz]);
        }
    }, {
        key: 'getTopLeft',
        value: function getTopLeft() {
            return paper.view.bounds.topLeft;
        }
    }, {
        key: 'getBottomLeft',
        value: function getBottomLeft() {
            return paper.view.bounds.bottomLeft;
        }
    }, {
        key: 'getBottomRight',
        value: function getBottomRight() {
            return paper.view.bounds.bottomRight;
        }
    }, {
        key: 'getTopRight',
        value: function getTopRight() {
            console.log(paper.view.bounds.topRight);
            return paper.view.bounds.topRight;
        }
    }, {
        key: 'makeVerticalGrid',
        value: function makeVerticalGrid(spacing, thickCount) {
            var topLeft = GridGenerator.getTopLeft();
            var bottomRight = GridGenerator.getBottomRight();
            var height = bottomRight.y - topLeft.y;
            var vertGroup = new paper.Group();
            var sym = new paper.Symbol(GridGenerator.makeVerticalLineTemplate());
            var thick = new paper.Symbol(GridGenerator.makeThickVerticalLineTemplate());
            for (var i = Math.floor(topLeft.x / spacing) * spacing; i <= bottomRight.x; i += spacing) {
                var pos = new paper.Point(i, topLeft.y + height / 2);
                if (i % (spacing * thickCount) < spacing && i % (spacing * thickCount) > -spacing) vertGroup.addChild(thick.place(pos));else vertGroup.addChild(sym.place(pos));
            }
            for (var i = Math.floor(topLeft.x / spacing) * spacing; i >= topLeft.x; i -= spacing) {
                var pos = new paper.Point(i, topLeft.y + height / 2);
                if (i % (spacing * thickCount) < spacing && i % (spacing * thickCount) > -spacing) vertGroup.addChild(thick.place(pos));else vertGroup.addChild(sym.place(pos));
            }
            return vertGroup;
        }
    }, {
        key: 'makeHorizontalGrid',
        value: function makeHorizontalGrid(spacing, thickCount) {
            var topLeft = GridGenerator.getTopLeft();
            var bottomRight = GridGenerator.getBottomRight();
            var width = bottomRight.x - topLeft.x;
            var horizGroup = new paper.Group();
            var sym = new paper.Symbol(GridGenerator.makeHorizontalLineTemplate());
            var thick = new paper.Symbol(GridGenerator.makeThickHorizontalLineTemplate());
            for (var i = Math.floor(topLeft.y / spacing) * spacing; i < bottomRight.y; i += spacing) {
                var pos = new paper.Point(topLeft.x + width / 2, i);
                if (i % (spacing * thickCount) < spacing && i % (spacing * thickCount) > -spacing) horizGroup.addChild(thick.place(pos));else horizGroup.addChild(sym.place(pos));
            }
            for (var i = Math.floor(topLeft.y / spacing) * spacing; i >= topLeft.y; i -= spacing) {
                var pos = new paper.Point(topLeft.x + width / 2, i);
                if (i % (spacing * thickCount) < spacing && i % (spacing * thickCount) > -spacing) horizGroup.addChild(thick.place(pos));else horizGroup.addChild(sym.place(pos));
            }
            return horizGroup;
        }
    }, {
        key: 'makeVerticalLineTemplate',
        value: function makeVerticalLineTemplate() {
            return GridGenerator.gridLineTemplate(GridGenerator.getTopLeft(), GridGenerator.getBottomLeft());
        }
    }, {
        key: 'makeThickVerticalLineTemplate',
        value: function makeThickVerticalLineTemplate() {
            var line = GridGenerator.makeVerticalLineTemplate();
            line.strokeWidth = GridGenerator.getStrokeWidth() * 3;
            return line;
        }
    }, {
        key: 'makeHorizontalLineTemplate',
        value: function makeHorizontalLineTemplate() {
            return GridGenerator.gridLineTemplate(GridGenerator.getTopLeft(), GridGenerator.getTopRight());
        }
    }, {
        key: 'makeThickHorizontalLineTemplate',
        value: function makeThickHorizontalLineTemplate() {
            var line = GridGenerator.makeHorizontalLineTemplate();
            line.strokeWidth = GridGenerator.getStrokeWidth() * 3;
            return line;
        }
    }, {
        key: 'snapToGrid',
        value: function snapToGrid(point, spacing) {
            var x = Math.round(point.x / spacing) * spacing;
            var y = Math.round(point.y / spacing) * spacing;
            return new paper.Point(x, y);
        }
    }, {
        key: 'gridLineTemplate',
        value: function gridLineTemplate(start, end) {
            var line = paper.Path.Line(start, end);
            line.strokeColor = lineColor;
            line.strokeWidth = GridGenerator.getStrokeWidth();
            line.remove();
            return line;
        }
    }, {
        key: 'getStrokeWidth',
        value: function getStrokeWidth() {
            var width = 1 / paper.view.zoom;
            return width;
        }
    }]);

    return GridGenerator;
})();

module.exports = GridGenerator;

},{"../view/colors":35}],24:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../core/registry");

var PanAndZoom = (function () {
	function PanAndZoom() {
		_classCallCheck(this, PanAndZoom);
	}

	_createClass(PanAndZoom, null, [{
		key: "stableZoom",
		value: function stableZoom(zoom, position) {
			var newZoom = zoom;
			var p = position;
			var c = paper.view.center;
			var beta = paper.view.zoom / newZoom;
			var pc = p.subtract(c);
			var a = p.subtract(pc.multiply(beta)).subtract(c);
			var newCenter = this.calcCenter(a.x, a.y);
			Registry.canvasManager.setCenter(newCenter.x, newCenter.y);
			Registry.canvasManager.setZoom(newZoom);
		}
	}, {
		key: "adjustZoom",
		value: function adjustZoom(delta, position) {
			this.stableZoom(this.calcZoom(delta), position);
		}

		// Stable pan and zoom modified from: http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/

	}, {
		key: "calcZoom",
		value: function calcZoom(delta) {
			var multiplier = arguments.length <= 1 || arguments[1] === undefined ? 1.177827941003 : arguments[1];

			if (delta < 0) return paper.view.zoom * multiplier;else if (delta > 0) return paper.view.zoom / multiplier;else return paper.view.zoom;
		}
	}, {
		key: "calcCenter",
		value: function calcCenter(deltaX, deltaY, factor) {
			var offset = new paper.Point(deltaX, deltaY);
			//offset = offset.multiply(factor);
			return paper.view.center.add(offset);
		}
	}]);

	return PanAndZoom;
})();

module.exports = PanAndZoom;

},{"../core/registry":21}],25:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");

var SelectTool = (function (_paper$Tool) {
	_inherits(SelectTool, _paper$Tool);

	function SelectTool() {
		_classCallCheck(this, SelectTool);

		_get(Object.getPrototypeOf(SelectTool.prototype), "constructor", this).call(this);
		this.dragStart = null;
		this.currentSelectBox = null;
		this.currentSelection = [];
		this.onMouseDown = function (event) {
			this.mouseDownHandler(event.point);
		};
		this.onKeyDown = function (event) {
			this.keyHandler(event);
		};
		this.onMouseDrag = function (event) {
			this.dragHandler(event.point);
		};
		this.onMouseUp = function (event) {
			this.mouseUpHandler(event.point);
		};
	}

	_createClass(SelectTool, [{
		key: "keyHandler",
		value: function keyHandler(event) {
			if (event.key == "delete" || event.key == "backspace") {
				this.removeFeatures();
			}
		}
	}, {
		key: "dragHandler",
		value: function dragHandler(point) {
			if (this.dragStart) {
				if (this.currentSelectBox) {
					this.currentSelectBox.remove();
				}
				this.currentSelectBox = this.rectSelect(this.dragStart, point);
			}
		}
	}, {
		key: "mouseUpHandler",
		value: function mouseUpHandler(point) {
			if (this.currentSelectBox) {
				this.currentSelection = Registry.canvasManager.hitFeaturesWithViewElement(this.currentSelectBox);
				this.selectFeatures();
			}
			this.killSelectBox();
		}
	}, {
		key: "mouseDownHandler",
		value: function mouseDownHandler(point) {
			var target = this.hitFeature(point);
			if (target) {
				if (target.selected) console.log("Doubleclick?");else {
					this.deselectFeatures();
					this.selectFeature(target);
				}
			} else {
				this.deselectFeatures();
				this.dragStart = point;
			}
		}
	}, {
		key: "killSelectBox",
		value: function killSelectBox() {
			if (this.currentSelectBox) {
				this.currentSelectBox.remove();
				this.currentSelectBox = null;
			}
			this.dragStart = null;
		}
	}, {
		key: "hitFeature",
		value: function hitFeature(point) {
			var target = Registry.canvasManager.hitFeatureInDevice(point);
			return target;
		}
	}, {
		key: "selectFeature",
		value: function selectFeature(paperElement) {
			this.currentSelection.push(paperElement);
			paperElement.selected = true;
		}
	}, {
		key: "selectFeatures",
		value: function selectFeatures() {
			if (this.currentSelection) {
				for (var i = 0; i < this.currentSelection.length; i++) {
					var paperFeature = this.currentSelection[i];
					paperFeature.selected = true;
				}
			}
		}
	}, {
		key: "deselectFeatures",
		value: function deselectFeatures() {
			if (this.currentSelection) {
				for (var i = 0; i < this.currentSelection.length; i++) {
					var paperFeature = this.currentSelection[i];
					paperFeature.selected = false;
				}
			}
			this.currentSelection = [];
		}
	}, {
		key: "abort",
		value: function abort() {
			this.deselectFeatures();
			this.killSelectBox();
			Registry.canvasManager.render();
		}
	}, {
		key: "rectSelect",
		value: function rectSelect(point1, point2) {
			var rect = new paper.Path.Rectangle(point1, point2);
			rect.fillColor = new paper.Color(0, .3, 1, .4);
			rect.strokeColor = new paper.Color(0, 0, 0);
			rect.strokeWidth = 2;
			rect.selected = true;
			return rect;
		}
	}]);

	return SelectTool;
})(paper.Tool);

module.exports = SelectTool;

},{"../../core/registry":21}],26:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Features = require("../../core/features");
var Registry = require("../../core/registry");

var ChannelTool = (function (_paper$Tool) {
	_inherits(ChannelTool, _paper$Tool);

	function ChannelTool(channelClass) {
		_classCallCheck(this, ChannelTool);

		_get(Object.getPrototypeOf(ChannelTool.prototype), "constructor", this).call(this);
		this.channelClass = channelClass;
		this.startPoint = null;
		this.currentChannelID = null;
		this.currentTarget = null;

		this.onMouseDown = function (event) {
			this.initChannel(event.point);
			this.showTarget(event.point);
		};
		this.onMouseDrag = function (event) {
			this.updateChannel(event.point);
			this.showTarget(event.point);
		};
		this.onMouseUp = function (event) {
			this.finishChannel(event.point);
			this.showTarget(event.point);
		};
		this.onMouseMove = function (event) {
			this.showTarget(event.point);
		};
	}

	_createClass(ChannelTool, [{
		key: "abort",
		value: function abort() {
			if (this.currentTarget) {
				this.currentTarget.remove();
			}
			if (this.currentChannelID) {
				Registry.currentLayer.removeFeatureByID(this.currentChannelID);
			}
			Registry.canvasManager.render();
		}
	}, {
		key: "showTarget",
		value: function showTarget(point) {
			if (this.currentTarget) {
				this.currentTarget.remove();
			}
			point = ChannelTool.getTarget(point);
			this.currentTarget = ChannelTool.makeReticle(point);
		}
	}, {
		key: "initChannel",
		value: function initChannel(point) {
			this.startPoint = ChannelTool.getTarget(point);
		}

		//TODO: Re-render only the current channel, to improve perforamnce
	}, {
		key: "updateChannel",
		value: function updateChannel(point) {
			if (this.currentChannelID) {
				var target = ChannelTool.getTarget(point);
				var feat = Registry.currentLayer.getFeature(this.currentChannelID);
				feat.updateParameter("end", [target.x, target.y]);
				Registry.canvasManager.render();
			} else {
				var newChannel = this.createChannel(this.startPoint, this.startPoint);
				this.currentChannelID = newChannel.id;
				Registry.currentLayer.addFeature(newChannel);
			}
		}
	}, {
		key: "finishChannel",
		value: function finishChannel(point) {
			var target = ChannelTool.getTarget(point);
			if (this.currentChannelID) {
				if (this.startPoint.x == target.x && this.startPoint.y == target.y) {
					Registry.currentLayer.removeFeatureByID(this.currentChannelID);
					//TODO: This will be slow for complex devices, since it re-renders everything
					Registry.canvasManager.render();
				}
			}
			this.currentChannelID = null;
			this.startPoint = null;
		}
	}, {
		key: "createChannel",
		value: function createChannel(start, end) {
			return new this.channelClass({
				"start": [start.x, start.y],
				"end": [end.x, end.y]
			});
		}

		//TODO: Re-establish target selection logic from earlier demo
	}], [{
		key: "makeReticle",
		value: function makeReticle(point) {
			var size = 10 / paper.view.zoom;
			var ret = paper.Path.Circle(point, size);
			ret.fillColor = new paper.Color(.5, 0, 1, .5);
			return ret;
		}
	}, {
		key: "getTarget",
		value: function getTarget(point) {
			return Registry.canvasManager.snapToGrid(point);
		}
	}]);

	return ChannelTool;
})(paper.Tool);

module.exports = ChannelTool;

},{"../../core/features":10,"../../core/registry":21}],27:[function(require,module,exports){
"use strict";

module.exports.ChannelTool = require("./channelTool");
module.exports.ValveTool = require("./valveTool");
module.exports.PanTool = require("./panTool");
module.exports.SelectTool = require("./SelectTool");

},{"./SelectTool":25,"./channelTool":26,"./panTool":28,"./valveTool":29}],28:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");

var PanTool = (function (_paper$Tool) {
	_inherits(PanTool, _paper$Tool);

	function PanTool() {
		_classCallCheck(this, PanTool);

		_get(Object.getPrototypeOf(PanTool.prototype), "constructor", this).call(this);
		this.startPoint = null;

		this.onMouseDown = function (event) {
			this.startPoint = event.point;
		};

		this.onMouseDrag = function (event) {
			if (this.startPoint) {
				var delta = event.point.subtract(this.startPoint);
				Registry.canvasManager.moveCenter(delta);
			}
		};
		this.onMouseUp = function (event) {
			this.startPoint = null;
		};
	}

	_createClass(PanTool, [{
		key: "abort",
		value: function abort() {
			this.startPoint = null;
		}
	}]);

	return PanTool;
})(paper.Tool);

module.exports = PanTool;

},{"../../core/registry":21}],29:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Features = require("../../core/features");
var Registry = require("../../core/registry");

var ValveTool = (function (_paper$Tool) {
	_inherits(ValveTool, _paper$Tool);

	function ValveTool(valveClass) {
		_classCallCheck(this, ValveTool);

		_get(Object.getPrototypeOf(ValveTool.prototype), "constructor", this).call(this);
		this.valveClass = valveClass;
		this.currentValveID = null;
		this.onMouseDown = function (event) {
			var newValve = new this.valveClass({
				"position": [event.point.x, event.point.y]
			});
			this.currentValveID = newValve.id;
			Registry.currentLayer.addFeature(newValve);
			Registry.canvasManager.render();
		};
		this.onMouseUp = function (event) {
			this.currentValveID = null;
		};
	}

	_createClass(ValveTool, [{
		key: "abort",
		value: function abort() {
			if (this.currentValveID) Registry.currentLayer.removeFeatureByID(this.currentValveID);
			Registry.canvasManager.render();
		}
	}]);

	return ValveTool;
})(paper.Tool);

module.exports = ValveTool;

},{"../../core/features":10,"../../core/registry":21}],30:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleQueue = (function () {
	function SimpleQueue(func, timeout) {
		var report = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		_classCallCheck(this, SimpleQueue);

		this.timeout = timeout;
		this.func = func;
		this.waiting = false;
		this.queued = true;
		this.counter = 0;
		this.report = report;
	}

	_createClass(SimpleQueue, [{
		key: "run",
		value: function run() {
			if (this.waiting) {
				this.counter++;
				if (!this.queued) {
					this.queued = true;
				}
			} else {
				if (this.report) console.log("Waited " + this.counter + " times.");
				this.func();
				this.startTimer();
				this.counter = 0;
			}
		}
	}, {
		key: "endTimer",
		value: function endTimer() {
			this.waiting = false;
			if (this.queued) {
				this.queued = false;
				this.run();
			}
		}
	}, {
		key: "startTimer",
		value: function startTimer() {
			var ref = this;
			this.waiting = true;
			window.setTimeout(function () {
				ref.endTimer();
			}, this.timeout);
		}
	}]);

	return SimpleQueue;
})();

module.exports = SimpleQueue;

},{}],31:[function(require,module,exports){
'use strict';

var removeClass = function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};

var addClass = function addClass(el, className) {
    if (el.classList) el.classList.add(className);else el.className += ' ' + className;
};

module.exports.removeClass = removeClass;
module.exports.addClass = addClass;

},{}],32:[function(require,module,exports){
"use strict";

function isFloat(n) {
    return n === +n && n !== (n | 0);
}

function isInteger(n) {
    return n === +n && n === (n | 0);
}

function isFloatOrInt(n) {
    return isFloat(n) || isInteger(n);
}

module.exports.isFloat = isFloat;
module.exports.isInteger = isInteger;
module.exports.isFloatOrInt = isFloatOrInt;

},{}],33:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleQueue = (function () {
	function SimpleQueue(func, timeout) {
		var report = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

		_classCallCheck(this, SimpleQueue);

		this.timeout = timeout;
		this.func = func;
		this.waiting = false;
		this.queued = true;
		this.counter = 0;
		this.report = report;
	}

	_createClass(SimpleQueue, [{
		key: "run",
		value: function run() {
			if (this.waiting) {
				this.counter++;
				if (!this.queued) {
					this.queued = true;
				}
			} else {
				if (this.report) console.log("Waited " + this.counter + " times.");
				this.func();
				this.startTimer();
				this.counter = 0;
			}
		}
	}, {
		key: "endTimer",
		value: function endTimer() {
			this.waiting = false;
			if (this.queued) {
				this.queued = false;
				this.run();
			}
		}
	}, {
		key: "startTimer",
		value: function startTimer() {
			var ref = this;
			this.waiting = true;
			window.setTimeout(function () {
				ref.endTimer();
			}, this.timeout);
		}
	}]);

	return SimpleQueue;
})();

module.exports = SimpleQueue;

},{}],34:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../core/registry");

var PanAndZoom = (function () {
    function PanAndZoom(paperView) {
        _classCallCheck(this, PanAndZoom);

        this.view = paperView;
    }

    _createClass(PanAndZoom, [{
        key: "stableZoom",
        value: function stableZoom(zoom, position) {
            var newZoom = zoom;
            var p = position;
            var c = this.view.getCenter();
            var beta = this.view.getZoom() / newZoom;
            var pc = p.subtract(c);
            var a = p.subtract(pc.multiply(beta)).subtract(c);
            this.view.setCenter(this.view.getCenter().add(a));
            this.view.setZoom(newZoom);
        }
    }, {
        key: "adjustZoom",
        value: function adjustZoom(delta, position) {
            this.stableZoom(this.calcZoom(delta), position);
        }

        // Stable pan and zoom modified from: http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/

    }, {
        key: "calcZoom",
        value: function calcZoom(delta) {
            var multiplier = arguments.length <= 1 || arguments[1] === undefined ? 1.177827941003 : arguments[1];

            if (delta < 0) return this.view.getZoom() * multiplier;else if (delta > 0) return this.view.getZoom() / multiplier;else return this.view.getZoom();
        }
    }, {
        key: "moveCenter",
        value: function moveCenter(delta) {
            this.view.setCenter(this.calcCenter(delta));
        }
    }, {
        key: "calcCenter",
        value: function calcCenter(delta) {
            return this.view.getCenter().subtract(delta);
        }
    }]);

    return PanAndZoom;
})();

module.exports = PanAndZoom;

},{"../core/registry":21}],35:[function(require,module,exports){

//Colors taken from: http://www.google.ch/design/spec/style/color.html
"use strict";

module.exports.RED_500 = "#F44336";
module.exports.INDIGO_500 = "#3F51B5";
module.exports.GREEN_500 = "#4CAF50";
module.exports.DEEP_PURPLE_500 = "#673AB7";
module.exports.BLUE_50 = "#e3f2fd";
module.exports.BLUE_100 = "#BBDEFB";
module.exports.BLUE_300 = "#64B5F6";
module.exports.BLUE_500 = "#2196F3";
module.exports.GREY_200 = "#EEEEEE";
module.exports.GREY_700 = "#616161";
module.exports.GREY_500 = "#9E9E9E";
module.exports.AMBER_50 = "#FFF8E1";
module.exports.PINK_500 = "#E91E63";
module.exports.PINK_300 = "#F06292";
module.exports.BLACK = "#000000";
module.exports.WHITE = "#FFFFFF";

var defaultColorKeys = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
var darkColorKeys = ["300", "400", "500", "600", "700", "800", "900"];

var indigo = {
	"900": "#" + "1A237E",
	"800": "#" + "283593",
	"700": "#" + "303F9F",
	"600": "#" + "3949AB",
	"500": "#" + "3F51B5",
	"400": "#" + "5C6BC0",
	"300": "#" + "7986CB",
	"200": "#" + "9FA8DA",
	"100": "#" + "C5CAE9",
	"50": "#" + "E8EAF6",
	"A100": "#" + "8C9EFF",
	"A200": "#" + "536DFE",
	"A400": "#" + "3D5AFE",
	"A700": "#" + "304FFE"
};

var red = {
	"900": "#" + "B71C1C",
	"800": "#" + "C62828",
	"700": "#" + "D32F2F",
	"600": "#" + "E53935",
	"500": "#" + "F44336",
	"400": "#" + "EF5350",
	"300": "#" + "E57373",
	"200": "#" + "EF9A9A",
	"100": "#" + "FFCDD2",
	"50": "#" + "FFEBEE",
	"A100": "#" + "FF8A80",
	"A200": "#" + "FF5252",
	"A400": "#" + "FF1744",
	"A700": "#" + "D50000"
};

var layerColors = {
	"indigo": indigo,
	"red": red
};

var decimalToIndex = function decimalToIndex(decimal, indices) {
	return Math.round((indices - 1) * decimal);
};

var decimalToLayerColor = function decimalToLayerColor(decimal, layerColors, orderedKeys) {
	var index = decimalToIndex(decimal, orderedKeys.length);
	var key = orderedKeys[index];
	return layerColors[key];
};

var renderAllColors = function renderAllColors(layer, orderedKeys) {
	for (var i = 0; i < orderedKeys.length; i++) {

		new paper.Path.Circle({
			position: new paper.Point(0 + i * 1000, 0),
			fillColor: layer[orderedKeys[i]],
			radius: 500
		});
	}

	for (var i = 0; i < orderedKeys.length; i++) {
		var color = decimalToLayerColor(i / orderedKeys.length, layer, orderedKeys);
		new paper.Path.Circle({
			position: new paper.Point(0 + i * 1000, 2000),
			fillColor: layer[orderedKeys[i]],
			radius: 500
		});
	}
};

var getLayerColors = function getLayerColors(layer) {
	if (layer.color) return layerColors[layer.color];else return layerColors["red"];
};

var getDefaultLayerColor = function getDefaultLayerColor(layer) {
	return getLayerColors(layer)["500"];
};

var getDefaultFeatureColor = function getDefaultFeatureColor(featureClass, layer) {
	var height = featureClass.getDefaultValues()["height"];
	var decimal = height / layer.estimateLayerHeight();
	if (!layer.flip) decimal = 1 - decimal;
	var colors = getLayerColors(layer);
	return decimalToLayerColor(decimal, colors, darkColorKeys);
};

module.exports.getDefaultLayerColor = getDefaultLayerColor;
module.exports.getDefaultFeatureColor = getDefaultFeatureColor;
module.exports.getLayerColors = getLayerColors;
module.exports.decimalToLayerColor = decimalToLayerColor;
module.exports.defaultColorKeys = defaultColorKeys;
module.exports.darkColorKeys = darkColorKeys;
module.exports.layerColors = layerColors;
module.exports.renderAllColors = renderAllColors;

},{}],36:[function(require,module,exports){
"use strict";

var Colors = require("./colors");
var DEFAULT_STROKE_COLOR = Colors.GREY_700;
var BORDER_THICKNESS = 5; // pixels

function renderDevice(device) {
    var strokeColor = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_STROKE_COLOR : arguments[1];

    var background = new paper.Path.Rectangle({
        from: paper.view.bounds.topLeft,
        to: paper.view.bounds.bottomRight,
        fillColor: Colors.GREY_200,
        strokeColor: null
    });
    var thickness = BORDER_THICKNESS / paper.view.zoom;
    var width = device.params.getValue("width");
    var height = device.params.getValue("height");
    var border = new paper.Path.Rectangle({
        from: new paper.Point(0, 0),
        to: new paper.Point(width, height),
        fillColor: Colors.WHITE,
        strokeColor: strokeColor,
        strokeWidth: thickness
    });

    var group = new paper.Group([background, border]);

    return group;
}

module.exports.renderDevice = renderDevice;

},{"./colors":35}],37:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Colors = require("../colors");

var FeatureRenderer = (function () {
    function FeatureRenderer() {
        _classCallCheck(this, FeatureRenderer);
    }

    _createClass(FeatureRenderer, null, [{
        key: "getLayerColor",
        value: function getLayerColor(feature, featureClass) {
            var height = undefined;
            try {
                height = feature.params.getValue("height");
            } catch (err) {
                height = featureClass.getDefaultValues()["height"];
            }
            var layerHeight = feature.layer.estimateLayerHeight();
            var decimal = height / layerHeight;
            if (!feature.layer.flip) decimal = 1 - decimal;
            var targetColorSet = Colors.getLayerColors(feature.layer);
            return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
        }
    }]);

    return FeatureRenderer;
})();

module.exports = FeatureRenderer;

},{"../colors":35}],38:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Channel = require("../../core/features").Channel;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

var ChannelRenderer = (function (_FeatureRenderer) {
    _inherits(ChannelRenderer, _FeatureRenderer);

    function ChannelRenderer() {
        _classCallCheck(this, ChannelRenderer);

        _get(Object.getPrototypeOf(ChannelRenderer.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(ChannelRenderer, null, [{
        key: "renderFeature",
        value: function renderFeature(channel) {
            var start = channel.params.getValue("start");
            var end = channel.params.getValue("end");
            var width = undefined;
            try {
                width = channel.params.getValue("width");
            } catch (err) {
                width = Channel.getDefaultValues()["width"];
            }
            var rec = PaperPrimitives.RoundedRect(start, end, width);
            rec.featureID = channel.id;
            rec.fillColor = FeatureRenderer.getLayerColor(channel, Channel);
            return rec;
        }
    }, {
        key: "renderTarget",
        value: function renderTarget(position) {
            var width = Channel.getDefaultValues()["width"];
            var circ = PaperPrimitives.CircleTarget(position, width / 2);
            return circ;
        }
    }]);

    return ChannelRenderer;
})(FeatureRenderer);

module.exports = ChannelRenderer;

},{"../../core/features":10,"../../core/registry":21,"../colors":35,"../paperPrimitives":47,"./FeatureRenderer":37}],39:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var CircleValve = require("../../core/features").CircleValve;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

var CircleValveRenderer = (function (_FeatureRenderer) {
    _inherits(CircleValveRenderer, _FeatureRenderer);

    function CircleValveRenderer() {
        _classCallCheck(this, CircleValveRenderer);

        _get(Object.getPrototypeOf(CircleValveRenderer.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(CircleValveRenderer, null, [{
        key: "renderFeature",
        value: function renderFeature(circleValve) {
            var position = circleValve.params.getValue("position");
            var radius = undefined;

            //TODO: figure out inheritance pattern for values!

            try {
                radius = circleValve.params.getValue("radius1");
            } catch (err) {
                radius = CircleValve.getDefaultValues()["radius1"];
            }

            var c1 = PaperPrimitives.Circle(position, radius);
            c1.fillColor = FeatureRenderer.getLayerColor(circleValve, CircleValve);
            c1.featureID = circleValve.id;
            return c1;
        }
    }, {
        key: "renderTarget",
        value: function renderTarget(position) {
            var width = CircleValve.getDefaultValues()["radius1"];
            var circ = PaperPrimitives.CircleTarget(position, width);
            return circ;
        }
    }]);

    return CircleValveRenderer;
})(FeatureRenderer);

module.exports = CircleValveRenderer;

},{"../../core/features":10,"../../core/registry":21,"../colors":35,"../paperPrimitives":47,"./FeatureRenderer":37}],40:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var HollowChannel = require("../../core/features").HollowChannel;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

var HollowChannelRenderer = (function (_FeatureRenderer) {
    _inherits(HollowChannelRenderer, _FeatureRenderer);

    function HollowChannelRenderer() {
        _classCallCheck(this, HollowChannelRenderer);

        _get(Object.getPrototypeOf(HollowChannelRenderer.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(HollowChannelRenderer, null, [{
        key: "renderFeature",
        value: function renderFeature(hollowChannel) {
            var start = hollowChannel.params.getValue("start");
            var end = hollowChannel.params.getValue("end");
            var width = undefined;
            try {
                width = hollowChannel.params.getValue("width");
            } catch (err) {
                width = HollowChannel.getDefaultValues()["width"];
            }
            var rec = PaperPrimitives.RoundedRect(start, end, width);
            rec.featureID = hollowChannel.id;
            rec.fillColor = FeatureRenderer.getLayerColor(hollowChannel, HollowChannel);
            return rec;
        }
    }, {
        key: "renderTarget",
        value: function renderTarget(position) {
            var width = HollowChannel.getDefaultValues()["width"];
            var circ = PaperPrimitives.CircleTarget(position, width / 2);
            return circ;
        }
    }]);

    return HollowChannelRenderer;
})(FeatureRenderer);

module.exports = HollowChannelRenderer;

},{"../../core/features":10,"../../core/registry":21,"../colors":35,"../paperPrimitives":47,"./FeatureRenderer":37}],41:[function(require,module,exports){
"use strict";

module.exports.Channel = require("./channelRenderer");
module.exports.Via = require("./viaRenderer");
module.exports.CircleValve = require("./circleValveRenderer");
module.exports.HollowChannel = require("./hollowChannelRenderer");
module.exports.Port = require("./portRenderer");

},{"./channelRenderer":38,"./circleValveRenderer":39,"./hollowChannelRenderer":40,"./portRenderer":42,"./viaRenderer":43}],42:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Port = require("../../core/features").Port;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

var PortRenderer = (function (_FeatureRenderer) {
    _inherits(PortRenderer, _FeatureRenderer);

    function PortRenderer() {
        _classCallCheck(this, PortRenderer);

        _get(Object.getPrototypeOf(PortRenderer.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(PortRenderer, null, [{
        key: "renderFeature",
        value: function renderFeature(port) {
            var position = port.params.getValue("position");
            var radius = undefined;

            //TODO: figure out inheritance pattern for values!

            try {
                radius = port.params.getValue("radius1");
            } catch (err) {
                radius = Port.getDefaultValues()["radius1"];
            }

            var c1 = PaperPrimitives.Circle(position, radius);
            c1.fillColor = FeatureRenderer.getLayerColor(port, Port);
            c1.featureID = port.id;
            console.log("foo");
            return c1;
        }
    }, {
        key: "renderTarget",
        value: function renderTarget(position) {
            var width = Port.getDefaultValues()["radius1"];
            var circ = PaperPrimitives.CircleTarget(position, width);
            return circ;
        }
    }]);

    return PortRenderer;
})(FeatureRenderer);

module.exports = PortRenderer;

},{"../../core/features":10,"../../core/registry":21,"../colors":35,"../paperPrimitives":47,"./FeatureRenderer":37}],43:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Via = require("../../core/features").Via;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

var ViaRenderer = (function (_FeatureRenderer) {
    _inherits(ViaRenderer, _FeatureRenderer);

    function ViaRenderer() {
        _classCallCheck(this, ViaRenderer);

        _get(Object.getPrototypeOf(ViaRenderer.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(ViaRenderer, null, [{
        key: "renderFeature",
        value: function renderFeature(via) {
            var position = via.params.getValue("position");
            var radius = undefined;

            //TODO: figure out inheritance pattern for values!

            try {
                radius = via.params.getValue("radius1");
            } catch (err) {
                radius = Via.getDefaultValues()["radius1"];
            }

            var c1 = PaperPrimitives.Circle(position, radius);
            c1.fillColor = FeatureRenderer.getLayerColor(via, Via);
            c1.featureID = via.id;
            return c1;
        }
    }, {
        key: "renderTarget",
        value: function renderTarget(position) {
            var width = Via.getDefaultValues()["radius1"];
            var circ = PaperPrimitives.CircleTarget(position, width);
            return circ;
        }
    }]);

    return ViaRenderer;
})(FeatureRenderer);

module.exports = ViaRenderer;

},{"../../core/features":10,"../../core/registry":21,"../colors":35,"../paperPrimitives":47,"./FeatureRenderer":37}],44:[function(require,module,exports){
"use strict";

var Colors = require("../colors");

function renderGrid(grid) {
    var gridGroup = new paper.Group();
    gridGroup.addChild(makeHorizontalLines(grid));
    gridGroup.addChild(makeVerticalLines(grid));
    return gridGroup;
}

function vertLineSymbol(width, color) {
    return lineSymbol(paper.view.bounds.topLeft, paper.view.bounds.bottomLeft, width, color);
}

function horizLineSymbol(width, color) {
    return lineSymbol(paper.view.bounds.topLeft, paper.view.bounds.topRight, width, color);
}

function lineSymbol(start, end, width, color) {
    var line = paper.Path.Line({
        from: start,
        to: end,
        strokeWidth: width,
        strokeColor: color
    });
    line.remove();
    return new paper.Symbol(line);
}

function isThick(val, origin, spacing, thickCount) {
    var diff = Math.abs(val - origin);
    var remainder = diff % (spacing * thickCount);
    if (remainder < spacing) {
        return true;
    } else return false;
}

function makeVerticalLines(grid) {
    var spacing = grid.getSpacing();
    var sym = vertLineSymbol(grid.getThinWidth(), grid.color);
    var thickSym = vertLineSymbol(grid.getThickWidth(), grid.color);
    var start = paper.view.bounds.topLeft;
    var end = paper.view.bounds.topRight;
    var height = paper.view.bounds.height;
    var group = new paper.Group();

    var startX = Math.floor((start.x - grid.origin.x) / spacing) * spacing + grid.origin.x;

    for (var i = startX; i < end.x; i += spacing) {
        var pos = new paper.Point(i, start.y + height / 2);
        if (isThick(i, grid.origin.x, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));else group.addChild(sym.place(pos));
    }

    for (var i = startX; i >= end.x; i -= spacing) {
        var pos = new paper.Point(i, start.y + height / 2);
        if (isThick(i, grid.origin.x, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));else group.addChild(sym.place(pos));
    }
    return group;
}

function makeHorizontalLines(grid) {
    var spacing = grid.getSpacing();
    var sym = horizLineSymbol(grid.getThinWidth(), grid.color);
    var thickSym = horizLineSymbol(grid.getThickWidth(), grid.color);
    var start = paper.view.bounds.topLeft;
    var end = paper.view.bounds.bottomLeft;
    var width = paper.view.bounds.width;
    var group = new paper.Group();

    var startY = Math.floor((start.y - grid.origin.y) / spacing) * spacing + grid.origin.y;

    for (var i = startY; i < end.y; i += spacing) {
        var pos = new paper.Point(start.x + width / 2, i);
        if (isThick(i, grid.origin.y, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));else group.addChild(sym.place(pos));
    }

    for (var i = startY; i >= end.y; i -= spacing) {
        var pos = new paper.Point(start.x + width / 2, i);
        if (isThick(i, grid.origin.y, spacing, grid.thickCount)) group.addChild(thickSym.place(pos));else group.addChild(sym.place(pos));
    }
    return group;
}

module.exports.renderGrid = renderGrid;

},{"../colors":35}],45:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../../core/registry");
var Colors = require("../colors");

var AdaptiveGrid = (function () {
    function AdaptiveGrid() {
        var minSpacing = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];
        var maxSpacing = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];
        var thickCount = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];
        var origin = arguments.length <= 3 || arguments[3] === undefined ? [0, 0] : arguments[3];
        var thinWidth = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
        var thickWidth = arguments.length <= 5 || arguments[5] === undefined ? 3 : arguments[5];
        var color = arguments.length <= 6 || arguments[6] === undefined ? Colors.BLUE_100 : arguments[6];

        _classCallCheck(this, AdaptiveGrid);

        this.origin = new paper.Point(origin[0], origin[1]);
        this.thinWidth = thinWidth; //pixel
        this.thickWidth = thickWidth; // pixels
        this.minSpacing = minSpacing; //pixels
        this.maxSpacing = maxSpacing; //pixels
        this.thickCount = thickCount;
        this.spacing = 1000;
        this.color = color;

        if (Registry.currentGrid) throw new Error("Cannot instantiate more than one AdaptiveGrid!");
        Registry.currentGrid = this;
    }

    _createClass(AdaptiveGrid, [{
        key: "getClosestGridPoint",
        value: function getClosestGridPoint(point) {
            var x = Math.round((point.x - this.origin.x) / this.spacing) * this.spacing + this.origin.x;
            var y = Math.round((point.y - this.origin.y) / this.spacing) * this.spacing + this.origin.y;
            return new paper.Point(x, y);
        }
    }, {
        key: "setOrigin",
        value: function setOrigin(origin) {
            this.origin = new paper.Point(origin[0], origin[1]);
            this.updateView();
        }
    }, {
        key: "setThinWidth",
        value: function setThinWidth(width) {
            this.thinWidth = width;
            this.updateView();
        }
    }, {
        key: "setThickWidth",
        value: function setThickWidth(width) {
            this.thickWidth = width;
            this.updateView();
        }
    }, {
        key: "setMinSpacing",
        value: function setMinSpacing(pixels) {
            this.spacing = pixels;
            this.updateView();
        }
    }, {
        key: "setMaxSpacing",
        value: function setMaxSpacing(pixels) {
            this.maxSpacing = pixels;
            this.updateView();
        }
    }, {
        key: "setColor",
        value: function setColor(color) {
            this.color = color;
            this.updateView();
        }
    }, {
        key: "getSpacing",
        value: function getSpacing() {
            var min = this.minSpacing / paper.view.zoom;
            var max = this.maxSpacing / paper.view.zoom;
            while (this.spacing < min) {
                this.spacing = this.spacing * 10;
            }
            while (this.spacing > max) {
                this.spacing = this.spacing / 10;
            }
            return this.spacing;
        }
    }, {
        key: "getThinWidth",
        value: function getThinWidth() {
            return this.thinWidth / paper.view.zoom;
        }
    }, {
        key: "getThickWidth",
        value: function getThickWidth() {
            return this.thickWidth / paper.view.zoom;
        }
    }, {
        key: "updateView",
        value: function updateView() {
            if (Registry.viewManager) Registry.viewManager.updateGrid();
        }
    }]);

    return AdaptiveGrid;
})();

module.exports = AdaptiveGrid;

},{"../../core/registry":21,"../colors":35}],46:[function(require,module,exports){
"use strict";

var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");
var Features = require("../core/features");

var activeButton = null;
var activeLayer = null;
var channelButton = document.getElementById("channel_button");
var circleValveButton = document.getElementById("circleValve_button");
var portButton = document.getElementById("port_button");
var viaButton = document.getElementById("via_button");

var flowButton = document.getElementById("flow_button");
var controlButton = document.getElementById("control_button");

var inactiveBackground = Colors.GREY_200;
var inactiveText = Colors.BLACK;
var activeText = Colors.WHITE;

var buttons = {
    "Channel": channelButton,
    "Via": viaButton,
    "Port": portButton,
    "CircleValve": circleValveButton
};

var layerButtons = {
    "0": flowButton,
    "1": controlButton
};

var layerIndices = {
    "0": 0,
    "1": 1
};

function setButtonColor(button, background, text) {
    button.style.background = background;
    button.style.color = text;
}

function setActiveButton(feature) {
    if (activeButton) setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
    activeButton = feature;
    setButtonColor(buttons[activeButton], Colors.getDefaultFeatureColor(Features[activeButton], Registry.currentLayer), activeText);
}

function setActiveLayer(layerName) {
    if (activeLayer) setButtonColor(layerButtons[activeLayer], inactiveBackground, inactiveText);
    activeLayer = layerName;
    setActiveButton(activeButton);
    var bgColor = Colors.getDefaultLayerColor(Registry.currentLayer);
    setButtonColor(layerButtons[activeLayer], bgColor, activeText);
}

function setupAppPage() {
    channelButton.onclick = function () {
        Registry.viewManager.activateTool("Channel");
        var bg = Colors.getDefaultFeatureColor(Features.Channel, Registry.currentLayer);
        setActiveButton("Channel");
    };

    circleValveButton.onclick = function () {
        Registry.viewManager.activateTool("CircleValve");
        var bg = Colors.getDefaultFeatureColor(Features.CircleValve, Registry.currentLayer);
        setActiveButton("CircleValve");
    };

    portButton.onclick = function () {
        Registry.viewManager.activateTool("Port");
        var bg = Colors.getDefaultFeatureColor(Features.Port, Registry.currentLayer);
        setActiveButton("Port");
    };

    viaButton.onclick = function () {
        Registry.viewManager.activateTool("Via");
        var bg = Colors.getDefaultFeatureColor(Features.Via, Registry.currentLayer);
        setActiveButton("Via");
    };

    flowButton.onclick = function () {
        Registry.currentLayer = Registry.currentDevice.layers[0];
        setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();
    };

    controlButton.onclick = function () {
        Registry.currentLayer = Registry.currentDevice.layers[1];
        setActiveLayer("1");
        Registry.viewManager.updateActiveLayer();
    };

    setActiveButton("Channel");
    setActiveLayer("0");
}

module.exports.setupAppPage = setupAppPage;

},{"../core/features":10,"../core/registry":21,"../utils/htmlUtils":31,"./colors":35}],47:[function(require,module,exports){
"use strict";

var Colors = require("./colors");

var RoundedRect = function RoundedRect(start, end, width) {
    var startPoint = new paper.Point(start[0], start[1]);
    var endPoint = new paper.Point(end[0], end[1]);
    var vec = endPoint.subtract(startPoint);
    var rec = paper.Path.Rectangle({
        size: [vec.length + width, width],
        point: start,
        radius: width / 2
    });
    rec.translate([-width / 2, -width / 2]);
    rec.rotate(vec.angle, start);
    return rec;
};

var Circle = function Circle(position, radius) {
    var pos = new paper.Point(position);
    var circ = new paper.Path.Circle(pos, radius);
    return circ;
};

var CircleTarget = function CircleTarget(position, radius) {
    if (radius < 8 / paper.view.zoom) radius = 8 / paper.view.zoom;
    var circ = Circle(position, radius);
    circ.fillColor = Colors.BLUE_300;
    circ.fillColor.alpha = .5;
    circ.strokeColor = Colors.WHITE;
    circ.strokeWidth = 3 / paper.view.zoom;
    if (circ.strokeWidth > radius / 2) circ.strokeWidth = radius / 2;
    return circ;
};

module.exports.RoundedRect = RoundedRect;
module.exports.Circle = Circle;
module.exports.CircleTarget = CircleTarget;

},{"./colors":35}],48:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../core/registry");
var FeatureRenderers = require("./featureRenderers");
var GridRenderer = require("./grid/GridRenderer");
var DeviceRenderer = require("./deviceRenderer");
var PanAndZoom = require("./PanAndZoom");
var SimpleQueue = require("../utils/simpleQueue");

var PaperView = (function () {
    function PaperView(canvas) {
        _classCallCheck(this, PaperView);

        this.panAndZoom = new PanAndZoom(this);
        this.center = paper.view.center;
        var ref = this;
        this.zoom = paper.view.zoom;
        this.canvas = canvas;
        this.paperFeatures = {};
        this.paperGrid = null;
        this.paperDevice = null;
        this.activeLayer = null;
        this.gridLayer = new paper.Group();
        this.deviceLayer = new paper.Group();
        this.gridLayer.insertAbove(this.deviceLayer);
        this.featureLayer = new paper.Group();
        this.featureLayer.insertAbove(this.gridLayer);
        this.uiLayer = new paper.Group();
        this.uiLayer.insertAbove(this.featureLayer);
        this.currentTarget = null;
        this.lastTargetType = null;
        this.lastTargetPosition = null;
        this.inactiveAlpha = .5;
    }

    _createClass(PaperView, [{
        key: "getCenter",
        value: function getCenter() {
            return this.center;
        }
    }, {
        key: "setCenter",
        value: function setCenter(point) {
            this.center = point;
            this.updateCenter();
        }
    }, {
        key: "updateCenter",
        value: function updateCenter() {
            paper.view.center = this.center;
        }
    }, {
        key: "getZoom",
        value: function getZoom() {
            return this.zoom;
        }
    }, {
        key: "setZoom",
        value: function setZoom(zoom) {
            this.zoom = zoom;
            this.updateZoom();
        }
    }, {
        key: "updateZoom",
        value: function updateZoom() {
            paper.view.zoom = this.zoom;
        }
    }, {
        key: "canvasToProject",
        value: function canvasToProject(x, y) {
            var rect = this.canvas.getBoundingClientRect();
            var projX = x - rect.left;
            var projY = y - rect.top;
            return paper.view.viewToProject(new paper.Point(projX, projY));
        }
    }, {
        key: "getProjectPosition",
        value: function getProjectPosition(x, y) {
            return this.canvasToProject(x, y);
        }
    }, {
        key: "setMouseWheelFunction",
        value: function setMouseWheelFunction(func) {
            this.canvas.addEventListener("wheel", func);
        }
    }, {
        key: "setMouseDownFunction",
        value: function setMouseDownFunction(func) {
            this.canvas.onmousedown = func;
        }
    }, {
        key: "setMouseUpFunction",
        value: function setMouseUpFunction(func) {
            this.canvas.onmouseup = func;
        }
    }, {
        key: "setMouseMoveFunction",
        value: function setMouseMoveFunction(func) {
            this.canvas.onmousemove = func;
        }
    }, {
        key: "setKeyPressFunction",
        value: function setKeyPressFunction(func) {
            this.canvas.onkeypress = func;
        }
    }, {
        key: "setKeyDownFunction",
        value: function setKeyDownFunction(func) {
            this.canvas.onkeydown = func;
        }
    }, {
        key: "setResizeFunction",
        value: function setResizeFunction(func) {
            paper.view.onResize = func;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            paper.view.update();
        }

        /* Rendering Devices */
    }, {
        key: "addDevice",
        value: function addDevice(device) {
            this.updateDevice(device);
        }
    }, {
        key: "updateDevice",
        value: function updateDevice(device) {
            this.removeDevice(device);
            var newPaperDevice = DeviceRenderer.renderDevice(device);
            this.paperDevice = newPaperDevice;
            this.deviceLayer.addChild(newPaperDevice);
        }
    }, {
        key: "removeDevice",
        value: function removeDevice() {
            if (this.paperDevice) this.paperDevice.remove();
            this.paperDevice = null;
        }

        /* Rendering Layers */

    }, {
        key: "addLayer",
        value: function addLayer(layer, index) {
            this.featureLayer.insertChild(index, new paper.Group());
        }
    }, {
        key: "updateLayer",
        value: function updateLayer(layer, index) {
            // do nothing, for now
        }
    }, {
        key: "removeLayer",
        value: function removeLayer(layer, index) {}
        // do nothing, for now

        /* Rendering Features */

    }, {
        key: "addFeature",
        value: function addFeature(feature) {
            this.updateFeature(feature);
        }
    }, {
        key: "setActiveLayer",
        value: function setActiveLayer(index) {
            this.activeLayer = index;
            this.showActiveLayer();
        }
    }, {
        key: "showActiveLayer",
        value: function showActiveLayer() {
            var layers = this.featureLayer.children;

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var targetAlpha = undefined;
                if (i != this.activeLayer) {
                    targetAlpha = this.inactiveAlpha;
                } else {
                    targetAlpha = 1;
                }
                for (var j = 0; j < layer.children.length; j++) {
                    layer.children[j].fillColor.alpha = targetAlpha;
                }
            }
        }
    }, {
        key: "comparePaperFeatureHeights",
        value: function comparePaperFeatureHeights(a, b) {
            var aFeature = Registry.currentDevice.getFeatureByID(a.featureID);
            var bFeature = Registry.currentDevice.getFeatureByID(b.featureID);
            var aHeight = undefined;
            var bHeight = undefined;
            try {
                aHeight = aFeature.params.getValue("height");
            } catch (err) {
                aHeight = Registry.registeredFeatures[aFeature.type].getDefaultValues()["height"];
            }

            try {
                bHeight = bFeature.params.getValue("height");
            } catch (err) {
                bHeight = Registry.registeredFeatures[bFeature.type].getDefaultValues()["height"];
            }
            return aHeight - bHeight;
        }
    }, {
        key: "insertChildByHeight",
        value: function insertChildByHeight(group, newChild) {
            this.getIndexByHeight(group.children, newChild);
            var index = this.getIndexByHeight(group.children, newChild);
            group.insertChild(index, newChild);
        }

        // TODO: Could be done faster with a binary search. Probably not needed!
    }, {
        key: "getIndexByHeight",
        value: function getIndexByHeight(children, newChild) {
            for (var i = 0; i < children.length; i++) {
                var test = this.comparePaperFeatureHeights(children[i], newChild);
                if (test >= 0) {
                    return i;
                }
            }
            return children.length;
        }
    }, {
        key: "updateFeature",
        value: function updateFeature(feature) {
            this.removeFeature(feature);
            var newPaperFeature = FeatureRenderers[feature.type].renderFeature(feature);
            this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
            //TODO: This is terrible. Fix it. Fix it now.
            var index = feature.layer.device.layers.indexOf(feature.layer);
            var layer = this.featureLayer.children[index];
            this.insertChildByHeight(layer, newPaperFeature);
            if (index != this.activeLayer && this.activeLayer != null) newPaperFeature.fillColor.alpha = this.inactiveAlpha;
        }
    }, {
        key: "removeTarget",
        value: function removeTarget() {
            if (this.currentTarget) this.currentTarget.remove();
            this.currentTarget = null;
        }
    }, {
        key: "addTarget",
        value: function addTarget(featureType, position) {
            this.removeTarget();
            this.lastTargetType = featureType;
            this.lastTargetPosition = position;
            this.updateTarget();
        }
    }, {
        key: "updateTarget",
        value: function updateTarget() {
            this.removeTarget();
            if (this.lastTargetType && this.lastTargetPosition) {
                var renderer = FeatureRenderers[this.lastTargetType];
                //console.log(renderer.renderTarget.toSource());
                this.currentTarget = FeatureRenderers[this.lastTargetType].renderTarget(this.lastTargetPosition);
                this.uiLayer.addChild(this.currentTarget);
            }
        }
    }, {
        key: "removeFeature",
        value: function removeFeature(feature) {
            var paperFeature = this.paperFeatures[feature.id];
            if (paperFeature) paperFeature.remove();
            this.paperFeatures[feature.id] = null;
        }
    }, {
        key: "removeGrid",
        value: function removeGrid() {
            if (this.paperGrid) this.paperGrid.remove();
            this.paperGrid = null;
        }
    }, {
        key: "updateGrid",
        value: function updateGrid(grid) {
            this.removeGrid();
            var newPaperGrid = GridRenderer.renderGrid(grid);
            this.paperGrid = newPaperGrid;
            this.gridLayer.addChild(newPaperGrid);
        }
    }, {
        key: "moveCenter",
        value: function moveCenter(delta) {
            this.panAndZoom.moveCenter(delta);
        }
    }, {
        key: "adjustZoom",
        value: function adjustZoom(delta, point) {
            this.panAndZoom.adjustZoom(delta, point);
        }
    }, {
        key: "getFeaturesByViewElements",
        value: function getFeaturesByViewElements(paperFeatures) {
            var output = [];
            for (var i = 0; i < paperFeatures.length; i++) {
                output.push(Registry.currentDevice.getFeatureByID(paperFeatures[i].featureID));
            }
            return output;
        }
    }, {
        key: "hitFeature",
        value: function hitFeature(point) {
            var onlyHitActiveLayer = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var hitOptions = {
                fill: true,
                tolerance: 5,
                guides: false
            };

            var target = undefined;

            if (onlyHitActiveLayer && this.activeLayer != null) {
                target = this.featureLayer.children[this.activeLayer];
            } else target = this.featureLayer.hitTest(point, hitOptions);

            var result = target.hitTest(point, hitOptions);
            if (result) {
                return result.item;
            }
        }
    }, {
        key: "hitFeaturesWithViewElement",
        value: function hitFeaturesWithViewElement(paperElement) {
            var onlyHitActiveLayer = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var output = [];
            if (onlyHitActiveLayer && this.activeLayer != null) {
                var layer = this.featureLayer.children[this.activeLayer];
                for (var i = 0; i < layer.children.length; i++) {
                    var child = layer.children[i];
                    if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                        output.push(child);
                    }
                }
            } else {
                for (var i = 0; i < this.featureLayer.children.length; i++) {
                    var layer = this.featureLayer.children[i];
                    for (var j = 0; j < layer.children.length; j++) {
                        var child = layer.children[j];
                        if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                            output.push(child);
                        }
                    }
                }
            }

            return output;
        }
    }]);

    return PaperView;
})();

module.exports = PaperView;

},{"../core/registry":21,"../utils/simpleQueue":33,"./PanAndZoom":34,"./deviceRenderer":36,"./featureRenderers":41,"./grid/GridRenderer":44}],49:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../../core/registry");

var MouseTool = (function () {
    function MouseTool() {
        _classCallCheck(this, MouseTool);

        this.up = MouseTool.defaultFunction("up");
        this.down = MouseTool.defaultFunction("down");
        this.move = MouseTool.defaultFunction("move");
    }

    _createClass(MouseTool, null, [{
        key: "defaultFunction",
        value: function defaultFunction(string) {
            return function () {
                console.log("No " + string + " function set.");
            };
        }
    }, {
        key: "getEventPosition",
        value: function getEventPosition(event) {
            return Registry.viewManager.getEventPosition(event);
        }
    }]);

    return MouseTool;
})();

module.exports = MouseTool;

},{"../../core/registry":21}],50:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Features = require("../../core/features");
var Registry = require("../../core/registry");
var MouseTool = require("./mouseTool");
var SimpleQueue = require("../../utils/simpleQueue");

var ChannelTool = (function (_MouseTool) {
	_inherits(ChannelTool, _MouseTool);

	function ChannelTool(channelClass) {
		_classCallCheck(this, ChannelTool);

		_get(Object.getPrototypeOf(ChannelTool.prototype), "constructor", this).call(this);
		this.channelClass = channelClass;
		this.startPoint = null;
		this.lastPoint = null;
		this.currentChannelID = null;
		this.currentTarget = null;
		this.dragging = false;
		var ref = this;

		this.showQueue = new SimpleQueue(function () {
			ref.showTarget();
		}, 20, false);

		this.updateQueue = new SimpleQueue(function () {
			ref.updateChannel();
		}, 20, false);

		this.down = function (event) {
			ref.dragging = true;
			ref.initChannel();
		};
		this.up = function (event) {
			ref.dragging = false;
			ref.finishChannel(MouseTool.getEventPosition(event));
		};
		this.move = function (event) {
			ref.lastPoint = MouseTool.getEventPosition(event);
			if (ref.dragging) {
				ref.updateQueue.run();
			}
			ref.showQueue.run();
		};
	}

	_createClass(ChannelTool, [{
		key: "abort",
		value: function abort() {
			ref.dragging = false;
			if (this.currentTarget) {
				this.currentTarget.remove();
			}
			if (this.currentChannelID) {
				Registry.currentLayer.removeFeatureByID(this.currentChannelID);
			}
		}
	}, {
		key: "showTarget",
		value: function showTarget(point) {
			var target = ChannelTool.getTarget(this.lastPoint);
			Registry.viewManager.updateTarget(this.channelClass.typeString(), [target.x, target.y]);
		}
	}, {
		key: "initChannel",
		value: function initChannel() {
			this.startPoint = ChannelTool.getTarget(this.lastPoint);
			this.lastPoint = this.startPoint;
		}

		//TODO: Re-render only the current channel, to improve perforamnce
	}, {
		key: "updateChannel",
		value: function updateChannel() {
			if (this.lastPoint && this.startPoint) {
				if (this.currentChannelID) {
					var target = ChannelTool.getTarget(this.lastPoint);
					var feat = Registry.currentLayer.getFeature(this.currentChannelID);
					feat.updateParameter("end", [target.x, target.y]);
					Registry.canvasManager.render();
				} else {
					var newChannel = this.createChannel(this.startPoint, this.startPoint);
					this.currentChannelID = newChannel.id;
					Registry.currentLayer.addFeature(newChannel);
				}
			}
		}
	}, {
		key: "finishChannel",
		value: function finishChannel(point) {
			var target = ChannelTool.getTarget(point);
			if (this.currentChannelID) {
				if (this.startPoint.x == target.x && this.startPoint.y == target.y) {
					Registry.currentLayer.removeFeatureByID(this.currentChannelID);
					//TODO: This will be slow for complex devices, since it re-renders everything
					Registry.canvasManager.render();
				}
			} else {
				this.updateChannel(point);
			}
			this.currentChannelID = null;
			this.startPoint = null;
		}
	}, {
		key: "createChannel",
		value: function createChannel(start, end) {
			return new this.channelClass({
				"start": [start.x, start.y],
				"end": [end.x, end.y]
			});
		}

		//TODO: Re-establish target selection logic from earlier demo
	}], [{
		key: "makeReticle",
		value: function makeReticle(point) {
			var size = 10 / paper.view.zoom;
			var ret = paper.Path.Circle(point, size);
			ret.fillColor = new paper.Color(.5, 0, 1, .5);
			return ret;
		}
	}, {
		key: "getTarget",
		value: function getTarget(point) {
			return Registry.viewManager.snapToGrid(point);
		}
	}]);

	return ChannelTool;
})(MouseTool);

module.exports = ChannelTool;

},{"../../core/features":10,"../../core/registry":21,"../../utils/simpleQueue":33,"./mouseTool":51}],51:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../../core/registry");

var MouseTool = (function () {
    function MouseTool() {
        _classCallCheck(this, MouseTool);

        this.up = MouseTool.defaultFunction("up");
        this.down = MouseTool.defaultFunction("down");
        this.move = MouseTool.defaultFunction("move");
    }

    _createClass(MouseTool, null, [{
        key: "defaultFunction",
        value: function defaultFunction(string) {
            return function () {
                console.log("No " + string + " function set.");
            };
        }
    }, {
        key: "getEventPosition",
        value: function getEventPosition(event) {
            return Registry.viewManager.getEventPosition(event);
        }
    }]);

    return MouseTool;
})();

module.exports = MouseTool;

},{"../../core/registry":21}],52:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var MouseTool = require("./mouseTool");
var SimpleQueue = require("../../utils/simpleQueue");

var PanTool = (function (_MouseTool) {
    _inherits(PanTool, _MouseTool);

    function PanTool() {
        _classCallCheck(this, PanTool);

        _get(Object.getPrototypeOf(PanTool.prototype), "constructor", this).call(this);
        this.startPoint = null;
        this.lastPoint = null;
        this.startCenter = null;
        var ref = this;
        this.updateQueue = new SimpleQueue(function () {
            ref.pan();
        }, 10);
        this.down = function (event) {
            ref.startPan(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
        this.up = function (event) {
            ref.endPan(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
        this.move = function (event) {
            ref.moveHandler(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
    }

    _createClass(PanTool, [{
        key: "startPan",
        value: function startPan(point) {
            this.dragging = true;
            this.startPoint = point;
        }
    }, {
        key: "moveHandler",
        value: function moveHandler(point) {
            if (this.dragging) {
                this.lastPoint = point;
                this.updateQueue.run();
                // this.pan();
            }
        }
    }, {
        key: "endPan",
        value: function endPan(point) {
            this.pan();
            this.lastPoint = null;
            this.dragging = false;
            this.startPoint = null;
        }
    }, {
        key: "showTarget",
        value: function showTarget() {
            Registry.viewManager.removeTarget();
        }
    }, {
        key: "pan",
        value: function pan() {
            if (this.lastPoint) {
                var delta = this.lastPoint.subtract(this.startPoint);
                Registry.viewManager.moveCenter(delta);
            }
        }
    }]);

    return PanTool;
})(MouseTool);

module.exports = PanTool;

},{"../../core/registry":21,"../../utils/simpleQueue":33,"./mouseTool":51}],53:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MouseTool = require("./mouseTool");
var Registry = require("../../core/registry");
var SimpleQueue = require("../../utils/SimpleQueue");

var PositionTool = (function (_MouseTool) {
    _inherits(PositionTool, _MouseTool);

    function PositionTool(featureClass) {
        _classCallCheck(this, PositionTool);

        _get(Object.getPrototypeOf(PositionTool.prototype), "constructor", this).call(this);
        this.featureClass = featureClass;
        this.currentFeatureID = null;
        var ref = this;
        this.lastPoint = null;
        this.showQueue = new SimpleQueue(function () {
            ref.showTarget();
        }, 20, false);
        this.up = function (event) {
            // do nothing
        };
        this.move = function (event) {
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        };
        this.down = function (event) {
            ref.createNewFeature(MouseTool.getEventPosition(event));
        };
    }

    _createClass(PositionTool, [{
        key: "createNewFeature",
        value: function createNewFeature(point) {
            var target = PositionTool.getTarget(point);
            var newFeature = new this.featureClass({
                position: [target.x, target.y]
            });
            this.currentFeatureID = newFeature.id;
            Registry.currentLayer.addFeature(newFeature);
        }
    }, {
        key: "showTarget",
        value: function showTarget() {
            var target = PositionTool.getTarget(this.lastPoint);
            Registry.viewManager.updateTarget(this.featureClass.typeString(), [target.x, target.y]);
        }
    }], [{
        key: "getTarget",
        value: function getTarget(point) {
            return Registry.viewManager.snapToGrid(point);
        }
    }]);

    return PositionTool;
})(MouseTool);

module.exports = PositionTool;

},{"../../core/registry":21,"../../utils/SimpleQueue":30,"./mouseTool":51}],54:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Registry = require("../../core/registry");
var MouseTool = require("./MouseTool");
var SimpleQueue = require("../../utils/simpleQueue");

var SelectTool = (function (_MouseTool) {
	_inherits(SelectTool, _MouseTool);

	function SelectTool() {
		_classCallCheck(this, SelectTool);

		_get(Object.getPrototypeOf(SelectTool.prototype), "constructor", this).call(this);
		this.dragging = false;
		this.dragStart = null;
		this.lastPoint = null;
		this.currentSelectBox = null;
		this.currentSelection = [];
		var ref = this;
		this.updateQueue = new SimpleQueue(function () {
			ref.dragHandler();
		}, 20);
		this.down = function (event) {
			ref.mouseDownHandler(MouseTool.getEventPosition(event));
			ref.dragging = true;
			ref.showTarget();
		};
		this.move = function (event) {
			if (ref.dragging) {
				ref.lastPoint = MouseTool.getEventPosition(event);
				ref.updateQueue.run();
			}
			ref.showTarget();
		};
		this.up = function (event) {
			ref.dragging = false;
			ref.mouseUpHandler(MouseTool.getEventPosition(event));
			ref.showTarget();
		};
	}

	_createClass(SelectTool, [{
		key: "keyHandler",
		value: function keyHandler(event) {
			if (event.key == "delete" || event.key == "backspace") {
				this.removeFeatures();
			}
		}
	}, {
		key: "dragHandler",
		value: function dragHandler() {
			if (this.dragStart) {
				if (this.currentSelectBox) {
					this.currentSelectBox.remove();
				}
				this.currentSelectBox = this.rectSelect(this.dragStart, this.lastPoint);
			}
		}
	}, {
		key: "showTarget",
		value: function showTarget() {
			Registry.viewManager.removeTarget();
		}
	}, {
		key: "mouseUpHandler",
		value: function mouseUpHandler(point) {
			if (this.currentSelectBox) {
				this.currentSelection = Registry.viewManager.hitFeaturesWithViewElement(this.currentSelectBox);
				this.selectFeatures();
			}
			this.killSelectBox();
		}
	}, {
		key: "removeFeatures",
		value: function removeFeatures() {
			if (this.currentSelection.length > 0) {
				for (var i = 0; i < this.currentSelection.length; i++) {
					var paperFeature = this.currentSelection[i];
					Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
				}
				this.currentSelection = [];
				Registry.canvasManager.render();
			}
		}
	}, {
		key: "mouseDownHandler",
		value: function mouseDownHandler(point) {
			var target = this.hitFeature(point);
			if (target) {
				this.deselectFeatures();
				this.selectFeature(target);
			} else {
				this.deselectFeatures();
				this.dragStart = point;
			}
		}
	}, {
		key: "killSelectBox",
		value: function killSelectBox() {
			if (this.currentSelectBox) {
				this.currentSelectBox.remove();
				this.currentSelectBox = null;
			}
			this.dragStart = null;
		}
	}, {
		key: "hitFeature",
		value: function hitFeature(point) {
			var target = Registry.viewManager.hitFeature(point);
			return target;
		}
	}, {
		key: "selectFeature",
		value: function selectFeature(paperElement) {
			this.currentSelection.push(paperElement);
			paperElement.selected = true;
		}
	}, {
		key: "selectFeatures",
		value: function selectFeatures() {
			if (this.currentSelection) {
				for (var i = 0; i < this.currentSelection.length; i++) {
					var paperFeature = this.currentSelection[i];
					paperFeature.selected = true;
				}
			}
		}
	}, {
		key: "deselectFeatures",
		value: function deselectFeatures() {
			if (this.currentSelection) {
				for (var i = 0; i < this.currentSelection.length; i++) {
					var paperFeature = this.currentSelection[i];
					paperFeature.selected = false;
				}
			}
			this.currentSelection = [];
		}
	}, {
		key: "abort",
		value: function abort() {
			this.deselectFeatures();
			this.killSelectBox();
		}
	}, {
		key: "rectSelect",
		value: function rectSelect(point1, point2) {
			var rect = new paper.Path.Rectangle(point1, point2);
			rect.fillColor = new paper.Color(0, .3, 1, .4);
			rect.strokeColor = new paper.Color(0, 0, 0);
			rect.strokeWidth = 2;
			rect.selected = true;
			return rect;
		}
	}]);

	return SelectTool;
})(MouseTool);

module.exports = SelectTool;

},{"../../core/registry":21,"../../utils/simpleQueue":33,"./MouseTool":49}],55:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = require("../core/registry");
var ChannelTool = require("./tools/channelTool");
var MouseTool = require("./tools/mouseTool");
var Features = require("../core/features");
var PanTool = require("./tools/panTool");
var PanAndZoom = require("./PanAndZoom");
var SelectTool = require("./tools/selectTool");
var SimpleQueue = require("../utils/SimpleQueue");
var PositionTool = require("./tools/positionTool");

var ViewManager = (function () {
    function ViewManager(view) {
        _classCallCheck(this, ViewManager);

        this.view = view;
        this.tools = {};
        this.middleMouseTool = new PanTool();
        this.rightMouseTool = new SelectTool();
        var reference = this;
        this.updateQueue = new SimpleQueue(function () {
            reference.view.refresh();
        }, 20);
        window.onkeydown = function (event) {
            var key = event.keyCode || event.which;
            if (key == 46 || key == 8) {
                event.preventDefault();
            }
        };
        this.view.setKeyDownFunction(function (event) {
            var key = event.keyCode || event.which;
            if (key == 46 || key == 8) {}
        });

        this.view.setResizeFunction(function () {
            reference.updateGrid();
            reference.updateDevice(Registry.currentDevice);
        });

        var func = function func(event) {
            reference.adjustZoom(event.deltaY, reference.getEventPosition(event));
        };
        this.view.setMouseWheelFunction(func);
        this.minZoom = .0001;
        this.maxZoom = 5;
        this.setupTools();
        this.activateTool("Channel");
    }

    _createClass(ViewManager, [{
        key: "addDevice",
        value: function addDevice(device) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.view.addDevice(device);
            this.__addAllDeviceLayers(device, false);
            this.refresh(refresh);
        }
    }, {
        key: "__addAllDeviceLayers",
        value: function __addAllDeviceLayers(device) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            for (var i = 0; i < device.layers.length; i++) {
                var layer = device.layers[i];
                this.addLayer(layer, i, false);
            }
        }
    }, {
        key: "__removeAllDeviceLayers",
        value: function __removeAllDeviceLayers(device) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            for (var i = 0; i < device.layers.length; i++) {
                var layer = device.layers[i];
                this.removeLayer(layer, i, false);
            }
        }
    }, {
        key: "removeDevice",
        value: function removeDevice(device) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.view.removeDevice(device);
            this.__removeAllDeviceLayers(device, false);
            this.refresh(refresh);
        }
    }, {
        key: "updateDevice",
        value: function updateDevice(device) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.view.updateDevice(device);
            this.refresh(refresh);
        }
    }, {
        key: "addFeature",
        value: function addFeature(feature) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            if (this.__isFeatureInCurrentDevice(feature)) {
                this.view.addFeature(feature);
                this.refresh(refresh);
            }
        }
    }, {
        key: "updateFeature",
        value: function updateFeature(feature) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            if (this.__isFeatureInCurrentDevice(feature)) {
                this.view.updateFeature(feature);
                this.refresh(refresh);
            }
        }
    }, {
        key: "removeFeature",
        value: function removeFeature(feature) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            if (this.__isFeatureInCurrentDevice(feature)) {
                this.view.removeFeature(feature);
                this.refresh(refresh);
            }
        }
    }, {
        key: "addLayer",
        value: function addLayer(layer, index) {
            var refresh = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            if (this.__isLayerInCurrentDevice(layer)) {
                this.view.addLayer(layer, index, false);
                this.__addAllLayerFeatures(layer, false);
                this.refresh(refresh);
            }
        }
    }, {
        key: "updateLayer",
        value: function updateLayer(layer, index) {
            var refresh = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            if (this.__isLayerInCurrentDevice(layer)) {
                this.view.updateLayer(layer);
                this.refresh(refresh);
            }
        }
    }, {
        key: "removeLayer",
        value: function removeLayer(layer, index) {
            var refresh = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            if (this.__isLayerInCurrentDevice(layer)) {
                this.view.removeLayer(layer, index);
                this.__removeAllLayerFeatures(layer);
                this.refresh(refresh);
            }
        }
    }, {
        key: "__addAllLayerFeatures",
        value: function __addAllLayerFeatures(layer) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            for (var key in layer.features) {
                var feature = layer.features[key];
                this.addFeature(feature, false);
                this.refresh(refresh);
            }
        }
    }, {
        key: "__updateAllLayerFeatures",
        value: function __updateAllLayerFeatures(layer) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            for (var key in layer.features) {
                var feature = layer.features[key];
                this.updateFeature(feature, false);
                this.refresh(refresh);
            }
        }
    }, {
        key: "__removeAllLayerFeatures",
        value: function __removeAllLayerFeatures(layer) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            for (var key in layer.features) {
                var feature = layer.features[key];
                this.removeFeature(feature, false);
                this.refresh(refresh);
            }
        }
    }, {
        key: "updateLayer",
        value: function updateLayer(layer) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            if (this.__isLayerInCurrentDevice(layer)) {
                this.view.updateLayer(layer);
                this.refresh(refresh);
            }
        }
    }, {
        key: "updateActiveLayer",
        value: function updateActiveLayer() {
            var refresh = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this.view.setActiveLayer(Registry.currentDevice.layers.indexOf(Registry.currentLayer));
            this.refresh(refresh);
        }
    }, {
        key: "removeGrid",
        value: function removeGrid() {
            var refresh = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            if (this.__hasCurrentGrid()) {
                this.view.removeGrid();
                this.refresh(refresh);
            }
        }
    }, {
        key: "updateGrid",
        value: function updateGrid() {
            var refresh = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            if (this.__hasCurrentGrid()) {
                this.view.updateGrid(Registry.currentGrid);
                this.refresh(refresh);
            }
        }
    }, {
        key: "setZoom",
        value: function setZoom(zoom) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.view.setZoom(zoom);
            this.updateGrid(false);
            this.updateDevice(Registry.currentDevice, false);
            this.__updateViewTarget(false);
            this.refresh(refresh);
        }
    }, {
        key: "removeTarget",
        value: function removeTarget() {
            this.view.removeTarget();
        }
    }, {
        key: "updateTarget",
        value: function updateTarget(featureType, position) {
            var refresh = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            this.view.addTarget(featureType, position);
            this.refresh(refresh);
        }
    }, {
        key: "__updateViewTarget",
        value: function __updateViewTarget() {
            var refresh = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this.view.updateTarget();
            this.refresh(refresh);
        }
    }, {
        key: "adjustZoom",
        value: function adjustZoom(delta, point) {
            var refresh = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            var belowMin = this.view.getZoom() >= this.maxZoom && delta < 0;
            var aboveMax = this.view.getZoom() <= this.minZoom && delta > 0;
            if (!aboveMax && !belowMin) {
                this.view.adjustZoom(delta, point);
                this.updateGrid(false);
                this.updateDevice(Registry.currentDevice, false);
                this.__updateViewTarget(false);
            } else {
                //console.log("Too big or too small!");
            }
            this.refresh(refresh);
        }
    }, {
        key: "setCenter",
        value: function setCenter(center) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.view.setCenter(center);
            this.updateGrid(false);
            this.updateDevice(Registry.currentDevice, false);
            this.refresh(refresh);
        }
    }, {
        key: "moveCenter",
        value: function moveCenter(delta) {
            var refresh = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.view.moveCenter(delta);
            this.updateGrid(false);
            this.updateDevice(Registry.currentDevice, false);
            this.refresh(refresh);
        }
    }, {
        key: "refresh",
        value: function refresh() {
            var _refresh = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            //this.view.refresh();
            this.updateQueue.run();
        }
    }, {
        key: "getEventPosition",
        value: function getEventPosition(event) {
            return this.view.getProjectPosition(event.clientX, event.clientY);
        }
    }, {
        key: "__hasCurrentGrid",
        value: function __hasCurrentGrid() {
            if (Registry.currentGrid) return true;else return false;
        }
    }, {
        key: "__isLayerInCurrentDevice",
        value: function __isLayerInCurrentDevice(layer) {
            if (Registry.currentDevice && layer.device == Registry.currentDevice) return true;else return false;
        }
    }, {
        key: "__isFeatureInCurrentDevice",
        value: function __isFeatureInCurrentDevice(feature) {
            if (Registry.currentDevice && this.__isLayerInCurrentDevice(feature.layer)) return true;else return false;
        }
    }, {
        key: "constructMouseDownEvent",
        value: function constructMouseDownEvent(tool1, tool2, tool3) {
            return this.constructMouseEvent(tool1.down, tool2.down, tool3.down);
        }
    }, {
        key: "constructMouseMoveEvent",
        value: function constructMouseMoveEvent(tool1, tool2, tool3) {
            return this.constructMouseEvent(tool1.move, tool2.move, tool3.move);
        }
    }, {
        key: "constructMouseUpEvent",
        value: function constructMouseUpEvent(tool1, tool2, tool3) {
            return this.constructMouseEvent(tool1.up, tool2.up, tool3.up);
        }
    }, {
        key: "removeFeaturesByPaperElements",
        value: function removeFeaturesByPaperElements(paperElements) {
            if (paperElements.length > 0) {
                for (var i = 0; i < paperElements.length; i++) {
                    var paperFeature = paperElements[i];
                    Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
                }
                this.currentSelection = [];
            }
        }
    }, {
        key: "constructMouseEvent",
        value: function constructMouseEvent(func1, func2, func3) {
            return function (event) {
                var target = undefined;
                if (event.buttons) {
                    target = ViewManager.__eventButtonsToWhich(event.buttons);
                } else {
                    target = event.which;
                }
                if (target == 2) func2(event);else if (target == 3) func3(event);else if (target == 1 || target == 0) func1(event);
            };
        }
    }, {
        key: "snapToGrid",
        value: function snapToGrid(point) {
            if (Registry.currentGrid) return Registry.currentGrid.getClosestGridPoint(point);else return point;
        }
    }, {
        key: "hitFeature",
        value: function hitFeature(point) {
            return this.view.hitFeature(point);
        }
    }, {
        key: "hitFeaturesWithViewElement",
        value: function hitFeaturesWithViewElement(element) {
            return this.view.hitFeaturesWithViewElement(element);
        }
    }, {
        key: "__updateViewMouseEvents",
        value: function __updateViewMouseEvents() {
            this.view.setMouseDownFunction(this.constructMouseDownEvent(this.leftMouseTool, this.middleMouseTool, this.rightMouseTool));
            this.view.setMouseUpFunction(this.constructMouseUpEvent(this.leftMouseTool, this.middleMouseTool, this.rightMouseTool));
            this.view.setMouseMoveFunction(this.constructMouseMoveEvent(this.leftMouseTool, this.middleMouseTool, this.rightMouseTool));
        }
    }, {
        key: "activateTool",
        value: function activateTool(toolString) {
            this.leftMouseTool = this.tools[toolString];
            this.__updateViewMouseEvents();
        }
    }, {
        key: "setupTools",
        value: function setupTools() {
            this.tools["Channel"] = new ChannelTool(Features.Channel);
            this.tools["CircleValve"] = new PositionTool(Features.CircleValve);
            this.tools["Port"] = new PositionTool(Features.Port);
            this.tools["Via"] = new PositionTool(Features.Via);
        }
    }], [{
        key: "__eventButtonsToWhich",
        value: function __eventButtonsToWhich(num) {
            if (num == 1) {
                return 1;
            } else if (num == 2) {
                return 3;
            } else if (num == 4) {
                return 2;
            } else if (num == 3) {
                return 2;
            }
        }
    }]);

    return ViewManager;
})();

module.exports = ViewManager;

},{"../core/features":10,"../core/registry":21,"../utils/SimpleQueue":30,"./PanAndZoom":34,"./tools/channelTool":50,"./tools/mouseTool":51,"./tools/panTool":52,"./tools/positionTool":53,"./tools/selectTool":54}]},{},[2]);
