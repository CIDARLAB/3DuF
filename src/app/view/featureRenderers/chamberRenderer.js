var Registry = require("../../core/registry");
var PaperPrimitives = require("../paperPrimitives");
var Colors = require("../colors");
var FeatureRenderer = require("./FeatureRenderer");
var Feature = require("../../core/feature");

class ChamberRenderer extends FeatureRenderer{
    static renderFeature(chamber) {
        let start = chamber.getValue("start");
        let end = chamber.getValue("end");
        let width = chamber.getValue("borderWidth");
        let rec = PaperPrimitives.RoundedChamber(start, end, width);
        rec.featureID = chamber.getID();
        rec.fillColor = FeatureRenderer.getLayerColor(chamber);
        return rec;
    }

    static renderTarget(position) {
        let width = Feature.getDefaultsForType("Chamber")["borderWidth"];
        let color = Colors.getDefaultFeatureColor("Chamber", Registry.currentLayer)
        let circ = PaperPrimitives.CircleTarget(position, width / 2, color);
        return circ;
    }
}

module.exports = ChamberRenderer;