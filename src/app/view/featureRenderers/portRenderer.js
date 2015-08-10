var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Feature = require("../../core/feature");
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class PortRenderer extends FeatureRenderer {
    static renderFeature(port){
       let position = port.getValue("position");
        let radius1 = port.getValue("radius1");
        let radius2 = port.getValue("radius2");
        let innerColor = FeatureRenderer.getLayerColor(port);
        let outerColor = FeatureRenderer.getBottomColor(port);

        let c1 = PaperPrimitives.GradientCircle(position, radius1, radius2, outerColor, innerColor);
        c1.featureID = port.getID();
        return c1; 
    }

    static renderTarget(position){
        let color = Colors.getDefaultFeatureColor("Port", Registry.currentLayer)
        let width = Feature.getDefaultsForType("Port")["radius1"];
        let circ = PaperPrimitives.CircleTarget(position, width, color);
        return circ;
    }
}

module.exports = PortRenderer;