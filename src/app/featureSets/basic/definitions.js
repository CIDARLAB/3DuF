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
        },
        minimum: {
            "width": 10,
            "height": 10,
        },
        maximum: {
            "width": 2000,
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
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float"
        },
        defaults: {
            "radius1": .7 * 1000,
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
    }
}

module.exports = basicFeatures;