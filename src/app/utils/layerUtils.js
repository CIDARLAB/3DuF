import Registry from "@/app/core/registry"

export default class layerUtls {
    constructor() {}

    static addFeature(feature) {
        Registry.viewManager.addFeature(feature);
    }

    static removeFeature(feature) {
        Registry.viewManager.removeFeature(feature);
    }
}