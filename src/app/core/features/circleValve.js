var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var Registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters')
var Params = require(appRoot + "core/params");

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

    static getDefaultParams() {
        return {
            "radius1": 1.2,
            "radius2": 1,
            "height": .4
        };
    }
}

Registry.registeredFeatures[CircleValve.typeString()] = CircleValve;

module.exports = CircleValve;