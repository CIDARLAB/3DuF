var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");
var Feature = require("../../core/feature");

class ChannelRenderer extends FeatureRenderer{
    static renderFeature(channel) {
        let start = channel.getValue("start");
        let end = channel.getValue("end");
        let width = channel.getValue("width");
        let rec = PaperPrimitives.RoundedRect(start, end, width);
        rec.featureID = channel.getID();
        rec.fillColor = FeatureRenderer.getLayerColor(channel);
        return rec;
    }

    static renderTarget(position) {
        let width = Feature.getDefaultsForType("Channel")["width"];
        let color = Colors.getDefaultFeatureColor("Channel", Registry.currentLayer)
        let circ = PaperPrimitives.CircleTarget(position, width / 2, color);
        return circ;
    }
}

module.exports = ChannelRenderer;