var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

class Chamber extends Feature {
    constructor(values, name = "New Chamber") {
        Feature.checkDefaults(values, Chamber);
        let params = new Params(values, Chamber.getUniqueParameters(), Chamber.getHeritableParameters());
        super(Chamber.typeString(), params, name);
    }

    static typeString() {
        return "Chamber";
    }

    static getUniqueParameters() {
        return {
            "start": PointValue.typeString(),
            "end": PointValue.typeString()
        }
    }

    static getHeritableParameters() {
        return {
            "borderWidth": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }
}

Registry.registeredFeatures[Chamber.typeString()] = Chamber;
Registry.featureDefaults[Chamber.typeString()] = {
    "borderWidth": .41 * 1000,
    "height": .1 * 1000
}

module.exports = Chamber;