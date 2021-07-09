import Registry from "@/app/core/registry";

export default class ConnectionUtils {

    constructor() {}

    static hasFeatureSet() {
        if (Registry.featureSet == null) {
            return false;
        } else {
            return true;
        }
    }

    static getDefinition(stringname) {
        return Registry.featureSet.getDefinition("Connection");
    }
    
    static getFeatureFromID(featureid) {
        return Registry.currentDevice.getFeatureByID(featureid)
    }
}