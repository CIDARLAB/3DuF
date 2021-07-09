import paper from "paper";
import Feature from "./feature";
import Parameter from "./parameter";
import Params from "./params";
import ConnectionTarget from "./connectionTarget";
import ComponentPort from "./componentPort";
import Device from './device';
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";
import Layer from './layer';
import uuid from "node-uuid";
import { ConnectionInterchangeV1 } from "./init";
import {Segment, Point} from "./init"
import ConnectionUtils from '../utils/connectionUtils'

/**
 * This class contains the connection abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Connection {
    protected _params: Params;
    protected _name: string;
    protected _id: string;
    protected _type: string;
    protected _entity: string;
    protected _features: string[]; // Not sure if it's Feature[] or string[]
    protected _nodes: any;
    protected _bounds: paper.Rectangle | null;
    protected _source: ConnectionTarget | null;
    protected _sinks: ConnectionTarget[];
    protected _paths: Point[];
    protected _objects: any;
    protected _routed: boolean;
    protected _layer: Layer;

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
        this._layer = new Layer({});
    }

    get layer() {
        return this._layer;
    }

    set layer(layer:Layer) {
        this._layer = layer;
    }
    /**
     * Gets the sinks in the connection
     * @returns {ConnectionTarget[]} Returns an array with the sinks
     * @memberof Connection
     */
    get sinks() {
        return this._sinks;
    }

    /**
     * Gets the source of the connection
     * @returns {ConnectionTarget} Returns the source of the connection
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
     * @return {Feature[]}
     * @memberof Connection
     */
    get features() {
        return this._features;
    }

    /**
     * Generates a random id
     * @returns {string} Random ID string
     * @memberof Connection
     */
    static generateID(): string {
        return uuid.v1();
    }

    /**
     * Sets the bounds i.e. the x,y position and the width and length of the component
     * @param {paper.Rectangle} bounds PaperJS Rectangle object associated with a Path.bounds property
     * @memberof Connection
     * @returns {void}
     */
    setBounds(bounds: paper.Rectangle): void {
        this._bounds = bounds;
        let topleftpt = bounds.topLeft;
        this._params.updateParameter('position', [topleftpt.x, topleftpt.y])
        this._params.updateParameter('xspan', bounds.width)
        this._params.updateParameter('yspan', bounds.height)
    }

    /**
     * Updates the parameters stored by the component
     * @param {String} key Identifier of the parameter
     * @param {any} value
     * @memberof Connection
     * @returns {void}
     */
    updateParameter(key: string, value: any): void {
        this._params.updateParameter(key, value);
        // this._params[key] = value;
        // this.updateView();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {ConnectionInterchangeV1} Object
     * @memberof Connection
     */
    toInterchangeV1(): ConnectionInterchangeV1 {
        const output: ConnectionInterchangeV1 = {
            id : this._id,
            name: this._name,
            entity: this._entity,
            source: null,
            sinks: null,
            paths: this._paths,
            params: this._params.toJSON(),
            layer: this._layer.id
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
     * @returns {String}
     * @memberof Connection
     */
    get id() {
        return this._id;
    }

    /**
     * Allows the user to set the name of the component
     * @param {String} name Name of the component
     * @memberof Connection
     * @returns {void}
     */
    set name(name: string) {
        this._name = name;
    }

    /**
     * Returns the name of the component
     * @returns {String} Name of the component
     * @memberof Connection
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {String}
     * @memberof Connection
     */
    get type() {
        return this._type;
    }

    /**
     * Returns the position of the component
     * @return {string}
     * @memberof Connection
     */
    /**
     * Returns the value of the parameter stored against the following key in teh component params
     * @returns {any}
     * @memberof Connection
     */
    getValue(key: string): any {
        try {
            return this._params.getValue(key);
        } catch (err) {
            throw new Error("Unable to get value for key: " + key);
        }
    }

    /**
     * Returns the feature ID
     * @returns {string[]}
     * @memberof Connection
     */
    getFeatureIDs(): Array<string> {
        return this._features;
    }

    /**
     * Adds a feature that is associated with the component
     * @param {String} featureID String id of the feature
     * @memberof Connection
     * @returns {void}
     */
    addFeatureID(featureID: string): void {
        this._features.push(featureID);
        //Now update bounds
        // this.__updateBounds();
    }

    /**
     * This method updates the bounds of the component
     * @memberof Connection
     * @returns {void}
     * @protected
     */
    protected updateBounds(): void {
        console.log("test");
        let bounds = null;
        let feature = null;
        let renderedfeature = null;
        for (var i in this._features) {
            // gets teh feature defined by the id
            feature = ConnectionUtils.getFeatureFromID(this._features[i]);
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
     * Sets the params associated with the component
     * @param {Params} params key -> Parameter Set
     * @returns {void}
     * @memberof Connection
     */
    set params(params: Params) {
        this._params = params;
        //TODO: Modify all the associated Features
        for (let key in params) {
            let value = params.getValue(key);
            for (const i in this._features) {
                const featureidtochange = this._features[i];

                //Get the feature id and modify it
                let feature = ConnectionUtils.getFeatureFromID(featureidtochange);
                feature.updateParameter(key, value.getValue());
            }
        }
    }

    /**
     * Returns the list of waypoints associated with the connection
     * @return {Point[]}
     * @memberof Connection
     */
    getPaths(): Segment {
        return this._paths;
    }

    /**
     * Updates the segments of the connection
     * @param {Segment[]} segments
     * @memberof Connection
     * @returns {void}
     */
    updateSegments(segments: Segment): void {
        this.updateParameter("segments", new Parameter("SegmentArray", segments));
        for (let i in this._features) {
            let featureidtochange = this._features[i];

            const feature = ConnectionUtils.getFeatureFromID(featureidtochange);
            // feature.updateParameter('position', center);
            feature.updateParameter("segments", segments);
        }
    }

    /**
     * Inserts the gap using the boundingbox
     * @param {any} boundingbox
     * @memberof Connection
     * @returns {boolean}
     */
    insertFeatureGap(boundingbox: any): boolean {
        let foundflag = false;
        // Convert Rectangle to Path.Rectangle
        console.log(boundingbox, boundingbox.width, boundingbox.height);
        boundingbox = new paper.Path.Rectangle(boundingbox);
        // Check which segment I need to break
        const segments = this.getValue("segments");
        for (const i in segments) {
            const segment = segments[i];
            const line = new paper.Path.Line(new paper.Point(segment[0]), new paper.Point(segment[1]));
            const intersections = line.getIntersections(boundingbox);
            // console.log("Intersections found", intersections);
            if (intersections.length === 2) {
                const break1 = intersections[0].point;
                const break2 = intersections[1].point;
                const newsegs = this.breakSegment(segment, break1, break2);
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

        // Now that we exit the check for every segment we can verify if this is ok
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
     * @param {Point[]} segment
     * @param {paper.Point} break1
     * @param {paper.Point} break2
     * @return {Segment[]} Returns the two segments
     * @memberof Connection
     * @protected
     */
    protected breakSegment(segment: Segment, break1: paper.Point, break2: paper.Point): Array<Segment> {
        //Generate 2 segments from this 1 segemnt
        const p1 = new paper.Point(segment[0]);
        const p2 = new paper.Point(segment[1]);

        let segment1: Segment, segment2: Segment;
        const p1_break1 = p1.getDistance(break1);
        const p2_break1 = p2.getDistance(break1);
        const p1_break2 = p1.getDistance(break2);
        const p2_break2 = p2.getDistance(break2);

        // Find out if break1 is closer to p1 or p2
        if (p1_break1 + p2_break2 < p2_break1 + p1_break2) {
            // break1 is closer to p1 and break2 is closer to p2\
            segment1 = [
                [Math.round(p1.x), Math.round(p1.y)],
                [Math.round(break1.x), Math.round(break1.y)]
            ];
            segment2 = [
                [Math.round(p2.x), Math.round(p2.y)],
                [Math.round(break2.x), Math.round(break2.y)]
            ];
        } else {
            // break1 is closer to p2 and break1 is closer to p1
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
    static fromInterchangeV1(device: Device, json: ConnectionInterchangeV1): Connection {
        // let set;
        // if (json.hasOwnProperty("set")) set = json.set;
        // else set = "Basic";
        // //TODO: This will have to change soon when the thing is updated
        // throw new Error("Need to implement Interchange V1 Import for component object");
        // //return Device.makeFeature(json.macro, set, json.params, json.name, json.id, json.type);

        const name = json.name;
        const id = json.id;
        const entity = json.entity;
        const params = json.params

        // Check if the params have the other unique elements necessary otherwise add them as null
        if (!Object.prototype.hasOwnProperty.call(params, "start")) {
            // Setting this value to origin
            params.start = [0, 0];
        }
        if (!Object.prototype.hasOwnProperty.call(params, "end")) {
            // Setting this value to origin
            params.end = [0, 0];
        }
        if (!Object.prototype.hasOwnProperty.call(params, "wayPoints")) {
            // TODO: setting a single waypoint at origin
            params.wayPoints = [
                [0, 0],
                [1, 2]
            ];
        }
        if (!Object.prototype.hasOwnProperty.call(params, "segments")) {
            // TODO: Setting a default segment from origin to origin
            params.segments = [
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
        let definition;
        if(ConnectionUtils.hasFeatureSet()){
            definition = ConnectionUtils.getDefinition("Connection");

        }
        const paramstoadd = new Params(params, definition.unique, definition.heritable);

        const connection = new Connection(entity, paramstoadd, name, entity, id);
        if (Object.prototype.hasOwnProperty.call(json, "source")) {
            if (json.source !== null && json.source != undefined) {
                connection.setSourceFromJSON(device, json.source);
            }
        }
        if (Object.prototype.hasOwnProperty.call(json, "sinks")) {
            if (json.sinks !== null && json.sinks != undefined) {
                for (const i in json.sinks) {
                    const sink = json.sinks[i];
                    connection.addSinkFromJSON(device, sink);
                }
            }
        }
        if (Object.prototype.hasOwnProperty.call(json, "paths")) {
            if (json.paths !== null && json.paths != undefined) {
                for (const i in json.paths) {
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
    regenerateSegments(): void {
        const pathscopy = this.getPaths();
        const ret: Segment = [];
        let waypointscopy;
        for (const j in pathscopy) {
            waypointscopy = pathscopy[j];
            for (let i = 0; i < waypointscopy.length - 1; i++) {
                const segment: Point = [waypointscopy[i], waypointscopy[i + 1]];
                ret.push(segment);
            }
        }
        this.updateSegments(ret);
    }

    // /**
    //  * Allows the user to set the source of the connection
    //  * @param {Object} component
    //  * @param {ComponentPort} port
    //  * @memberof Connection
    //  * @returns {void}
    //  */
    // setSource(component: string, port: ComponentPort) {
    //     if (typeof component != "string" && !(component instanceof String)) {
    //         console.error("The reference object value can only be a string");
    //     }
    //     this._source = new ConnectionTarget(component, port);
    // }

    // /**
    //  * Allows the user to add a sink to the connection
    //  * @param {string} component
    //  * @param {ComponentPort} port
    //  * @memberof Connection
    //  * @returns {void}
    //  */
    // addSink(component: string, port: ComponentPort) {
    //     if (typeof component != "string" || !(component instanceof String)) {
    //         console.error("The reference object value can only be a string");
    //     }
    //     this._sinks.push(new ConnectionTarget(component, port));
    // }

    /**
     * Adds a new connection target to either the source or the sinks of the connection object. Requires the user to pass
     * a ConnectionTarget Object or else it will throw an error.
     * @param {string} connectiontarget
     * @memberof Connection
     * @returns {void}
     */
    addConnectionTarget(connectiontarget: ConnectionTarget): void {
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
    tryDeleteConnectionTarget(componentid: string): boolean {
        let ret = false;

        let source = this._source;
        if(source != null) {
            if (source.component.id == componentid) {
                //Remove the source object
                this._source = null;
                ret = true;
            }
        }

        for (let i in this._sinks) {
            let sink = this._sinks[i];

            if (sink.component.id == componentid) {
                this._sinks.splice(+i, 1);
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
    addWayPoints(wayPoints: Point): void {
        this._paths.push(wayPoints);
    }

    /**
     * Merges connections
     * @param {Connection} connection
     * @memberof Connection
     * @returns {void}
     */
    mergeConnection(connection: Connection): void {
        console.error("Merge the newly found connection with the new connection");
        // TODO:
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
    setSourceFromJSON(device: Device, json: ConnectionInterchangeV1): void {
        const target = ConnectionTarget.fromJSON(device, json);
        this._source = target;
    }

    /**
     * ?
     * @param {Object} device
     * @param {JSON} json
     * @memberof Connection
     * @returns {void}
     */
    addSinkFromJSON(device: Device, json: ConnectionInterchangeV1): void {
        let target = ConnectionTarget.fromJSON(device, json);
        this._sinks.push(target);
    }
}
