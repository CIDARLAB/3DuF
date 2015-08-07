var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

class CircleValve extends Feature {
    constructor(values, name = "New CircleValve") {
        let params = new Params(values, CircleValve.getUniqueParameters(), CircleValve.getHeritableParameters());
        super(CircleValve.typeString(), params, name);
    }

    static typeString() {
        return "CircleValve";
    }


    static getUniqueParameters() {
        return {
            "position": PointValue.typeString(),
        }
    }

    static getHeritableParameters() {
        return {
            "radius1": FloatValue.typeString(),
            "radius2": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultValues() {
        return {
            "radius1": 1.2 * 1000,
            "radius2": 1 * 1000,
            "height": .4 * 1000
        };
    }
}

Registry.registeredFeatures[CircleValve.typeString()] = CircleValve;

module.exports = CircleValve;