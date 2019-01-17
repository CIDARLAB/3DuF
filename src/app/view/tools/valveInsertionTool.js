import MultilayerPositionTool from "./multilayerPositionTool";

const Registry = require("../../core/registry");
import Feature from '../../core/feature';
import MouseTool from './mouseTool';
import PositionTool from "./positionTool";
import paper from 'paper';

export default class ValveInsertionTool extends MultilayerPositionTool{
    constructor(typeString, setString, is3D = false){
        super(typeString, setString);
        this.is3D = is3D;

        let ref = this;

        this.down = function (event) {
            console.log(event);
            let point = MouseTool.getEventPosition(event);
            let target = PositionTool.getTarget(point);
            //Check if connection exists at point
            let connection = ref.checkIfConnectionExistsAt(target);
            //if connection exists then place the valve
            if(connection){
                ref.insertValve(point, connection);
            }else if(event.ctrlKey || event.metaKey){
                //Forced placement of the Valve
                console.warn("Forcing placement of valve, a lot of things will not work correct if done this way");
                ref.forceInsertValve(point);
            }
            else{
                //Send out error message
                console.log("Could not find connection at this location");
            }

        }
    }

    /**
     * Places the component (single layer)
     * @param point
     * @param rotation
     * @return {Component}
     */
    createNewFeature(point, rotation = null){
        let featureIDs = [];
        let overridedata;

        if(rotation){
            overridedata = {
                "position": PositionTool.getTarget(point),
                "rotation": rotation
            };
        }else{
            overridedata = {
                "position": PositionTool.getTarget(point)
            };
        }

        let currentlevel = Math.floor(Registry.currentDevice.layers.indexOf(Registry.currentLayer)/3);
        let controllayer = Registry.currentDevice.layers[currentlevel * 3 + 1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, overridedata);
        this.currentFeatureID = newFeature.getID();

        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        let component = super.createNewComponent(this.typeString, params_to_copy, featureIDs );

        return component
    }

    /**
     * Places the component (multi-layer)
     * @param point
     * @param rotation
     * @return {Component}
     */
    createNewMultiLayerFeature(point, rotation = null){
        let featureIDs = [];
        let overridedata;

        if(rotation){
           overridedata = {
               "position": PositionTool.getTarget(point),
               "rotation": rotation
           };
        }else{
            overridedata = {
                "position": PositionTool.getTarget(point)
            };
        }

        let currentlevel = Math.floor(Registry.currentDevice.layers.indexOf(Registry.currentLayer)/3);
        let flowlayer = Registry.currentDevice.layers[currentlevel * 3 + 0];
        let controllayer = Registry.currentDevice.layers[currentlevel * 3 + 1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, overridedata);
        this.currentFeatureID = newFeature.getID();
        flowlayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        let newtypestring = this.typeString + "_control";
        let paramstoadd = newFeature.getParams();
        newFeature = Feature.makeFeature(newtypestring, this.setString, overridedata);
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.getID();
        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let component  = super.createNewComponent(this.typeString, params_to_copy, featureIDs );

        return component;
    }

    /**
     * Shows the target
     */
    showTarget(){
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    /**
     * Checks if the connection exists at the point where the user clicks
     * @param target
     * @return {*}
     */
    checkIfConnectionExistsAt(target) {
        let hit = Registry.viewManager.view.hitFeature(target, false);
        //TODO: check if the hit feature belongs to a connection
        if(hit){
            let connection = Registry.currentDevice.getConnectionForFeatureID(hit.featureID);
            return connection;
        }

        return hit;
    }

    /**
     * Inserts the valve at the point on the connection
     * @param point
     * @param connection
     */
    insertValve(point, connection) {
        let angle = this.__getRotation(point, connection);
        if(angle < 0){
            angle+=180;
        }

        let component;
        if(this.is3D){
            angle+=90;
            //TODO: Insert the valve features in both flow and control
            component = this.createNewMultiLayerFeature(point, angle);
            //TODO: Redraw the connection
        }else {
            //TODO: Insert the valve feature in flow
            component = this.createNewFeature(point, angle);
        }

        Registry.currentDevice.insertValve(component, connection);
        Registry.viewManager.updatesConnectionRender(connection);
        Registry.viewManager.saveDeviceState();

    }

    /**
     * Inserts the valve at the point on the connection
     * @param point
     * @param connection
     */
    forceInsertValve(point) {

        let component;
        if(this.is3D){
            //TODO: Insert the valve features in both flow and control
            component = this.createNewMultiLayerFeature(point);
            //TODO: Redraw the connection
        }else {
            //TODO: Insert the valve feature in flow
            component = this.createNewFeature(point);
        }

        Registry.viewManager.saveDeviceState();

    }

    /**
     * Generates the rotation for the valve when placed on the connection
     * @param point
     * @param connection
     * @return {*}
     * @private
     */
    __getRotation(point, connection) {
        //Find closes normal intersection of the point and place the
        let conn_waypoints;
        let lowestdist = 1000000000000000000000;
        let p0, p1, sol;
        let paths = [] = connection.getPaths();
        let waypoints = [];
        for (let j in paths) {
            conn_waypoints = paths[j];
            //conn_waypoints = connection.getValue("wayPoints");
            for(let i = 0; i < conn_waypoints.length; i++ ){
                waypoints.push(conn_waypoints[i]);
            }

            //Find out which segment the point is on
            for(let i = 0 ; i < waypoints.length -1 ; i++){
                p0 = waypoints[i];
                p1 = waypoints[i+1];

                let tempdist = this.__calculateNormalDistance(point, p0, p1);
                if(tempdist < lowestdist || i === 0){
                    sol = i;
                    lowestdist = tempdist;
                }
            }

            p0 = waypoints[sol];
            p1 = waypoints[sol+1];

        }
        // waypoints.splice(0, 0, connection.getValue("start"));


        let to = new paper.Point(p0[0], p0[1]);
        let from = new paper.Point(p1[0], p1[1]);
        let vec = from.subtract(to);

        return vec.angle;
    }

    /**
     * Calculates normal distance
     * @param point
     * @param p0
     * @param p1
     * @private
     */
    __calculateNormalDistance(point, p0, p1) {
        let line = new paper.Path.Line(new paper.Point(p0[0], p0[1]), new paper.Point(p1[0], p1[1]));
        let target = new paper.Point(point.x, point.y);
        let closestpt = line.getNearestPoint(target);
        let dist = closestpt.getDistance(point);
        return dist;
    }
}

