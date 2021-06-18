import Feature from "./feature";
import paper from "paper";
import Parameter from "./parameter";
import Params from "./params";
import ConnectionTarget from "./connectionTarget";
import ComponentPort from "./componentPort";
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";

import Registry from './registry';


/**
 * This class contains the connection abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Connection {
    private _params: Params;
    private _name: string;
    private _id: string;
    private _type: string;
    private _entity: string;
    private _features: Feature[]; // Not sure if it's Feature[] or string[]
    private _nodes: any;
    private _bounds: paper.Rectangle | null;
    private _source: ConnectionTarget | null;
    private _sinks: ConnectionTarget[];
    private _paths: [number, number][];
    private _objects: any;
    private _routed: boolean;

    /**
     * Default Connection Constructor
     * @param {String} type 
     * @param {Params} params 
     * @param {String} name 
     * @param {String} mint 
     * @param {String} id 
     */
    constructor(type: string, params: Params, name: string, mint: string, id: string = Feature.generateID()) {
        this._params = params;
        this._name = name;
        this._id = id;
        this._type = type;
        this._entity = mint;
        //This stores the features that are a part of the component
        this._features = [];
        this._nodes = [];
        //TODO: Need to figure out how to effectively search through these
        this._bounds = null;
        this._source = null;
        this._sinks = [];
        this._paths = [];
        this._objects = [];
        this._routed = false;
    }
    /**
     * Gets the sinks in the connection
     * @returns {Array<ConnectionTarget>} Returns an array with the sinks
     * @memberof Connection
     */
    get sinks() {
        return this._sinks;
    }
    /**
     * Gets the source of the connection
     * @returns {} Returns the source of the connection
     * @memberof Connection
     */
    get source() {
        return this._source;
    }
    /**
     * Checks if the connection is routed
     * @returns {Boolean} Returns true whether if it is routed or not
     * @memberof Connection
     */
    get routed() {
        return this._routed;
    }
    /**
     * Sets if the connection is routed
     * @param {Boolean} value true if it's router or false if it's not
     * @returns {void}
     * @memberof Connection
     */
    set routed(value: boolean) {
        this._routed = value;
    }

    /**
     * Returns the list of features associated with the connection
     * @return {Array<Feature>}
     * @memberof Connection
     */
    get features() {
        return this._features;
    }

    /**
     * Generates a random id
     * @returns {String} Random ID string
     * @memberof Connection
     */
    static generateID() {
        return Registry.generateID();
    }

    /**
     * Sets the bounds i.e. the x,y position and the width and length of the component
     * @param {paper.Path.Rectangle} bounds PaperJS Rectangle object associated with a Path.bounds property
     * @memberof Connection
     * @returns {void}
     */
    setBounds(bounds: paper.Rectangle) {
        this._bounds = bounds;
        let topleftpt = bounds.topLeft;
        this._params.position = [topleftpt.x, topleftpt.y];
        this._params.xspan = bounds.width;
        this._params.yspan = bounds.height;
    }

    /**
     * Updates the parameters stored by the component
     * @param {string} key Identifier of the parameter
     * @param {PointArray} value
     * @memberof Connection
     * @returns {void}
     */
    updateParameter(key: string, value: {[index: string]: any}) {
        // this.__params.updateParameter(key, value);
        this._params[key] = value;
        // this.updateView();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {Connection} Object
     * @memberof Connection
     */
    toInterchangeV1() {
        type InterchangeV1 = {
            id: string
            name: string
            entity: string
            source: any
            sinks: any
            paths: [number, number][]
            params: any
        }

        const output: InterchangeV1 = {
            id : this._id,
            name: this._name,
            entity: this._entity,
            source: null,
            sinks: null,
            paths: this._paths,
            params: this._params.toJSON()
        };

        if (this._source != null) {
            output.source = this._source.toJSON();
        }  
        if (this._sinks != null && this._sinks.length > 0) {
            let sinks = [];
            for (let i in this._sinks) {
                sinks.push(this._sinks[i].toJSON());
            }
            output.sinks = this._sinks;
        }
        return output;
    }

    /**
     * Returns the ID of the component
     * @returns {string|*}
     * @memberof Connection
     */
    get id() {
        return this._id;
    }

    /**
     * Allows the user to set the name of the component
     * @param {string} name Name of the component
     * @memberof Connection
     * @returns {void}
     */
    set name(name: string) {
        this._name = name;
    }

    /**
     * Returns the name of the component
     * @returns {string} Name of the component
     * @memberof Connection
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {string}
     * @memberof Connection
     */
    get type() {
        return this._type;
    }

    /**
     * Returns the position of the component
     * @return {*|string}
     * @memberof Connection
     */
    get position() {
        return this._params["position"].getValue();
    }

    /**
     * Returns the value of the parameter stored against the following key in teh component params
     * @param {String} key Key is get the value
     * @returns {*}
     * @memberof Connection
     */
    getValue(key: string) {
        try {
            return this._params.getValue(key);
        } catch (err) {
            throw new Error("Unable to get value for key: " + key);
        }
    }
    /**
     * Returns the feature ID
     * @returns {string}
     * @memberof Connection
     */
    getFeatureIDs() {
        return this._features;
    }

    /**
     * If it has their own properties returns true
     * @param {String} key
     * @returns {boolean}
     * @memberof Connection
     */
    hasDefaultParam(key: string) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Adds a feature that is associated with the component
     * @param {String} featureID String id of the feature
     * @memberof Connection
     * @returns {void}
     */
    addFeatureID(featureID: string) {
        this._features.push(featureID);
        //Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @memberof Connection
     * @returns {void}
     * @private
     */
    private updateBounds() {
        console.log("test");
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for (var i in this._features) {
            // gets teh feature defined by the id
            feature = Registry.currentDevice.getFeatureByID(this._features[i]);
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
        this._bounds = bounds;
    }

    /**
     * Returns the params associated with the component
     * @returns {Params}
     * @memberof Connection
     */
    get params() {
        return this._params;
    }

    /**
     * Sets the params associated with the component
     * @param {Params} params key -> Parameter Set
     * @returns {void}
     * @memberof Connection
     */
    set params(params: Params) {
        this._params = params;
        //TODO: Modify all the associated Features
        for (let key in params) {
            let value = params[key];
            for (let i in this._features) {
                let featureidtochange = this._features[i];

                //Get the feature id and modify it
                let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
                feature.updateParameter(key, value.getValue());
            }
        }
    }

    /**
     * Returns the list of waypoints associated with the connection
     * @return {*|void|string}
     * @memberof Connection
     */
    getPaths() {
        return this._paths;
    }

    /**
     * Updates the segments of the connection
     * @param {Array} segments
     * @memberof Connection
     * @returns {void}
     */
    updateSegments(segments: number[][]) {
        this.updateParameter("segments", new Parameter("SegmentArray", segments));
        for (let i in this._features) {
            let featureidtochange = this._features[i];

            let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
            // feature.updateParameter('position', center);
            feature.updateParameter("segments", segments);
        }
    }

    /**
     * Inserts the gap using the boundingbox
     * @param {Object} boundingbox
     * @memberof Connection
     * @returns {boolean}
     */
    insertFeatureGap(boundingbox: any) {
        let foundflag = false;
        //Convert Rectangle to Path.Rectangle
        console.log(boundingbox, boundingbox.width, boundingbox.height);
        boundingbox = new paper.Path.Rectangle(boundingbox);
        //Check which segment I need to break
        let segments = this.getValue("segments");
        for (let i in segments) {
            let segment = segments[i];
            let line = new paper.Path.Line(new paper.Point(segment[0]), new paper.Point(segment[1]));
            let intersections = line.getIntersections(boundingbox);
            // console.log("Intersections found", intersections);
            if (intersections.length === 2) {
                let break1 = intersections[0].point;
                let break2 = intersections[1].point;
                let newsegs = this.breakSegment(segment, break1, break2);
                console.log("breaking:", segment, newsegs);
                if (newsegs.length !== 2) {
                    throw new Error("Could not break the segments correctly");
                }
                segments.splice(i, 1, newsegs[0], newsegs[1]);
                foundflag = true;
            } else if (intersections.length === 1) {
                console.error("Only found 1 intersection point so going to use a different method");
                console.log("Found Intersection:", intersections);

                console.log("Segments:", segments);
                console.log("line:", line);
                console.log("Bounding Box:", boundingbox);
            } else {
                console.error("No intersections found so going to use a different method");
                console.log("Found Intersection:", intersections);

                console.log("Segments:", segments);
                console.log("line:", line);
                console.log("Bounding Box:", boundingbox);
            }
        }

        //Now that we exit the check for every segment we can verify if this is ok
        if (!foundflag) {
            console.error("There's something funky going on with the intersection,no intersections found");
            console.log("Segments:", segments);
            // console.log("line:", line);
            console.log("Bounding Box:", boundingbox);
            throw new Error("Could not find 2 intersection points, hence aborting the whole thing");
        }
        // console.log("raw new segments:", segments);
        this.updateSegments(segments);

        return foundflag;
    }

    /**
     * Breaks the segment at the 2 points given by the points
     * @param {PointArray} segment
     * @param break1
     * @param break2
     * @return {SegmentArray} Returns the two segments
     * @memberof Connection
     * @private
     */
    private breakSegment(segment: [number, number][], break1: paper.Point, break2: paper.Point) {
        //Generate 2 segments from this 1 segemnt
        let p1 = new paper.Point(segment[0]);
        let p2 = new paper.Point(segment[1]);

        let segment1, segment2;
        let p1_break1 = p1.getDistance(break1);
        let p2_break1 = p2.getDistance(break1);
        let p1_break2 = p1.getDistance(break2);
        let p2_break2 = p2.getDistance(break2);

        //Find out if break1 is closer to p1 or p2
        if (p1_break1 + p2_break2 < p2_break1 + p1_break2) {
            //break1 is closer to p1 and break2 is closer to p2\
            segment1 = [
                [Math.round(p1.x), Math.round(p1.y)],
                [Math.round(break1.x), Math.round(break1.y)]
            ];
            segment2 = [
                [Math.round(p2.x), Math.round(p2.y)],
                [Math.round(break2.x), Math.round(break2.y)]
            ];
        } else {
            //break1 is closer to p2 and break1 is closer to p1
            segment1 = [
                [Math.round(p2.x), Math.round(p2.y)],
                [Math.round(break1.x), Math.round(break1.y)]
            ];
            segment2 = [
                [Math.round(p1.x), Math.round(p1.y)],
                [Math.round(break2.x), Math.round(break2.y)]
            ];
        }
        return [segment1, segment2];
    }

    /**
     * This method is used to import the component from Interchange V1 JSON
     * @param json
     * @returns {Connection} Returns a connection object
     * @memberof Connection
     */
    static fromInterchangeV1(device: any, json: JSON) {
        // let set;
        // if (json.hasOwnProperty("set")) set = json.set;
        // else set = "Basic";
        // //TODO: This will have to change soon when the thing is updated
        // throw new Error("Need to implement Interchange V1 Import for component object");
        // //return Device.makeFeature(json.macro, set, json.params, json.name, json.id, json.type);
        let name = json.name;
        let id = json.id;
        let entity = json.entity;
        let params = {};
        for (let key in json.params) {
            // console.log("key:", key, "value:", json.params[key]);
            // let paramobject = Parameter.generateConnectionParameter(key, json.params[key]);
            params[key] = json.params[key];
        }

        //Check if the params have the other unique elements necessary otherwise add them as null
        if (!params.hasOwnProperty("start")) {
            //Setting this value to origin
            params["start"] = [0, 0];
        }
        if (!params.hasOwnProperty("end")) {
            //Setting this value to origin
            params["end"] = [0, 0];
        }
        if (!params.hasOwnProperty("wayPoints")) {
            //TODO: setting a single waypoint at origin
            params["wayPoints"] = [
                [0, 0],
                [1, 2]
            ];
        }
        if (!params.hasOwnProperty("segments")) {
            //TODO: Setting a default segment from origin to origin
            params["segments"] = [
                [
                    [0, 0],
                    [0, 0]
                ],
                [
                    [0, 0],
                    [0, 0]
                ]
            ];
        }
        let definition = Registry.featureSet.getDefinition("Connection");
        let paramstoadd = new Params(params, definition.unique, definition.heritable);

        let connection = new Connection(entity, paramstoadd, name, entity, id);
        if (json.hasOwnProperty("source")) {
            if (json.source != null && json.source != undefined) {
                connection.setSourceFromJSON(device, json.source);
            }
        }
        if (json.hasOwnProperty("sinks")) {
            if (json.sinks != null && json.sinks != undefined) {
                for (let i in json.sinks) {
                    let sink = json.sinks[i];
                    connection.addSinkFromJSON(device, sink);
                }
            }
        }
        if (json.hasOwnProperty("paths")) {
            if (json.paths != null && json.paths != undefined) {
                for (let i in json.paths) {
                    connection.addWayPoints(json.paths[i]);
                }
            }
        }

        return connection;
    }

    /**
     * Goes through teh waypoints and generates the connection segments
     * @return {SegmentArray}
     * @memberof Connection
     */
    regenerateSegments() {
        let pathscopy = this.getPaths();
        let ret = [];
        let waypointscopy;
        for (let j in pathscopy) {
            waypointscopy = pathscopy[j];
            for (let i = 0; i < waypointscopy.length - 1; i++) {
                let segment = [waypointscopy[i], waypointscopy[i + 1]];
                ret.push(segment);
            }
        }
        this.updateSegments(ret);
    }

    /**
     * Allows the user to set the source of the connection
     * @param {Object} component
     * @param {ComponentPort} port
     * @memberof Connection
     * @returns {void}
     */
    setSource(component: string, port: ComponentPort) {
        if (typeof component != "string" && !(component instanceof String)) {
            console.error("The reference object value can only be a string");
        }
        this._source = new ConnectionTarget(component, port);
    }

    /**
     * Allows the user to add a sink to the connection
     * @param {string} component 
     * @param {ComponentPort} port
     * @memberof Connection
     * @returns {void}
     */
    addSink(component: string, port: ComponentPort) {
        if (typeof component != "string" || !(component instanceof String)) {
            console.error("The reference object value can only be a string");
        }
        this._sinks.push(new ConnectionTarget(component, port));
    }

    /**
     * Adds a new connection target to either the source or the sinks of the connection object. Requires the user to pass
     * a ConnectionTarget Object or else it will throw an error.
     * @param {string} connectiontarget
     * @memberof Connection
     * @returns {void}
     */
    addConnectionTarget(connectiontarget: ConnectionTarget) {
        if (!(connectiontarget instanceof ConnectionTarget) || connectiontarget == null || connectiontarget == undefined) {
            console.error("Cannot add non-ConnectionTarget object as source or sink");
        }

        if (this._source == null) {
            this._source = connectiontarget;
        } else {
            //TODO: Check for duplicates - does it matter actually ?
            this._sinks.push(connectiontarget);
        }
    }

    /**
     * Tries to delete any connection target reference that uses the said component
     * @param {string} componentid Component ID
     * @return {boolean} Returns true if any corresponding connection target is found
     * @memberof Connection
     * 
     */
    tryDeleteConnectionTarget(componentid: string) {
        let ret = false;
        if (component.getID() == componentid) {
            //Remove the source object
            this._source = null;
            ret = true;
        }

        for (let i in this._sinks) {
            let sink = this._sinks[i];

            if (sink.component.getID() == componentid) {
                this._sinks.splice(i, 1);
                ret = true;
            }
        }

        return ret;
    }

    /**
     * Adds a new set of waypoints to the path field of the connection
     * @param {} wayPoints
     * @memberof Connection
     * @returns {void}
     */
    addWayPoints(wayPoints: [number, number]) {
        this._paths.push(wayPoints);
    }
    /**
     * Merges connections
     * @param {Connection} connection 
     * @memberof Connection
     * @returns {void}
     */
    mergeConnection(connection: Connection) {
        console.error("Merge the newly found connection with the new connection");
        //TODO:
        /*
        1. Transfer all the paths
        2. Transfer all the ConnectionTargets
        3. Transfer all the other objects
        4. Move the params
        5.
         */
    }
    /**
     * Converts from JSON format to connection object
     * @param {Object} device 
     * @param {JSON} json 
     * @memberof Connection
     * @returns {void}
     */
    setSourceFromJSON(device: any, json: JSON) {
        let target = ConnectionTarget.fromJSON(device, json);
        this._source = target;
    }
    /**
     * ?
     * @param {Object} device 
     * @param {JSON} json 
     * @memberof Connection
     * @returns {void}
     */
    addSinkFromJSON(device: any, json: JSON) {
        let target = ConnectionTarget.fromJSON(device, json);
        this._sinks.push(target);
    }
}
