var Params = require('./params');
var Parameters = require('./parameters');
var Parameter = require("./parameter");
var StringValue = Parameters.StringValue;
var FeatureSets = require("../featureSets");
var Registry = require("./registry");

var registeredFeatureTypes = {};

class Feature {
    constructor(type, set, params, name, id = Feature.generateID(), group = null){
        this.__type = type;
        this.__params = params;
        this.__name = StringValue(name);
        this.__id = id;
        this.__group = group;
        this.__type = type;
        this.__set = set;
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
        output.name = this.__name.toJSON();
        output.type = this.__type;
        output.set = this.__set;
        output.params = this.__params.toJSON();

        //TODO: Implement Groups!
        //output.group = this.group.toJSON();
        return output;
    }

    getSet(){
        return this.__set;
    }

    setGroup(group){
        //TODO: implement this!
    }

    getGroup(){
        return this.__group;
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
        return this.getFeatureType().heritable;
    }

    getUniqueParams(){
        return this.getFeatureType().unique;
    }

    getDefaults(){
        return this.getFeatureType().defaults;
    }

    static getDefaultsForType(typeString, setString){
        return FeatureSets.getDefinition(typeString, setString).defaults;
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

    static makeFeature(typeString, setString, values, name = "New Feature", id=undefined){
        let featureType = FeatureSets.getDefinition(typeString, setString);
        Feature.checkDefaults(values, featureType.heritable, featureType.defaults);
        let params = new Params(values, featureType.unique, featureType.heritable);
        return new Feature(typeString, setString, params, name, id)
    }

    updateView(){
        if(Registry.viewManager) Registry.viewManager.updateFeature(this);
    }

    //I wish I had abstract methods. :(
    render2D(){
        throw new Error("Base class Feature cannot be rendered in 2D.");
    }
}

module.exports = Feature;