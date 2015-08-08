var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Via = require("../../core/features").Via;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class ViaRenderer extends FeatureRenderer{
    static renderFeature(via){
       let position = via.params.getValue("position");
        let radius1;
        let radius2;

        //TODO: figure out inheritance pattern for values!

        try {
            radius1 = via.params.getValue("radius1");
        } catch (err) {
            radius1 = Via.getDefaultValues()["radius1"];
        }

        try {
            radius2 = via.params.getValue("radius2");
        } catch (err) {
            radius2 = Via.getDefaultValues()["radius2"];
        }

        let innerColor = FeatureRenderer.getLayerColor(via, Via);
        let outerColor = FeatureRenderer.getBottomColor(via);

        let c1 = PaperPrimitives.GradientCircle(position, radius1, radius2, outerColor, innerColor);
        c1.featureID = via.id;
        return c1; 
    }

    static renderTarget(position){
        let color = Colors.getDefaultFeatureColor(Via, Registry.currentLayer)
        let width = Via.getDefaultValues()["radius1"];
        let circ = PaperPrimitives.CircleTarget(position, width, color);
        return circ;
    }
}

module.exports = ViaRenderer;