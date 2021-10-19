import Feature from "../core/feature";

/**
 * Substrate feature map class
 */
export default class SubstrateFeatureMap {
    /**
     * Default Constructor for DepthFeatureMap object.
     * @param {string} name
     */

    private __name: string;
    private __offsetMap: Map<string, Array<Feature>>;
    constructor(name: string) {
        this.__name = name;
        this.__offsetMap = new Map();
    }

    /**
     * Add feature to the object
     * @param {string} offset Value of substrate offset
     * @param {*} feature
     * @memberof SubstrateFeatureMap
     * @returns {void}
     */
    addFeature(substrate: string, feature: Feature): void {
        if (this.__offsetMap.has(substrate)) {
            // Get the array stored for the depth
            const features: Array<Feature> | undefined = this.__offsetMap.get(substrate);
            if (features != undefined) features.push(feature);
            // this.__depthMap.set(depth, features);
        } else {
            const features = [];
            features.push(feature);
            this.__offsetMap.set(substrate, features);
        }
    }

    /**
     * Gets substrate offset
     * @returns {Array<string>} Returns all the depth
     * @memberof SubstrateFeatureMap
     */
    getOffsets(): IterableIterator<string> | undefined {
        return this.__offsetMap.keys();
    }

    /**
     * Gets features for a certain offset
     * @param {*} offset
     * @returns {Array<Feature>} Returns the feature of the depth
     * @memberof SubstrateFeatureMap
     */
    getFeaturesOfOffset(offset: string): Array<Feature> | undefined {
        return this.__offsetMap.get(offset);
    }
}
