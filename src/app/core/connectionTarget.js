import Component from "./component";
import Device from "./device";

/**
 * Connection target class
 */
export default class ConnectionTarget {
    /**
     * Default ConnectionTarget Constructor 
<<<<<<< HEAD
<<<<<<< HEAD
     * @param {Component} component 
=======
     * @param {Object} component 
>>>>>>> 12/23/20
=======
     * @param {Component} component 
>>>>>>> Error corrected in the core folder
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
<<<<<<< HEAD
<<<<<<< HEAD
     * @returns {Component} Returns a component object
=======
     * @returns {Object} Returns a component object
>>>>>>> 12/23/20
=======
     * @returns {Component} Returns a component object
>>>>>>> Error corrected in the core folder
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
<<<<<<< HEAD
<<<<<<< HEAD
     * @param {Device} device Device in the connection
     * @param {JSON} json File where the connection is contain
     * @returns {ConnectionTarget} Returns a Connection Target Object
=======
     * @param {Object} device Device in the connection
     * @param {JSON} json File where the connection is contain
     * @returns {Object} Returns a Connection Target Object
>>>>>>> 12/23/20
=======
     * @param {Device} device Device in the connection
     * @param {JSON} json File where the connection is contain
     * @returns {ConnectionTarget} Returns a Connection Target Object
>>>>>>> Error corrected in the core folder
     * @memberof ConnectionTarget
     */
    static fromJSON(device, json) {
        let component = device.getComponentByID(json.component);
        return new ConnectionTarget(component, json.port);
    }
}
