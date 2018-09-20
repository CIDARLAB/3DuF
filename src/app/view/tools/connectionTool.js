import MouseTool from "./mouseTool";
import Connection from '../../core/connection';

const Registry = require("../../core/registry");
import SimpleQueue from "../../utils/simpleQueue";
import Feature from "../../core/feature";
var PageSetup = require("../pageSetup");
import paper from 'paper';


export default class ConnectionTool extends MouseTool {
    constructor(typeString, setString) {
        super();
        this.typeString = typeString;
        this.setString = setString;
        this.startPoint = null;
        this.lastPoint = null;
        this.wayPoints = [];
        this.currentChannelID = null;
        this.currentTarget = null;
        this.dragging = false;

        /*
        States:
        1. SOURCE
        2. WAYPOINT
        3. TARGET
         */
        this.__STATE = "SOURCE";
        let ref = this;

        this.showQueue = new SimpleQueue(function () {
            ref.showTarget();
        }, 20, false);

        this.updateQueue = new SimpleQueue(function () {
            ref.updateChannel();
        }, 20, false);

        this.down = function (event) {
            console.log(event);
            Registry.viewManager.killParamsWindow();
            paper.project.deselectAll();
            console.log("Current State:", ref.__STATE);
            switch (ref.__STATE) {
                case "SOURCE":
                    ref.__STATE = "WAYPOINT";
                    ref.dragging = true;
                    ref.initChannel(event);
                    break;
                case "WAYPOINT":
                    ref.addWayPoint(event, event.altKey);
                    break;
                case "TARGET":
                    ref.__STATE = "WAYPOINT";
                    ref.dragging = true;
                    ref.initChannel(event);
                    //ref.createConnection();
                    break;
            }

        };

        this.rightdown = function (event) {
            ref.__STATE = "TARGET";
            ref.dragging = false;
            let end = ref.wayPoints.pop();
            ref.lastPoint = end;
            ref.finishChannel();
        };

        this.move = function (event) {
            //Check if orthogonal
            let point = MouseTool.getEventPosition(event)
            let target = ConnectionTool.getTarget(point);

            if(event.altKey && ref.__STATE == "WAYPOINT"){
                let lastwaypoint = ref.startPoint;
                if(ref.wayPoints.length > 0){
                    lastwaypoint = ref.wayPoints[ref.wayPoints.length -1];
                }
                // ref.getNextOrthogonalPoint(lastwaypoint, target);
                let orthopoint = ref.getNextOrthogonalPoint(lastwaypoint, target)
                ref.lastPoint = {"x": orthopoint[0], "y": orthopoint[1]};
            }else{
                ref.lastPoint = {"x": target[0], "y":target[1]};
            }
            if (ref.dragging) {
                //This queue basically does the rendering of the connection feature
                ref.updateQueue.run();
            }

            //This queue basically does the rendering of the target
            ref.showQueue.run();
        }
    }

    /**
     * This function renders the cross haired target used to show the mouse position.
     * @param point
     */
    showTarget(point) {
        let target = ConnectionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    initChannel() {
        this.startPoint = ConnectionTool.getTarget(this.lastPoint);
        this.lastPoint = this.startPoint;
        this.wayPoints.push(this.startPoint);
    }

    updateChannel() {
        if (this.lastPoint && this.startPoint) {
            if (this.currentChannelID) {
                let target = ConnectionTool.getTarget(this.lastPoint);
                let feat = Registry.currentLayer.getFeature(this.currentChannelID);
                feat.updateParameter("end", target);
                feat.updateParameter("wayPoints", this.wayPoints);
                feat.updateParameter("segments", this.generateSegments());
            } else {
                let newChannel = this.createChannel(this.startPoint, this.startPoint);
                this.currentChannelID = newChannel.getID();
                Registry.currentLayer.addFeature(newChannel);
            }
        }
    }

    finishChannel() {
        if (this.currentChannelID) {
            this.wayPoints.push(this.lastPoint);
            let feat = Registry.currentLayer.getFeature(this.currentChannelID);
            feat.updateParameter("end", this.lastPoint);
            feat.updateParameter("wayPoints", this.wayPoints);
            feat.updateParameter("segments", this.generateSegments());
            //Save the connection object
            let connection = new Connection('Connection', feat.getParams(), Registry.currentDevice.generateNewName('CHANNEL'), 'CHANNEL');
            connection.addFeatureID(feat.getID());
            Registry.currentDevice.addConnection(connection);

            this.currentChannelID = null;
            this.wayPoints = [];
            Registry.viewManager.saveDeviceState();
        } else {
            console.error("Something is wrong here, unable to finish the connection");
        }

        Registry.viewManager.saveDeviceState();


    }

    cleanup(){
        console.log("Running Cleanup for the Connection Tool");

        /*
        Step 1 - Check the state
        Step 2 - based on the state do the following
            SOURCE - Do nothing, everything is good
            WAYPOINT - 1) Reset the state to source 2) cleanup features 3) TBA
            TARGET - Set the state to SOURCE and do nothing else
         */
        switch (this.__STATE) {
            case "SOURCE":
                console.log("Doing nothing");
                break;
            case "WAYPOINT":
                console.warn("Implement cleanup");

                break;
            case "TARGET":
                this.__STATE = "SOURCE";
                this.dragging = false;
                break;
        }

    }


    addWayPoint(event, isManhatten) {
        let point = MouseTool.getEventPosition(event);
        let target = ConnectionTool.getTarget(point);
        if(isManhatten && target){
            //TODO: modify the target to find the orthogonal point
            let lastwaypoint = this.startPoint;
            if(this.wayPoints.length > 0){
                lastwaypoint = this.wayPoints[this.wayPoints.length -1];
            }
            target = this.getNextOrthogonalPoint(lastwaypoint, target);
        }
        if (target.length = 2) {
            this.wayPoints.push(target);
        }
    }

    /**
     * Creates the channel from the start and the end point
     * @param start
     * @param end
     * @return {EdgeFeature}
     */
    createChannel(start, end) {
        return Feature.makeFeature(this.typeString, this.setString, {
            start: start,
            end: end,
            wayPoints: this.wayPoints,
            segments: this.generateSegments()
        });
    }

    //TODO: Re-establish target selection logic from earlier demo
    static getTarget(point) {
        let target = Registry.viewManager.snapToGrid(point);
        return [target.x, target.y]
    }

    /**
     * Gets the closes manhatten point to where ever the mouse is
     * @param lastwaypoint
     * @param target
     * @return {*}
     */
    getNextOrthogonalPoint(lastwaypoint,target) {
        //Trivial case where target is orthogonal
        if((target[0] === lastwaypoint[0]) || (target[1] === lastwaypoint[1])){
            return target;
        }

        let ret = [target[0], target[1]];
        //Find out if the delta x or delta y is smaller and then just 0 the that coordinate
        let delta_x = Math.abs(target[0] - lastwaypoint[0]);
        let delta_y = Math.abs(target[1] - lastwaypoint[1]);
        if(delta_x < delta_y){
            ret[0] = lastwaypoint[0];
        }else{
            ret[1] = lastwaypoint[1];
        }
        return ret;
    }

    /**
     * Goes through teh waypoints and generates the connection segments
     * @return {Array}
     */
    generateSegments() {
        let waypointscopy = [];
        waypointscopy.push(this.startPoint);
        this.wayPoints.forEach(function (waypoint) {
            waypointscopy.push(waypoint);
        });
        //TODO: Fix this bullshit where teh points are not always arrays
        if(Array.isArray(this.lastPoint)){
            waypointscopy.push(this.lastPoint);
        }else{
            waypointscopy.push([this.lastPoint.x, this.lastPoint.y]);
        }
        // console.log("waypoints", this.wayPoints, this.startPoint);
        let ret = [];
        for(let i=0; i < waypointscopy.length - 1; i++){
            let segment = [waypointscopy[i], waypointscopy[i+1]];
            ret.push(segment);
        }
        // console.log("segments:", ret);
        return ret;
    }
}