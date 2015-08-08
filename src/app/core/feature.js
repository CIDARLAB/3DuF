var uuid = require('node-uuid');
var Params = require('./params');
var Parameters = require('./parameters');
var Parameter = require("./parameter");
var StringValue = Parameters.StringValue;
var Registry = require("./registry");

class Feature {
    constructor(type, params, name, id = Feature.generateID(), group = null){
        this.type = type;
        this.params = params;
        this.name = new StringValue(name);
        this.id = id;
        this.group = group;
        this.type = type;
    }

    static generateID() {
        //return uuid.v1();
        return Registry.generateID();
    }

    updateParameter(key, value){
        this.params.updateParameter(key, value);
        this.updateView();
    }

    toJSON() {
        let output = {};
        output.id = this.id;
        output.name = this.name.toJSON();
        output.type = this.type;
        output.params = this.params.toJSON();
        //TODO: Fix groups!
        //output.group = this.group.toJSON();
        return output;
    }

    static checkDefaults(values, featureClass){
        let defaults = featureClass.getDefaultValues();
        let heritable = featureClass.getHeritableParameters();
        for (let key in heritable){
            if (!values.hasOwnProperty(key)) values[key] = defaults[key];
        }
        return values;
    }

    //TODO: This needs to return the right subclass of Feature, not just the right data! 
    static fromJSON(json) {
        return Feature.makeFeature(json.type, json.params, json.name);
    }

    static makeFeature(type, values, name){
        if(Registry.registeredFeatures.hasOwnProperty(type)){
            return new Registry.registeredFeatures[type](values, name);
        } else {
            throw new Error("Feature " + type + " has not been registered.");
        }
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