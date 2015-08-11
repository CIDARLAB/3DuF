var Colors = require("../colors");
var Feature = require("../../core/feature");
var PaperPrimitives = require("./paperPrimitives");
var FeatureSets = require("../../featureSets");
var registeredFeatureRenderers = {};

class FeatureRenderer {
	static getLayerColor(feature){
		let height = feature.getValue("height");
        let layerHeight = feature.layer.estimateLayerHeight();
        let decimal = height / layerHeight;
        if (!feature.layer.flip) decimal = 1-decimal;
        let targetColorSet = Colors.getLayerColors(feature.layer);
        return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
	}

    static getBaseColor(feature){
        let decimal = 0;
        if (!feature.layer.flip) decimal = 1-decimal;
        let targetColorSet = Colors.getLayerColors(feature.layer);
        return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
    }

    static __getDefaultValueForType(typeString, key){
        return Feature.getDefaultsForType(typeString)[key];
    }

    static getFeatureRenderer(typeString){
        let rendererInfo = FeatureSets.getRenderer2D(typeString);
        return rendererInfo;
    }

    static getPrimitive(typeString){
        return PaperPrimitives[typeString];
    }

    static renderTarget(typeString, position){
        let renderer = FeatureRenderer.getFeatureRenderer(typeString);
        let params = renderer.targetParams;
        let prim = FeatureRenderer.getPrimitive(renderer.targetPrimitive);
        let primParams = {};
        for (let key in params){
            primParams[key] = FeatureRenderer.__getDefaultValueForType(typeString, params[key]);
        }
        primParams["position"] = position;
        primParams["color"] = Colors.getDefaultFeatureColor(typeString, Registry.currentLayer);
        let rendered = prim(primParams);
        return rendered;
    }

    static renderFeature(feature){
        let type = feature.getType();
        let renderer = FeatureRenderer.getFeatureRenderer(type);
        let params = renderer.featureParams;
        let prim = FeatureRenderer.getPrimitive(renderer.featurePrimitive);
        let primParams = {};
        for (let key in params){
            primParams[key] = feature.getValue(params[key]);
        }
        primParams["color"] = FeatureRenderer.getLayerColor(feature);
        primParams["baseColor"] = FeatureRenderer.getBaseColor(feature);
        let rendered = prim(primParams);
        rendered.featureID = feature.getID();
        return rendered;
    }

    static registerFeatureType(typeString, featureParams, targetParams, featurePrimitive, targetPrimitive){
        registeredFeatureRenderers[typeString] = {
            featureParams: featureParams,
            targetParams: targetParams,
            featurePrimitive: featurePrimitive,
            targetPrimitive: targetPrimitive
        }
        console.log("Registered feature Renderers:");
        console.log(registeredFeatureRenderers);
    }
}

module.exports.registeredFeatureRenderers = registeredFeatureRenderers;
module.exports.renderFeature = FeatureRenderer.renderFeature;
module.exports.renderTarget = FeatureRenderer.renderTarget;
module.exports.registerFeatureType = FeatureRenderer.registerFeatureType;