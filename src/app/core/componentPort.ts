import uuid from "node-uuid";
import paper from "paper";
import Layer from "./layer";
import Component from "./component";
import { ComponentPortInterchangeV1, LogicalLayerType, Point } from "./init";

export default class ComponentPort {
    protected _id: string;
    protected _x: number;
    protected _y: number;
    protected _label: string;
    protected _layer: LogicalLayerType;

    /**
     * Default constructor for ComponentPorts
     * @param {Number} x X coordinate
     * @param {Number} y Y coordinate
     * @param {String} label Name of the component
     * @param {Layer} layer
     */
    constructor(x: number, y: number, label: string, layer: LogicalLayerType) {
        this._id = uuid.v1();
        this._x = x;
        this._y = y;
        this._label = label;
        this._layer = layer;
    }

    /**
     * Gets the layer of the component port
     * @returns {layer} Returns layer
     * @memberof ComponentPort
     */
    get layer() {
        return this._layer;
    }

    /**
     * Sets the layer
     * @param {} value Value of the layer
     * @memberof ComponentPort
     * @returns {void}
     */
    set layer(value) {
        this._layer = value;
    }

    /**
     * Gets the label
     * @returns {string} Returns the label of the component port
     * @memberof ComponentPort
     */
    get label() {
        return this._label;
    }

    /**
     * Sets the label of the component port
     * @param {string} value Label
     * @memberof ComponentPort
     * @returns {void}
     */
    set label(value) {
        this._label = value;
    }

    /**
     * Gets the Y coordinate of the component port
     * @returns {number} Returns the y coordinate
     * @memberof ComponentPort
     */
    get y() {
        return this._y;
    }

    /**
     * Sets the Y coordinate of the component port
     * @param {number} y Value of the Y coordinate
     * @memberof ComponentPort
     * @returns {void}
     */
    set y(value) {
        this._y = value;
    }

    /**
     * Gets the X coordinate of the component port
     * @returns {number} Returns the X coordinate
     * @memberof ComponentPort
     */
    get x() {
        return this._x;
    }

    /**
     * Sets the X coordinate of the component port
     * @param {number} value Value of the X coordinate
     * @returns {void}
     * @memberof ComponentPort
     */
    set x(value) {
        this._x = value;
    }

    /**
     * Gets the ID of the component port
     * @returns {string} Returns the ID
     * @memberof ComponentPort
     */
    get id() {
        return this._id;
    }

    /**
     * Set the ID of the component port
     * @param {string} value ID
     * @memberof ComponentPort
     * @returns {void}
     */
    set id(value) {
        this._id = value;
    }

    /**
     * Converts to Interchange V1 format
     * @returns {Object} Returns a object with Interchange V1 format
     * @memberof ComponentPort
     */
    toInterchangeV1(): ComponentPortInterchangeV1 {
        return {
            x: this._x,
            y: this._y,
            layer: this._layer,
            label: this._label
        };
    }

    /**
     * Returns the absolute postition of the component
     * @param {Object} componentport Component port object
     * @param {Object} component Component object
     * @returns {Array} Returns an array which contains the X absolute coordinate and the y absolute coordinate
     * @memberof ComponentPort
     */
    static calculateAbsolutePosition(componentport: ComponentPort, component: Component): Point {
        const topleftposition = component.getValue("position");
        const point = new paper.Point(topleftposition[0] + componentport.x, topleftposition[1] + componentport.y);
        console.log("Unchanged point:", point);
        console.log(component.getRotation());
        const rotatedpoint = point.rotate(component.getRotation(), topleftposition);
        console.log("Rotated point:", point);
        return [rotatedpoint.x, rotatedpoint.y];
    }

    /**
     * Creates a new Component Port from an Interchange V1 format
     * @param {} json
     * @returns {ComponentPort} Returns a component port object
     * @memberof ComponentPort
     */
    static fromInterchangeV1(json: ComponentPortInterchangeV1): ComponentPort {
        return new ComponentPort(json.x, json.y, json.label, json.layer);
    }
}
