import Registry from "@/app/core/registry";
import Feature from "@/app/core/feature";
import Layer from "@/app/core/layer";
import RenderLayer from "@/app/view/renderLayer";
import { LogicalLayerType } from "@/app/core/init";

export default class FeatureUtils {
    /**
     * Determines substrate from layer index and susbtrate offset
     * @return {number}
     * @memberof FeatureUtils
     */
    static setSubstrate(feature: Feature, offset: string): number {
        let substrate: number;
        let layer: RenderLayer | Layer | null = feature.layer;
        if (layer == null) {
            throw new Error("Layer never set for feature " + feature.ID);
        } else if (Registry.currentDevice == null) {
            throw new Error("Current device has not been set in registry");
        } else if (layer instanceof RenderLayer) {
            if (layer.physicalLayer != null) {
                layer = layer.physicalLayer;
            } else {
                throw new Error("Feature " + feature.ID + " must be on physical layer for manufacturing");
            }
        }

        if (layer.type == LogicalLayerType.FLOW) {
            if (offset.includes("-")) {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) - parseInt(offset);
            } else {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) + parseInt(offset);
            }
        } else if (layer.type == LogicalLayerType.CONTROL) {
            if (offset.includes("-")) {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) - parseInt(offset);
            } else if (offset != "0") {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) + parseInt(offset);
            } else {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) + 1;
            }
        } else if (layer.type == LogicalLayerType.INTEGRATION) {
            if (offset.includes("-")) {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) - parseInt(offset);
            } else {
                substrate = ~~(Registry.currentDevice.layers.indexOf(layer) / 3) + parseInt(offset);
            }
        } else {
            throw new Error("Layer type" + layer.type + "not recognized");
        }
        return substrate;
    }
}
