var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Via extends Feature {
    constructor(values, name = "New Via") {
        Feature.checkDefaults(values, Via);
        let params = new Params(values, Via.getUniqueParameters(), Via.getHeritableParameters());
        super(Via.typeString(), params, name);
    }

    static typeString() {
        return "Via";
    }

    static getUniqueParameters(){
        return {
            "position": PointValue.typeString()
        }
    }

    static getHeritableParameters(){
        return { 
            "radius1": FloatValue.typeString(),
            "radius2": FloatValue.typeString(),
            "height": FloatValue.typeString(),
        };
    }

    static getDefaultValues() {
        return {
            "radius1": .8 * 1000,
            "radius2": .7 * 1000,
            "height": 1.1 * 1000
        };
    }
}

Registry.registeredFeatures[Via.typeString()] = Via;

module.exports = Via;