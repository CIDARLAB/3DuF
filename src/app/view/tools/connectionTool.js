import MouseTool from "./mouseTool";
import Connection from '../../core/connection';
import SimpleQueue from "../../utils/simpleQueue";
import Feature from "../../core/feature";
import paper from 'paper';
import Params from "../../core/params";
import ConnectionTarget from "../../core/connectionTarget";
import ComponentPort from "../../core/componentPort";

const Registry = require("../../core/registry");


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
        this.source = null;
        this.sinks = [];
        this.__currentConnectionObject = null;

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
        let isPointOnComponent = this.__isPointOnComponent(this.lastPoint);
        let isPointOnConnection = this.__isPointOnConnection(this.lastPoint);
        this.startPoint = ConnectionTool.getTarget(this.lastPoint);
        this.lastPoint = this.startPoint;
        if(isPointOnComponent){
            //Modify the waypoint to reflect closest port in the future
            let componentport = this.__getClosestComponentPort(isPointOnComponent, this.startPoint);
            if(componentport != null){
                let location = ComponentPort.calculateAbsolutePosition(componentport, isPointOnComponent);
                this.source = new ConnectionTarget(isPointOnComponent, componentport.label);
                this.startPoint = location;
                this.lastPoint = this.startPoint;
                this.wayPoints.push(location);
            }else{
                this.source = new ConnectionTarget(isPointOnComponent, null);
                this.wayPoints.push(this.startPoint);
            }
        } else if (isPointOnConnection){
            console.warn("Implement method to make the connection connections");
            //TODO: Find the current connection we are working with and load it into this tools working memory
            this.__currentConnectionObject = isPointOnConnection; //We just use this as the reference
            //TODO: Modify the waypoint to reflect the closest point on connection center spine
            this.wayPoints.push(this.startPoint);
        }else{
            this.wayPoints.push(this.startPoint);
        }
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

    /**
     * Finishes the creation of the connection object
     */
    finishChannel() {
        if (this.currentChannelID) {
            this.wayPoints.push(this.lastPoint);
            let feat = Registry.currentLayer.getFeature(this.currentChannelID);
            feat.updateParameter("end", this.lastPoint);
            // feat.updateParameter("wayPoints", this.wayPoints);
            feat.updateParameter("segments", this.generateSegments());
            //Save the connection object
            let params = new Params(null,null,null, feat.getParams());
            if(this.__currentConnectionObject == null || this.__currentConnectionObject === undefined){
                let connection = new Connection('Connection', params, Registry.currentDevice.generateNewName('CHANNEL'), 'CHANNEL');
                connection.routed = true;
                connection.addFeatureID(feat.getID());
                connection.addWayPoints(this.wayPoints);
                feat.referenceID = connection.getID();
                this.__addConnectionTargets(connection);
                Registry.currentDevice.addConnection(connection);
            }else{
                // console.error("Implement conneciton tool to update existing connection");
                // TODO: Update the connection with more sinks and paths and what not
                this.__currentConnectionObject.addFeatureID(feat.getID());
                feat.referenceID = this.__currentConnectionObject.getID();
                this.__currentConnectionObject.addWayPoints(this.wayPoints);
                feat.referenceID = this.__currentConnectionObject.getID();
                this.__addConnectionTargets(this.__currentConnectionObject);
            }

            this.currentChannelID = null;
            this.wayPoints = [];
            this.source = null;
            this.sinks = [];
            this.__currentConnectionObject = null;
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
            WAYPOINT - 1) Reset the state to __source 2) cleanup features 3) TBA
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

    /**
     * Adds a way point to the connection
     * @param event
     * @param isManhatten
     */
    addWayPoint(event, isManhatten) {
        let connectiontargettoadd;
        let point = MouseTool.getEventPosition(event);
        let isPointOnComponent = this.__isPointOnComponent(point);
        let isPointOnConnection = this.__isPointOnConnection(point);
        let target = ConnectionTool.getTarget(point);
        if (isManhatten && target) {
            //TODO: modify the target to find the orthogonal point
            let lastwaypoint = this.startPoint;
            if (this.wayPoints.length > 0) {
                lastwaypoint = this.wayPoints[this.wayPoints.length - 1];
            }
            target = this.getNextOrthogonalPoint(lastwaypoint, target);
        }
        if (target.length = 2) {
            this.wayPoints.push(target);
        }

        if (isPointOnComponent) {
            //Modify the waypoint to reflect closest port in the future
            let componentport = this.__getClosestComponentPort(isPointOnComponent, this.startPoint, target);
            if (componentport != null) {
                let location = ComponentPort.calculateAbsolutePosition(componentport, isPointOnComponent);
                connectiontargettoadd = new ConnectionTarget(isPointOnComponent, componentport.label);
                this.wayPoints.pop();
                this.lastPoint = location;
            }else {
                connectiontargettoadd = new ConnectionTarget(isPointOnComponent, null);
                this.lastPoint = this.wayPoints.pop();
            }

            //Do this if we want to terminate the connection
            //Check if source is empty
            if(this.source == null){
                //Set is as the source
                // console.log("isPointOnComponent", isPointOnComponent);
                this.source = connectiontargettoadd;
            } else {
                //Add it to the sinks
                this.sinks.push(connectiontargettoadd);
            }
            this.__STATE = "TARGET";
            this.dragging = false;
            this.finishChannel();

        } else if (isPointOnConnection){
            console.log("There is connection at the waypoint path");
            if(this.__currentConnectionObject == null){
                this.__currentConnectionObject = isPointOnConnection;
            }else{
                this.__currentConnectionObject.mergeConnection(isPointOnConnection);
            }
            this.__STATE = "TARGET";
            this.dragging = false;
            this.lastPoint = this.wayPoints.pop();
            this.finishChannel();

        }

    }

    /**
     * Checks if the point coincides with a Connection. Return the Connection associated with the point or returns false
     * @param point
     * @return {boolean} or Connection Object
     * @private
     */
    __isPointOnConnection(point) {
        // console.log("Point to check", point);
        let render = Registry.viewManager.hitFeature(point);
        if(render != false && render != null && render != undefined){
            let feature = Registry.currentDevice.getFeatureByID(render.featureID);
            let connection = Registry.currentDevice.getConnectionByID(feature.referenceID);
            // console.log("Feature that intersects:", feature);
            // console.log("Associated object:", connection);
            return connection;
        }

        return false;
    }

    /**
     * Checks if the point coincides with a component. Return the Component associated with the point or returns false
     * @param point
     * @return {boolean} or Component Object
     * @private
     */
    __isPointOnComponent(point) {
        // console.log("Point to check", point);
        let render = Registry.viewManager.hitFeature(point);
        if(render != false && render != null && render != undefined){
            let feature = Registry.currentDevice.getFeatureByID(render.featureID);
            // console.log("Feature that intersects:", feature);
            let component = Registry.currentDevice.getComponentByID(feature.referenceID);
            // console.log("Associated object:", component);
            if(component != null || component != undefined){
                return component;
            }else{
                return false;
            }
        }

        return false;
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

    /**
     * Checks if the current connection tool object has source and sinks and updates the connection object that is
     * passed as an argument in this method.
     * @private
     */
    __addConnectionTargets(connection) {
        if(this.source != null || this.source != undefined){
            connection.addConnectionTarget(this.source);
        }

        for(let i in this.sinks){
            console.log("Sinks: " ,this.sinks);
            connection.addConnectionTarget(this.sinks[i]);
        }

    }

    /**
     * Returns the closest component port to the given point
     * @param component
     * @param startPoint
     * @param targetPoint This is null in case of the initialzing case
     * @return {ComponentPort}
     * @private
     */
    __getClosestComponentPort(component, startPoint, targetPoint = null) {
        // console.log("Location of startpoint: ",startPoint);
        //Find out if this is on control or flow for now
        //TODO:Change this implementation, currently layer does not have a type setting that maps 1-1 to the componentport layer location
        let closest;
        let layertype = null;
        let dist;
        let gridsize = Registry.currentGrid.getSpacing();
        console.log("Grid Size: ", gridsize);

        if ("control" == Registry.currentLayer.name) {
            layertype = "CONTROL";
            console.log("This layer :", layertype);
        } else if ("flow" == Registry.currentLayer.name) {
            layertype = "FLOW";
            console.log("This layer: ", layertype);
        }
        let componentports = component.ports;
        if (layertype == null) {
            console.warn("Could not find the current layer type, searching through all the component ports without filtering");
        }

        //TODO: Check if the targetPoint and the component port are closer than grid size, if they are just make the connection
        if (targetPoint != null) {
            for(let key of componentports.keys()){
                let componentport = componentports.get(key);
                if (componentport.layer !== layertype){
                    continue;
                }
                let location = ComponentPort.calculateAbsolutePosition(componentport, component);
                let calc = Math.abs(targetPoint[0] - location[0]) + Math.abs(targetPoint[1] - location[1]);
                // let gridsize = 1000; //TODO:Calculate from grid size
                //Check if anything is really really close (use current grid size for now) to the port.
                if(calc <= 3* gridsize){
                    //If the distance is really small then yes fix return it
                    return componentport;
                }
            }

        }

        dist = 1000000000000000;
        closest = null;
        for(let key of componentports.keys()){
            let componentport = componentports.get(key);
            if (componentport.layer !== layertype){
                continue;
            }
            let location = ComponentPort.calculateAbsolutePosition(componentport, component);
            let calc = Math.abs(startPoint[0] - location[0]) + Math.abs(startPoint[1] - location[1]);
            if(calc < dist){
                dist = calc;
                closest = componentport;
            }
        }

        return closest;
    }
}