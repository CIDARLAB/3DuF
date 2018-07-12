var Registry = require("../../core/registry");
var MouseTool = require("./mouseTool");
var SimpleQueue = require("../../utils/simpleQueue");
import Feature from "../../core/feature";
var PageSetup = require("../pageSetup");

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
            console.log("LAst Point", ref.lastPoint);
            ref.finishChannel();
        };
        // this.up = function(event) {
        // 	ref.dragging = false;
        // 	ref.finishChannel(MouseTool.getEventPosition(event))
        // };
        this.move = function (event) {
            //Check if orthogonal
            let point = MouseTool.getEventPosition(event)
            let target = ConnectionTool.getTarget(point);

            if(event.altKey && ref.__STATE == "WAYPOINT"){
                let lastwaypoint = ref.startPoint;
                console.log("is orthogonal point");
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

    // static makeReticle(point) {
    // 	let size = 10 / paper.view.zoom;
    // 	let ret = paper.Path.Circle(point, size);
    // 	ret.fillColor = new paper.Color(.5, 0, 1, .5);
    // 	return ret;
    // }
    //
    // abort() {
    // 	ref.dragging = false;
    // 	if (this.currentTarget) {
    // 		this.currentTarget.remove();
    // 	}
    // 	if (this.currentChannelID) {
    // 		Registry.currentLayer.removeFeatureByID(this.currentChannelID);
    // 	}
    // }

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
    }

    updateChannel() {
        if (this.lastPoint && this.startPoint) {
            if (this.currentChannelID) {
                let target = ConnectionTool.getTarget(this.lastPoint);
                let feat = Registry.currentLayer.getFeature(this.currentChannelID);
                feat.updateParameter("end", target);
                feat.updateParameter("wayPoints", this.wayPoints);
            } else {
                console.log("Creating a new connection");
                let newChannel = this.createChannel(this.startPoint, this.startPoint);
                this.currentChannelID = newChannel.getID();
                Registry.currentLayer.addFeature(newChannel);
            }
        }
    }

    finishChannel() {
        console.log("waypoints", this.wayPoints);
        if (this.currentChannelID) {
            let feat = Registry.currentLayer.getFeature(this.currentChannelID);
            feat.updateParameter("end", this.lastPoint);
            feat.updateParameter("wayPoints", this.wayPoints);
            this.currentChannelID = null;
            this.wayPoints = [];
        } else {
            console.log("Something is wrong here");
        }

    }

    // finishChannel(point) {
    // 	let target = ConnectionTool.getTarget(point);
    // 	if (this.currentChannelID) {
    // 		if (this.startPoint.x == target[0] && this.startPoint.y == target[1]) {
    // 			Registry.currentLayer.removeFeatureByID(this.currentChannelID);
    // 		}
    // 	} else {
    // 		this.updateChannel(point);
    // 	}
    // 	this.currentChannelID = null;
    // 	this.startPoint = null;
    // }

    addWayPoint(event, isManhatten) {
        console.log("WayPoint", MouseTool.getEventPosition(event));
        let point = MouseTool.getEventPosition(event);
        let target = ConnectionTool.getTarget(point);
        console.log("target:", target);
        if(isManhatten && target){
            //TODO: modify the target to find the orthogonal point
            let lastwaypoint = this.startPoint;
            console.log("is orthogonal point");
            if(this.wayPoints.length > 0){
                lastwaypoint = this.wayPoints[this.wayPoints.length -1];
            }
            target = this.getNextOrthogonalPoint(lastwaypoint, target);
        }
        if (target.length = 2) {
            console.log("adding waypoints");
            this.wayPoints.push(target);
        }
    }

    createChannel(start, end) {
        return Feature.makeFeature(this.typeString, this.setString, {
            start: start,
            end: end,
            wayPoints: this.wayPoints
        });
    }

    //TODO: Re-establish target selection logic from earlier demo
    static getTarget(point) {
        let target = Registry.viewManager.snapToGrid(point);
        return [target.x, target.y]
    }

    getNextOrthogonalPoint(lastwaypoint,target) {
        console.log("init", target, lastwaypoint);
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
        console.log(target, ret);
        return ret;
    }
}