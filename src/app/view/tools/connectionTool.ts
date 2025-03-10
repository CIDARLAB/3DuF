import MouseTool from "./mouseTool";
import Connection from "../../core/connection";
import SimpleQueue from "../../utils/simpleQueue";
import Device from "../../core/device";
import paper from "paper";
import Params from "../../core/params";
import ConnectionTarget from "../../core/connectionTarget";
import ComponentPort from "../../core/componentPort";
import { ComponentAPI } from "@/componentAPI";
import EventBus from "@/events/events";
import { LogicalLayerType, Point, ToolPaperObject } from "@/app/core/init";

import Registry from "../../core/registry";
import MapUtils from "../../utils/mapUtils";
import PositionTool from "./positionTool";
import { ViewManager } from "@/app";

export enum ConnectionToolState {
    PLACE_FIRST_POINT,
    TARGET_PLACED_START_AGAIN,
    PLACE_WAYPOINT, 
    INTERSECTION_AWAITING_USER_INPUT
}

export default class ConnectionTool extends MouseTool {
    typeString: string;
    setString: string;
    startPoint: Point | null;
    lastPoint: Point | null;
    wayPoints: any[];
    currentChannelID: string | null;
    currentTarget: paper.Point | null;
    dragging: boolean;
    source: ConnectionTarget | null;
    sinks: Array<ConnectionTarget>;

    private __currentConnectionObject: Connection | null;
    private __STATE: ConnectionToolState = ConnectionToolState.PLACE_FIRST_POINT;
    showQueue: SimpleQueue;
    updateQueue: SimpleQueue;

    
    public get state() : ConnectionToolState {
        return this.__STATE;
    }
    

    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string) {
        super(viewManagerDelegate);
        this.typeString = typeString;
        this.setString = setString;
        this.startPoint = null;
        this.lastPoint = [0,0];
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
        const ref = this;

        this.showQueue = new SimpleQueue(
            function () {
                if (ref.lastPoint === null) {
                    return;
                }
                ref.showTarget(new paper.Point(ref.lastPoint));
            },
            20,
            false
        );

        this.updateQueue = new SimpleQueue(
            function () {
                ref.updateChannel();
            },
            20,
            false
        );

        this.down = function (event) {
            Registry.viewManager?.killParamsWindow();
            paper.project.deselectAll();
            console.log("Current State:", ref.__STATE);
            switch (ref.__STATE) {
                case ConnectionToolState.PLACE_FIRST_POINT:
                    ref.__STATE = ConnectionToolState.PLACE_WAYPOINT;
                    ref.dragging = true;
                    ref.initChannel();
                    break;
                case ConnectionToolState.PLACE_WAYPOINT:
                    ref.addWayPoint(event as unknown as MouseEvent, (event as any).altKey);
                    break;
                case ConnectionToolState.TARGET_PLACED_START_AGAIN:
                    ref.__STATE = ConnectionToolState.PLACE_WAYPOINT;
                    ref.dragging = true;
                    ref.initChannel();
                    // ref.createConnection();
                    break;
            }
        };

        this.rightdown = function (event) {
            ref.__STATE = ConnectionToolState.TARGET_PLACED_START_AGAIN;
            ref.dragging = false;
            const end = ref.wayPoints.pop();
            ref.lastPoint = end;
            ref.finishChannel();
            EventBus.get().emit(EventBus.RIGHT_CLICK);
        };

        this.move = function (event) {
            // Check if orthogonal
            const point = MouseTool.getEventPosition(event as unknown as MouseEvent);
            if (point === null) return;
            const target = PositionTool.getTarget([point.x, point.y]);

            if ((event as any).altKey && ref.__STATE === ConnectionToolState.PLACE_WAYPOINT) {
                let lastwaypoint = ref.startPoint;
                if (ref.wayPoints.length > 0) {
                    lastwaypoint = ref.wayPoints[ref.wayPoints.length - 1];
                }
                // Check if lastwaypoint is null or not
                if (lastwaypoint === null) {
                    throw new Error("Last waypoint is null");
                }
                // ref.getNextOrthogonalPoint(lastwaypoint, target);
                const orthopoint = ref.getNextOrthogonalPoint(lastwaypoint, target);
                ref.lastPoint = [orthopoint[0], orthopoint[1]];
            } else {
                ref.lastPoint = [target[0], target[1]];
            }
            if (ref.dragging) {
                // This queue basically does the rendering of the connection feature
                ref.updateQueue.run();
            }

            // This queue basically does the rendering of the target
            ref.showQueue.run();
        };
    }

    /**
     * This function renders the cross haired target used to show the mouse position.
     * @param point
     */
    showTarget(point: paper.Point): void  {
        const target = PositionTool.getTarget([point.x, point.y]);
        Registry.viewManager?.updateTarget(this.typeString, this.setString, target);
    }

    initChannel(): void  {
        if (this.lastPoint === null) {
            throw new Error("No last point to init channel");
        }
        const isPointOnComponent = this.__isPointOnComponent(new paper.Point(this.lastPoint));
        const isPointOnConnection = this.__isPointOnConnection(new paper.Point(this.lastPoint));
        this.startPoint = PositionTool.getTarget(this.lastPoint);
        this.lastPoint = this.startPoint;
        if (isPointOnComponent) {
            // Modify the waypoint to reflect closest port in the future
            const componentport = this.__getClosestComponentPort(isPointOnComponent, this.startPoint);
            if (componentport !== null) {
                const location = ComponentPort.calculateAbsolutePosition(componentport, isPointOnComponent);
                this.source = new ConnectionTarget(isPointOnComponent, componentport.label);
                this.startPoint = location;
                this.lastPoint = this.startPoint;
                this.wayPoints.push(location);
            } else {
                this.source = new ConnectionTarget(isPointOnComponent, "");
                this.wayPoints.push(this.startPoint);
            }
        } else if (isPointOnConnection) {
            console.warn("Implement method to make the connection connections");
            // TODO: Find the current connection we are working with and load it into this tools working memory
            this.__currentConnectionObject = isPointOnConnection; // We just use this as the reference
            // TODO: Modify the waypoint to reflect the closest point on connection center spine
            this.wayPoints.push(this.startPoint);
        } else {
            this.wayPoints.push(this.startPoint);
        }
    }

    updateChannel(): void  {
        if (this.lastPoint && this.startPoint) {
            if (this.currentChannelID) {
                const target = PositionTool.getTarget(this.lastPoint);
                const feat = this.viewManagerDelegate.currentLayer?.getFeature(this.currentChannelID);
                feat?.updateParameter("end", target);
                feat?.updateParameter("wayPoints", this.wayPoints);
                feat?.updateParameter("segments", this.generateSegments());
            } else {
                if (this.startPoint === null) {
                    throw new Error("No start point to update the channel");
                }
                const newChannel = this.createChannel(new paper.Point(this.startPoint), new paper.Point(this.startPoint));
                this.currentChannelID = newChannel.ID;
                Registry.viewManager?.addFeature(newChannel);
            }
        }
    }

    /**
     * Finishes the creation of the connection object
     */
    finishChannel(): void  {
        if (this.currentChannelID) {
            this.wayPoints.push(this.lastPoint);
            const feat = this.viewManagerDelegate.currentLayer.getFeature(this.currentChannelID);
            feat?.updateParameter("end", this.lastPoint);
            // feat.updateParameter("wayPoints", this.wayPoints);
            feat?.updateParameter("segments", this.generateSegments());
            // Save the connection object
            const rawparams = feat?.getParams();
            const values: { [k: string]: any } = {};
            for (const key in rawparams) {
                values[key] = rawparams[key].value;
            }
            const definition = ComponentAPI.getDefinition("Connection");
            const params = new Params(values, MapUtils.toMap(definition!.unique), MapUtils.toMap(definition!.heritable));
            if (this.__currentConnectionObject === null || this.__currentConnectionObject === undefined) {
                if (this.viewManagerDelegate.currentLayer.physicalLayer === null) throw new Error("Error: Attempting to add connection on non-physical layer");
                const connection = new Connection("Connection", params, Registry.currentDevice!.generateNewName("CHANNEL"), "CHANNEL", this.viewManagerDelegate.currentLayer.physicalLayer);
                connection.routed = true;
                connection.addFeatureID(feat!.ID);
                connection.addWayPoints(this.wayPoints);
                feat!.referenceID = connection.id;
                this.__addConnectionTargets(connection);
                Registry.currentDevice?.addConnection(connection);
            } else {
                // console.error("Implement conneciton tool to update existing connection");
                // TODO: Update the connection with more sinks and paths and what not
                this.__currentConnectionObject.addFeatureID(feat!.ID);
                feat!.referenceID = this.__currentConnectionObject.id;
                this.__currentConnectionObject.addWayPoints(this.wayPoints);
                feat!.referenceID = this.__currentConnectionObject.id;
                this.__addConnectionTargets(this.__currentConnectionObject);
            }

            this.currentChannelID = null;
            this.wayPoints = [];
            this.source = null;
            this.sinks = [];
            this.__currentConnectionObject = null;
            Registry.viewManager?.saveDeviceState();
        } else {
            console.error("Something is wrong here, unable to finish the connection");
        }

        Registry.viewManager?.saveDeviceState();
    }

    cleanup(): void  {
        console.log("Running Cleanup for the Connection Tool");

        /*
        Step 1 - Check the state
        Step 2 - based on the state do the following
            SOURCE - Do nothing, everything is good
            WAYPOINT - 1) Reset the state to __source 2) cleanup features 3) TBA
            TARGET - Set the state to SOURCE and do nothing else
         */
        switch (this.__STATE) {
            case ConnectionToolState.PLACE_FIRST_POINT:
                console.log("Doing nothing");
                break;
            case ConnectionToolState.PLACE_WAYPOINT:
                console.warn("Paused connection placement midway");

                break;
            case ConnectionToolState.TARGET_PLACED_START_AGAIN:
                this.__STATE = ConnectionToolState.PLACE_FIRST_POINT;
                this.dragging = false;
                break;
        }
    }

    /**
     * Adds a way point to the connection
     * @param event
     * @param isManhatten
     */
    addWayPoint(event: MouseEvent, isManhatten: boolean): void  {
        let connectiontargettoadd;
        const point = MouseTool.getEventPosition(event);
        const isPointOnComponent = this.__isPointOnComponent(point!);
        const isPointOnConnection = this.__isPointOnConnection(point!);
        if (point === null) return;
        let target = PositionTool.getTarget([point.x, point.y]);
        if (isManhatten && target) {
            // TODO: modify the target to find the orthogonal point
            let lastwaypoint = this.startPoint;
            if (this.wayPoints.length > 0) {
                lastwaypoint = this.wayPoints[this.wayPoints.length - 1];
            }
            // Check if the lastwaypoint is null or not
            if (lastwaypoint === null) {
                throw new Error("Target is null");
            }
            target = this.getNextOrthogonalPoint(lastwaypoint, target);
        }
        if (target.length == 2) {
            this.wayPoints.push(target);
        }

        if (isPointOnComponent) {
            // Modify the waypoint to reflect closest port in the future
            if (this.startPoint === null) {
                throw new Error("No start point to update the channel");
            }
            const componentport = this.__getClosestComponentPort(isPointOnComponent, this.startPoint, target);
            if (componentport !== null) {
                const location = ComponentPort.calculateAbsolutePosition(componentport, isPointOnComponent);
                connectiontargettoadd = new ConnectionTarget(isPointOnComponent, componentport.label);
                this.wayPoints.pop();
                this.lastPoint = location;
            } else {
                connectiontargettoadd = new ConnectionTarget(isPointOnComponent, "");
                this.lastPoint = this.wayPoints.pop();
            }

            // Do this if we want to terminate the connection
            // Check if source is empty
            if (this.source === null) {
                // Set is as the source
                // console.log("isPointOnComponent", isPointOnComponent);
                this.source = connectiontargettoadd;
            } else {
                // Add it to the sinks
                this.sinks.push(connectiontargettoadd);
            }
            this.__STATE = ConnectionToolState.TARGET_PLACED_START_AGAIN; // "TARGET";
            this.dragging = false;
            this.finishChannel();
        } else if (isPointOnConnection) {
            console.log("There is connection at the waypoint path");
            if (this.__currentConnectionObject === null) {
                this.__currentConnectionObject = isPointOnConnection;
            } else {
                this.__currentConnectionObject.mergeConnection(isPointOnConnection);
            }
            this.__STATE = ConnectionToolState.TARGET_PLACED_START_AGAIN; //"TARGET";
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
    __isPointOnConnection(point: paper.Point) {
        // console.log("Point to check", point);
        const render = Registry.viewManager?.hitFeature(point as unknown as number[]);
        if (render !== false && render !== null && render !== undefined) {
            let connection;
            const feature = Registry.viewManager?.getFeatureByID(render.featureID);
            // const feature = Registry.currentDevice.getFeatureByID(render.featureID);
            // TODO: Replace this logic
            if (feature!.referenceID === null) {
                return false;
            } else {
                connection = Registry.currentDevice?.getConnectionByID(feature!.referenceID);
            }
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
    __isPointOnComponent(point: paper.Point) {
        // console.log("Point to check", point);
        const render = Registry.viewManager?.hitFeature(point as unknown as number[]);

        if (render !== false && render !== null && render !== undefined) {
            let component;
            const feature = Registry.viewManager?.getFeatureByID(render.featureID);
            // const feature = Registry.currentDevice.getFeatureByID(render.featureID);
            // console.log("Feature that intersects:", feature);
            // TODO: Replace this logic
            if (feature!.referenceID === null) {
                return false;
            } else {
                component = Registry.currentDevice?.getComponentByID(feature!.referenceID);
            }
            // console.log("Associated object:", component);
            if (component !== null || component !== undefined) {
                return component;
            } else {
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
    createChannel(start: paper.Point, end: paper.Point) {
        return Device.makeFeature(this.typeString, {
            start: start,
            end: end,
            wayPoints: this.wayPoints,
            segments: this.generateSegments()
        });
    }

    /**
     * Gets the closes manhatten point to where ever the mouse is
     * @param lastwaypoint
     * @param target
     * @return {*}
     */
    getNextOrthogonalPoint(lastwaypoint: Point, target: Point): Point {
        // Trivial case where target is orthogonal
        if (target[0] === lastwaypoint[0] || target[1] === lastwaypoint[1]) {
            return target;
        }

        const ret: Point = [target[0], target[1]];
        // Find out if the delta x or delta y is smaller and then just 0 the that coordinate
        const delta_x = Math.abs(target[0] - lastwaypoint[0]);
        const delta_y = Math.abs(target[1] - lastwaypoint[1]);
        if (delta_x < delta_y) {
            ret[0] = lastwaypoint[0];
        } else {
            ret[1] = lastwaypoint[1];
        }
        return ret;
    }

    /**
     * Goes through teh waypoints and generates the connection segments
     * @return {Array}
     */
    generateSegments() {
        const waypointscopy = [];
        waypointscopy.push(this.startPoint);
        this.wayPoints.forEach(function (waypoint) {
            waypointscopy.push(waypoint);
        });
        // TODO: Fix this bullshit where teh points are not always arrays
        if (Array.isArray(this.lastPoint)) {
            waypointscopy.push(this.lastPoint);
        } else {
            waypointscopy.push(this.lastPoint);
        }
        // console.log("waypoints", this.wayPoints, this.startPoint);
        const ret = [];
        for (let i = 0; i < waypointscopy.length - 1; i++) {
            const segment = [waypointscopy[i], waypointscopy[i + 1]];
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
    __addConnectionTargets(connection: Connection): void  {
        if (this.source !== null && this.source !== undefined) {
            connection.addConnectionTarget(this.source);
        }

        for (const i in this.sinks) {
            console.log("Sinks: ", this.sinks);
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
    __getClosestComponentPort(component: any, startPoint: Point, targetPoint: Point | null = null) {
        // console.log("Location of startpoint: ",startPoint);
        // Find out if this is on control or flow for now
        // TODO:Change this implementation, currently layer does not have a type setting that maps 1-1 to the componentport layer location
        let closest;
        let layertype = null;
        let dist;
        const gridsize = Registry.currentGrid?.getSpacing();
        console.log("Grid Size: ", gridsize);

        if (this.viewManagerDelegate.currentLayer.type === LogicalLayerType.CONTROL) {
            layertype = "CONTROL";
        } else if (this.viewManagerDelegate.currentLayer.type === LogicalLayerType.FLOW) {
            layertype = "FLOW";
        } else if (this.viewManagerDelegate.currentLayer.type === LogicalLayerType.INTEGRATION) {
            layertype = "INTEGRATION";
        }
        console.log("This layer: ", layertype);
        const componentports = component.ports;
        if (layertype === null) {
            console.warn("Could not find the current layer type, searching through all the component ports without filtering");
        }

        // TODO: Check if the targetPoint and the component port are closer than grid size, if they are just make the connection
        if (targetPoint !== null) {
            for (const key of componentports.keys()) {
                const componentport = componentports.get(key);
                if (componentport.layer !== layertype) {
                    continue;
                }
                const location = ComponentPort.calculateAbsolutePosition(componentport, component);
                const calc = Math.abs(targetPoint[0] - location[0]) + Math.abs(targetPoint[1] - location[1]);
                // let gridsize = 1000; //TODO:Calculate from grid size
                // Check if anything is really really close (use current grid size for now) to the port.
                if (calc <= 3 * gridsize!) {
                    // If the distance is really small then yes fix return it
                    return componentport;
                }
            }
        }

        dist = 1000000000000000;
        closest = null;
        for (const key of componentports.keys()) {
            const componentport = componentports.get(key);
            if (componentport.layer !== layertype) {
                continue;
            }
            const location = ComponentPort.calculateAbsolutePosition(componentport, component);
            const calc = Math.abs(startPoint[0] - location[0]) + Math.abs(startPoint[1] - location[1]);
            if (calc < dist) {
                dist = calc;
                closest = componentport;
            }
        }

        return closest;
    }

    /**
     * Updates the parameters of the connection object
     *
     * @param {string} parameter
     * @param {*} value
     * @memberof ConnectionTool
     */
    updateParameter(parameter: string, value: any): void  {  
        if(this.currentChannelID !== null){
            const feat = this.viewManagerDelegate.currentLayer.getFeature(this.currentChannelID);
            feat?.updateParameter(parameter, value);
        }
    }
}
