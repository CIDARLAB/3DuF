var Colors = require("../colors");

class FeatureRenderer {
	static getLayerColor(feature, featureClass){
		let height;
        try {
            height = feature.params.getValue("height");
        } catch (err) {
            height = featureClass.getDefaultValues()["height"];
        }
        let layerHeight = feature.layer.estimateLayerHeight();
        let decimal = height / layerHeight;
        if (!feature.layer.flip) decimal = 1-decimal;
        let targetColorSet = Colors.getLayerColors(feature.layer);
        return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
	}
}

module.exports = FeatureRenderer;