import Params from "./params";
import CustomComponent from "./customComponent";
import ComponentPort from "./componentPort";
import Feature from "./feature";

import uuid from "node-uuid";
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";
import Port from "../library/port";
import { ComponentPortInterchangeV1, ComponentInterchangeV1 } from "./init";
import { ConnectionInterchangeV1, Point } from "./init";
import ComponentUtils from "../utils/componentUtils";
import { ComponentAPI } from "@/componentAPI";
import MapUtils from "../utils/mapUtils";

/**
 * This class contains the component abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Component {
    protected _params: Params;
    protected _name: string;
    protected _id: string;
    protected _entity: string;
    protected _featureIDs: Array<string>;
    protected _bounds: paper.Rectangle | null;
    protected _placed: boolean;
    protected _ports: Map<string, ComponentPort>;
    protected _componentPortTRenders: Map<string, Port>;
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
    constructor(params: Params, name: string, mint: string, id: string = Component.generateID()) {
        this._params = params;
        this._name = name;
        this._id = id;
        this._entity = mint;
        // This stores the features that are a part of the component
        this._featureIDs = [];
        // TODO: Need to figure out how to effectively search through these
        this._bounds = null;
        this._placed = false;
        this._ports = new Map();
        this._componentPortTRenders = new Map();

        // TODO - Figure out how to use this for generic components
        this._xspan = 0;
        this._yspan = 0;

        // Create and set the ports here itself

        const cleanparamdata = this._params.toMap();
        if (mint !== "" || mint === null) {
            const ports = ComponentAPI.getComponentPorts(cleanparamdata, mint);
            if (ports != undefined && ports.length >= 0 && ports !== null) {
                for (const i in ports) {
                    this.setPort(ports[i].label, ports[i]);
                }
            }
        } else {
            console.warn("Component mint is empty");
        }
    }

    /**
     * Returns the mint type of the component
     *
     * @readonly
     * @type {string}
     * @memberof Component
     */
    get mint(): string {
        return this._entity;
    }

    /**
     * Gets the ports of the component
     * @returns {Map()} Returns ports of the component
     * @memberof Component
     */
    get ports(): Map<string, ComponentPort> {
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
     * @returns {Boolean} Returns the place of the component
     * @memberof Component
     */
    get placed(): boolean {
        return this._placed;
    }

    /**
     * Sets the place
     * @param {Boolean} value
     * @returns {void}
     * @memberof Component
     */
    set placed(value: boolean) {
        this._placed = value;
    }

    /**
     * Returns an array of strings that are the feature ids of the component
     * @return {Array} Returns an array with the features
     * @memberof Component
     */
    get featureIDs(): Array<String> {
        return this._featureIDs;
    }

    /**
     * Generates a random id
     * @returns {String} Random ID string
     * @memberof component
     */
    static generateID(): string {
        return uuid.v1();
    }

    /**
     * Sets the bounds i.e. the x,y position and the width and length of the component
     * @param {Object} bounds PaperJS Rectangle object associated with a Path.bounds property
     * @memberof Component
     * @returns {void}
     */
    setBounds(bounds: paper.Rectangle): void {
        this._bounds = bounds;
        const topleftpt = bounds.topLeft;
        this._params.updateParameter("position", [topleftpt.x, topleftpt.y]);
        this._params.updateParameter("xspan", bounds.width);
        this._params.updateParameter("yspan", bounds.height);
    }

    /**
     * Updates the parameters stored by the component
     * @param {String} key Key to identify the parameter
     * @param {} value New value to be assign in the feature
     * @memberof Component
     * @returns {void}
     */
    updateParameter(key: string, value: any): void {
        this._params.updateParameter(key, value);

        for (const i in this._featureIDs) {
            const featureidtochange = this._featureIDs[i];

            // Get the feature id and modify it
            const feature = ComponentUtils.getFeatureFromID(featureidtochange);
            feature.updateParameter(key, value);
        }

        // Update the ComponentPorts
        this.updateComponentPorts();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {ComponentInterchangeV1} Object
     * @memberof Component
     */
    toInterchangeV1(): ComponentInterchangeV1 {
        const bounds = this.getBoundingRectangle();

        const portdata: Array<ComponentPortInterchangeV1> = [];
        const map: Map<string, ComponentPort> = this.ports;
        if (map !== null) {
            for (const key of map.keys()) {
                let part: ComponentPort | undefined = map.get(key);
                if (part != undefined) {
                    let p = part.toInterchangeV1();
                    portdata.push(p);
                }
            }
        }

        const output: ComponentInterchangeV1 = {
            id: this._id,
            name: this._name,
            entity: this._entity,
            params: this._params.toJSON(),
            "x-span": this._xspan,
            "y-span": this._yspan,
            ports: portdata,
            layer: this.findLayerReferences()
        };

        return output;
    }

    private findLayerReferences(): Array<string> {
        const layers = ComponentUtils.getDeviceLayers();
        const layerrefs = [];
        let layer;
        for (const i in layers) {
            layer = layers[i];
            // Check if the component is in layer then put it there
            let feature;
            for (const key in layer.features) {
                feature = layer.features[key];
                if (feature.referenceID == this.id) {
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
     * Returns an Array of size two containing the X and Y coordinates
     * @return {number[]}
     * @memberof Component
     */
    getPosition(): number[] {
        return this._params.getValue("position");
    }

    /**
     * Returns the value of the parameter stored against the following key in the component params
     * @param {string} key Key to access the value
     * @returns {*} Returns the value or an error
     * @memberof Component
     */
    getValue(key: string): any {
        try {
            return this._params.getValue(key);
        } catch (err) {
            throw new Error("Unable to get value for key: " + key);
        }
    }

    /**
     * Adds a feature that is associated with the component
     * @param {String} featureID String id of the feature
     * @memberof Component
     * @returns {void}
     */
    addFeatureID(featureID: string): void {
        this._featureIDs.push(featureID);
        // Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @private
     * @memberof Component
     * @returns {void}
     */
    private updateBounds(): void {
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for (const i in this._featureIDs) {
            // gets teh feature defined by the id
            feature = ComponentUtils.getFeatureFromID(this._featureIDs[i]);
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
    getBoundingRectangle(): paper.Rectangle {
        if (this._featureIDs.length == 0 || this._featureIDs === null || this._featureIDs == undefined) {
            console.error("No features associated with the component");
        }
        let bounds = null;
        for (const i in this._featureIDs) {
            const featureid = this._featureIDs[i];
            const render = ComponentUtils.getRenderedFeature(featureid);
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
    updateComponentPosition(center: Point): void {
        // This was not calling the right method earlier
        this._params.updateParameter("position", center);
        for (const i in this._featureIDs) {
            const featureidtochange = this._featureIDs[i];

            const feature = ComponentUtils.getFeatureFromID(featureidtochange);
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
    replicate(xpos: number, ypos: number, name: string = ComponentUtils.generateDeviceName(this._entity)): Component {
        // TODO: Fix this ridiculous chain of converting params back and forth, there should be an easier way
        // Converting all the params into raw values
        // let paramvalues = {};
        // for(let key in this._params.parameters){
        //     paramvalues[key] = this.getValue(key);
        // }

        const definition = ComponentAPI.getDefinitionForMINT(this._entity);
        if (definition === null) {
            throw new Error("Unable to find definition for component type: " + this._entity);
        }
        // Clean Param Data
        const cleanparamdata = this._params.parameters;
        const unique_map = MapUtils.toMap(definition.unique);
        const heritable_map = MapUtils.toMap(definition.heritable);
        const replicaparams = new Params(cleanparamdata, unique_map, heritable_map);
        const ret = new Component(replicaparams, name, this._entity);
        console.log("Checking what the new component params are:", ret._params);
        // Generate New features
        for (const i in this._featureIDs) {
            const feature = ComponentUtils.getFeatureFromID(this._featureIDs[i]);
            console.log("test", this.getPosition()[0], this.getPosition()[1], this.getPosition());
            const replica = feature.replicate(this.getPosition()[0], this.getPosition()[1]);
            replica.referenceID = ret.id;
            ret.featureIDs.push(replica.id);

            // TODO: add new feature to the layer in which the current feature is in
            const currentlayer = ComponentUtils.getDeviceLayerFromID(this._featureIDs[i]);
            currentlayer.addFeature(replica);
        }
        console.warn("TODO: Generate renders for the new Features for this new component");
        ret.updateComponentPosition([xpos, ypos]);
        return ret;
    }

    /**
     * Returns the center position of the component as a 2D vector
     * @return {Array}
     * @memberof Component
     */
    getCenterPosition(): Point {
        const bounds = this.getBoundingRectangle();
        return [bounds.center.x, bounds.center.y];
    }

    /**
     * Returns the topleft position of the component as a 2D vector
     * @return {Array}
     * @memberof Component
     */
    getTopLeftPosition(): Point {
        const bounds = this.getBoundingRectangle();
        return [bounds.topLeft.x, bounds.topLeft.y];
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param {} json
     * @returns {*}
     * @memberof component
     */
    static fromInterchangeV1(json: ComponentInterchangeV1): Component {
        // let set;
        // if (json.hasOwnProperty("set")) set = json.set;
        // else set = "Basic";
        // //TODO: This will have to change soon when the thing is updated
        // throw new Error("Need to implement Interchange V1 Import for component object");
        const iscustomcompnent = false;
        const name = json.name;
        const id = json.id;
        const entity = json.entity;

        // Idk whether this is correct
        // It was originially this._span = this.span which threw several errors so I patterned in off the above const var
        const xspan = json["x-span"];
        const yspan = json["y-span"];

        const params = json.params;

        console.log("new entity:", entity);

        // TODO - remove this dependency
        // iscustomcompnent = Registry.viewManager.customComponentManager.hasDefinition(entity);

        let definition;

        if (iscustomcompnent) {
            definition = CustomComponent.defaultParameterDefinitions();
        } else {
            definition = ComponentAPI.getDefinitionForMINT(entity);
        }

        if (definition === null) {
            throw Error("Could not find definition for type: " + entity);
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
        const unique_map = MapUtils.toMap(definition.unique);
        const heritable_map = MapUtils.toMap(definition.heritable);
        const paramstoadd = new Params(params, unique_map, heritable_map);
        const component = new Component(paramstoadd, name, entity, id);

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
    setPort(label: string, port: ComponentPort): void {
        this._ports.set(label, port);
    }

    /**
     * Gets the rotation of the component
     * @returns {Number} Returns the degree of rotation
     * @memberof Component
     */
    getRotation(): number {
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
    attachComponentPortRender(label: string, render: any): void {
        this._componentPortTRenders.set(label, render);
    }

    /**
     * Updates the Component Ports to have the latest location information
     * @memberof Component
     * @returns {void}
     */
    updateComponentPorts(): void {
        // updating the Component Ports

        const params = this.params.toMap();

        const cleanparamdata = params;

        const ports = ComponentAPI.getComponentPorts(cleanparamdata, this._entity);

        for (const i in ports) {
            this.setPort(ports[i].label, ports[i]);
        }
    }
}
