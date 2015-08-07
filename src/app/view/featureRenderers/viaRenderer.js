var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Via = require("../../core/features").Via;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class ViaRenderer extends FeatureRenderer{
    static renderFeature(via){
       let position = via.params.getValue("position");
        let radius;

        //TODO: figure out inheritance pattern for values!

        try {
            radius = via.params.getValue("radius1");
        } catch (err) {
            radius = Via.getDefaultValues()["radius1"];
        }


        let c1 = PaperPrimitives.Circle(position, radius);
        c1.fillColor = FeatureRenderer.getLayerColor(via, Via);
        c1.featureID = via.id;
        return c1; 
    }

    static renderTarget(position){
        let width = Via.getDefaultValues()["radius1"];
        let circ = PaperPrimitives.CircleTarget(position, width);
        return circ;
    }
}

module.exports = ViaRenderer;