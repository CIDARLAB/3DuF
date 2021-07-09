import Registry from "@/app/core/registry";

export default class deviceUtils {
    constructor() {}

    static addLayer(layer,index) {
        Registry.viewManager.addLayer(layer, index);
    }    
}