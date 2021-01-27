import DXFObject from "./dxfObject";
import Device from "./device";

import * as Registry from "./registry";
import Feature from "./feature";

/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class CustomComponent {
    /**
     * Default constructor
     * @param {String} type Type of component
     * @param {DXFObject} dxfdata DXFObject
     * @param {String} mint Unique MINT identifier
     */
    constructor(type, dxfdata, mint = type.toUpperCase()) {
        // this.__params = params;
        this.__type = type;
        this.__entity = mint;
        this.dxfData = dxfdata;
        this.__params = null;
        this.__renderData = null;
        //This stores the features that are a part of the component
        // this.__features = [];
        // //TODO: Need to figure out how to effectively search through these
        // this.__bounds = null;
    }

    /**
     * Returns the entity type
     * @return {string}
     * @memberof CustomComponent
     */
    get entity() {
        return this.__entity;
    }

    /**
     * Returns the type
     * @return {string}
     * @memberof CustomComponent
     */
    get type() {
        return this.__type;
    }

    /**
     * Sets the rendering data
     * @param {} data
     * @memberof CustomComponent
     * @returns {void}
     */
    set renderData(data) {
        this.__renderData = data;
    }

    /**
     * Generates a Feature that has all the corresponding respective data
     * @returns {Feature} Returns a feature based on the data
     * @memberof CustomComponent
     */
    generateComponent() {
        let paramvalues = {};
        let feature = Device.makeFeature(type, "custom", paramvalues, Registry.currentDevice.generateNewName(type), Feature.generateID(), this.dxfData);
        return feature;
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {JSON} Object
     * @memberof CustomComponent
     */
    toJSON() {
        let output = {};
        output.type = this.__type;
        output.entity = this.__entity;
        if (this.__params) {
            output.params = this.__params.toJSON();
        }
        let dxfdata = [];
        for (let i in this.dxfData) {
            dxfdata.push(this.dxfData[i].getData());
        }
        output.dxfData = dxfdata;
        // output.renderData = this.__renderData;
        // console.log(output);
        return output;
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param json
     * @returns {CustomComponent}
     * @memberof CustomComponent
     */
    static fromInterchangeV1(json) {
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        let dxfdata = [];
        for (let i in json.dxfData) {
            dxfdata.push(new DXFObject(json.dxfData[i]));
        }

        //TODO: This will have to change soon when the thing is updated
        let ret = new CustomComponent(json.type, dxfdata, json.entity);
        // ret.renderData = json.renderData;
        // let render = DXFRenderer.renderDXFObjects(dxfdata);
        // ret.renderData = render.exportSVG();
        return ret;
    }
    /**
     * Contains the default parameters
     * @returns {Object} Returns an Object containing the default parameters
     * @memberof CustomComponent
     */
    static defaultParameterDefinitions() {
        let params = {
            unique: {
                position: "Point"
            },
            heritable: {
                rotation: "Float",
                // "x-scale": "Float",
                // "width": "Float",
                height: "Float"
            },
            units: {
                rotation: "&deg",
                // "length": "&mu;m",
                // "width": "&mu;m",
                height: "&mu;m"
            },
            defaults: {
                rotation: 0,
                // "width": 1.23 * 1000,
                // "length": 4.92 * 1000,
                height: 0.1 * 1000
            },
            minimum: {
                rotation: 0,
                // "width": 30,
                // "length": 120,
                height: 1
            },
            maximum: {
                rotation: 359,
                // "width": 6000,
                // "length": 24 * 1000,
                height: 1200
            }
        };
        return params;
    }
}
