var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Port extends Feature {
    constructor(values, name = "New Port") {
        Feature.checkDefaults(values, Port);
        let params = new Params(values, Port.getUniqueParameters(), Port.getHeritableParameters());
        super(Port.typeString(), params, name);
    }

    static typeString(){
        return "Port";
    }

    static getUniqueParameters(){
        return {
            "position": PointValue.typeString(),
        }
    }

    static getHeritableParameters(){
        return { 
            "radius1": FloatValue.typeString(),
            "radius2": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultValues() {
        return {
            "radius1": .7 * 1000,
            "radius2": .7 * 1000,
            "height": .1 * 1000
        };
    }
}

Registry.registeredFeatures[Port.typeString()] = Port;

module.exports = Port;