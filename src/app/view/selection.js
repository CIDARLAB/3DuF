import paper from "paper";
import * as Registry from "../core/registry";

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
        //Sort out where each of the items selected belongs to one of the following
        for (let i in items) {  // query if its a component, connection or other feature
            let feature = Registry.currentDevice.getComponentByID(items[i]); 
            if (feature == null) {
                feature = Registry.currentDevice.getConnectionByID(items[i]);
                if (feature == null) {
                    console.log("Other Feature Selected");
                    feature = Registry.currentDevice.getFeatureByID(items[i]);
                    console.log(feature);
                    console.log(items[i]);
                    console.log(Registry.currentDevice.getFeatureIDs);
                    this.__otherFeatures.push(items[i]);
                } else {
                    console.log("Connection Feature Selected");
                    this.__connections.push(items[i]);
                }
            } else {
                console.log("Component Feature Selected");
                this.__components.push(items[i]);
            }
        }
        this.__bounds = this.__calculateSelectionBounds();
    }

    getFeatureIDs() {
        let ret = [];
        ret.concat(this.__components);
        ret.concat(this.__connections);
        ret.concat(this.__otherFeatures);
        return ret;
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
        let referencepoint = this.__bounds.topleft;

        console.log("reference point:", referencepoint);


        for (let i in this.__components) {
            let render = Registry.currentDevice.getComponentByID(this.__components[i]);
            let newx = referencepoint.x + render.bounds.x;
            newx -= x;
            let newy = referencepoint.y - render.bounds.y;
            newy += y;
            let newComponent = render.replicate(newx,newy);
            Registry.currentDevice.addComponent(newComponent);
            console.log("registry added replicated device");
        }

        for (let i in this.__connections) {
            let render = Registry.currentDevice.getFeatureByID(this.__connections[i]);
            let replica = render.replicate(x,y);
        }

        for (let i in this.__otherFeatures) {
            let render = Registry.currentDevice.getFeatureByID(this.__otherFeatures[i]);
            let newx = referencepoint.x + render.bounds.x;
            newx -= x;
            let newy = referencepoint.y - render.bounds.y;
            newy += y;
            let newFeature = render.replicate(newx,newy);
            let replica = render.replicate(newx,newy);
        }

    }
    /**
     * Selects all the components, connections and features
     * @returns {void}
     * @memberof Selection
     */
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
