var Colors = require("../colors");

class FeatureRenderer {
	static getLayerColor(feature){
		let height;
        try {
            height = feature.getValue("height");
        } catch (err) {
            height = feature.getDefaults()["height"];
        }
        let layerHeight = feature.layer.estimateLayerHeight();
        let decimal = height / layerHeight;
        if (!feature.layer.flip) decimal = 1-decimal;
        let targetColorSet = Colors.getLayerColors(feature.layer);
        return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
	}

    static getBottomColor(feature){
        let decimal = 0;
        if (!feature.layer.flip) decimal = 1-decimal;
        let targetColorSet = Colors.getLayerColors(feature.layer);
        return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
    }
}

module.exports = FeatureRenderer;