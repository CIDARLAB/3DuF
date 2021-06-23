import * as PrimitiveSets3D from "./primitiveSets3D";
import * as FeatureSets from "../../featureSets";
import * as THREE from "three";

var layerMaterials = {
    red: new THREE.MeshLambertMaterial({
        color: 0xf44336,
        shading: THREE.SmoothShading
    }),
    indigo: new THREE.MeshLambertMaterial({
        color: 0x3f51b5,
        shading: THREE.SmoothShading
    }),
    purple: new THREE.MeshLambertMaterial({
        color: 0x673ab7,
        shading: THREE.SmoothShading
    }),
    grey: new THREE.MeshLambertMaterial({
        color: 0x9e9e9e,
        shading: THREE.SmoothShading
    })
};

function getFeatureMaterial(layer) {
    var colorString = layer.color;
    if (colorString && Object.prototype.hasOwnProperty.call(layerMaterials, colorString)) {
        return layerMaterials[colorString];
    } else return layerMaterials["grey"];
}

function makeParams(feature, renderInfo) {
    let params = {};
    let featureParams = renderInfo.featureParams;
    for (let key in featureParams) {
        let target = featureParams[key];
        if (target === undefined || !Object.prototype.hasOwnProperty.call(feature.params, target)) throw new Error("Key value: " + key + " for value: " + target + " not found in renderInfo.");
        let value = feature.params[target];
        params[key] = value;
    }
    return params;
}

function getRenderInfo(type, set) {
    return FeatureSets.getRender3D(type, set);
}

export function renderFeature(feature, layer, z_offset) {
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
