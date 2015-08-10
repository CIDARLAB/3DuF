var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");
var Feature = require("../../core/feature");

class CircleValveRenderer extends FeatureRenderer{
    static renderFeature(circleValve){
        let position = circleValve.getValue("position");
        let radius1 = circleValve.getValue("radius1");
        let radius2 = circleValve.getValue("radius2");

        let innerColor = FeatureRenderer.getLayerColor(circleValve);
        let outerColor = FeatureRenderer.getBottomColor(circleValve);

        let c1 = PaperPrimitives.GradientCircle(position, radius1, radius2, outerColor, innerColor);
        c1.featureID = circleValve.getID();
        return c1; 
    }

    static renderTarget(position){
        let width = Feature.getDefaultsForType("CircleValve")["radius1"];
        let color = Colors.getDefaultFeatureColor("CircleValve", Registry.currentLayer)
        let circ = PaperPrimitives.CircleTarget(position, width, color);
        return circ;
    }
}

module.exports = CircleValveRenderer;