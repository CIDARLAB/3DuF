var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var CircleValve = require("../../core/features").CircleValve;
var Colors = require("../colors");

var renderCircleValve = function(circleValve){
    let position = circleValve.params.getValue("position");
    let radius;

    //TODO: figure out inheritance pattern for values!

    try {
        radius = circleValve.params.getValue("radius1");
    } catch (err) {
        radius = CircleValve.getDefaultValues()["radius1"];
    }


    let c1 = PaperPrimitives.Circle(position, radius);
    c1.fillColor = Colors.RED_500;
    c1.featureID = circleValve.id;
    return c1;
}

module.exports = renderCircleValve;