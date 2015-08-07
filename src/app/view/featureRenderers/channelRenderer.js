var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Channel = require("../../core/features").Channel;
var Colors = require("../colors");

class ChannelRenderer{
    static renderFeature(channel){
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
        rec.fillColor = Colors.INDIGO_500;
        return rec;
    }

    static renderTarget(position){
        let width = Channel.getDefaultValues()["width"];
        let circ = PaperPrimitives.CircleTarget(position, width/2);
        return circ;
    }
}

module.exports = ChannelRenderer;