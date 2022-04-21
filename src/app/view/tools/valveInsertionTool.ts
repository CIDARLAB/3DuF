import MultilayerPositionTool from "./multilayerPositionTool";

import Registry from "../../core/registry";
import Device from "../../core/device";
import MouseTool, { MouseToolCallback } from "./mouseTool";
import PositionTool from "./positionTool";
import paper from "paper";
import ViewManager from "@/app/view/viewManager";
import { paperObject } from "@/app/core/init";
import Connection from "@/app/core/connection";
import Component from "@/app/core/component";

export default class ValveInsertionTool extends MultilayerPositionTool {
    is3D: boolean;

    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string, currentParameters: { [k: string]: any }, is3D = false) {
        super(viewManagerDelegate, typeString, setString, currentParameters);
        this.is3D = is3D;

        const ref = this;

        this.down = function (event) {
            console.log(event);
            const point = MouseTool.getEventPosition(event as unknown as MouseEvent);
            if (point == null) return;
            const target = PositionTool.getTarget([point.x, point.y]);
            // Check if connection exists at point
            const connection = ref.checkIfConnectionExistsAt(target as unknown as paper.Point);
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
     * Places the component (single layer)
     * @param point
     * @param rotation
     * @return {Component}
     */
    createNewFeature(point: paper.Point, rotation: number | null = null) {
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

        const currentlevel = Math.floor(Registry.viewManager!.renderLayers.indexOf(Registry.currentLayer!) / 3);
        // const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;
        // const intlayer = currentlevel * 3 + 2;

        const newFeature = Device.makeFeature(this.typeString, overridedata);
        this.currentFeatureID = newFeature.ID;

        this.viewManagerDelegate.addFeature(newFeature, controllayer);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        const component = super.createNewComponent(this.typeString, params_to_copy, featureIDs);

        return component;
    }

    /**
     * Places the component (multi-layer)
     * @param point
     * @param rotation
     * @return {Component}
     */
    createNewMultiLayerFeature(point: paper.Point, rotation: number | null = null) {
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

        const currentlevel = Math.floor(Registry.viewManager!.renderLayers.indexOf(Registry.currentLayer!) / 3);
        const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;

        let newFeature = Device.makeFeature(this.typeString, overridedata);
        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, flowlayer);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        const newtypestring = this.typeString + "_control";
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
    showTarget() {
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
    checkIfConnectionExistsAt(target: paper.Point) {
        const hit = Registry.viewManager!.view.hitFeature(target, false);
        // TODO: check if the hit feature belongs to a connection
        if (hit) {
            const connection = Registry.currentDevice!.getConnectionForFeatureID(hit.featureID);
            return connection;
        }

        return hit;
    }

    /**
     * Inserts the valve at the point on the connection
     * @param point
     * @param connection
     */
    insertValve(point: paper.Point, connection: Connection) {
        let angle = this.__getRotation(point, connection);
        if (angle < 0) {
            angle += 180;
        }

        let component: Component;

        // TODO: Enable this.is3D functionality
        if (this.typeString == "Valve") {
            component = this.createNewFeature(point, angle);
            Registry.currentDevice!.insertValve(component, connection as any, this.is3D);
        } else if (this.typeString == "Valve3D") {
            angle += 90;
            component = this.createNewMultiLayerFeature(point, angle);
            Registry.currentDevice!.insertValve(component, connection as any, this.is3D);
        }
        Registry.viewManager!.updatesConnectionRender(connection);
        Registry.viewManager!.saveDeviceState();
    }

    /**
     * Inserts the valve at the point on the connection
     * @param point
     * @param connection
     */
    forceInsertValve(point: paper.Point) {
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
        const paths =  (connection as any).getPaths();
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
