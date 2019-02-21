const uuid = require('node-uuid');
import paper from "paper";

export default class ComponentPort {
    /**
     * Default constructor for ComponentPorts
     * @param x
     * @param y
     * @param label
     * @param layer
     */
    constructor(x, y, label, layer){
        this._id = uuid.v1();
        this._x = x;
        this._y = y;
        this._label = label;
        this._layer = layer;
    }

    get layer() {
        return this._layer;
    }

    set layer(value) {
        this._layer = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    toInterchangeV1(){
        return {
            "x": this._x,
            "y": this._y,
            "layer": this._layer,
            "label": this._label
        }
    }

    static calculateAbsolutePosition(componentport, component){
        let topleftposition = component.getValue("position");
        let point = new paper.Point(topleftposition[0] + componentport.x, topleftposition[1] + componentport.y);
        console.log("Unchanged point:", point);
        console.log(component.getRotation());
        let rotatedpoint = point.rotate(component.getRotation(), topleftposition);
        console.log("Rotated point:", point);
        return [rotatedpoint.x, rotatedpoint.y];
    }

    static fromInterchangeV1(json){
        return new ComponentPort(json.x, json.y, json.label, json.layer);
    }


}