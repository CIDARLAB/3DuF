import EdgeFeature from "./edgeFeature";
import PositionTool from "../view/tools/positionTool";
import {PointValue} from "./parameters";

var Params = require('./params');
var Parameters = require('./parameters');
var StringValue = Parameters.StringValue;
var FeatureSets = require("../featureSets");
var Registry = require("./registry");

// var registeredFeatureTypes = {};

export default class Feature {
    constructor(type, set, params, name, id = Feature.generateID(), fabtype="XY"){
        this.__type = type;
        this.__params = params;
        this.__name = name;
        this.__id = id;
        this.__type = type;
        this.__set = set;
        this.__fabtype = fabtype;
        this.__dxfObjects = [];
    }

    get fabType(){
        return this.__fabtype;
    }

    static generateID() {
        return Registry.generateID();
    }

    updateParameter(key, value){
        this.__params.updateParameter(key, value);
        this.updateView();
    }

    toJSON() {
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.type = this.__type;
        output.set = this.__set;
        output.params = this.__params.toJSON();
        return output;
    }

    toInterchangeV1(){
        //TODO: We need to figure out what to do and what the final feature format will be
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.macro = this.__type;
        output.set = this.__set;
        if(this.__params){
            output.params = this.__params.toJSON();
        }
        if(this.__dxfObjects){
            output.dxfData = this.__dxfObjects;
        }
        output.type = this.__fabtype;
        return output;
    }

    getSet(){
        return this.__set;
    }

    getID(){
        return this.__id;
    }

    setName(name){
        this.__name = StringValue(name);
    }

    getName(){
        return this.__name.getValue();
    }

    getType(){
        return this.__type;
    }

    static getFeatureGenerator(typeString, setString){
        return function(values){
            return Feature.makeFeature(typeString, setString, values);
        }
    }

    getValue(key){
        try {
            return this.__params.getValue(key);
        } catch (err){
            if (this.hasDefaultParam(key)) return this.getDefaults()[key];
            else throw new Error("Unable to get value for key: " + key);
        }
    }

    hasDefaultParam(key){
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    hasUniqueParam(key){
        return this.__params.isUnique(key);
    }

    hasHeritableParam(key){
        return this.__params.isHeritable(key);
    }

    getHeritableParams(){
        return Feature.getDefinitionForType(this.getType(), this.getSet()).heritable;
    }

    getUniqueParams(){
        return Feature.getDefinitionForType(this.getType(), this.getSet()).unique;
    }

    getDefaults(){
        return Feature.getDefaultsForType(this.getType(), this.getSet());
    }

    getParams(){
        return this.__params.parameters;
    }

    setParams(params){
        this.__params.parameters = params;
    }

    replicate(xpos, ypos){
        let paramscopy = this.__params;
        let replicaparams = {};
        for(let key in this.__params.parameters){
            replicaparams[key] = this.getValue(key);
        }
        replicaparams["position"] = [xpos, ypos];
        let ret = Feature.makeFeature(
            this.__type,
            this.__set,
            replicaparams,
            this.__name,
            Feature.generateID(),
            this.__dxfObjects
        );

        return ret;

    }

    static getDefaultsForType(typeString, setString){
        return Registry.featureDefaults[setString][typeString];
    }

    static getDefinitionForType(typeString, setString){
        return FeatureSets.getDefinition(typeString, setString);
    }

    static checkDefaults(values, heritable, defaults){
        for (let key in heritable){
            if (!values.hasOwnProperty(key)) values[key] = defaults[key];
        }
        return values;
    }

    static fromJSON(json) {
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        return Feature.makeFeature(json.type, set, json.params, json.name, json.id);
    }

    static fromInterchangeV1(json){
        let set;
        if (json.hasOwnProperty("set")) set = json.set;
        else set = "Basic";
        //TODO: This will have to change soon when the thing is updated
        return Feature.makeFeature(json.macro, set, json.params, json.name, json.id, json.type, json.dxfData);
    }

    static makeFeature(typeString, setString, paramvalues, name = "New Feature", id=undefined, dxfdata=undefined){
        let params;
        let featureType = FeatureSets.getDefinition(typeString, setString);
        if (paramvalues) {
            Feature.checkDefaults(paramvalues, featureType.heritable, Feature.getDefaultsForType(typeString, setString));
            params = new Params(paramvalues, featureType.unique, featureType.heritable);
        }
        if (typeString == "EDGE"){
            console.log("testing......")
            return new EdgeFeature(dxfdata, params, id);
        }else {
            return new Feature(typeString, setString, params, name, id)
        }
    }

    updateView(){
        if(Registry.viewManager) Registry.viewManager.updateFeature(this);
    }

    //I wish I had abstract methods. :(
    render2D(){
        throw new Error("Base class Feature cannot be rendered in 2D.");
    }

    /**
     * Returns the array of dxf objects
     * @return {Array}
     */
    getDXFObjects(){
        return this.__dxfObjects;
    }

    /**
     * Add a DXF object
     * @param dxfobject
     */
    addDXFObject(dxfobject) {
        this.__dxfObjects.push(dxfobject);
    }
}
