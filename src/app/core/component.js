import Params from "./params";
import CustomComponent from "./customComponent";
import ComponentPort from "./componentPort";

import * as Registry from "./registry";
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";
import Port from "../library/port";
import * as FeatureSets from "../featureSets";


/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Component {
    /**
     * Default Constructor
     * @param {string} type
     * @param {Params} params
     * @param {String} name
     * @param {string} mint
     * @param {String} id
     */
    constructor(type, params, name, mint, id = Component.generateID()) {
        if (params instanceof Params) {
            this.__params = params;
        } else {
            console.error("Params not an instance of Params Object");
        }

        this.__name = name;
        this.__id = id;
        this.__type = type;
        this.__entity = mint;
        //This stores the features that are a part of the component
        this.__features = [];
        //TODO: Need to figure out how to effectively search through these
        this.__bounds = null;
        this.__placed = false;
        this.__ports = new Map();
        this._componentPortTRenders = new Map();

        // TODO - Figure out how to use this for generic components
        this._xspan = 0;
        this._yspan = 0;

        //Create and set the ports here itself

        let cleanparamdata = {};
        for (let key in this.__params.parameters) {
            cleanparamdata[key] = this.__params.parameters[key].getValue();
        }

        let ports = Registry.featureSet.getComponentPorts(cleanparamdata, this.__type);
        if (ports != undefined && ports.length >= 0 && ports != null) {
            for (let i in ports) {
                this.setPort(ports[i].label, ports[i]);
            }
        }
    }
    /**
     * Gets the ports of the component
     * @returns {Port} Returns ports of the component
     * @memberof Component
     */
    get ports() {
        return this.__ports;
    }
    /**
     * Sets the port of the component
     * @param {} value
     * @returns {void}
     * @memberof Component
     */
    set ports(value) {
        this.__ports = value;
    }
    /**
     * Gets the place of the component
     * @returns {Number} Returns the place of the component
     * @memberof Component
     */
    get placed() {
        return this.__placed;
    }
    /**
     * Sets the place 
     * @param {Number} value
     * @returns {void}
     * @memberof Component
     */
    set placed(value) {
        this.__placed = value;
    }

    /**
     * Returns an array of strings that are the feature ids of the component
     * @return {Array} Returns an array with the features
     * @memberof Component
     */
    get features() {
        return this.__features;
    }

    /**
     * Generates a random id
     * @returns {String} Random ID string
     * @memberof component
     */
    static generateID() {
        return Registry.generateID();
    }

    /**
     * Sets the bounds i.e. the x,y position and the width and length of the component
     * @param {Object} bounds PaperJS Rectangle object associated with a Path.bounds property
     * @memberof Component
     * @returns {void}
     */
    setBounds(bounds) {
        this.__bounds = bounds;
        let topleftpt = bounds.topLeft;
        this.__params.position = [topleftpt.x, topleftpt.y];
        this.__params.xspan = bounds.width;
        this.__params.yspan = bounds.height;
    }

    /**
     * Updates the parameters stored by the component
     * @param {String} key Key to identify the parameter
     * @param {} value New value to be assign in the feature
     * @memberof Component
     * @returns {void}
     */
    updateParameter(key, value) {
        this.__params.updateParameter(key, value);

        for (let i in this.__features) {
            let featureidtochange = this.__features[i];

            //Get the feature id and modify it
            let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
            feature.updateParameter(key, value);
        }

        //Update the ComponentPorts
        this.updateComponentPorts();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {Object} Object
     * @memberof Component
     */
    toInterchangeV1() {
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.entity = this.__entity;
        output.params = this.__params.toJSON();
        let bounds = this.getBoundingRectangle();
        output["x-span"] = bounds.width;
        output["y-span"] = bounds.height;
        let portdata = [];
        let map = this.ports;
        if (map != null) {
            for (let key of map.keys()) {
                let p = map.get(key).toInterchangeV1();
                portdata.push(p);
            }
        }

        output.ports = portdata;
        output.layers = this.__findLayerReferences();
        return output;
    }

    __findLayerReferences(){
        let layers = Registry.currentDevice.getLayers();
        let layerrefs = [];
        let layer;
        for(let i in layers){
            layer = layers[i];
            //Check if the component is in layer then put it there
            let feature;
            for(let key in layer.features){
                feature = layer.features[key];
                if(feature.referenceID == this.getID()){
                    layerrefs.push(layer.id);
                }
            }
        }
        return layerrefs;
    }

    /**
     * Returns the ID of the component
     * @returns {string|*}
     * @memberof Component
     */
    getID() {
        return this.__id;
    }

    /**
     * Allows the user to set the name of the component
     * @param {string} name
     * @returns {void}
     * @memberof Component
     * 
     */
    setName(name) {
        this.__name = name;
    }

    /**
     * Returns the name of the component
     * @returns {string}
     * @memberof Component
     */
    getName() {
        return this.__name;
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {string} Returns the type of component
     * @memberof Component
     */
    getType() {
        return this.__type;
    }

    /**
     * Returns an Array of size two containing the X and Y coordinates
     * @return {Array<number>}
     * @memberof Component
     */
    getPosition() {
        return this.__params.getValue("position");
    }

    /**
     * Returns the value of the parameter stored against the following key in the component params
     * @param {string} key Key to access the value
     * @returns {*} Returns the value or an error
     * @memberof Component
     */
    getValue(key) {
        try {
            return this.__params.getValue(key);
        } catch (err) {
            throw new Error("Unable to get value for key: " + key);
        }
    }

    /**
     * Gets the list of feature ids that are associated with this
     * component
     * @return {Array|*} Returns an array with the correspondings features of the component
     * @memberof Component
     * 
     */
    getFeatureIDs() {
        return this.__features;
    }

    /**
     * Checks if the component has default parameters
     * @param {String} key Key to access the component
     * @returns {boolean} Returns true whether it has default parameters or not
     * @memberof Component
     */
    hasDefaultParam(key) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Adds a feature that is associated with the component
     * @param {String} featureID String id of the feature
     * @memberof Component
     * @returns {void}
     */
    addFeatureID(featureID) {
        if (typeof featureID != "string" && !(featureID instanceof String)) {
            throw new Error("The reference object value can only be a string");
        }
        this.__features.push(featureID);
        //Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @private
     * @memberof Component
     * @returns {void}
     */
    __updateBounds() {
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for (var i in this.__features) {
            // gets teh feature defined by the id
            feature = Registry.currentDevice.getFeatureByID(this.__features[i]);
            console.log(feature);
            renderedfeature = FeatureRenderer2D.renderFeature(feature);
            console.log("rendered:");
            console.log(renderedfeature);
            if (bounds == null) {
                bounds = renderedfeature.bounds;
            } else {
                bounds = bounds.unite(renderedfeature.bounds);
            }
        }
        this.__bounds = bounds;
    }

    /**
     * Gets the params associated with the component
     * @return {Params} Returns the params associated with the component
     * @memberof Component
     */
    getParams() {
        return this.__params;
    }

    /**
     * Returns a paper.Rectangle object that defines the bounds of the component
     * @return {Object}
     * @memberof Component
     */
    getBoundingRectangle() {
        if (this.features.length == 0 || this.features == null || this.features == undefined) {
            console.error("No features associated with the component");
        }
        let bounds = null;
        for (let i in this.features) {
            let featureid = this.features[i];
            let render = Registry.viewManager.view.getRenderedFeature(featureid);
            if (bounds && render) {
                bounds = bounds.unite(render.bounds);
            } else {
                bounds = render.bounds;
            }
        }

        return bounds;
    }

    /**
     * Updates the coordinates of the component and all the other features
     * @param {Array} center
     * @memberof Component
     * @returns {void}
     */
    updateComponetPosition(center) {
        //This was not calling the right method earlier
        this.__params.updateParameter("position", center);

        let technology = FeatureSets.getTechnologyDefinition(this.getType(),  "Basic");
        let params_to_copy = this.getParams().toJSON();
        let offset = technology.getDrawOffset(params_to_copy);
        console.log("Offsets:", this.name, this.getType(), offset);
        for (let i in this.__features) {
            let featureidtochange = this.__features[i];

            let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
            // feature.updateParameter('position', center);
            feature.updateParameter("position", center);
        }
    }

    /**
     * Replicates the component at the given positions
     * @param {Number} xpos Integer location of X
     * @param {Number} ypos Integer location of Y
     * @param {string} name Name of the replicated component
     * @return {Component}
     * @memberof Component
     */
    replicate(xpos, ypos, name = Registry.currentDevice.generateNewName(this.__type)) {
        //TODO: Fix this ridiculous chain of converting params back and forth, there should be an easier way
        //Converting all the params into raw values
        // let paramvalues = {};
        // for(let key in this.__params.parameters){
        //     paramvalues[key] = this.getValue(key);
        // }

        let definition = Registry.featureSet.getDefinition(this.__type);
        //Clean Param Data
        let cleanparamdata = {};
        for (let key in this.__params.parameters) {
            cleanparamdata[key] = this.__params.parameters[key].getValue();
        }
        let replicaparams = new Params(cleanparamdata, definition.unique, definition.heritable);
        let ret = new Component(this.__type, replicaparams, name, this.__entity);
        console.log("Checking what the new component params are:", ret.__params);
        //Generate New features
        for (let i in this.features) {
            let feature = Registry.currentDevice.getFeatureByID(this.features[i]);
            console.log("test", this.getPosition()[0], this.getPosition()[1], this.getPosition());
            let replica = feature.replicate(this.getPosition()[0], this.getPosition()[1]);
            replica.referenceID = ret.getID();
            ret.features.push(replica.getID());

            //TODO: add new feature to the layer in which the current feature is in
            let currentlayer = Registry.currentDevice.getLayerFromFeatureID(this.features[i]);
            currentlayer.addFeature(replica);
        }
        console.warn("TODO: Generate renders for the new Features for this new component");
        ret.updateComponetPosition([xpos, ypos]);
        return ret;
    }

    /**
     * Returns the center position of the component as a 2D vector
     * @return {Array}
     * @memberof Component
     */
    getCenterPosition() {
        let bounds = this.getBoundingRectangle();
        return [bounds.center.x, bounds.center.y];
    }

    /**
     * Returns the topleft position of the component as a 2D vector
     * @return {Array}
     * @memberof Component
     */
    getTopLeftPosition() {
        let bounds = this.getBoundingRectangle();
        return [bounds.topLeft.x, bounds.topLeft.y];
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param {} json
     * @returns {*}
     * @memberof component
     */
    static fromInterchangeV1(json) {
        // let set;
        // if (json.hasOwnProperty("set")) set = json.set;
        // else set = "Basic";
        // //TODO: This will have to change soon when the thing is updated
        // throw new Error("Need to implement Interchange V1 Import for component object");
        let iscustomcompnent = false;
        let name = json.name;
        let id = json.id;
        let entity = json.entity;
        this.xspan = this._xspan;
        this.yspan = this._yspan;

        let params = {};
        if (entity === "TEST MINT") {
            console.warn("Found legacy invalid entity string", entity);
            entity = name.split("_")[0]; //'^.*?(?=_)'

            console.log("new entity:", entity);
        }

        iscustomcompnent = Registry.viewManager.customComponentManager.hasDefinition(entity);

        let definition;

        if (iscustomcompnent) {
            definition = CustomComponent.defaultParameterDefinitions();
        } else {
            definition = Registry.featureSet.getDefinition(entity);
            if(definition === null){
                throw Error("Could not find definition for type: "+ entity);
            }
        }

        // console.log(definition);
        let type;
        let value;
        for (let key in json.params) {
            // console.log("key:", key, "value:", json.params[key]);
            if (definition.heritable.hasOwnProperty(key)) {
                type = definition.heritable[key];
            } else if (definition.unique.hasOwnProperty(key)) {
                type = definition.unique[key];
            }
            // let paramobject = Parameter.generateComponentParameter(key, json.params[key]);
            //Check if the value type is float and convert the value from string
            value = json.params[key];
            if (type === "Float" && typeof value == "string") {
                value = parseFloat(value);
            }

            // let paramobject = new Parameter(type, value);
            params[key] = value;
        }

        //Do another check and see if position is present or not
        if (!params.hasOwnProperty("position")) {
            params["position"] = [0.0, 0.0];
        }
        let paramstoadd;
        try{
            paramstoadd = new Params(params, definition.unique, definition.heritable);
        }catch(e){
            console.error("Could not generate parameters object for:", name, entity);
            console.error(e.message);
        }
        let typestring = Registry.featureSet.getTypeForMINT(entity);
        let component = new Component(typestring, paramstoadd, name, entity, id);

        //Deserialize the component ports
        let portdata = new Map();
        for (let i in json.ports) {
            let componentport = ComponentPort.fromInterchangeV1(json.ports[i]);
            portdata.set(componentport.label, componentport);
        }

        component.ports = portdata;

        return component;
    }
    /**
     * Set port for the component
     * @param {string} label 
     * @param {Port} port 
     * @memberof Component
     * @returns {void}
     */
    setPort(label, port) {
        this.__ports.set(label, port);
    }
    /**
     * Gets the rotation of the component
     * @returns {Number} Returns the degree of rotation
     * @memberof Component
     */
    getRotation() {
        if (this.__params.hasParam("rotation")) {
            return this.getValue("rotation");
        } else if (this.__params.hasParam("orientation")) {
            let orientation = this.getValue("orientation");
            if (orientation === "V") {
                return 0;
            } else {
                return 270;
            }
        } else {
            console.warn("No rotation was found for component: ", this);
            return 0;
        }
    }
    /**
     * 
     * @param {string} label 
     * @param {*} render 
     * @returns {void}
     * @memberof Component
     */
    attachComponentPortRender(label, render) {
        this._componentPortTRenders.set(label, render);
    }

    /**
     * Updates the Component Ports to have the latest location information
     * @memberof Component
     * @returns {void}
     */
    updateComponentPorts() {
        //updating the Component Ports

        let params = this.getParams().toMap();

        let cleanparamdata = {};

        for (let key of params.keys()) {
            cleanparamdata[key] = params.get(key);
        }

        let ports = Registry.featureSet.getComponentPorts(cleanparamdata, this.getType());

        for (let i in ports) {
            this.setPort(ports[i].label, ports[i]);
        }
    }
}
