/**
 * Depth feature map class
 */
export default class DepthFeatureMap {
    /**
     * Default Constructor for DepthFeatureMap object.
     * @param {string} name 
     */
    constructor(name) {
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
    /**
     * Gets depth
     * @returns {Array<number>} Returns all the depth
     * @memberof DepthFeatureMap
     */
    getDepths() {
        return this.__depthMap.keys();
    }
    /**
     * Gets features for a certain depth
     * @param {*} depth 
     * @returns {Array<features>} Returns the feature of the depth 
     * @memberof DepthFeatureMap
     */
    getFeaturesAtDepth(depth) {
        return this.__depthMap.get(depth);
    }
}
