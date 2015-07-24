var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var values = require(appRoot + 'core/values');
var registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters')

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Port extends Feature {
    constructor(params, name = "New Port") {
        let sanitized = Port.getParamTypes().sanitizeParams(params);
        super(Port.typeString(), sanitized, new StringValue(name));
    }

    static typeString() {
        return "Port";
    }

    static getParamTypes() {
        let unique = {
            "position": PointValue.typeString()
        };
        let heritable = {
            "radius": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
        return new values.ParamTypes(unique, heritable);
    }

    static getDefaultParams() {
        return {
            "radius1": .6,
            "radius2": .6,
            "height": .8
        };
    }
}

registry.registeredFeatures[Port.typeString()] = Port;

module.exports = Port;