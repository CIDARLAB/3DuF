import Feature from './feature';

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
    toInterchangeV1(){
        let output = {};
        output.id = this.__id;
        output.name = this.__name.toJSON();
        output.entity = this.__entity.toJSON();
        output.params = this.__params.toJSON();
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
        //TODO: This will have to change soon when the thing is updated
        throw new Error("Need to implement Interchange V1 Import for component object");
        //return Feature.makeFeature(json.macro, set, json.params, json.name, json.id, json.type);
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
