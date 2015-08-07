var Feature = require("../feature");
var Registry = require("../registry");
var Params = require("../params");
var Parameters = require("../parameters");

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;


class HollowChannel extends Feature {
    constructor(values, name = "New HollowChannel") {
        let params = new Params(values, HollowChannel.getUniqueParameters(), HollowChannel.getHeritableParameters());
        super(HollowChannel.typeString(), params, name);
    }

    static getUniqueParameters() {
        return {
            "start": PointValue.typeString(),
            "end": PointValue.typeString()
        }
    }

    static getHeritableParameters() {
        return {
            "width": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultValues() {
        return {
            "width": .4 * 1000,
            "height": .4 * 1000
        };
    }

    static typeString() {
        return "HollowChannel";
    }
}

Registry.registeredFeatures[HollowChannel.typeString()] = HollowChannel;

module.exports = HollowChannel;