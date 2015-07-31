var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Port extends Feature {
    constructor(values, name = "New Port") {
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
            "radius": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultParams() {
        return {
            "radius1": .6,
            "radius2": .6,
            "height": .8
        };
    }
}

Registry.registeredFeatures[Port.typeString()] = Port;

module.exports = Port;