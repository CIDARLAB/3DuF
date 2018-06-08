var Parameters = require('./parameters');
var StringValue = Parameters.StringValue;
var Registry = require("./registry");
var FeatureRenderer2D = require("../view/render2D/featureRenderer2D");


/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
class Component {
    constructor(type, params, name, mint, id = Component.generateID()){
        this.__params = params;
        this.__name = StringValue(name);
        this.__id = id;
        this.__type = type;
        this.__entity = StringValue(mint);
        //This stores the features that are a part of the component
        this.__features = [];
        //TODO: Need to figure out how to effectively search through these
        this.__bounds = null;
    }

    /**
     * Generates a random id
     * @returns {String} Random ID string
     */
    static generateID() {
        return Registry.generateID();
    }

    /**
     * Sets the bounds i.e. the x,y position and the width and length of the component
     * @param bounds PaperJS Rectangle object associated with a Path.bounds property
     */
    setBounds(bounds){
        this.__bounds = bounds;
        let topleftpt = bounds.topLeft;
        this.__params.position = [topleftpt.x, topleftpt.y];
        this.__params.xspan = bounds.width;
        this.__params.yspan = bounds.height;
    }

    /**
     * Updates the parameters stored by the component
     * @param key
     * @param value
     */
    updateParameter(key, value){
        this.__params.updateParameter(key, value);
        this.updateView();
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
     * Returns the ID of the component
     * @returns {String|*}
     */
    getID(){
        return this.__id;
    }

    /**
     * Allows the user to set the name of the component
     * @param name
     */
    setName(name){
        this.__name = StringValue(name);
    }

    /**
     * Returns the name of the component
     * @returns {String}
     */
    getName(){
        return this.__name.getValue();
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {*}
     */
    getType(){
        return this.__type;
    }

    /**
     * Returns the value of the parameter stored against the following key in teh component params
     * @param key
     * @returns {*}
     */
    getValue(key){
        try {
            return this.__params.getValue(key);
        } catch (err){
            if (this.hasDefaultParam(key)) return this.getDefaults()[key];
            else throw new Error("Unable to get value for key: " + key);
        }
    }

    getFeatureIDs(){
        return this.__features;
    }

    /**
     * Not sure what this does
     * @param key
     * @returns {boolean}
     */
    hasDefaultParam(key){
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Adds a feature that is associated with the component
     * @param featureID String id of the feature
     */
    addFeatureID(featureID){
        this.__features.push(featureID);
        //Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @private
     */
    __updateBounds() {
        console.log("test");
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for(var i in this.__features){
            // gets teh feature defined by the id
            feature = Registry.currentDevice.getFeatureByID(this.__features[i]);
            console.log(feature);
            renderedfeature = FeatureRenderer2D.renderFeature(feature);
            console.log("rendered:");
            console.log(renderedfeature);
            if(bounds == null){
                bounds = renderedfeature.bounds;
            }else{
                bounds = bounds.unite(renderedfeature.bounds);
            }
        }
        this.__bounds = bounds;
    }

    /**
     * Rerturns the params associated with the component
     */
    getParams(){
        return this.__params.parameters;
    }

    /**
     * Sets the params associated with the component
     * @param params
     */
    setParams(params){
        this.__params.parameters = params;
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

}

module.exports = Component;