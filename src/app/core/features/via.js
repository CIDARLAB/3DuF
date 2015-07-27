var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var Registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters');
var Params = require(appRoot + 'core/params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Via extends Feature {
    constructor(values, name = "New Via") {
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

    static getDefaultParams() {
        return {
            "radius1": .6,
            "radius2": .4,
            "height": .8
        };
    }
}

Registry.registeredFeatures[Via.typeString()] = Via;

module.exports = Via;