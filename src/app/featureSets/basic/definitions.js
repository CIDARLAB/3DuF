let basicFeatures = {
    "Channel": {
        unique: {
            "start": "Point",
            "end": "Point"
        },
        heritable: {
            "channelWidth": "Float",
            "height": "Float",
            "width": "Float"
        },
        defaults: {
            "channelWidth": .75 * 1000,
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
    "Chamber": {
        unique: {
            "start": "Point",
            "end": "Point"
        },
        heritable: {
            "borderWidth": "Float",
            "height": "Float"
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

    "Via": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float"
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
        defaults: {
            "orientation": "H",
            "channelWidth": .75 * 1000,
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
        defaults: {
            "channelWidth": .75 * 1000,
            "bendSpacing": 1.23 * 1000,
            "numberOfBends": 1,
            "orientation": "H",
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
            "length": "Float",
            "height": "Float",
            "direction": "String"
        },
        defaults: {
            "flowChannelWidth": .75 * 1000,
            "orientation": "H",
            "spacing": 1.23 * 1000,
            "leafs": 2,
            "width": 2.46 * 1000,
            "length": 2.46 * 1000,
            "height": .1 * 1000,
            "direction": "IN"
        },
        minimum: {
            "flowChannelWidth": 10,
            "spacing": 30,
            "leafs": 2,
            "width": 60,
            "length": 60,
            "height": 10
        },
        maximum: {
            "flowChannelWidth": 2000,
            "spacing": 6000,
            "leafs": 2,
            "width": 12 * 1000,
            "length": 12 * 1000,
            "height": 1200
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
        defaults: {
            "chamberLength": 1.2 * 1000,
            "feedingChannelWidth": .41 * 1000,
            "orientation": "H",
            "chamberWidth": 1.23 * 1000,
            "numberOfChambers": 3,
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
        defaults: {
            "orificeSize": .75 * 1000,
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