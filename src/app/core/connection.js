import Feature from "./feature";
import paper from "paper";
import Parameter from "./parameter";
import Params from "./params";
import ConnectionTarget from "./connectionTarget";

import * as Registry from "./registry";

/**
 * This class contains the connection abstraction used in the interchange format and the
 * high level device model of the microfluidic.
 */
export default class Connection {
    constructor(type, params, name, mint, id = Feature.generateID()) {
        this.__params = params;
        this.__name = name;
        this.__id = id;
        this.__type = type;
        this.__entity = mint;
        //This stores the features that are a part of the component
        this.__features = [];
        this.__nodes = [];
        //TODO: Need to figure out how to effectively search through these
        this.__bounds = null;
        this.__source = null;
        this.__sinks = [];
        this.__paths = [];
        this.__objects = [];
        this.__routed = false;
    }

    get sinks() {
        return this.__sinks;
    }

    get source() {
        return this.__source;
    }

    get routed() {
        return this.__routed;
    }

    set routed(value) {
        this.__routed = value;
    }

    /**
     * Returns the list of features associated with the connection
     * @return {Array}
     */
    get features() {
        return this.__features;
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
    setBounds(bounds) {
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
    updateParameter(key, value) {
        // this.__params.updateParameter(key, value);
        this.__params[key] = value;
        // this.updateView();
    }

    /**
     * Generates the object that needs to be serialzed into JSON for interchange format V1
     * @returns {{}} Object
     */
    toInterchangeV1() {
        let output = {};
        output.id = this.__id;
        output.name = this.__name;
        output.entity = this.__entity;
        if (this.__source != null) {
            output.source = this.__source.toJSON();
        } else {
            output.source = null;
        }
        let sinks = [];
        if (this.__sinks != null && this.__sinks.length > 0) {
            for (let i in this.__sinks) {
                sinks.push(this.__sinks[i].toJSON());
            }
            output.sinks = this.__sinks;
        } else {
            output.sinks = null;
        }
        output.paths = this.__paths;
        output.params = this.__params.toJSON();
        return output;
    }

    /**
     * Returns the ID of the component
     * @returns {String|*}
     */
    getID() {
        return this.__id;
    }

    /**
     * Allows the user to set the name of the component
     * @param name
     */
    setName(name) {
        console.log("test", name);
        this.__name = name;
    }

    /**
     * Returns the name of the component
     * @returns {String}
     */
    getName() {
        return this.__name;
    }

    /**
     * Gets the 3DuF Type of the component, this will soon be depreciated and merged with
     * the MINT references
     * @returns {*}
     */
    getType() {
        return this.__type;
    }

    /**
     * Returns the position of the component
     * @return {*|string}
     */
    getPosition() {
        return this.__params["position"].getValue();
    }

    /**
     * Returns the value of the parameter stored against the following key in teh component params
     * @param key
     * @returns {*}
     */
    getValue(key) {
        try {
            return this.__params.getValue(key);
        } catch (err) {
            throw new Error("Unable to get value for key: " + key);
        }
    }

    getFeatureIDs() {
        return this.__features;
    }

    /**
     * Not sure what this does
     * @param key
     * @returns {boolean}
     */
    hasDefaultParam(key) {
        if (this.getDefaults().hasOwnProperty(key)) return true;
        else return false;
    }

    /**
     * Adds a feature that is associated with the component
     * @param featureID String id of the feature
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
     */
    __updateBounds() {
        console.log("test");
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
     * Rerturns the params associated with the component
     */
    getParams() {
        return this.__params;
    }

    /**
     * Sets the params associated with the component
     * @param params key -> Parameter Set
     */
    setParams(params) {
        this.__params = params;
        //TODO: Modify all the associated Features
        for (let key in params) {
            let value = params[key];
            for (let i in this.__features) {
                let featureidtochange = this.__features[i];

                //Get the feature id and modify it
                let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
                feature.updateParameter(key, value.getValue());
            }
        }
    }

    /**
     * Returns the list of waypoints associated with the connection
     * @return {*|void|string}
     */
    getPaths() {
        return this.__paths;
    }

    /**
     * Updates the segments of the connection
     * @param segments
     */
    updateSegments(segments) {
        this.updateParameter("segments", new Parameter("SegmentArray", segments));
        for (let i in this.__features) {
            let featureidtochange = this.__features[i];

            let feature = Registry.currentDevice.getFeatureByID(featureidtochange);
            // feature.updateParameter('position', center);
            feature.updateParameter("segments", segments);
        }
    }

    /**
     * Inserts the gap using the boundingbox
     * @param boundingbox
     */
    insertFeatureGap(boundingbox) {
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
                let newsegs = this.__breakSegment(segment, break1, break2);
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
     * @param segment
     * @param break1
     * @param break2
     * @return {*[][][]}
     * @private
     */
    __breakSegment(segment, break1, break2) {
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
     * @returns {*}
     */
    static fromInterchangeV1(device, json) {
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
     * @return {Array}
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
     * @param component
     * @param port
     */
    setSource(component, port) {
        if (typeof component != "string" && !(component instanceof String)) {
            console.error("The reference object value can only be a string");
        }
        this.__source = new ConnectionTarget(component, port);
    }

    /**
     * Allows the user to add a sink to the connection
     * @param component
     * @param port
     */
    addSink(component, port) {
        if (typeof component != "string" || !(component instanceof String)) {
            console.error("The reference object value can only be a string");
        }
        this.__sinks.push(new ConnectionTarget(component, port));
    }

    /**
     * Adds a new connection target to either the source or the sinks of the connection object. Requires the user to pass
     * a ConnectionTarget Object or else it will throw an error.
     * @param connectiontarget
     */
    addConnectionTarget(connectiontarget) {
        if (!(connectiontarget instanceof ConnectionTarget) || connectiontarget == null || connectiontarget == undefined) {
            console.error("Cannot add non-ConnectionTarget object as source or sink");
        }

        if (this.__source == null) {
            this.__source = connectiontarget;
        } else {
            //TODO: Check for duplicates - does it matter actually ?
            this.__sinks.push(connectiontarget);
        }
    }

    /**
     * Tries to delete any connection target reference that uses the said component. Returns true if any corresponding
     * connection target is found.
     * @param component
     * @return boolean
     */
    tryDeleteConnectionTarget(componentid) {
        let ret = false;
        if (component.getID() == componentid) {
            //Remove the source object
            this.__source = null;
            ret = true;
        }

        for (let i in this.__sinks) {
            let sink = this.__sinks[i];

            if (sink.component.getID() == componentid) {
                this.__sinks.splice(i, 1);
                ret = true;
            }
        }

        return ret;
    }

    /**
     * Adds a new set of waypoints to the path field of the connection
     * @param wayPoints
     */
    addWayPoints(wayPoints) {
        this.__paths.push(wayPoints);
    }

    mergeConnection(connection) {
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

    setSourceFromJSON(device, json) {
        let target = ConnectionTarget.fromJSON(device, json);
        this.__source = target;
    }

    addSinkFromJSON(device, json) {
        let target = ConnectionTarget.fromJSON(device, json);
        this.__sinks.push(target);
    }
}
