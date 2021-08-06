import * as PrimitiveSets3D from "./primitiveSets3D";
import * as FeatureSets from "../../featureSets";
import * as THREE from "three";

const layerMaterials = {
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
    const colorString = layer.color;
    if (colorString && Object.prototype.hasOwnProperty.call(layerMaterials, colorString)) {
        return layerMaterials[colorString];
    } else return layerMaterials.grey;
}

function makeParams(feature, renderInfo) {
    const params = {};
    const featureParams = renderInfo.featureParams;
    for (const key in featureParams) {
        const target = featureParams[key];
        if (target === undefined || !Object.prototype.hasOwnProperty.call(feature.params, target)) {
            throw new Error("Key value: " + key + " for value: " + target + " not found in renderInfo.");
        }
        const value = feature.params[target];
        params[key] = value;
    }
    return params;
}

function getRenderInfo(type, set) {
    return FeatureSets.getRender3D(type, set);
}

export function renderFeature(feature, layer, z_offset) {
    const flip = layer.params.flip;
    const type = feature.type;
    const set = feature.set;
    const renderInfo = getRenderInfo(type, set);
    const renderingSet = renderInfo.featurePrimitiveSet;
    const renderingPrimitive = renderInfo.featurePrimitive;
    const primSet = PrimitiveSets3D[renderingSet];
    const targetFunction = PrimitiveSets3D[renderingSet][renderingPrimitive];
    const params = makeParams(feature, renderInfo);
    const geom = targetFunction(params, flip, z_offset);
    const material = getFeatureMaterial(layer);
    const renderedFeature = new THREE.Mesh(geom, material);
    return renderedFeature;
}
