import paper from "paper";
import Registry from "@/app/core/registry";

/**
 * Selection class
 */
export default class Selection {
    /**
     * Pass an array of feature IDs that can be used to store the selection
     * @param {Array<string>} items Array of String
     */
    constructor(items) {
        this.__components = [];
        this.__connections = [];
        this.__otherFeatures = [];
        // Sort out wether each of the items selected belongs to one of the following
        for (const i in items) {
            console.log(items[i]);
        }
        this.__bounds = this.__calculateSelectionBounds();
    }

    /**
     * Generates a replica
     * @param {number} x X coordinate for here the selection should be replicated
     * @param {number} y Y coordinate for where the selection should be replicated
     * @returns {void}
     * @memberof Selection
     */
    replicate(x, y) {
        /*
        1. Get the selection's reference point
        2. Go through each of the items
        3. Clone components/connections/other features
         */
        const referencepoint = this.__bounds.topleft;

        console.log("reference point:", referencepoint);

        for (const i in this.__components) {
            const render = Registry.currentDevice.getFeatureByID(this.__components[i]);
        }

        for (const i in this.__connections) {
            const render = Registry.currentDevice.getFeatureByID(this.__connections[i]);
        }

        for (const i in this.__otherFeatures) {
            const render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
        }
    }

    /**
     * Selects all the components, connections and features
     * @returns {void}
     * @memberof Selection
     */
    selectAll() {
        for (const i in this.__components) {
            const component = Registry.currentDevice.getComponentByID(this.__components[i]);
            for (const j in component.featureIDs) {
                const render = Registry.currentDevice.getFeatureByID(component.featureIDs[i]);
                render.selected = true;
            }
        }

        for (const i in this.__connections) {
            const connection = Registry.currentDevice.getConnectionByID(this.__connections[i]);
            for (const j in connection.featureIDs) {
                const render = Registry.currentDevice.getFeatureByID(connection.featureIDs[i]);
                render.selected = true;
            }
        }

        for (const i in this.__otherFeatures) {
            const render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
            render.selected = true;
        }
    }

    /**
     * Gets all the bounds
     * @returns {Array<number>} Returns an array containing the bounds of the selection
     * @memberof Selection
     */
    get bounds() {
        return this.__bounds;
    }

    /**
     * Calculates how much area has been selected
     * @returns {void}
     * @memberof Selection
     */
    __calculateSelectionBounds() {
        let xmin = 0;
        let ymin = 0;
        let xmax = 0;
        let ymax = 0;
        let bounds;

        for (const i in this.__components) {
            const render = Registry.currentDevice.getFeatureByID(this.__components[i]);
            bounds = render.bounds;
            if (bounds.x < xmin) {
                xmin = bounds.x;
            }
            if (bounds.y < ymin) {
                ymin = bounds.y;
            }
            if (bounds.x + bounds.width > xmax) {
                xmax = bounds.x + bounds.width;
            }
            if (bounds.y + bounds.height > ymax) {
                ymax = bounds.y + bounds.height;
            }
        }

        for (const i in this.__connections) {
            const render = Registry.currentDevice.getFeatureByID(this.__connections[i]);
            bounds = render.bounds;
            if (bounds.x < xmin) {
                xmin = bounds.x;
            }
            if (bounds.y < ymin) {
                ymin = bounds.y;
            }
            if (bounds.x + bounds.width > xmax) {
                xmax = bounds.x + bounds.width;
            }
            if (bounds.y + bounds.height > ymax) {
                ymax = bounds.y + bounds.height;
            }
        }

        for (const i in this.__otherFeatures) {
            const render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
            bounds = render.bounds;
            if (bounds.x < xmin) {
                xmin = bounds.x;
            }
            if (bounds.y < ymin) {
                ymin = bounds.y;
            }
            if (bounds.x + bounds.width > xmax) {
                xmax = bounds.x + bounds.width;
            }
            if (bounds.y + bounds.height > ymax) {
                ymax = bounds.y + bounds.height;
            }
        }

        const ret = new paper.Rectangle(new paper.Point(xmin, ymin), new paper.Point(xmax, ymax));
        return ret;
    }
}
