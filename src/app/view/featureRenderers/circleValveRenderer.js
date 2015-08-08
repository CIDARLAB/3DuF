var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var CircleValve = require("../../core/features").CircleValve;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class CircleValveRenderer extends FeatureRenderer{
    static renderFeature(circleValve){
       let position = circleValve.params.getValue("position");
        let radius1;
        let radius2;

        //TODO: figure out inheritance pattern for values!

        try {
            radius1 = circleValve.params.getValue("radius1");
        } catch (err) {
            radius1 = CircleValve.getDefaultValues()["radius1"];
        }

        try {
            radius2 = circleValve.params.getValue("radius2");
        } catch (err) {
            radius2 = CircleValve.getDefaultValues()["radius2"];
        }

        let innerColor = FeatureRenderer.getLayerColor(circleValve, CircleValve);
        let outerColor = FeatureRenderer.getBottomColor(circleValve);

        let c1 = PaperPrimitives.GradientCircle(position, radius1, radius2, outerColor, innerColor);
        c1.featureID = circleValve.id;
        return c1; 
    }

    static renderTarget(position){
        let width = CircleValve.getDefaultValues()["radius1"];
        let color = Colors.getDefaultFeatureColor(CircleValve, Registry.currentLayer)
        let circ = PaperPrimitives.CircleTarget(position, width, color);
        return circ;
    }
}

module.exports = CircleValveRenderer;