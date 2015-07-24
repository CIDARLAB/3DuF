var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var values = require(appRoot + 'core/values');
var registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters')

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Via extends Feature {
    constructor(params, name = "New Via") {
        let sanitized = Via.getParamTypes().sanitizeParams(params);
        super(Via.typeString(), sanitized, new StringValue(name));
    }

    static typeString() {
        return "Via";
    }

    static getParamTypes() {
        let unique = {
            "position": PointValue.typeString()
        };
        let heritable = {
            "radius1": FloatValue.typeString(),
            "radius2": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
        return new values.ParamTypes(unique, heritable);
    }

    static getDefaultParams() {
        return {
            "radius1": .6,
            "radius2": .4,
            "height": .8
        };
    }
}

registry.registeredFeatures[Via.typeString()] = Via;

module.exports = Via;