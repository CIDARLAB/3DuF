var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");
var Feature = require("../../core/feature");

class HollowChannelRenderer extends FeatureRenderer{
    static renderFeature(hollowChannel){
        let start = hollowChannel.getValue("start");
        let end = hollowChannel.getValue("end");
        let width = hollowChannel.getValue("width");
        let rec = PaperPrimitives.RoundedRect(start, end, width);
        rec.featureID = hollowChannel.getID();
        rec.fillColor = FeatureRenderer.getLayerColor(hollowChannel);
        return rec;
    }

    static renderTarget(position){
        let color = Colors.getDefaultFeatureColor("HollowChannel", Registry.currentLayer)
        let width = Feature.getDefaultsForType("HollowChannel")["width"];
        let circ = PaperPrimitives.CircleTarget(position, width/2, color);
        return circ;
    }
}

module.exports = HollowChannelRenderer;