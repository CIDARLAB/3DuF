export default class DepthFeatureMap {
    constructor(name) {
        this.__name = name;
        this.__depthMap = new Map();
    }

    addFeature(depth, featureref) {
        if (this.__depthMap.has(depth)) {
            //Get the array stored for the depth
            let features = this.__depthMap.get(depth);
            features.push(featureref);
            // this.__depthMap.set(depth, features);
        } else {
            let features = [];
            features.push(featureref);
            this.__depthMap.set(depth, features);
        }
    }

    getDepths() {
        return this.__depthMap.keys();
    }

    getFeaturesAtDepth(depth) {
        return this.__depthMap.get(depth);
    }
}
