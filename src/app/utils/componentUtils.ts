import Registry from "@/app/core/registry";
import { ComponentAPI } from "@/componentAPI";

export default class ComponentUtils {
    constructor() {}

    static getFeatureFromID(featureid: string) {
        return Registry.currentDevice!.getFeatureByID(featureid);
    }

    static getRenderedFeature(featureid: string) {
        return Registry.viewManager!.view.getRenderedFeature(featureid);
    }

    static generateDeviceName(type: string) {
        return Registry.currentDevice!.generateNewName(type);
    }

    static getDeviceLayers() {
        return Registry.currentDevice!.layers;
    }

    static getDeviceLayerFromID(featureid: string) {
        return Registry.currentDevice!.getLayerFromFeatureID(featureid);
    }
}
