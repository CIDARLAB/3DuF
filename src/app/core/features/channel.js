var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var values = require(appRoot + 'core/values');
var registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters')

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;
var StringValue = Parameters.StringValue;

class Channel extends Feature {
    constructor(params, name = "New Channel") {
        let sanitized = Channel.getParamTypes().sanitizeParams(params);
        super(Channel.typeString(), sanitized, new StringValue(name));
    }

    static typeString() {
        return "Channel";
    }

    static getParamTypes() {
        let unique = {
            "start": PointValue.typeString(),
            "end": PointValue.typeString()
        };
        let heritable = {
            "width": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
        return new values.ParamTypes(unique, heritable);
    }

    static getDefaultParams() {
        return {
            "width": .4,
            "height": .4
        };
    }
}

registry.registeredFeatures[Channel.typeString()] = Channel;

module.exports = Channel;