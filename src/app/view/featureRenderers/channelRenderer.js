var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Channel = require("../../core/features").Channel;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class ChannelRenderer extends FeatureRenderer{
    static renderFeature(channel) {
        let start = channel.params.getValue("start");
        let end = channel.params.getValue("end");
        let width;
        try {
            width = channel.params.getValue("width");
        } catch (err) {
            width = Channel.getDefaultValues()["width"];
        }
        let rec = PaperPrimitives.RoundedRect(start, end, width);
        rec.featureID = channel.id;
        rec.fillColor = FeatureRenderer.getLayerColor(channel, Channel);
        return rec;
    }

    static renderTarget(position) {
        let width = Channel.getDefaultValues()["width"];
        let color = Colors.getDefaultFeatureColor(Channel, Registry.currentLayer)
        let circ = PaperPrimitives.CircleTarget(position, width / 2, color);
        return circ;
    }
}

module.exports = ChannelRenderer;