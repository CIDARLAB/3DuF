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

var Channel = Features.Channel;
var CircleValve = Features.CircleValve;
var HollowChannel = Features.HollowChannel;

var manager;

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
    "end": [40 * 1000, 40 * 1000],
    "width": .4 * 1000
});
flow.addFeature(chan1);
var circ1 = new CircleValve({
    "position": [30 * 1000, 30 * 1000],
    "radius1": .8 * 1000
});
control.addFeature(circ1);
var chan2 = new Channel({
    "start": [25 * 1000, 20 * 1000],
    "end": [45 * 1000, 40 * 1000],
    "width": 10
});
flow.addFeature(chan2);

Registry.currentDevice = dev;
Registry.currentLayer = dev.layers[0];

paper.setup("c");

window.onload = function () {
    manager = new CanvasManager(document.getElementById("c"));
    manager.render();

    window.dev = dev;
    window.Channel = Channel;
    window.man = manager;
    window.Features = Features;
    window.Registry = Registry;
    var canvas = document.getElementById("c");
    paper.view.center = new paper.Point(30 * 1000, 30 * 1000);
    manager.setZoom(.04);
    manager.updateGridSpacing();
};

/*

var paperFunctions = require("./paperFunctions");

paper.install(window);
paper.setup("c");

window.onload = function(){
    paperFunctions.setup()
    //paperFunctions.channel([100,100],[200,200],20);
};

document.getElementById("c").onmousewheel = function(event){
    view.zoom = paperFunctions.changeZoom(view.zoom, event.wheelDelta);
    console.log(event.offsetX);
}



*/

},{"./core/device":3,"./core/features":10,"./core/layer":12,"./core/registry":21,"./graphics/CanvasManager":22}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Params = require("./params");
var Parameters = require("./parameters");
var Parameter = require("./parameter");
var Feature = require('./feature');
var Layer = require('./layer');
var Group = require('./group');

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

    /* Sort the layers such that they are ordered from lowest to highest z_offset. */

    _createClass(Device, [{
        key: "sortLayers",
        value: function sortLayers() {
            this.layers.sort(function (a, b) {
                return a.params.getValue("z_offset") - b.params.getValue("z_offset");
            });
        }

        /* Add a layer, and re-sort the layers array.*/
    }, {
        key: "addLayer",
        value: function addLayer(layer) {
            this.layers.push(layer);
            this.sortLayers();
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
                this.addLayer(Layer.fromJSON(json[i]));
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
            return new paper.Group(this.__renderLayers2D());
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

},{"./feature":4,"./group":11,"./layer":12,"./parameter":13,"./parameters":16,"./params":20}],4:[function(require,module,exports){
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
        key: 'render2D',

        //I wish I had abstract methods. :(
        value: function render2D() {
            throw new Error("Base class Feature cannot be rendered in 2D.");
        }
    }], [{
        key: 'generateID',
        value: function generateID() {
            return uuid.v1();
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

    _createClass(CircleValve, [{
        key: 'render2D',
        value: function render2D() {
            var position = this.params.getValue("position");
            var radius1 = undefined;

            //TODO: figure out inheritance pattern for values!

            try {
                radius1 = this.params.getValue("radius1");
            } catch (err) {
                radius1 = CircleValve.getDefaultValues()["radius1"];
            }

            var c1 = new paper.Path.Circle(new paper.Point(position), radius1);
            c1.fillColor = new paper.Color(1, 0, 0);
            return c1;
        }
    }], [{
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
                "radius1": 1.2 * 1000,
                "radius2": 1 * 1000,
                "height": .4 * 1000
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

    _createClass(HollowChannel, [{
        key: "render2D",
        value: function render2D() {
            var start = this.params.getValue("start");
            var end = this.params.getValue("end");
            var width = undefined;
            try {
                width = this.params.getValue("width");
            } catch (err) {
                width = HollowChannel.getDefaultValues()["width"];
            }

            var startPoint = new paper.Point(start[0], start[1]);
            var endPoint = new paper.Point(end[0], end[1]);

            var vec = endPoint.subtract(startPoint);
            var ori = new paper.Path.Rectangle({
                size: [vec.length + width, width],
                point: start,
                radius: width / 2
            });
            ori.translate([-width / 2, -width / 2]);
            ori.rotate(vec.angle, start);

            var rec = new paper.Path.Rectangle({
                size: [vec.length + width / 2, width / 2],
                point: start,
                radius: width / 4
            });
            rec.translate([-width / 4, -width / 4]);
            rec.rotate(vec.angle, start);

            return new paper.CompoundPath({
                children: [ori, rec],
                fillColor: new paper.Color(0, 0, 0)
            });
        }
    }], [{
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
                "height": .4 * 1000
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

    _createClass(Port, [{
        key: 'render2D',
        value: function render2D() {
            var position = this.params.getValue("position");
            var radius1 = undefined;

            //TODO: figure out inheritance pattern for values!

            try {
                radius1 = this.params.getValue("radius1");
            } catch (err) {
                radius1 = Port.getDefaultValues()["radius1"];
            }

            var c1 = new paper.Path.Circle(new paper.Point(position), radius1);
            c1.fillColor = new paper.Color(.5, 0, .5);
            return c1;
        }
    }], [{
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
                "radius1": .6 * 1000,
                "radius2": .6 * 1000,
                "height": .8 * 1000
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

    _createClass(Via, [{
        key: 'render2D',
        value: function render2D() {
            var position = this.params.getValue("position");
            var radius1 = undefined;

            //TODO: figure out inheritance pattern for values!

            try {
                radius1 = this.params.getValue("radius1");
            } catch (err) {
                radius1 = Via.getDefaultValues()["radius1"];
            }

            var c1 = new paper.Path.Circle(new paper.Point(position), radius1);
            c1.fillColor = new paper.Color(.2, 1, .3);
            return c1;
        }
    }], [{
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
                "radius1": .6 * 1000,
                "radius2": .4 * 1000,
                "height": .8 * 1000
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

    _createClass(Channel, [{
        key: 'render2D',
        value: function render2D() {
            var start = this.params.getValue("start");
            var end = this.params.getValue("end");
            //TODO: figure out inheritance pattern for values!
            var width = undefined;
            try {
                width = this.params.getValue("width");
            } catch (err) {
                width = Channel.getDefaultValues()["width"];
            }

            var startPoint = new paper.Point(start[0], start[1]);
            var endPoint = new paper.Point(end[0], end[1]);

            var vec = endPoint.subtract(startPoint);
            var rec = new paper.Path.Rectangle({
                size: [vec.length + width, width],
                point: start,
                radius: width / 2
            });

            rec.translate([-width / 2, -width / 2]);
            rec.rotate(vec.angle, start);
            rec.fillColor = new paper.Color(0, 0, 1);
            return rec;
        }
    }], [{
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
                "height": .4 * 1000
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
    }

    _createClass(Layer, [{
        key: 'addFeature',
        value: function addFeature(feature) {
            this.__ensureIsAFeature(feature);
            this.features[feature.id] = feature;
            this.featureCount += 1;
        }
    }, {
        key: '__ensureIsAFeature',
        value: function __ensureIsAFeature(feature) {
            if (!(feature instanceof Feature)) throw new Error("Provided value" + feature + " is not a Feature! Did you pass an ID by mistake?");
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
            this.__ensureFeatureExists(feature);
            delete this.features[feature.id];
            this.featureCount -= 1;
        }
    }, {
        key: 'removeFeatureByID',
        value: function removeFeatureByID(featureID) {
            this.__ensureFeatureIDExists(featureID);
            delete this.features[featureID];
            this.featureCount -= 1;
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
            output.params = this.params.toJSON();
            output.features = this.__featuresToJSON();
            return output;
        }
    }, {
        key: 'render2D',
        value: function render2D(paperScope) {
            return new paper.Group(this.__renderFeatures2D());
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
            return newLayer;
        }
    }]);

    return Layer;
})();

module.exports = Layer;

},{"./feature":4,"./parameters":16,"./params":20}],13:[function(require,module,exports){
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

},{"../../utils/numberUtils":29,"../parameter":13}],16:[function(require,module,exports){
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

},{"../../utils/numberUtils":29,"../parameter":13}],18:[function(require,module,exports){
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

},{"../../utils/numberUtils":29,"../parameter":13}],19:[function(require,module,exports){
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
var registeredFeatures = {};
var currentDevice = null;
var canvasManager = null;
var currentLayer = null;

exports.registeredFeatures = registeredFeatures;
exports.registeredParams = registeredParams;
exports.currentDevice = currentDevice;
exports.currentLayer = currentLayer;
exports.canvasManager = canvasManager;

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

var Channel = Features.Channel;
var HollowChannel = Features.HollowChannel;
var Port = Features.Port;
var CircleValve = Features.CircleValve;
var Via = Features.Via;

var ChannelTool = Tools.ChannelTool;
var ValveTool = Tools.ValveTool;
var PanTool = Tools.PanTool;

var CanvasManager = (function () {
    function CanvasManager(canvas) {
        _classCallCheck(this, CanvasManager);

        this.canvas = canvas;
        this.paperDevice = undefined;
        this.grid = undefined;
        this.tools = {};
        this.minPixelSpacing = 10;
        this.maxPixelSpacing = 50;
        this.gridSpacing = 10;
        this.thickCount = 5;
        this.minZoom = .00001;
        this.maxZoom = 10;
        this.generateTools();
        this.selectTool("pan");

        if (!Registry.canvasManager) Registry.canvasManager = this;else throw new Error("Cannot register more than one CanvasManager");

        this.setupZoomEvent();
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
            this.tools["pan"] = new PanTool();
        }
    }, {
        key: "selectTool",
        value: function selectTool(typeString) {
            this.tools[typeString].activate();
        }
    }, {
        key: "snapToGrid",
        value: function snapToGrid(point) {
            return GridGenerator.snapToGrid(point, this.gridSpacing);
        }
    }, {
        key: "setupZoomEvent",
        value: function setupZoomEvent() {
            var min = this.minZoom;
            var max = this.maxZoom;
            var canvas = this.canvas;

            this.canvas.addEventListener("wheel", function (event) {
                var rect = canvas.getBoundingClientRect();
                var x = event.clientX - rect.left;
                var y = event.clientY - rect.top;
                if (paper.view.zoom >= max && event.deltaY < 0) console.log("Whoa! Zoom is way too big.");else if (paper.view.zoom <= min && event.deltaY > 0) console.log("Whoa! Zoom is way too small.");else PanAndZoom.adjustZoom(event.deltaY, paper.view.viewToProject(new paper.Point(x, y)));
            }, false);
        }
    }, {
        key: "renderFeature",
        value: function renderFeature(feature) {
            var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            feature.render2D();
            paper.view.update(forceUpdate);
        }
    }, {
        key: "render",
        value: function render() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this.renderDevice();
            this.renderGrid();
            paper.view.update(forceUpdate);
        }
    }, {
        key: "renderGrid",
        value: function renderGrid() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            if (this.grid) {
                this.grid.remove();
            }
            this.grid = GridGenerator.makeGrid(this.gridSpacing, this.thickCount);
            if (this.paperDevice) this.grid.insertBelow(this.paperDevice);
            paper.view.update(forceUpdate);
        }
    }, {
        key: "setGridSize",
        value: function setGridSize(size) {
            var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            this.gridSpacing = size;
            this.renderGrid(forceUpdate);
        }
    }, {
        key: "renderDevice",
        value: function renderDevice() {
            var forceUpdate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            if (this.paperDevice) {
                this.paperDevice.remove();
            }
            this.paperDevice = Registry.currentDevice.render2D(this.paper);
            if (this.grid) this.paperDevice.insertAbove(this.grid);
            paper.view.update(forceUpdate);
        }
    }, {
        key: "updateGridSpacing",
        value: function updateGridSpacing() {
            var min = this.minPixelSpacing / paper.view.zoom;
            var max = this.maxPixelSpacing / paper.view.zoom;
            while (this.gridSpacing < min) {
                this.gridSpacing = this.gridSpacing * 5;
            }
            while (this.gridSpacing > max) {
                this.gridSpacing = this.gridSpacing / 5;
            }
            this.render();
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
            this.updateGridSpacing();
            this.render();
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
            this.render();
        }
    }, {
        key: "saveToStorage",
        value: function saveToStorage() {
            localStorage.setItem('currentDevice', JSON.stringify(Registry.currentDevice.toJSON()));
        }
    }, {
        key: "loadFromStorage",
        value: function loadFromStorage() {
            Registry.currentDevice = Device.fromJSON(JSON.parse(localStorage.getItem("currentDevice")));
            Registry.currentLayer = Registry.currentDevice.layers[0];
            this.render();
        }
    }]);

    return CanvasManager;
})();

module.exports = CanvasManager;

},{"../core/device":3,"../core/features":10,"../core/registry":21,"./gridGenerator":23,"./panAndZoom":24,"./tools":26}],23:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lineColor = new paper.Color(173 / 255, 216 / 255, 230 / 255);

//TODO: Fix fifth-line highlighting at low/high zooms!

var GridGenerator = (function () {
    function GridGenerator() {
        _classCallCheck(this, GridGenerator);
    }

    _createClass(GridGenerator, null, [{
        key: "makeGrid",
        value: function makeGrid(spacing, thickCount) {
            var vert = GridGenerator.makeVerticalGrid(spacing, thickCount);
            var horiz = GridGenerator.makeHorizontalGrid(spacing, thickCount);
            return new paper.Group([vert, horiz]);
        }
    }, {
        key: "getTopLeft",
        value: function getTopLeft() {
            return paper.view.viewToProject(new paper.Point(0, 0));
        }
    }, {
        key: "getBottomLeft",
        value: function getBottomLeft() {
            return paper.view.viewToProject(new paper.Point(0, paper.view.bounds.height * paper.view.zoom));
        }
    }, {
        key: "getBottomRight",
        value: function getBottomRight() {
            return paper.view.viewToProject(new paper.Point(paper.view.bounds.width * paper.view.zoom, paper.view.bounds.height * paper.view.zoom));
        }
    }, {
        key: "getTopRight",
        value: function getTopRight() {
            return paper.view.viewToProject(new paper.Point(paper.view.bounds.width * paper.view.zoom, 0));
        }
    }, {
        key: "makeVerticalGrid",
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
        key: "makeHorizontalGrid",
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
        key: "makeVerticalLineTemplate",
        value: function makeVerticalLineTemplate() {
            return GridGenerator.gridLineTemplate(GridGenerator.getTopLeft(), GridGenerator.getBottomLeft());
        }
    }, {
        key: "makeThickVerticalLineTemplate",
        value: function makeThickVerticalLineTemplate() {
            var line = GridGenerator.makeVerticalLineTemplate();
            line.strokeWidth = GridGenerator.getStrokeWidth() * 3;
            return line;
        }
    }, {
        key: "makeHorizontalLineTemplate",
        value: function makeHorizontalLineTemplate() {
            return GridGenerator.gridLineTemplate(GridGenerator.getTopLeft(), GridGenerator.getTopRight());
        }
    }, {
        key: "makeThickHorizontalLineTemplate",
        value: function makeThickHorizontalLineTemplate() {
            var line = GridGenerator.makeHorizontalLineTemplate();
            line.strokeWidth = GridGenerator.getStrokeWidth() * 3;
            return line;
        }
    }, {
        key: "snapToGrid",
        value: function snapToGrid(point, spacing) {
            var x = Math.round(point.x / spacing) * spacing;
            var y = Math.round(point.y / spacing) * spacing;
            return new paper.Point(x, y);
        }
    }, {
        key: "gridLineTemplate",
        value: function gridLineTemplate(start, end) {
            var line = paper.Path.Line(start, end);
            line.strokeColor = lineColor;
            line.strokeWidth = GridGenerator.getStrokeWidth();
            line.remove();
            return line;
        }
    }, {
        key: "getStrokeWidth",
        value: function getStrokeWidth() {
            var width = 1 / paper.view.zoom;
            return width;
        }
    }]);

    return GridGenerator;
})();

module.exports = GridGenerator;

},{}],24:[function(require,module,exports){
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
			Registry.canvasManager.setCenter(newCenter.x, newCenter.y, 1 / beta);
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
			var multiplier = arguments.length <= 1 || arguments[1] === undefined ? 1.1 : arguments[1];

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
			var newChannel = this.createChannel(this.startPoint, this.startPoint);
			this.currentChannelID = newChannel.id;
			Registry.currentLayer.addFeature(newChannel);
			Registry.canvasManager.render();
		}

		//TODO: Re-render only the current channel, to improve perforamnce
	}, {
		key: "updateChannel",
		value: function updateChannel(point) {
			var target = ChannelTool.getTarget(point);
			var feat = Registry.currentLayer.getFeature(this.currentChannelID);
			feat.updateParameter("end", [target.x, target.y]);
			Registry.canvasManager.render();
		}
	}, {
		key: "finishChannel",
		value: function finishChannel(point) {
			if (this.currentChannel) {
				if (this.startPoint.x == point.x && this.startPoint.y == point.y) {
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

},{"../../core/features":10,"../../core/registry":21}],26:[function(require,module,exports){
"use strict";

module.exports.ChannelTool = require("./channelTool");
module.exports.ValveTool = require("./valveTool");
module.exports.PanTool = require("./panTool");

},{"./channelTool":25,"./panTool":27,"./valveTool":28}],27:[function(require,module,exports){
"use strict";

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

	return PanTool;
})(paper.Tool);

module.exports = PanTool;

},{"../../core/registry":21}],28:[function(require,module,exports){
"use strict";

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
		this.onMouseDown = function (event) {
			var newValve = new this.valveClass({
				"position": [event.point.x, event.point.y]
			});
			Registry.currentLayer.addFeature(newValve);
			Registry.canvasManager.render();
		};
	}

	return ValveTool;
})(paper.Tool);

module.exports = ValveTool;

},{"../../core/features":10,"../../core/registry":21}],29:[function(require,module,exports){
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

},{}]},{},[2]);
