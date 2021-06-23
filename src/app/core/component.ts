import Params from "./params";
import CustomComponent from "./customComponent";
import ComponentPort from "./componentPort";
import Feature from './feature'

import Registry from "./registry";
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";
import Port from "../library/port";

/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Component {
    protected _params: Params;
    protected _name: string;
    protected _id: string;
    protected _type: string;
    protected _entity: string;
    protected _features: Feature[]; // Not sure if it's Feature[] or string[]
    protected _bounds: paper.Rectangle | null;
    protected _placed: Boolean;
    protected _ports: Map;
    protected _componentPortTRenders: Map;
    protected _xspan: number;
    protected _yspan: number;
    /**
     * Default Constructor
     * @param {string} type
     * @param {Params} params
     * @param {String} name
     * @param {string} mint
     * @param {String} id
     */
    constructor(type: string, params: Params, name: string, mint: string, id: string = Component.generateID()) {
        this._params = params;
        this._name = name;
        this._id = id;
        this._type = type;
        this._entity = mint;
        // This stores the features that are a part of the component
        this._features = [];
        // TODO: Need to figure out how to effectively search through these
        this._bounds = null;
        this._placed = false;
        this._ports = new Map();
        this._componentPortTRenders = new Map();

        // TODO - Figure out how to use this for generic components
        this._xspan = 0;
        this._yspan = 0;

        // Create and set the ports here itself

        const cleanparamdata = {};
        for (const key in this._params.parameters) {
            cleanparamdata[key] = this._params.parameters[key].getValue();
        }

        const ports = Registry.featureSet.getComponentPorts(cleanparamdata, this._type);
        if (ports != undefined && ports.length >= 0 && ports !== null) {
            for (const i in ports) {
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
        return this._ports;
    }

    /**
     * Sets the port of the component
     * @param {} value
     * @returns {void}
     * @memberof Component
     */
    set ports(value) {
        this._ports = value;
    }

    /**
     * Gets the place of the component
     * @returns {Number} Returns the place of the component
     * @memberof Component
     */
    get placed() {
        return this._placed;
    }

    /**
     * Sets the place
     * @param {Number} value
     * @returns {void}
     * @memberof Component
     */
    set placed(value) {
        this._placed = value;
    }

    /**
     * Returns an array of strings that are the feature ids of the component
     * @return {Array} Returns an array with the features
     * @memberof Component
     */
    get features() {
        return this._features;
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
    setBounds(bounds: paper.Rectangle) {
        this._bounds = bounds;
        const topleftpt = bounds.topLeft;
        this._params.updateParameter('position', [topleftpt.x, topleftpt.y])
        this._params.updateParameter('xspan', bounds.width)
        this._params.updateParameter('yspan', bounds.height)
    }

    /**
     * Updates the parameters stored by the component
     * @param {String} key Key to identify the parameter
     * @param {} value New value to be assign in the feature
     * @memberof Component
     * @returns {void}
     */
    updateParameter(key: string, value: any) {
        this._params.updateParameter(key, value);

        for (const i in this._features) {
            const featureidtochange = this._features[i];

            // Get the feature id and modify it
            const feature = Registry.currentDevice.getFeatureByID(featureidtochange);
            feature.updateParameter(key, value);
        }

        // Update the ComponentPorts
        this.updateComponentPorts();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {any} Object
     * @memberof Component
     */
    toInterchangeV1() {
        const bounds = this.getBoundingRectangle();

        const portdata = [];
        const map = this.ports;
        if (map !== null) {
            for (const key of map.keys()) {
                const p = map.get(key).toInterchangeV1();
                portdata.push(p);
            }
        }

        const output: InterchangeV1 = {
            id : this._id,
            name: this._name,
            entity: this._entity,
            source: null,
            sinks: null,
            params: this._params.toJSON(),
            xspan: bounds.width,
            yspan: bounds.height,
            ports: portdata,
            layers: this.findLayerReferences()
        };
        
        return output;
    }

    private findLayerReferences() {
        const layers = Registry.currentDevice.getLayers();
        const layerrefs = [];
        let layer;
        for (const i in layers) {
            layer = layers[i];
            // Check if the component is in layer then put it there
            let feature;
            for (const key in layer.features) {
                feature = layer.features[key];
                if (feature.referenceID == this.getID()) {
                    layerrefs.push(layer.id);
                }
            }
        }
        return layerrefs;
    }

    /**
     * Returns the ID of the component
     * @returns {string}
     * @memberof Component
     */
    get id() {
        return this._id;
    }

    /**
     * Allows the user to set the name of the component
     * @param {string} name
     * @returns {void}
     * @memberof Component
     *
     */
    set name(name: string) {
        this._name = name;
    }

    /**
     * Returns the name of the component
     * @returns {string}
     * @memberof Component
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {string} Returns the type of component
     * @memberof Component
     */
    get type() {
        return this._type;
    }

    /**
     * Returns an Array of size two containing the X and Y coordinates
     * @return {Array<number>}
     * @memberof Component
     */
    getPosition() {
        return this._params.getValue("position");
    }

    /**
     * Returns the value of the parameter stored against the following key in the component params
     * @param {string} key Key to access the value
     * @returns {*} Returns the value or an error
     * @memberof Component
     */
    getValue(key: string) {
        try {
            return this._params.getValue(key);
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
        return this._features;
    }

    // /**
    //  * Checks if the component has default parameters
    //  * @param {String} key Key to access the component
    //  * @returns {boolean} Returns true whether it has default parameters or not
    //  * @memberof Component
    //  */
    // hasDefaultParam(key: string) {
    //     if (this.getDefaults().hasOwnProperty(key)) return true;
    //     else return false;
    // }

    /**
     * Adds a feature that is associated with the component
     * @param {String} featureID String id of the feature
     * @memberof Component
     * @returns {void}
     */
    addFeatureID(featureID: string) {
        if (typeof featureID !== "string" && !(featureID instanceof String)) {
            throw new Error("The reference object value can only be a string");
        }
        this._features.push(featureID);
        // Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @private
     * @memberof Component
     * @returns {void}
     */
     private updateBounds() {
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for (const i in this._features) {
            // gets teh feature defined by the id
            feature = Registry.currentDevice.getFeatureByID(this._features[i]);
            console.log(feature);
            renderedfeature = FeatureRenderer2D.renderFeature(feature);
            console.log("rendered:");
            console.log(renderedfeature);
            if (bounds === null) {
                bounds = renderedfeature.bounds;
            } else {
                bounds = bounds.unite(renderedfeature.bounds);
            }
        }
        this._bounds = bounds;
    }

    /**
     * Gets the params associated with the component
     * @return {Params} Returns the params associated with the component
     * @memberof Component
     */
    get params() {
        return this._params;
    }

    /**
     * Returns a paper.Rectangle object that defines the bounds of the component
     * @return {Object}
     * @memberof Component
     */
    getBoundingRectangle() {
        if (this.features.length == 0 || this.features === null || this.features == undefined) {
            console.error("No features associated with the component");
        }
        let bounds = null;
        for (const i in this.features) {
            const featureid = this.features[i];
            const render = Registry.viewManager.view.getRenderedFeature(featureid);
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
     * @param {Point} center
     * @memberof Component
     * @returns {void}
     */
    updateComponetPosition(center: Point) {
        // This was not calling the right method earlier
        this._params.updateParameter("position", center);
        for (const i in this._features) {
            const featureidtochange = this._features[i];

            const feature = Registry.currentDevice.getFeatureByID(featureidtochange);
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
    replicate(xpos: number, ypos: number, name: string = Registry.currentDevice.generateNewName(this._type)) {
        // TODO: Fix this ridiculous chain of converting params back and forth, there should be an easier way
        // Converting all the params into raw values
        // let paramvalues = {};
        // for(let key in this._params.parameters){
        //     paramvalues[key] = this.getValue(key);
        // }

        const definition = Registry.featureSet.getDefinition(this._type);
        // Clean Param Data
        const cleanparamdata = {};
        for (const key in this._params.parameters) {
            cleanparamdata[key] = this._params.parameters[key].getValue();
        }
        const replicaparams = new Params(cleanparamdata, definition.unique, definition.heritable);
        const ret = new Component(this._type, replicaparams, name, this._entity);
        console.log("Checking what the new component params are:", ret._params);
        // Generate New features
        for (const i in this.features) {
            const feature = Registry.currentDevice.getFeatureByID(this.features[i]);
            console.log("test", this.getPosition()[0], this.getPosition()[1], this.getPosition());
            const replica = feature.replicate(this.getPosition()[0], this.getPosition()[1]);
            replica.referenceID = ret.getID();
            ret.features.push(replica.getID());

            // TODO: add new feature to the layer in which the current feature is in
            const currentlayer = Registry.currentDevice.getLayerFromFeatureID(this.features[i]);
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
        const bounds = this.getBoundingRectangle();
        return [bounds.center.x, bounds.center.y];
    }

    /**
     * Returns the topleft position of the component as a 2D vector
     * @return {Array}
     * @memberof Component
     */
    getTopLeftPosition() {
        const bounds = this.getBoundingRectangle();
        return [bounds.topLeft.x, bounds.topLeft.y];
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param {} json
     * @returns {*}
     * @memberof component
     */
    static fromInterchangeV1(json: JSON) {
        // let set;
        // if (json.hasOwnProperty("set")) set = json.set;
        // else set = "Basic";
        // //TODO: This will have to change soon when the thing is updated
        // throw new Error("Need to implement Interchange V1 Import for component object");
        const iscustomcompnent = false;
        const name = json.name;
        const id = json.id;
        let entity = json.entity;
        this.xspan = this._xspan;
        this.yspan = this._yspan;

        const params = {};
        if (entity === "TEST MINT") {
            console.warn("Found legacy invalid entity string", entity);
            entity = name.split("_")[0]; // '^.*?(?=_)'

            console.log("new entity:", entity);
        }

        // TODO - remove this dependency
        // iscustomcompnent = Registry.viewManager.customComponentManager.hasDefinition(entity);

        let definition;

        if (iscustomcompnent) {
            definition = CustomComponent.defaultParameterDefinitions();
        } else {
            definition = Registry.featureSet.getDefinition(entity);
            if (definition === null) {
                throw Error("Could not find definition for type: " + entity);
            }
        }

        // console.log(definition);
        let type;
        let value;
        for (const key in json.params) {
            // console.log("key:", key, "value:", json.params[key]);
            if (Object.prototype.hasOwnProperty.call(definition.heritable, key)) {
                type = definition.heritable[key];
            } else if (Object.prototype.hasOwnProperty.call(definition.unique, key)) {
                type = definition.unique[key];
            }
            // let paramobject = Parameter.generateComponentParameter(key, json.params[key]);
            // Check if the value type is float and convert the value from string
            value = json.params[key];
            if (type === "Float" && typeof value === "string") {
                value = parseFloat(value);
            }

            // let paramobject = new Parameter(type, value);
            params[key] = value;
        }

        // Do another check and see if position is present or not
        if (!Object.prototype.hasOwnProperty.call(params, "position")) {
            params.position = [0.0, 0.0];
        }

        const paramstoadd = new Params(params, definition.unique, definition.heritable);
        const typestring = Registry.featureSet.getTypeForMINT(entity);
        const component = new Component(typestring, paramstoadd, name, entity, id);

        // Deserialize the component ports
        const portdata = new Map();
        for (const i in json.ports) {
            const componentport = ComponentPort.fromInterchangeV1(json.ports[i]);
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
    setPort(label: string, port: Port) {
        this._ports.set(label, port);
    }

    /**
     * Gets the rotation of the component
     * @returns {Number} Returns the degree of rotation
     * @memberof Component
     */
    getRotation() {
        if (this._params.hasParam("rotation")) {
            return this.getValue("rotation");
        } else if (this._params.hasParam("orientation")) {
            const orientation = this.getValue("orientation");
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
     * @param {any} render
     * @returns {void}
     * @memberof Component
     */
    attachComponentPortRender(label: string, render: any) {
        this._componentPortTRenders.set(label, render);
    }

    /**
     * Updates the Component Ports to have the latest location information
     * @memberof Component
     * @returns {void}
     */
    updateComponentPorts() {
        // updating the Component Ports

        const params = this.params.toMap();

        const cleanparamdata = {};

        for (const key of params.keys()) {
            cleanparamdata[key] = params.get(key);
        }

        const ports = Registry.featureSet.getComponentPorts(cleanparamdata, this.type);

        for (const i in ports) {
            this.setPort(ports[i].label, ports[i]);
        }
    }
}
