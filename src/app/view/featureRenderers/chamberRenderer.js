var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Chamber = require("../../core/features").Chamber;
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");

class ChamberRenderer extends FeatureRenderer{
    static renderFeature(chamber) {
        let start = chamber.params.getValue("start");
        let end = chamber.params.getValue("end");
        let width;
        try {
            width = chamber.params.getValue("borderWidth");
        } catch (err) {
            width = Chamber.getDefaultValues()["borderWidth"];
        }
        let rec = PaperPrimitives.RoundedChamber(start, end, width);
        rec.featureID = chamber.id;
        rec.fillColor = FeatureRenderer.getLayerColor(chamber, Chamber);
        return rec;
    }

    static renderTarget(position) {
        let width = Channel.getDefaultValues()["borderWidth"];
        let color = Colors.getDefaultFeatureColor(Chamber, Registry.currentLayer)
        let circ = PaperPrimitives.CircleTarget(position, width / 2, color);
        return circ;
    }
}

module.exports = ChamberRenderer;