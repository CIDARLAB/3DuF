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

    static getDefaultValues() {
        return {
            "radius1": .6 * 1000,
            "radius2": .6 * 1000,
            "height": .8 * 1000
        };
    }

    render2D() {
        let position = this.params.getValue("position");
        let radius1;

        //TODO: figure out inheritance pattern for values!

        try {
            radius1 = this.params.getValue("radius1");
        } catch (err) {
            radius1 = Port.getDefaultValues()["radius1"];
        }


        let c1 = new paper.Path.Circle(new paper.Point(position), radius1);
        c1.fillColor = new paper.Color(.5,0,.5);
        c1.featureID = this.id;
        return c1;
    }
}

Registry.registeredFeatures[Port.typeString()] = Port;

module.exports = Port;