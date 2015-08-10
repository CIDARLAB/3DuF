var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Feature = require("../../core/feature");
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class ViaRenderer extends FeatureRenderer{
    static renderFeature(via){
       let position = via.getValue("position");
        let radius1 = via.getValue("radius1");;
        let radius2 = via.getValue("radius2");;
        let innerColor = FeatureRenderer.getLayerColor(via);
        let outerColor = FeatureRenderer.getBottomColor(via);

        let c1 = PaperPrimitives.GradientCircle(position, radius1, radius2, outerColor, innerColor);
        c1.featureID = via.getID();
        return c1; 
    }

    static renderTarget(position){
        let color = Colors.getDefaultFeatureColor("Via", Registry.currentLayer)
        let width = Feature.getDefaultsForType("Via")["radius1"];
        let circ = PaperPrimitives.CircleTarget(position, width, color);
        return circ;
    }
}

module.exports = ViaRenderer;