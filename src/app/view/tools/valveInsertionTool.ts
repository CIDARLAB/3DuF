import MultilayerPositionTool from "./multilayerPositionTool";

import Registry from "../../core/registry";
import Device from "../../core/device";
import MouseTool, { MouseToolCallback } from "./mouseTool";
import PositionTool from "./positionTool";
import paper from "paper";
import ViewManager from "@/app/view/viewManager";
import Connection from "@/app/core/connection";
import Component from "@/app/core/component";
import { ValveType } from "@/app/core/init";
import { ComponentAPI } from "@/componentAPI";

export default class ValveInsertionTool extends MultilayerPositionTool {
    valveType: ValveType;

    /**
     * Creates an instance of ValveInsertionTool.
     * @param {ViewManager} viewManagerDelegate
     * @param {string} mintstring
     * @param {string} setString
     * @param {{ [k: string]: any }} currentParameters
     * @param {ValveType} [valveType=ValveType.NORMALLY_OPEN]
     * @memberof ValveInsertionTool
     */
    constructor(viewManagerDelegate: ViewManager, mintstring: string, setString: string, currentParameters: { [k: string]: any }, valveType: ValveType = ValveType.NORMALLY_OPEN) {
        const threeduftype = ComponentAPI.getTypeForMINT(mintstring);
        if (!threeduftype) {
            throw new Error("Could not find type for MINT type " + mintstring);
        }
        super(viewManagerDelegate, threeduftype, setString, currentParameters);
        // Keep VALVE3D placement semantics aligned with legacy behavior:
        // the NC valve gap should be perpendicular to the hosting connection.
        this.valveType = mintstring.toUpperCase() === "VALVE3D"
            ? ValveType.NORMALLY_CLOSED
            : valveType;

        const ref = this;

        this.down = function (event: MouseEvent) {
            console.log(event);
            const point = MouseTool.getEventPosition(event);
            if (point === null) return;
            const target = PositionTool.getTarget([point.x, point.y]);
            // Check if connection exists at point
            const connection = ref.checkIfConnectionExistsAt(new paper.Point(target[0], target[1]));
            // if connection exists then place the valve
            if (connection) {
                ref.insertValve(point!, connection);
            } else if ((event as any).ctrlKey || (event as any).metaKey) {
                // Forced placement of the Valve
                console.warn("Forcing placement of valve, a lot of things will not work correct if done this way");
                ref.forceInsertValve(point!);
            } else {
                // Send out error message
                console.log("Could not find connection at this location");
            }
        };
    }

    /**
     * Places the component (single layer for plain VALVE; for VALVE3D also drops a matching FLOW
     * feature so the placed valve renders the same blue-crescent geometry as the placement preview).
     * @param point
     * @param rotation
     * @return {Component}
     */
    createNewFeature(point: paper.Point, rotation: number | null = null): Component {
        const featureIDs = [];
        let overridedata;

        if (rotation) {
            overridedata = {
                position: PositionTool.getTarget([point.x, point.y]),
                rotation: rotation
            };
        } else {
            overridedata = {
                position: PositionTool.getTarget([point.x, point.y])
            };
        }

        const currentlevel = Math.floor(this.viewManagerDelegate!.renderLayers.indexOf(this.viewManagerDelegate.currentLayer) / 3);
        const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;
        // const intlayer = currentlevel * 3 + 2;

        const controlFeature = Device.makeFeature(this.typeString, overridedata);
        this.currentFeatureID = controlFeature.ID;

        this.viewManagerDelegate.addFeature(controlFeature, controllayer);

        featureIDs.push(controlFeature.ID);

        const params_to_copy = controlFeature.getParams();

        // For VALVE3D the placement preview (render2DTarget) shows the FLOW geometry (two blue
        // crescents with a gap). To keep that geometry visible after placement, also add a FLOW
        // layer feature using the explicit flow-library type.
        if (ComponentAPI.library[this.typeString]?.object.mint === "VALVE3D" && ComponentAPI.library.Valve3D) {
            const flowFeature = Device.makeFeature("Valve3D", overridedata);
            this.viewManagerDelegate.addFeature(flowFeature, flowlayer);
            featureIDs.push(flowFeature.ID);
        }

        const component = super.createNewComponent(this.typeString, params_to_copy, featureIDs);

        return component;
    }

    /**
     * Places the component (multi-layer)
     * @param point
     * @param rotation
     * @return {Component}
     */
    createNewMultiLayerFeature(point: paper.Point, rotation: number | null = null): Component {
        const featureIDs = [];
        let overridedata;

        if (rotation) {
            overridedata = {
                position: PositionTool.getTarget([point.x, point.y]),
                rotation: rotation
            };
        } else {
            overridedata = {
                position: PositionTool.getTarget([point.x, point.y])
            };
        }

        const currentlevel = Math.floor(Registry.viewManager!.renderLayers.indexOf(this.viewManagerDelegate.currentLayer) / 3);
        const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;

        // Flow layer uses explicit FLOW library type so rendering/colors match fluid preview (not Valve3D_control on flow).
        let newFeature = Device.makeFeature("Valve3D", overridedata);
        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, flowlayer);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        const newtypestring = this.typeString === "Valve3D" ? "Valve3D_control" : this.typeString;
        const paramstoadd = newFeature.getParams();
        newFeature = Device.makeFeature(newtypestring, overridedata);
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, controllayer);

        featureIDs.push(newFeature.ID);

        const component = super.createNewComponent(this.typeString, params_to_copy, featureIDs);

        return component;
    }

    /**
     * Shows the target
     */
    showTarget(): void  {
        if (this.lastPoint === null) {
            return;
        }
        const target = PositionTool.getTarget(this.lastPoint);
        this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters!);
    }

    /**
     * Checks if the connection exists at the point where the user clicks
     * @param target
     * @return {*}
     */
    checkIfConnectionExistsAt(target: paper.Point): Connection | null {
        const hit = Registry.viewManager!.view.hitFeature(target, false);
        // TODO: check if the hit feature belongs to a connection
        if (hit) {
            const connection = Registry.currentDevice!.getConnectionForFeatureID(hit.featureID);
            return connection;
        }

        return null;
    }

    /**
     * Inserts the valve at the point on the connection
     * @param point
     * @param connection
     */
    insertValve(point: paper.Point, connection: Connection): void  {
        let angle = this.__getRotation(point, connection);
        if (angle < 0) {
            angle += 180;
        }

        let component: Component;

        // TODO: Enable this.is3D functionality
        if (this.valveType === ValveType.NORMALLY_OPEN) {
            component = this.createNewFeature(point, angle);
            this.viewManagerDelegate.currentDevice!.insertValve(component, connection, this.valveType);
        } else if (this.valveType === ValveType.NORMALLY_CLOSED) {
            angle += 90;
            component = this.createNewMultiLayerFeature(point, angle);
            this.viewManagerDelegate.currentDevice!.insertValve(component, connection, this.valveType);
        }
        // Cut the channel where the valve sits so the FLOW geometry (two crescents with a gap)
        // remains visible — without this break the connection still fills the gap and the valve
        // looks like a solid filled circle on the FLOW layer.
        try {
            Registry.viewManager!.updatesConnectionRender(connection);
        } catch (err) {
            console.warn("Could not break connection at valve placement:", err);
        }
        Registry.viewManager!.saveDeviceState();
    }

    /**
     * Inserts the valve at the point on the connection
     * @param point
     * @param connection
     */
    forceInsertValve(point: paper.Point): void  {
        let component;
        if (this.typeString == "Valve3D") {
            // TODO: Insert the valve features in both flow and control
            component = this.createNewMultiLayerFeature(point);
            // TODO: Redraw the connection
        } else {
            // TODO: Insert the valve feature in flow
            component = this.createNewFeature(point);
        }

        Registry.viewManager!.saveDeviceState();
    }

    /**
     * Generates the rotation for the valve when placed on the connection
     * @param point
     * @param connection
     * @return {*}
     * @private
     */
    __getRotation(point: paper.Point, connection: Connection) {
        // Find closes normal intersection of the point and place the
        let conn_waypoints;
        let lowestdist = 1000000000000000000000;
        let p0: number[], p1: number[], sol: number;
        const paths = connection.getPaths();
        const waypoints = [];
        for (const j in paths) {
            conn_waypoints = paths[j];
            // conn_waypoints = connection.getValue("wayPoints");
            for (let i = 0; i < conn_waypoints.length; i++) {
                waypoints.push(conn_waypoints[i]);
            }

            // Find out which segment the point is on
            for (let i = 0; i < waypoints.length - 1; i++) {
                p0 = waypoints[i];
                p1 = waypoints[i + 1];

                const tempdist = this.__calculateNormalDistance(point, p0, p1);
                if (tempdist < lowestdist || i === 0) {
                    sol = i;
                    lowestdist = tempdist;
                }
            }

            p0 = waypoints[sol!];
            p1 = waypoints[sol! + 1];
        }
        // waypoints.splice(0, 0, connection.getValue("start"));

        const to = new paper.Point(p0![0], p0![1]);
        const from = new paper.Point(p1![0], p1![1]);
        const vec = from.subtract(to);

        return vec.angle;
    }

    /**
     * Calculates normal distance
     * @param point
     * @param p0
     * @param p1
     * @private
     */
    __calculateNormalDistance(point: paper.Point, p0: number[], p1: number[]) {
        const line = new paper.Path.Line(new paper.Point(p0[0], p0[1]), new paper.Point(p1[0], p1[1]));
        const target = new paper.Point(point.x, point.y);
        const closestpt = line.getNearestPoint(target);
        const dist = closestpt.getDistance(point);
        return dist;
    }
}
