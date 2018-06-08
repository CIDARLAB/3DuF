var PrimitiveSets3D = require("./primitiveSets3D");
var FeatureSets = require("../../featureSets");

var layerMaterials = {
	"red": new THREE.MeshLambertMaterial({
		color: 0xF44336,
		shading: THREE.SmoothShading
	}),
	"indigo": new THREE.MeshLambertMaterial({
		color: 0x3F51B5,
		shading: THREE.SmoothShading
	}),
	"purple": new THREE.MeshLambertMaterial({
		color: 0x673AB7,
		shading: THREE.SmoothShading
	}),
	"grey": new THREE.MeshLambertMaterial({
		color: 0x9E9E9E,
		shading: THREE.SmoothShading
	})
};

function getFeatureMaterial(layer) {
	var colorString = layer.color;
	if (colorString && layerMaterials.hasOwnProperty(colorString)) {
		return layerMaterials[colorString];
	} else return layerMaterials["grey"];
}

function makeParams(feature, renderInfo) {
	let params = {};
	let featureParams = renderInfo.featureParams;
	for (let key in featureParams) {
		let target = featureParams[key];
		if (target == undefined || !feature.params.hasOwnProperty(target)) throw new Error("Key value: " + key + " for value: " + target + " not found in renderInfo.");
		let value = feature.params[target];
		params[key] = value;
	}
	return params;
}

function getRenderInfo(type, set) {
	return FeatureSets.getRender3D(type, set);
}

function renderFeature(feature, layer, z_offset) {
	let flip = layer.params.flip;
	let type = feature.type;
	let set = feature.set;
	let renderInfo = getRenderInfo(type, set);
	let renderingSet = renderInfo.featurePrimitiveSet;
	let renderingPrimitive = renderInfo.featurePrimitive;
	let primSet = PrimitiveSets3D[renderingSet];
	let targetFunction = PrimitiveSets3D[renderingSet][renderingPrimitive];
	let params = makeParams(feature, renderInfo);
	let geom = targetFunction(params, flip, z_offset);
	let material = getFeatureMaterial(layer);
	let renderedFeature = new THREE.Mesh(geom, material);
	return renderedFeature;
}

module.exports.renderFeature = renderFeature;