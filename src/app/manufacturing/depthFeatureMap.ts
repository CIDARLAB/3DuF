/**
 * Depth feature map class
 */
export default class DepthFeatureMap {
    /**
     * Default Constructor for DepthFeatureMap object.
     * @param {string} name
     */

    private __name: string;
    private __depthMap: Map<number, Array<string>>;

    constructor(name: string) {
        this.__name = name;
        this.__depthMap = new Map();
    }

    /**
     * Add feature to the object
     * @param {number} depth Value of depth
     * @param {*} featureref
     * @memberof DepthFeatureMap
     * @returns {void}
     */
    addFeature(depth: number, featureref: string): void {
        if (this.__depthMap.has(depth)) {
            // Get the array stored for the depth
            const features = this.__depthMap.get(depth);
            if (features != undefined) features.push(featureref);
            // this.__depthMap.set(depth, features);
        } else {
            const features = [];
            features.push(featureref);
            this.__depthMap.set(depth, features);
        }
    }

    /**
     * Gets depth
     * @returns {Array<number>} Returns all the depth
     * @memberof DepthFeatureMap
     */
    getDepths(): IterableIterator<number> {
        return this.__depthMap.keys();
    }

    /**
     * Gets features for a certain depth
     * @param {*} depth
     * @returns {Array<features>} Returns the feature of the depth
     * @memberof DepthFeatureMap
     */
    getFeaturesAtDepth(depth: number): Array<string> | undefined {
        return this.__depthMap.get(depth);
    }
}
