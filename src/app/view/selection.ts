import paper from "paper";
import { ViewManager } from "..";

/**
 * Selection class
 */
export default class Selection {
    protected __components: Array<string>;
    protected __connections: Array<string>;
    protected __otherFeatures: Array<string>;
    protected __bounds: paper.Rectangle;
    private viewManagerDelegate: ViewManager;

    /**
     * Pass an array of feature IDs that can be used to store the selection
     * @param {Array<string>} items Array of String
     */
    constructor(items: Array<string>, viewManager: ViewManager) {
        this.__components = [];
        this.__connections = [];
        this.__otherFeatures = [];
        // Sort out wether each of the items selected belongs to one of the following
        for (const i in items) {
            console.log(items[i]);
        }
        this.__bounds = this.__calculateSelectionBounds();
        this.viewManagerDelegate = viewManager;
    }

    /**
     * Generates a replica
     * @param {number} x X coordinate for here the selection should be replicated
     * @param {number} y Y coordinate for where the selection should be replicated
     * @returns {void}
     * @memberof Selection
     */
    replicate(x: number, y: number): void {
        // throw error if current device is not set
        if (this.viewManagerDelegate.currentDevice === null) {
            throw new Error("Current device not set");
        }
        /*
        1. Get the selection's reference point
        2. Go through each of the items
        3. Clone components/connections/other features
         */
        const referencepoint = this.__bounds.topLeft;

        console.log("reference point:", referencepoint);

        for (const i in this.__components) {
            const render = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__components[i]);
        }

        for (const i in this.__connections) {
            const render = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__connections[i]);
        }

        for (const i in this.__otherFeatures) {
            const render = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__otherFeatures[i]);
        }
    }

    /**
     * Selects all the components, connections and features
     * @returns {void}
     * @memberof Selection
     */
    selectAll(): void {
        // throw error if current device is not set
        if (this.viewManagerDelegate.currentDevice === null) {
            throw new Error("No device selected");
        }
        for (const i in this.__components) {
            const component = this.viewManagerDelegate.currentDevice.getComponentByID(this.__components[i]);
            if (component === null) {
                throw new Error("Component not found");
            }
            for (const j in component.featureIDs) {
                const feature = this.viewManagerDelegate.currentDevice.getFeatureByID(component.featureIDs[i]);
                const render = this.viewManagerDelegate.view.getRender(feature.ID);
                render.selected = true;
            }
        }

        for (const i in this.__connections) {
            const connection = this.viewManagerDelegate.currentDevice.getConnectionByID(this.__connections[i]);
            if (connection === null) {
                throw new Error("Connection not found");
            }
            for (const j in connection.featureIDs) {
                const feature = this.viewManagerDelegate.currentDevice.getFeatureByID(connection.featureIDs[i]);
                const render = this.viewManagerDelegate.view.getRender(feature.ID);
                render.selected = true;
            }
        }

        for (const i in this.__otherFeatures) {
            const feature = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__otherFeatures[i]);
            const render = this.viewManagerDelegate.view.getRender(feature.ID);
            render.selected = true;
        }
    }

    /**
     * Gets all the bounds
     * @returns {Array<number>} Returns an array containing the bounds of the selection
     * @memberof Selection
     */
    get bounds(): paper.Rectangle {
        return this.__bounds;
    }

    /**
     * Calculates how much area has been selected
     * @returns {void}
     * @memberof Selection
     */
    __calculateSelectionBounds(): paper.Rectangle {
        // throw error if current device is not set
        if (this.viewManagerDelegate.currentDevice === null) {
            throw new Error("Current device not set");
        }
        let xmin = 0;
        let ymin = 0;
        let xmax = 0;
        let ymax = 0;
        let bounds;

        for (const i in this.__components) {
            const feature = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__components[i]);
            const render = this.viewManagerDelegate.view.getRender(feature.ID);
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
            const feature = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__connections[i]);
            const render = this.viewManagerDelegate.view.getRender(feature.ID);
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
            const feature = this.viewManagerDelegate.currentDevice.getFeatureByID(this.__otherFeatures[i]);
            const render = this.viewManagerDelegate.view.getRender(feature.ID);
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
