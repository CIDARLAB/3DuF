import Registry from "@/app/core/registry";
import { ComponentAPI } from "@/componentAPI";

export default class ComponentUtils {
    constructor() {}

    static getFeatureFromID(featureid) {
        return Registry.currentDevice.getFeatureByID(featureid);
    }

    static getRenderedFeature(featureid) {
        return Registry.viewManager.view.getRenderedFeature(featureid);
    }

    static generateDeviceName(type) {
        return Registry.currentDevice.generateNewName(type);
    }

    static getDeviceLayers() {
        return Registry.currentDevice.getLayers();
    }

    static getDeviceLayerFromID(featureid) {
        return Registry.currentDevice.getLayerFromFeatureID(featureid);
    }
}
