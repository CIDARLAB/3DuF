var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var CircleValve = require("../../core/features").CircleValve;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class CircleValveRenderer extends FeatureRenderer{
    static renderFeature(circleValve){
       let position = circleValve.params.getValue("position");
        let radius;

        //TODO: figure out inheritance pattern for values!

        try {
            radius = circleValve.params.getValue("radius1");
        } catch (err) {
            radius = CircleValve.getDefaultValues()["radius1"];
        }


        let c1 = PaperPrimitives.Circle(position, radius);
        c1.fillColor = FeatureRenderer.getLayerColor(circleValve, CircleValve);
        c1.featureID = circleValve.id;
        return c1; 
    }

    static renderTarget(position){
        let width = CircleValve.getDefaultValues()["radius1"];
        let circ = PaperPrimitives.CircleTarget(position, width);
        return circ;
    }
}

module.exports = CircleValveRenderer;