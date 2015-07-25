var appRoot = "../../";

var Feature = require(appRoot + 'core/feature');
var Registry = require(appRoot +'core/registry');
var Parameters = require(appRoot +'core/parameters')
var Params = require(appRoot + 'core/params');

var PointValue = Parameters.PointValue;
var FloatValue = Parameters.FloatValue;

class Channel extends Feature {
    constructor(values, name = "New Channel") {
        let params = new Params(values, Channel.getUniqueParameters(), Channel.getHeritableParameters());
        super(Channel.typeString(), params, name);
    }

    static typeString() {
        return "Channel";
    }

    static getUniqueParameters(){
        return {
            "start": PointValue.typeString(),
            "end": PointValue.typeString()
        }
    }

    static getHeritableParameters(){
        return { 
            "width": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultValues() {
        return {
            "width": .4,
            "height": .4
        };
    }
}

Registry.registeredFeatures[Channel.typeString()] = Channel;

module.exports = Channel;