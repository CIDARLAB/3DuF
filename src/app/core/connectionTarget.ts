import Component from "./component";
import Device from "./device";
import { ConnectionTargetInterchangeV1 } from "./init";

/**
 * Connection target class
 */
export default class ConnectionTarget {
    protected _component: Component;
    protected _portLabel: string;

    /**
     * Default ConnectionTarget Constructor
     * @param {Component} component
     * @param {string} portLabel
     */
    constructor(component: Component, portLabel: string) {
        this._component = component;
        this._portLabel = portLabel;
    }

    /**
     * Gets the port label of the object
     * @returns {string} Returns the port label of the object
     * @memberof ConnectionTarget
     */
    get portLabel(): string {
        return this._portLabel;
    }

    /**
     * Gets the component in the connection
     * @returns {Component} Returns a component object
     * @memberof ConnectionTarget
     */
    get component(): Component {
        return this._component;
    }

    /**
     * Converts to JSON format
     * @returns {JSON}
     * @memberof ConnectionTarget
     */
    toJSON(): { component: string; port: string } {
        // This is for the older design data
        if (this._component instanceof Component) {
            return {
                component: this._component.id,
                port: this._portLabel
            };
        } else {
            return { component: this._component, port: this._portLabel };
        }
    }

    /**
     * Creates a new connection from a JSON format
     * @param {Device} device Device in the connection
     * @param {JSON} json File where the connection is contain
     * @returns {ConnectionTarget} Returns a Connection Target Object
     * @memberof ConnectionTarget
     */
    static fromJSON(device: Device, json: ConnectionTargetInterchangeV1): ConnectionTarget {
        const component = device.getComponentByID(json.component);
        if (component !== null) return new ConnectionTarget(component, json.port);
        else throw new Error("Component not found");
    }
}
