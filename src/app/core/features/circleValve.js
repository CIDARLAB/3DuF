var Feature = require('../feature');
var Registry = require('../registry');
var Parameters = require('../parameters');
var Params = require('../params');
var Colors = require('../../graphics/colors');

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


    static getUniqueParameters() {
        return {
            "position": PointValue.typeString(),
        }
    }

    static getHeritableParameters() {
        return {
            "radius1": FloatValue.typeString(),
            "radius2": FloatValue.typeString(),
            "height": FloatValue.typeString()
        };
    }

    static getDefaultValues() {
        return {
            "radius1": 1.2 * 1000,
            "radius2": 1 * 1000,
            "height": .4 * 1000
        };
    }

    render2D() {
        let position = this.params.getValue("position");
        let radius1;

        //TODO: figure out inheritance pattern for values!

        try {
            radius1 = this.params.getValue("radius1");
        } catch (err) {
            radius1 = CircleValve.getDefaultValues()["radius1"];
        }


        let c1 = new paper.Path.Circle(new paper.Point(position), radius1);
        c1.fillColor = Colors.RED_500;
        c1.featureID = this.id;
        return c1;
    }
}

Registry.registeredFeatures[CircleValve.typeString()] = CircleValve;

module.exports = CircleValve;