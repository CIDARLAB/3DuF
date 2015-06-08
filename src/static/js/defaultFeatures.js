'use strict';

var getDefaultFeatures = function(){
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
}

exports.getDefaultFeatures = getDefaultFeatures;