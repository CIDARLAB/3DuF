import Device from "../core/device";
import Layer from "@/app/core/layer";
import { LogicalLayerType } from "../core/init";
import RenderLayer from "../view/renderLayer";
import LoadUtils from "./loadUtils";

export function generateRenderLayers(device: Device): Array<RenderLayer> {

    let newRenderLayers: Array<RenderLayer> = [];
    newRenderLayers.push(new RenderLayer(device.generateNewName("RenderLayerFlow"), device.layers[0], LogicalLayerType.FLOW));
    newRenderLayers.push(new RenderLayer(device.generateNewName("RenderLayerControl"), device.layers[1], LogicalLayerType.CONTROL));
    newRenderLayers.push(new RenderLayer(device.generateNewName("RenderLayerIntegration"), device.layers[0], LogicalLayerType.INTEGRATION));

    // Ensures that there are three layers per group
    let layerGroups: Map<string, number> = new Map();
    for (let i = 0; i < device.layers.length; i++) {
        if (layerGroups.has(device.layers[i].group)) {
            const currentVal = layerGroups.get(device.layers[i].group);
            if (currentVal) layerGroups.set(device.layers[i].group, currentVal + 1);
        } else {
            layerGroups.set(device.layers[i].group, 1);
        }
    }

    // layerGroups.forEach((value, key) => {
    //     const keyVal = parseInt(key, 10);

    //     if (value == 3) {
    //         console.log("All layers accounted for in group " + key);
    //     } else {
    //         const layerTypes: Array<string> = ["FLOW", "CONTROL", "INTEGRATION"];
    //         for (const i in json.layers) {
    //             const index = layerTypes.indexOf(json.layers[i].type);
    //             layerTypes.splice(index, 1);
    //         }
    //         console.log(layerTypes.length + " layers missing from group " + key + ", these will be generated");
    //         for (const j in layerTypes) {
    //             const featuresToAdd = LoadUtils.generateMissingLayerFeaturesV1(json, layerTypes[j], key);
    //             if (layerTypes[j] == "FLOW") {
    //                 const newLayer = new Layer({}, device.generateNewName("LayerFlow"), LogicalLayerType.FLOW, key, device);
    //                 for (const k in featuresToAdd) {
    //                     newLayer.features[featuresToAdd[k].ID] = featuresToAdd[k];
    //                 }
    //                 newLayer.featureCount = featuresToAdd.length;
    //                 device.addLayerAtIndex(newLayer, keyVal * 3);
    //                 newRenderLayers.splice(keyVal * 3, 0, new RenderLayer(device.generateNewName("RenderLayerFlow"), device.layers[keyVal * 3], LogicalLayerType.FLOW));
    //             }
    //             else if (layerTypes[j] == "CONTROL") {
    //                 const newLayer = new Layer({}, device.generateNewName("LayerControl"), LogicalLayerType.CONTROL, key, device);
    //                 for (const k in featuresToAdd) {
    //                     newLayer.features[featuresToAdd[k].ID] = featuresToAdd[k];
    //                 }
    //                 newLayer.featureCount = featuresToAdd.length;
    //                 device.addLayerAtIndex(newLayer, keyVal * 3 + 1);
    //                 newRenderLayers.splice(keyVal * 3 + 1, 0, new RenderLayer(device.generateNewName("RenderLayerControl"), device.layers[keyVal * 3 + 1], LogicalLayerType.CONTROL));
    //             }
    //             else if (layerTypes[j] == "INTEGRATION") {
    //                 const newLayer = new Layer({}, device.generateNewName("LayerIntegration"), LogicalLayerType.INTEGRATION, key, device);
    //                 for (const k in featuresToAdd) {
    //                     newLayer.features[featuresToAdd[k].ID] = featuresToAdd[k];
    //                 }
    //                 newLayer.featureCount = featuresToAdd.length;
    //                 device.addLayerAtIndex(newLayer, keyVal * 3 + 2);
    //                 newRenderLayers.splice(keyVal * 3 + 2, 0, new RenderLayer(device.generateNewName("RenderLayerIntegration"), device.layers[keyVal * 3 + 2], LogicalLayerType.INTEGRATION));
    //             }
    //         }
    //     }
    // });

    // //Updating cross-references
    // let features = device.getAllFeaturesFromDevice();
    // for (let i in features) {
    //     const feature = features[i];
    //     if (feature.referenceID !== null) {
    //         device.updateObjectReference(feature.referenceID, feature.ID);
    //     }
    // }

    return newRenderLayers;

}