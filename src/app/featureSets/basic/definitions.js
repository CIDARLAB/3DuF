let basicFeatures = {
    "Channel": {
        unique: {
            "start": "Point",
            "end": "Point"
        },
        heritable: {
            "channelWidth": "Float",
            "height": "Float"
        },
        units: {
            "channelWidth": "um",
            "height": "um"
        },
        defaults: {
            "channelWidth": .80 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "channelWidth": 3,
            "height": 10,
        },
        maximum: {
            "channelWidth": 2000,
            "height": 1200,
        }
    },
    "RoundedChannel": {
        unique: {
            "start": "Point",
            "end": "Point"
        },
        heritable: {
            "channelWidth": "Float",
            "height": "Float"
        },
        units: {
            "channelWidth": "um",
            "height": "um"
        },
        defaults: {
            "channelWidth": .80 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "channelWidth": 3,
            "height": 10,
        },
        maximum: {
            "channelWidth": 2000,
            "height": 1200,
        }
    },
    "Transition": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "cw1": "Float",
            "cw2": "Float",
            "length": "Float",
            "orientation": "String",
            "height": "Float"
        },
        units: {
            "cw1": "um",
            "cw2": "um",
            "length": "um",
            "orientation": "",
            "height": "um"
        },
        defaults: {
            "cw1": .80 * 1000,
            "cw2": .90 * 1000,
            "length": 1.0 * 1000,
            "orientation": "V",
            "height": .1 * 1000
        },
        minimum: {
            "cw1": 3,
            "cw2": 3,
            "length": 10,
            "height": 10
        },
        maximum: {
            "cw1": 2000,
            "cw2": 2000,
            "length": 1200,
            "height": 1200
        }
    },
    "Chamber": {
        unique: {
            "start": "Point",
            "end": "Point"
        },
        heritable: {
            "borderWidth": "Float",
            "height": "Float"
        },
        units: {
            "borderWidth": "um",
            "height": "um"
        },
        defaults: {
            "borderWidth": .41 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "borderWidth": 10,
            "height": 10,
        },
        maximum: {
            "borderWidth": 2000,
            "height": 1200,
        }
    },
    "Node": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float",
            "width": "Float",
            "length": "Float"
        },
        units: {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float",
            "width": "Float",
            "length": "Float"
        },
        defaults: {
            "radius1": 0,
            "radius2": 0,
            "width": 0,
            "length": 0,
            "height": 0
        },
        minimum: {
            "radius1": 0,
            "radius2": 0,
            "height": 10
        },
        maximum: {
            "radius1": 200,
            "radius2": 200,
            "height": 1200
        }
    },
    "CircleValve": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float"
        },
        units: {
            "radius1": "um",
            "radius2": "um",
            "height": "um"
        },
        defaults: {
            "radius1": 1.4 * 1000,
            "radius2": 1.2 * 1000,
            "height": .8 * 1000
        },
        minimum: {
            "radius1": 10,
            "radius2": 10,
            "height": 10
        },
        maximum: {
            "radius1": 2000,
            "radius2": 2000,
            "height": 1200
        }
    },
    "RectValve": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "width": "Float",
            "length": "Float",
            "height": "Float"
        },
        units: {
            "width": "um",
            "length": "um",
            "height": "um"
        },
        defaults: {
            "width": 1.4 * 1000,
            "length": 1.2 * 1000,
            "height": .8 * 1000
        },
        minimum: {
            "width": 10,
            "length": 10,
            "height": 10
        },
        maximum: {
            "width": 2000,
            "length": 2000,
            "height": 1200
        }
    },
    "AlignmentMarks": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "width": "Float",
            "length": "Float",
            "height": "Float"
        },
        units: {
            "width": "um",
            "length": "um",
            "height": "um"
        },
        defaults: {
            "width": 4000,
            "length": 4000,
            "height": 200
        },
        minimum: {
            "width": 10,
            "length": 10,
            "height": 10
        },
        maximum: {
            "width": 200000,
            "length": 200000,
            "height": 1200
        }
    },
    "AlignmentMarks_control": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "width": "Float",
            "length": "Float",
            "height": "Float"
        },
        units: {
            "width": "um",
            "length": "um",
            "height": "um"
        },
        defaults: {
            "width": 4000,
            "length": 4000,
            "height": 200
        },
        minimum: {
            "width": 10,
            "length": 10,
            "height": 10
        },
        maximum: {
            "width": 200000,
            "length": 200000,
            "height": 1200
        }
    },
    "Valve3D": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orientation": "String",
            "valveRadius": "Float",
            "height": "Float",
            "gap": "Float",
            "width": "Float",
            "length": "Float"
        },
        units: {
            "orientation": "",
            "valveRadius": "um",
            "height": "um",
            "gap": "um",
            "width": "um",
            "length": "um"
        },
        defaults: {
            "orientation": "V",
            "valveRadius": 1.2 * 1000,
            "height": .8 * 1000,
            "gap": 0.6 * 1000,
            "width": 2.4 * 1000,
            "length": 2.4 * 1000
        },
        minimum: {
          //  "orientation": "V",
            "valveRadius": .1 * 100,
            "height": .1 * 100,
            "gap": .5 * 10
        },
        maximum: {
        //    "orientation": "H",
            "valveRadius": .2 * 10000,
            "height": 1.2 * 1000,
            "gap": .1 * 10000
        }
    },
    "Valve3D_control": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orientation": "String",
            "valveRadius": "Float",
            "height": "Float",
            "gap": "Float",
            "width": "Float",
            "length": "Float"
        },
        units: {
            "orientation": "",
            "valveRadius": "um",
            "height": "um",
            "gap": "um",
            "width": "um",
            "length": "um"
        },
        defaults: {
            "orientation": "V",
            "valveRadius": 1.2 * 1000,
            "height": .8 * 1000,
            "gap": 0.6 * 1000,
            "width": 2.4 * 1000,
            "length": 2.4 * 1000
        },
        minimum: {
          //  "orientation": "V",
            "valveRadius": .1 * 100,
            "height": .1 * 100,
            "gap": .5 * 10
        },
        maximum: {
        //    "orientation": "H",
            "valveRadius": .2 * 10000,
            "height": 1.2 * 1000,
            "gap": .1 * 10000
        }
    },
    "Transposer": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orientation": "String",
            "valveRadius": "Float",
            "height": "Float",
            "gap": "Float",
            "valveSpacing": "Float",
            "channelWidth": "Float"
        },
        units: {
            "orientation": "",
            "valveRadius": "um",
            "height": "um",
            "gap": "um",
            "valveSpacing": "um",
            "channelWidth": "um"
        },
        defaults: {
            "orientation": "V",
            "valveRadius": 1.2 * 1000,
            "height": .8 * 1000,
            "gap": 0.6 * 1000,
            "valveSpacing": 0.6 * 1000,
            "channelWidth": 500
        },
        minimum: {
            "valveRadius": .1 * 100,
            "height": .1 * 100,
            "gap": .5 * 10,
            "valveSpacing": 0.1 * 1000,
            "channelWidth" : 25
        },
        maximum: {
            "valveRadius": .2 * 10000,
            "height": 1.2 * 1000,
            "gap": .1 * 10000,
            "valveSpacing": 0.1 * 10000,
            "channelWidth" : 25e3
        }
    },
    "Transposer_control": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orientation": "String",
            "valveRadius": "Float",
            "height": "Float",
            "gap": "Float",
            "valveSpacing": "Float",
            "channelWidth": "Float"
        },
        units: {
            "orientation": "",
            "valveRadius": "um",
            "height": "um",
            "gap": "um",
            "valveSpacing": "um",
            "channelWidth": "um"
        },
        defaults: {
            "orientation": "V",
            "valveRadius": 1.2 * 1000,
            "height": .8 * 1000,
            "gap": 0.6 * 1000,
            "valveSpacing": 0.6 * 1000,
            "channelWidth": 500
        },
        minimum: {
            "valveRadius": .1 * 100,
            "height": .1 * 100,
            "gap": .5 * 10,
            "valveSpacing": 0.1 * 1000,
            "channelWidth": 25
        },
        maximum: {
            "valveRadius": .2 * 10000,
            "height": 1.2 * 1000,
            "gap": .1 * 10000,
            "valveSpacing": 0.1 * 10000,
            "channelWidth": 25e3
        }
    },
    "RotaryMixer": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orientation": "String",
            "radius": "Float",
            "flowChannelWidth": "Float",
            "valveWidth": "Float",
            "valveLength": "Float",
            "valveSpacing": "Float",
            "height": "Float"
        },
        units: {
            "orientation": "",
            "radius": "um",
            "flowChannelWidth": "um",
            "valveWidth": "um",
            "valveLength": "um",
            "valveSpacing": "um",
            "height": "um"
        },
        defaults: {
            "orientation": "V",
            "radius": 2000,
            "flowChannelWidth": 1000,
            "valveWidth": 2.4 * 1000,
            "valveLength": 2.4 * 1000,
            "valveSpacing": 300,
            "valveRadius": 1.2 * 1000,
            "height": 200
        },
        minimum: {
          //  "orientation": "V",
            "radius": 0.1 * 5000,
            "flowChannelWidth": 0.1 * 1000,
            "valveWidth": 0.1 * 2.4 * 1000,
            "valveLength": 0.1 * 2.4 * 1000,
            "valveSpacing": 0.1 * 300,
            "valveRadius": 0.1 * 1.2 * 1000,
            "height": 0.1 * 200
        },
        maximum: {
            "radius": 10 * 5000,
            "flowChannelWidth": 10 * 1000,
            "valveWidth": 10 * 2.4 * 1000,
            "valveLength": 10 * 2.4 * 1000,
            "valveSpacing": 10 * 300,
            "valveRadius": 10 * 1.2 * 1000,
            "height": 10 * 200
        }
    },
    "RotaryMixer_control": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orientation": "String",
            "radius": "Float",
            "flowChannelWidth": "Float",
            "valveWidth": "Float",
            "valveLength": "Float",
            "valveSpacing": "Float",
            "height": "Float"
        },
        defaults: {
            "orientation": "V",
            "radius": 2000,
            "flowChannelWidth": 1000,
            "valveWidth": 2.4 * 1000,
            "valveLength": 2.4 * 1000,
            "valveSpacing": 300,
            "valveRadius": 1.2 * 1000,
            "height": 200
        },
        minimum: {
            //  "orientation": "V",
            "radius": 0.1 * 5000,
            "flowChannelWidth": 0.1 * 1000,
            "valveWidth": 0.1 * 2.4 * 1000,
            "valveLength": 0.1 * 2.4 * 1000,
            "valveSpacing": 0.1 * 300,
            "valveRadius": 0.1 * 1.2 * 1000,
            "height": 0.1 * 200
        },
        maximum: {
            "radius": 10 * 5000,
            "flowChannelWidth": 10 * 1000,
            "valveWidth": 10 * 2.4 * 1000,
            "valveLength": 10 * 2.4 * 1000,
            "valveSpacing": 10 * 300,
            "valveRadius": 10 * 1.2 * 1000,
            "height": 10 * 200
        }
    },
    "Valve": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "orientation": "String",
            "length": "Float",
            "width": "Float",
            "height": "Float"
        },
        units: {
            "orientation": "",
            "length": "um",
            "width": "um",
            "height": "um"
        },
        defaults: {
            "orientation": "V",
            "width": 1.23 * 1000,
            "length": 4.92 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "width": 30,
            "length": 120,
            "height": 10
        },
        maximum: {
            "width": 6000,
            "length": 24 * 1000,
            "height": 1200
        }
    },
    "Via": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float"
        },
        units: {
            "radius1": "um",
            "radius2": "um",
            "height": "um"
        },
        defaults: {
            "radius1": .8 * 1000,
            "radius2": .7 * 1000,
            "height": 1.1 * 1000
        },
        minimum: {
            "radius1": 10,
            "radius2": 10,
            "height": 10
        },
        maximum: {
            "radius1": 2000,
            "radius2": 2000,
            "height": 1200
        }
    },
    "Port": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "portRadius": "Float",
            "height": "Float"
        },
        units: {
            "portRadius": "um",
            "height": "um"
        },
        defaults: {
            "portRadius": .7 * 1000,
           // "radius2": .7 * 1000,
            "height": 1.1 * 1000
        },
        minimum: {
            "portRadius": .8 * 10,
         //   "radius2": 10,
            "height": 10
        },
        maximum: {
            "portRadius": 2000,
        //    "radius2": 2000,
            "height": 1200
        }
    },
    "DiamondReactionChamber": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "orientation": "String",
            "channelWidth": "Float",
            "length": "Float",
            "width": "Float",
            "height": "Float"
        },
        units: {
            "orientation": "",
            "channelWidth": "um",
            "length": "um",
            "width": "um",
            "height": "um"
        },
        defaults: {
            "orientation": "V",
            "channelWidth": .80 * 1000,
            "width": 1.23 * 1000,
            "length": 4.92 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "channelWidth": 10,
            "width": 30,
            "length": 120,
            "height": 10,
        },
        maximum: {
            "channelWidth": 2000,
            "width": 6000,
            "length": 24 * 1000,
            "height": 1200,
        }
    },
    "BetterMixer": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "bendSpacing": "Float",
            "numberOfBends": "Float",
            "channelWidth": "Float",
            "bendLength": "Float",
            "orientation": "String",
            "height": "Float"
        },
        units: {
            "bendSpacing": "um",
            "numberOfBends": "",
            "channelWidth": "um",
            "bendLength": "um",
            "orientation": "",
            "height": "um"
        },
        defaults: {
            "channelWidth": .80 * 1000,
            "bendSpacing": 1.23 * 1000,
            "numberOfBends": 1,
            "orientation": "V",
            "bendLength": 2.46 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "channelWidth": 10,
            "bendSpacing": 10,
            "numberOfBends": 1,
            "orientation": "H",
            "bendLength": 10,
            "height": 10,
        },
        maximum: {
            "channelWidth": 2000,
            "bendSpacing": 6000,
            "numberOfBends": 20,
            "orientation": "H",
            "bendLength": 12 * 1000,
            "height": 1200,
        }
    },
    "CurvedMixer": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "bendSpacing": "Float",
            "numberOfBends": "Float",
            "channelWidth": "Float",
            "bendLength": "Float",
            "orientation": "String",
            "height": "Float"
        },
        units: {
            "bendSpacing": "um",
            "numberOfBends": "",
            "channelWidth": "um",
            "bendLength": "um",
            "orientation": "",
            "height": "um"
        },
        defaults: {
            "channelWidth": .80 * 1000,
            "bendSpacing": 1.23 * 1000,
            "numberOfBends": 1,
            "orientation": "V",
            "bendLength": 2.46 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "channelWidth": 10,
            "bendSpacing": 10,
            "numberOfBends": 1,
            "orientation": "H",
            "bendLength": 10,
            "height": 10,
        },
        maximum: {
            "channelWidth": 2000,
            "bendSpacing": 6000,
            "numberOfBends": 20,
            "orientation": "H",
            "bendLength": 12 * 1000,
            "height": 1200,
        }
    },
    "Mixer": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "bendSpacing": "Float",
            "numberOfBends": "Float",
            "channelWidth": "Float",
            "bendLength": "Float",
            "orientation": "String",
            "height": "Float"
        },
        units: {
            "bendSpacing": "um",
            "numberOfBends": "",
            "channelWidth": "um",
            "bendLength": "um",
            "orientation": "",
            "height": "um"
        },
        defaults: {
            "channelWidth": .80 * 1000,
            "bendSpacing": 1.23 * 1000,
            "numberOfBends": 1,
            "orientation": "V",
            "bendLength": 2.46 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "channelWidth": 10,
            "bendSpacing": 10,
            "numberOfBends": 1,
            "orientation": "H",
            "bendLength": 10,
            "height": 10,
        },
        maximum: {
            "channelWidth": 2000,
            "bendSpacing": 6000,
            "numberOfBends": 20,
            "orientation": "H",
            "bendLength": 12 * 1000,
            "height": 1200,
        }
    },
    "Tree": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "flowChannelWidth": "Float",
            "orientation": "String",
            "spacing": "Float",
            "leafs": "Float",
            "width": "Float",
            "height": "Float",
            "direction": "String",
            "stageLength":"Float"
        },
        units: {
            "flowChannelWidth": "um",
            "orientation": "",
            "spacing": "um",
            "leafs": "",
            "width": "um",
            "height": "um",
            "direction": "",
            "stageLength":"um"
        },
        defaults: {
            "flowChannelWidth": .80 * 1000,
            "orientation": "V",
            "spacing": 4 * 1000,
            "leafs": 8,
            "width": 2.46 * 1000,
            "height": .1 * 1000,
            "direction": "IN",
            "stageLength": 4000
        },
        minimum: {
            "flowChannelWidth": 10,
            "spacing": 30,
            "leafs": 2,
            "width": 60,
            "height": 10,
            "stageLength": 100
        },
        maximum: {
            "flowChannelWidth": 2000,
            "spacing": 12000,
            "leafs": 2,
            "width": 12 * 1000,
            "height": 1200,
            "stageLength": 6000
        }
    },
    "Mux": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "flowChannelWidth": "Float",
            "orientation": "String",
            "spacing": "Float",
            "leafs": "Float",
            "width": "Float",
            "length": "Float",
            "height": "Float",
            "direction": "String",
            "stageLength":"Float",
            "controlChannelWidth": "Float"
        },
        units: {
            "flowChannelWidth": "um",
            "orientation": "",
            "spacing": "um",
            "leafs": "",
            "width": "um",
            "length": "um",
            "height": "um",
            "direction": "",
            "stageLength":"um",
            "controlChannelWidth": "um"
        },
        defaults: {
            "flowChannelWidth": .80 * 1000,
            "orientation": "V",
            "spacing": 4 * 1000,
            "leafs": 8,
            "width": 1.6 * 1000,
            "length": 1.6 * 1000,
            "height": .1 * 1000,
            "direction": "IN",
            "stageLength": 4000,
            "controlChannelWidth": .40 * 1000
        },
        minimum: {
            "flowChannelWidth": 10,
            "spacing": 30,
            "leafs": 2,
            "width": 60,
            "length": 60,
            "height": 10,
            "stageLength": 100,
            "controlChannelWidth": 10
        },
        maximum: {
            "flowChannelWidth": 2000,
            "spacing": 12000,
            "leafs": 2,
            "width": 12 * 1000,
            "length": 12 * 1000,
            "height": 1200,
            "stageLength": 6000,
            "controlChannelWidth": 2000
        }
    },
    "Mux_control": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "flowChannelWidth": "Float",
            "orientation": "String",
            "spacing": "Float",
            "leafs": "Float",
            "width": "Float",
            "length": "Float",
            "height": "Float",
            "direction": "String",
            "stageLength":"Float",
            "controlChannelWidth": "Float"
        },
        defaults: {
            "flowChannelWidth": .80 * 1000,
            "orientation": "V",
            "spacing": 4 * 1000,
            "leafs": 8,
            "width": 1.6 * 1000,
            "length": 1.6 * 1000,
            "height": .1 * 1000,
            "direction": "IN",
            "stageLength": 4000,
            "controlChannelWidth": .40 * 1000
        },
        minimum: {
            "flowChannelWidth": 10,
            "spacing": 30,
            "leafs": 2,
            "width": 60,
            "length": 60,
            "height": 10,
            "stageLength": 100,
            "controlChannelWidth": 10
        },
        maximum: {
            "flowChannelWidth": 2000,
            "spacing": 12000,
            "leafs": 2,
            "width": 12 * 1000,
            "length": 12 * 1000,
            "height": 1200,
            "stageLength": 6000,
            "controlChannelWidth": 2000
        }
    },
    "CellTrapL": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "chamberLength": "Float",
            "feedingChannelWidth": "Float",
            "orientation": "String",
            "chamberWidth": "Float",
            "numberOfChambers": "Float",
            "chamberSpacing": "Float",
            "height": "Float"
        },
        units: {
            "chamberLength": "um",
            "feedingChannelWidth": "um",
            "orientation": "",
            "chamberWidth": "um",
            "numberOfChambers": "",
            "chamberSpacing": "um",
            "height": "um"
        },
        defaults: {
            "chamberLength": 1.2 * 1000,
            "feedingChannelWidth": .41 * 1000,
            "orientation": "H",
            "chamberWidth": 1.23 * 1000,
            "numberOfChambers": 6,
            "chamberSpacing": 2.46 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "chamberLength": 30,
            "feedingChannelWidth": 10,
            "chamberWidth": 30,
            "numberOfChambers": 1,
            "chamberSpacing": 60,
            "height": 10
        },
        maximum: {
            "chamberLength": 6000,
            "feedingChannelWidth": 2000,
            "chamberWidth": 6000,
            "numberOfChambers": 10,
            "chamberSpacing": 12 * 1000,
            "height": 1200
        }
    },
    "CellTrapL_cell": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "chamberLength": "Float",
            "feedingChannelWidth": "Float",
            "orientation": "String",
            "chamberWidth": "Float",
            "numberOfChambers": "Float",
            "chamberSpacing": "Float",
            "height": "Float"
        },
        defaults: {
            "chamberLength": 1.2 * 1000,
            "feedingChannelWidth": .41 * 1000,
            "orientation": "H",
            "chamberWidth": 1.23 * 1000,
            "numberOfChambers": 6,
            "chamberSpacing": 2.46 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "chamberLength": 30,
            "feedingChannelWidth": 10,
            "chamberWidth": 30,
            "numberOfChambers": 1,
            "chamberSpacing": 60,
            "height": 10
        },
        maximum: {
            "chamberLength": 6000,
            "feedingChannelWidth": 2000,
            "chamberWidth": 6000,
            "numberOfChambers": 10,
            "chamberSpacing": 12 * 1000,
            "height": 1200
        }
    },
    "DropletGen": {
        unique: {
            "position": "Point"
        },
        heritable: {
            "orificeSize": "Float",
            "height": "Float"
        },
        units: {
            "orificeSize": "um",
            "height": "um"
        },
        defaults: {
            "orificeSize": .80 * 1000,
            "height": .1 * 1000
        },
        minimum: {
            "orificeSize": 10,
            "height": 10,
        },
        maximum: {
            "orificeSize": 2000,
            "height": 1200,
        }
    }
}

module.exports = basicFeatures;