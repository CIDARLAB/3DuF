import DXFObject from "./dxfObject";

import Feature from "./feature";
import Params from "./params";

/**
 * Edge Feature class
 */
export default class EdgeFeature extends Feature {
    /**
     * Default constructor for the edge feature
     * @param {Object} edgeObjects
     * @param {Params} params
     * @param {String} id
     */
    constructor(edgeObjects, params, id = Feature.generateID()) {
        super("EDGE", "Basic", params, id, id, "EDGE");
        if (edgeObjects) {
            this.__edgeObjects = edgeObjects;
        } else {
            this.__edgeObjects = [];
        }
    }

    /**
     * Generate a rectangular edge for the device
     * @param {Number} xspan X coordinate
     * @param {Number} yspan Y coordinate
     * @memberof EdgeFeature
     * @returns {void}
     */
    generateRectEdge(xspan, yspan) {
        //TODO: Fix this by trying to incorporate a system where the unit is given
        xspan /= 1000;
        yspan /= 1000;
        let object = new DXFObject({
            type: "POLYLINE",
            vertices: [
                {
                    x: 0,
                    y: 0,
                    z: 0
                },
                {
                    x: xspan,
                    y: 0,
                    z: 0
                },
                {
                    x: xspan,
                    y: yspan,
                    z: 0
                },
                {
                    x: 0,
                    y: yspan,
                    z: 0
                },
                {
                    x: 0,
                    y: 0,
                    z: 0
                }
            ]
        });

        this.addDXFObject(object);
    }
}
