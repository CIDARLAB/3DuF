import MultilayerPositionTool from "./multilayerPositionTool";

var Registry = require("../../core/registry");
import Feature from '../../core/feature';
import MouseTool from './mouseTool';
import PositionTool from "./positionTool";

export default class ValveInsertionTool extends MultilayerPositionTool{
    constructor(typeString, setString, is3D = false){
        super(typeString, setString);
        this.is3D = is3D;

        let ref = this;

        this.down = function (event) {
            let point = MouseTool.getEventPosition(event);
            let target = PositionTool.getTarget(point);
            //Check if connection exists at point
            let connection = ref.checkIfConnectionExistsAt(target);
            //if connection exists then place the valve
            if(connection){
                ref.insertValve(point, connection);
            }else{
                //Send out error message
                console.log("Could not find connection at this location");
            }

        }
    }

    createNewFeature(point, rotation){
        let featureIDs = [];
        let currentlevel = Math.floor(Registry.currentDevice.layers.indexOf(Registry.currentLayer)/3);
        let controllayer = Registry.currentDevice.layers[currentlevel * 3 + 1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point),
            "rotation": rotation
        });
        this.currentFeatureID = newFeature.getID();

        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        super.createNewComponent(this.typeString, params_to_copy, featureIDs );

    }

    createNewMultiLayerFeature(point, rotation){
        let featureIDs = [];
        let currentlevel = Math.floor(Registry.currentDevice.layers.indexOf(Registry.currentLayer)/3);
        let flowlayer = Registry.currentDevice.layers[currentlevel * 3 + 0];
        let controllayer = Registry.currentDevice.layers[currentlevel * 3 + 1];

        let newFeature = Feature.makeFeature(this.typeString, this.setString, {
            "position": PositionTool.getTarget(point),
            "rotation": rotation
        });
        this.currentFeatureID = newFeature.getID();
        flowlayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        let newtypestring = this.typeString + "_control";
        let paramstoadd = newFeature.getParams();
        newFeature = Feature.makeFeature(newtypestring, this.setString, {
            "position": PositionTool.getTarget(point),
            "rotation": rotation
        });
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.getID();
        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        super.createNewComponent(this.typeString, params_to_copy, featureIDs );
    }

    showTarget(){
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    checkIfConnectionExistsAt(target) {
        let hit = Registry.viewManager.view.hitFeature(target);
        //TODO: check if the hit feature belongs to a connection
        return hit;
    }

    insertValve(point, connection) {
        let rotation = this.__getRotation(point, connection);
        if(this.is3D){
            //TODO: Insert the valve features in both flow and control
            this.createNewMultiLayerFeature(point, rotation);
            //TODO: Redraw the connection
        }else {
            //TODO: Insert the valve feature in flow
            this.createNewFeature(point, rotation);
        }
    }

    __getRotation(point, connection) {
        return 90;
    }
}

