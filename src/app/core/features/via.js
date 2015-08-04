var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');
var Colors = require('../../view/colors');
var PaperPrimitives = require('../../view/paperPrimitives');

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

    static getDefaultValues() {
        return {
            "radius1": .6 * 1000,
            "radius2": .4 * 1000,
            "height": .8 * 1000
        };
    }

    render2D() {
        let position = this.params.getValue("position");
        let radius;

        //TODO: figure out inheritance pattern for values!

        try {
            radius = this.params.getValue("radius1");
        } catch (err) {
            radius = Via.getDefaultValues()["radius1"];
        }


        let c1 = PaperPrimitives.Circle(position, radius);
        c1.fillColor = Colors.GREEN_500;
        c1.featureID = this.id;
        return c1;
    }
}

Registry.registeredFeatures[Via.typeString()] = Via;

module.exports = Via;