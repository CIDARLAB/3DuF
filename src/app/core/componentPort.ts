import uuid from "node-uuid";
import paper from "paper";
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
     * @param {string} layer
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
     * @returns {string} Returns layer
     * @memberof ComponentPort
     */
    get layer() {
        return this._layer;
    }

    /**
     * Sets the layer
     * @param {string} value Value of the layer
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
     * Returns the absolute position of a component port.
     * Must match {@link ComponentPortRenderer2D}: draw-origin + local offset,
     * then rotate and mirror about the geometric center.
     * @param {Object} componentport Component port object
     * @param {Object} component Component object
     * @returns {Array} Returns an array which contains the X absolute coordinate and the y absolute coordinate
     * @memberof ComponentPort
     */
    static calculateAbsolutePosition(componentport: ComponentPort, component: Component): Point {
        const drawOrigin = component.getDrawOrigin();
        const drawX = drawOrigin[0];
        const drawY = drawOrigin[1];
        let point = new paper.Point(drawX + componentport.x, drawY + componentport.y);

        let geoCenter: paper.Point;
        try {
            const center = component.getCenterPosition();
            geoCenter = new paper.Point(center[0], center[1]);
        } catch {
            geoCenter = new paper.Point(drawX, drawY);
        }

        const rotation = component.getRotation();
        if (rotation) {
            point = point.rotate(rotation, geoCenter);
        }

        let x = point.x;
        let y = point.y;
        if (component.getMirrorByX()) {
            x = 2 * geoCenter.x - x;
        }
        if (component.getMirrorByY()) {
            y = 2 * geoCenter.y - y;
        }
        return [x, y];
    }

    /**
     * Pull a port waypoint into the component body so a square channel, which
     * stops on the centerline, overlaps the primitive instead of sharing a
     * zero-width edge (hairline gap at mixer / chamber openings).
     */
    static insetTowardCenter(portAbs: Point, component: Component, overlap: number): Point {
        let cx = portAbs[0];
        let cy = portAbs[1];
        try {
            const center = component.getCenterPosition();
            cx = center[0];
            cy = center[1];
        } catch {
            // keep port as the reference if the component has no center
        }
        const dx = cx - portAbs[0];
        const dy = cy - portAbs[1];
        const length = Math.hypot(dx, dy);
        if (length < 1e-6) {
            return [portAbs[0], portAbs[1]];
        }
        const step = Math.min(Math.abs(overlap), length * 0.25) / length;
        return [portAbs[0] + dx * step, portAbs[1] + dy * step];
    }

    /**
     * Creates a new Component Port from an Interchange V1 format
     * @param {} json
     * @returns {ComponentPort} Returns a component port object
     * @memberof ComponentPort
     */
    static fromInterchangeV1(json: ComponentPortInterchangeV1): ComponentPort {
        let layer = LogicalLayerType.FLOW;
        if(json.layer === "FLOW"){
            layer = LogicalLayerType.FLOW;
        } else if (json.layer === "CONTROL"){
            layer = LogicalLayerType.CONTROL;
        } else if (json.layer === "INTEGRATION"){
            layer = LogicalLayerType.INTEGRATION;
        }
        return new ComponentPort(json.x, json.y, json.label, layer);
    }
}
