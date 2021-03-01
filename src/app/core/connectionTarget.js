import Component from "./component";
import Device from "./device";

/**
 * Connection target class
 */
export default class ConnectionTarget {
    /**
     * Default ConnectionTarget Constructor
     * @param {Component} component
     * @param {string} portLabel
     */
    constructor(component, portLabel) {
        this.__component = component;
        this.__portLabel = portLabel;
    }

    /**
     * Gets the port label of the object
     * @returns {string} Returns the port label of the object
     * @memberof ConnectionTarget
     */
    get portLabel() {
        return this.__portLabel;
    }

    /**
     * Gets the component in the connection
     * @returns {Component} Returns a component object
     * @memberof ConnectionTarget
     */
    get component() {
        return this.__component;
    }

    /**
     * Converts to JSON format
     * @returns {JSON}
     * @memberof ConnectionTarget
     */
    toJSON() {
        //This is for the older design data
        if (this.__component instanceof Component) {
            return {
                component: this.__component.getID(),
                port: this.__portLabel
            };
        } else {
            return { component: this.__component, port: this.__portLabel };
        }
    }

    /**
     * Creates a new connection from a JSON format
     * @param {Device} device Device in the connection
     * @param {JSON} json File where the connection is contain
     * @returns {ConnectionTarget} Returns a Connection Target Object
     * @memberof ConnectionTarget
     */
    static fromJSON(device, json) {
        let component = device.getComponentByID(json.component);
        return new ConnectionTarget(component, json.port);
    }
}
