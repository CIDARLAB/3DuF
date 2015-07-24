var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var values = require(appRoot + 'core/values');
var registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters')

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class CircleValve extends Feature {
    constructor(params, name = "New CircleValve") {
        let sanitized = CircleValve.getParamTypes().sanitizeParams(params);
        super(CircleValve.typeString(), sanitized, new StringValue(name));
    }

    static typeString() {
        return "CircleValve";
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
            "radius1": 1.2,
            "radius2": 1,
            "height": .4
        };
    }
}

registry.registeredFeatures[CircleValve.typeString()] = CircleValve;

module.exports = CircleValve;