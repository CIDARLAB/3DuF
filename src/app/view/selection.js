import paper from "paper";

export default class Selection {
    /**
     * Pass an array of feature IDs that can be used to store the selection
     * @param items Array of String
     */
    constructor(items) {
        this.__components = [];
        this.__connections = [];
        this.__otherFeatures = [];
        //Sort out wether each of the items selected belongs to one of the following
        for (let i in items) {
            console.log(items[i]);
        }
        this.__bounds = this.__calculateSelectionBounds();
    }

    /**
     * Generates a replica
     * @param x X coordinate for here the selection should be replicated
     * @param y Y coordinate for where the selection should be replicated
     */
    replicate(x, y) {
        /*
        1. Get the selection's reference point
        2. Go through each of the items
        3. Clone components/connections/other features
         */
        let referencepoint = this.__bounds.topleft;

        console.log("reference point:", referencepoint);

        for (let i in this.__components) {
            let render = Registry.currentDevice.getFeatureByID(this.__components[i]);
        }

        for (let i in this.__connections) {
            let render = Registry.currentDevice.getFeatureByID(this.__connections[i]);
        }

        for (let i in this.__otherFeatures) {
            let render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
        }
    }

    selectAll() {
        for (let i in this.__components) {
            let component = Registry.currentDevice.getComponentByID(this.__components[i]);
            for (let j in component.features) {
                let render = Registry.currentDevice.getFeatureByID(component.features[i]);
                render.selected = true;
            }
        }

        for (let i in this.__connections) {
            let connection = Registry.currentDevice.getConnectionByID(this.__connections[i]);
            for (let j in connection.features) {
                let render = Registry.currentDevice.getFeatureByID(connection.features[i]);
                render.selected = true;
            }
        }

        for (let i in this.__otherFeatures) {
            let render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
            render.selected = true;
        }
    }

    get bounds() {
        return this.__bounds;
    }

    __calculateSelectionBounds() {
        let xmin = 0;
        let ymin = 0;
        let xmax = 0;
        let ymax = 0;
        let bounds;

        for (let i in this.__components) {
            let render = Registry.currentDevice.getFeatureByID(this.__components[i]);
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

        for (let i in this.__connections) {
            let render = Registry.currentDevice.getFeatureByID(this.__connections[i]);
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

        for (let i in this.__otherFeatures) {
            let render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
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

        let ret = new paper.Rectangle(new paper.Point(xmin, ymin), new paper.Point(xmax, ymax));
        return ret;
    }
}
