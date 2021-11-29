import Registry from "@/app/core/registry";
import { ComponentAPI } from "@/componentAPI";

export default class ConnectionUtils {
    constructor() {}

    static hasFeatureSet() {
        if (Registry.featureSet === null) {
            return false;
        } else {
            return true;
        }
    }

    static getDefinition(stringname: string) {
        return ComponentAPI.getDefinition("Connection");
    }

    static getFeatureFromID(featureid: string) {
        return Registry.currentDevice!.getFeatureByID(featureid);
    }
}
