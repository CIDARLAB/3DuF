/**
 * Depth feature map class
 */
export default class DepthFeatureMap {
    private __name: string;
    __depthMap: Map<any, any>;

    /**
     * Default Constructor for DepthFeatureMap object.
     * @param {string} name
     */
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
    addFeature(depth: number, featureref: any) {
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
    getFeaturesAtDepth(depth: number): Array<string> {
        if (this.__depthMap.has(depth)) {
            return this.__depthMap.get(depth) as Array<string>;
        }
        throw new Error("Could not find features at Depth: " + depth);
    }
}
