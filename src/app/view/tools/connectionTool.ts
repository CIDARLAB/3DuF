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
    /** Heritable Connection parameter: 0 = square ends / CHANNEL, 1 = rounded stadium / ROUNDED CHANNEL */
    crossSection: number;
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
        this.crossSection = 0;

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
                    EventBus.get().emit(EventBus.CONNECTION_ESC_HINT, true);
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
            const componentport = this.__getClosestComponentPort(isPointOnComponent, this.startPoint, this.startPoint);
            if (componentport !== null) {
                const location = this.__portTerminal(isPointOnComponent, componentport);
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
         * Leaving the connection tool (e.g. sidebar deselect): keep any channel geometry already on the canvas
         * (finished segments and in-progress drafts). Clear only in-memory routing state so the next activation
         * starts from PLACE_FIRST_POINT and the user must pick a new start for another path.
         */
        switch (this.__STATE) {
            case ConnectionToolState.PLACE_FIRST_POINT:
                break;
            case ConnectionToolState.PLACE_WAYPOINT:
                // Drop edit handle to the in-progress feature but do NOT remove it from the layer — keeps preview polyline.
                this.dragging = false;
                this.currentChannelID = null;
                this.wayPoints = [];
                this.startPoint = null;
                this.lastPoint = [0, 0];
                this.source = null;
                this.sinks = [];
                this.__currentConnectionObject = null;
                this.__STATE = ConnectionToolState.PLACE_FIRST_POINT;
                break;
            case ConnectionToolState.TARGET_PLACED_START_AGAIN:
                this.__STATE = ConnectionToolState.PLACE_FIRST_POINT;
                this.dragging = false;
                break;
            default:
                this.__STATE = ConnectionToolState.PLACE_FIRST_POINT;
                this.dragging = false;
                break;
        }
        EventBus.get().emit(EventBus.CONNECTION_ESC_HINT, false);
        Registry.viewManager?.removeTarget();
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
        const clickTarget = target;
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
        const approachPoint =
            this.wayPoints.length > 0 ? this.wayPoints[this.wayPoints.length - 1] : this.startPoint;
        if (target.length == 2) {
            this.wayPoints.push(target);
        }

        if (isPointOnComponent) {
            if (this.startPoint === null || approachPoint === null) {
                throw new Error("No start point to update the channel");
            }
            const componentport = this.__getClosestComponentPort(isPointOnComponent, approachPoint, clickTarget);
            if (componentport !== null) {
                const location = this.__portTerminal(isPointOnComponent, componentport);
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
            segments: this.generateSegments(),
            crossSection: this.crossSection
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
     * Snap to a component port using the same rule for every primitive:
     * a channel approaching from the left docks at the left-facing port, from the
     * right at the right-facing port, and so on. Clicking the body (often the
     * center) must not fall back to insertion order — that always picked the
     * top port on a chamber.
     *
     * If the click is uniquely close to one port, that click wins; otherwise the
     * port that faces `approachPoint` (incoming waypoint, or the click when
     * starting) is used.
     */
    __getClosestComponentPort(component: any, approachPoint: Point, clickPoint: Point | null = null) {
        const located = this.__locatedPortsOnCurrentLayer(component);
        if (located.length === 0) {
            return null;
        }

        if (clickPoint !== null) {
            const aimed = this.__uniquelyClosestPort(located, clickPoint, component);
            if (aimed !== null) {
                return aimed;
            }
        }

        return this.__portFacingPoint(component, located, approachPoint);
    }

    private __currentConnectionLayer(): string | null {
        if (this.viewManagerDelegate.currentLayer.type === LogicalLayerType.CONTROL) {
            return "CONTROL";
        }
        if (this.viewManagerDelegate.currentLayer.type === LogicalLayerType.FLOW) {
            return "FLOW";
        }
        if (this.viewManagerDelegate.currentLayer.type === LogicalLayerType.INTEGRATION) {
            return "INTEGRATION";
        }
        return null;
    }

    private __locatedPortsOnCurrentLayer(component: any): Array<{ port: any; loc: Point }> {
        const layertype = this.__currentConnectionLayer();
        if (layertype === null) {
            console.warn("Could not find the current layer type, searching through all the component ports without filtering");
        }
        const located: Array<{ port: any; loc: Point }> = [];
        for (const key of component.ports.keys()) {
            const port = component.ports.get(key);
            if (layertype !== null && port.layer !== layertype) {
                continue;
            }
            located.push({
                port,
                loc: ComponentPort.calculateAbsolutePosition(port, component)
            });
        }
        return located;
    }

    private __componentSpan(component: any): number {
        try {
            const bounds = component.getBoundingRectangle();
            return Math.max(bounds.width, bounds.height, 1);
        } catch {
            return 1000;
        }
    }

    /**
     * Honor a click only when it is clearly nearer one port than the next.
     * A click on the body/center is a near-tie and must not pick the top port.
     */
    private __uniquelyClosestPort(
        located: Array<{ port: any; loc: Point }>,
        clickPoint: Point,
        component: any
    ) {
        if (located.length === 1) {
            return located[0].port;
        }
        const ranked = [...located].sort(
            (a, b) => this.__euclidean(clickPoint, a.loc) - this.__euclidean(clickPoint, b.loc)
        );
        const uniqueMargin = Math.max(this.__componentSpan(component) * 0.15, 1);
        if (this.__euclidean(clickPoint, ranked[1].loc) - this.__euclidean(clickPoint, ranked[0].loc) > uniqueMargin) {
            return ranked[0].port;
        }
        return null;
    }

    /**
     * Port whose direction from the component center best matches the direction
     * from the center to `referencePoint` (incoming channel or start click).
     */
    private __portFacingPoint(
        component: any,
        located: Array<{ port: any; loc: Point }>,
        referencePoint: Point
    ) {
        let center: Point;
        try {
            center = component.getCenterPosition();
        } catch {
            center = referencePoint;
        }
        const vx = referencePoint[0] - center[0];
        const vy = referencePoint[1] - center[1];
        const vlen = Math.hypot(vx, vy);

        let best = located[0];
        let bestScore = Number.NEGATIVE_INFINITY;
        let bestDist = Number.POSITIVE_INFINITY;
        for (const item of located) {
            const dist = this.__euclidean(referencePoint, item.loc);
            const px = item.loc[0] - center[0];
            const py = item.loc[1] - center[1];
            const plen = Math.hypot(px, py);
            const score =
                vlen < 1e-6 || plen < 1e-6 ? -dist : (px * vx + py * vy) / (plen * vlen);
            if (score > bestScore + 1e-9 || (Math.abs(score - bestScore) <= 1e-9 && dist < bestDist)) {
                bestScore = score;
                bestDist = dist;
                best = item;
            }
        }
        return best.port;
    }

    private __euclidean(a: Point, b: Point): number {
        return Math.hypot(a[0] - b[0], a[1] - b[1]);
    }

    /**
     * Channel endpoint on a component port: the absolute port, then inset
     * into the body by half the channel width so square channels overlap
     * the opening instead of sharing a zero-width edge.
     */
    private __portTerminal(component: any, componentport: any): Point {
        const abs = ComponentPort.calculateAbsolutePosition(componentport, component);
        return ComponentPort.insetTowardCenter(abs, component, this.__channelOverlap());
    }

    private __channelOverlap(): number {
        const defaults = ComponentAPI.getDefaultsForType(this.typeString) || {};
        const width = Number(defaults.channelWidth ?? 800);
        return Math.max(width / 2, 16);
    }

    /**
     * Updates the parameters of the connection object
     *
     * @param {string} parameter
     * @param {*} value
     * @memberof ConnectionTool
     */
    updateParameter(parameter: string, value: any): void  {  
        if (parameter === "crossSection") {
            this.crossSection = Number(value);
        }
        if(this.currentChannelID !== null){
            const feat = this.viewManagerDelegate.currentLayer.getFeature(this.currentChannelID);
            feat?.updateParameter(parameter, value);
        }
    }
}
