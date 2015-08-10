var uuid = require('node-uuid');
var Params = require('./params');
var Parameters = require('./parameters');
var Parameter = require("./parameter");
var StringValue = Parameters.StringValue;
var Registry = require("./registry");

class Feature {
    constructor(type, params, name, id = Feature.generateID(), group = null){
        this.__type = type;
        this.__params = params;
        this.__name = StringValue(name);
        this.__id = id;
        this.__group = group;
        this.__type = type;
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
        output.params = this.__params.toJSON();

        //TODO: Implement Groups!
        //output.group = this.group.toJSON();
        return output;
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

    static getDefaultsForType(typeString){
        return Registry.registeredFeatures[typeString].defaults;
    }

    static __ensureTypeExists(type){
         if(Registry.registeredFeatures.hasOwnProperty(type)){
            return true;
        } else {
            throw new Error("Feature " + type + " has not been registered.");
        }
    }

    static registerFeature(typeString, unique, heritable, defaults){
        Registry.registeredFeatures[typeString] = {
            unique: unique,
            heritable: heritable,
            defaults: defaults
        }
    }

    static checkDefaults(values, heritable, defaults){
        for (let key in heritable){
            if (!values.hasOwnProperty(key)) values[key] = defaults[key];
        }
        return values;
    }

    //TODO: This needs to return the right subclass of Feature, not just the right data! 
    static fromJSON(json) {
        return Feature.makeFeature(json.type, json.params, json.name);
    }

    static makeFeature(type, values, name = "New Feature"){
        Feature.__ensureTypeExists(type);
        let featureType = Registry.registeredFeatures[type];
        Feature.checkDefaults(values, featureType.heritable, featureType.defaults);
        let params = new Params(values, featureType.unique, featureType.heritable);
        return new Feature(type, params, name)
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