let basicFeatures = {
    "Channel": {
        unique: {
            "start": "Point",
            "end": "Point"
        },
        heritable: {
            "width": "Float",
            "height": "Float"
        },
        defaults: {
            "width": .41 * 1000,
            "height": .1 * 1000
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
        }
    },
    "Port": {
        unique: {
            "position": "Point",
        },
        heritable: {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float"
        },
        defaults: {
            "radius1": .7 * 1000,
            "radius2": .7 * 1000,
            "height": 1.1 * 1000
        }
    }
}

module.exports = basicFeatures;