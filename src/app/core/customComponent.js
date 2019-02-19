import Feature from './feature';
import DXFObject from "./dxfObject";

const Registry = require("./registry");

/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class CustomComponent {

    /**
     * Default constructor
     * @param type String
     * @param dxfdata [DXFObjects]
     * @param mint String
     */
    constructor(type, dxfdata, mint=type.toUpperCase()){
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
     */
    get entity(){
        return this.__entity;
    }

    /**
     * Returns the type
     * @return {*}
     */
    get type(){
        return this.__type;
    }

    /**
     * Returns the rendering data
     * @param data
     */
    set renderData(data){
        this.__renderData = data;
    }

    /**
     * Generates a Feature that has all the corresponding respective data
     */
    generateComponent(){
        let paramvalues = {};
        let feature = Feature.makeFeature(
            type,
            "custom",
            paramvalues,
            Registry.currentDevice.generateNewName(type),
            Feature.generateID(),
            this.dxfData
        );
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {{}} Object
     */
    toJSON(){
        let output = {};
        output.type = this.__type;
        output.entity = this.__entity;
        if(this.__params){
            output.params = this.__params.toJSON();
        }
        let dxfdata = [];
        for(let i in this.dxfData){
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
     * @returns {*}
     */
    static fromInterchangeV1(json){
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        let dxfdata = [];
        for(let i in json.dxfData){
            dxfdata.push(new DXFObject(json.dxfData[i]));
        }

        //TODO: This will have to change soon when the thing is updated
        let ret = new CustomComponent(json.type, dxfdata, json.entity);
        // ret.renderData = json.renderData;
        // let render = DXFRenderer.renderDXFObjects(dxfdata);
        // ret.renderData = render.exportSVG();
        return ret;

    }

    static defaultParameterDefinitions(){
        let params = {
            unique: {
                "position": "Point",
            },
            heritable: {
                "rotation": "Float",
                // "x-scale": "Float",
                // "width": "Float",
                "height": "Float"
            },
            units: {
                "rotation": "&deg",
                // "length": "&mu;m",
                // "width": "&mu;m",
                "height": "&mu;m"
            },
            defaults: {
                "rotation": 0,
                // "width": 1.23 * 1000,
                // "length": 4.92 * 1000,
                "height": .1 * 1000
            },
            minimum: {
                "rotation": 0,
                // "width": 30,
                // "length": 120,
                "height": 1
            },
            maximum: {
                "rotation": 359,
                // "width": 6000,
                // "length": 24 * 1000,
                "height": 1200
            }
        };
        return params;
    }

}
