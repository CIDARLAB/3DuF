import Registry from "@/app/core/registry";

export default class ComponentUtils {
    constructor() {}

    static getComponentPorts(cleanparamdata, type) {
        return Registry.featureSet.getComponentPorts(cleanparamdata, type);
    }

    static getFeatureFromID(featureid) {
        return Registry.currentDevice.getFeatureByID(featureid);
    }

    static getRenderedFeature(featureid) {
        return Registry.viewManager.view.getRenderedFeature(featureid);
    }

    static getMintType(entity) {
        return Registry.featureSet.getTypeForMINT(entity);
    }

    static getComponentPorts(cleanparamdata, type) {
        return Registry.featureSet.getComponentPorts(cleanparamdata, type);
    }

    static generateDeviceName(type) {
        return Registry.currentDevice.generateNewName(type);
    }

    static getFeatureSetDefinition(type) {
        return Registry.featureSet.getDefinition(type);
    }

    static getDeviceLayers() {
        return Registry.currentDevice.getLayers();
    }

    static getDeviceLayerFromID(featureid) {
        return Registry.currentDevice.getLayerFromFeatureID(featureid);
    }
}