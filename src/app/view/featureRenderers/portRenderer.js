var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Port = require("../../core/features").Port;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class PortRenderer extends FeatureRenderer {
    static renderFeature(port){
       let position = port.params.getValue("position");
        let radius1;
        let radius2;

        //TODO: figure out inheritance pattern for values!

        try {
            radius1 = port.params.getValue("radius1");
        } catch (err) {
            radius1 = Port.getDefaultValues()["radius1"];
        }

        try {
            radius2 = port.params.getValue("radius2");
        } catch (err) {
            radius2 = Port.getDefaultValues()["radius2"];
        }

        let innerColor = FeatureRenderer.getLayerColor(port, Port);
        let outerColor = FeatureRenderer.getBottomColor(port);

        let c1 = PaperPrimitives.GradientCircle(position, radius1, radius2, outerColor, innerColor);
        c1.featureID = port.id;
        return c1; 
    }

    static renderTarget(position){
        let color = Colors.getDefaultFeatureColor(Port, Registry.currentLayer)
        let width = Port.getDefaultValues()["radius1"];
        let circ = PaperPrimitives.CircleTarget(position, width, color);
        return circ;
    }
}

module.exports = PortRenderer;