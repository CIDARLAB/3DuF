import Registry from "@/app/core/registry";

export default class DeviceUtils {

    static __nameMap = new Map();

    static addLayer(layer, index) {
        Registry.viewManager.addLayer(layer, index);
    }

    /**
     * Generates a new new name for the type, use this to autogenerate the names for components that are typespecific
     * @param {string} type
     * @return {string}
     * @memberof Device
     */
    static generateNewName(type) {
        let value = DeviceUtils.__nameMap.get(type);
        if (value != undefined) {
            this.__nameMap.set(type, value + 1);
            return type + "_" + String(value + 1);
        } else {
            this.__nameMap.set(type, 1);
            return type + "_1";
        }
    }
}
