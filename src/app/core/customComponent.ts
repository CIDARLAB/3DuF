import DXFObject from "./dxfObject";
import Device from "./device";

import Registry from "./registry";
import Component from "./component";
import Params from "./params";
import Template from "../library/template";
import Feature from "./feature";
import DeviceUtils from "../utils/deviceUtils";
import { LibraryEntryDefinition } from "@/componentAPI";

/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class CustomComponent extends Template {
    dxfData: any = null;
    protected _type: string = "";
    protected _entity: string = "";
    protected _renderData: any = null;
    protected _params: Params = new Params({}, new Map(), new Map());

    /**
     * Default constructor
     * @param {String} type Type of component
     * @param {DXFObject} dxfdata DXFObject
     * @param {String} mint Unique MINT identifier
     */
    constructor(type: string, dxfdata: any, mint: string = type.toUpperCase()) {
        super();
        // this.__params = params;
        this._type = type;
        this._entity = mint;
        this.dxfData = dxfdata;
        // this.__params = null;
        // this.__renderData = null;
        // This stores the features that are a part of the component
        // this.__features = [];
        // //TODO: Need to figure out how to effectively search through these
        // this.__bounds = null;
    }

    /**
     * Returns the entity type
     * @return {string}
     * @memberof CustomComponent
     */
    get entity(): string {
        return this._entity;
    }

    /**
     * Returns the type
     * @return {string}
     * @memberof CustomComponent
     */
    get type(): string {
        return this._type;
    }

    /**
     * Sets the rendering data
     * @param {} data
     * @memberof CustomComponent
     * @returns {void}
     */
    set renderData(data: any) {
        this._renderData = data;
    }

    /**
     * Generates a Feature that has all the corresponding respective data
     * @returns {Feature} Returns a feature based on the data
     * @memberof CustomComponent
     */
    generateComponent(): Feature {
        const paramvalues = {};
        const feature = Device.makeFeature(this.type, "custom", paramvalues, DeviceUtils.generateNewName(this.type), Feature.generateID(), "XY", this.dxfData);
        return feature;
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {JSON} Object
     * @memberof CustomComponent
     */
    toJSON() {
        const dxfdata = [];
        for (const i in this.dxfData) {
            dxfdata.push(this.dxfData[i].getData());
        }

        const output = {
            type: this.type,
            entity: this.entity,
            params: this._params.toJSON(),
            dxfData: dxfdata
        };
        return output;
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param json
     * @returns {CustomComponent}
     * @memberof CustomComponent
     */
    static fromInterchangeV1(json: any) {
        let set;
        if (Object.prototype.hasOwnProperty.call(json, "set")) set = json.set;
        else set = "Basic";
        const dxfdata = [];
        for (const i in json.dxfData) {
            dxfdata.push(new DXFObject(json.dxfData[i]));
        }

        // TODO: This will have to change soon when the thing is updated
        const ret = new CustomComponent(json.type, dxfdata, json.entity);
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
    static defaultParameterDefinitions(): LibraryEntryDefinition {
        const params = {
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
            },
            mint: ""
        };
        return params;
    }
}
