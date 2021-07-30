import PositionTool from "./positionTool";

import Registry from "../../core/registry";
import Device from "../../core/device";

export default class ControlCellPositionTool extends PositionTool {
    constructor(typeString, setString) {
        super(typeString, setString);
    }

    createNewFeature(point) {
        const featureIDs = [];

        const currentlevel = Math.floor(Registry.currentDevice.layers.indexOf(Registry.currentLayer) / 3);
        const flowlayer = Registry.currentDevice.layers[currentlevel * 3 + 0];
        const controllayer = Registry.currentDevice.layers[currentlevel * 3 + 1];
        const cell_layer = Registry.currentDevice.layers[currentlevel * 3 + 2];

        let newFeature = Device.makeFeature(this.typeString, {
            position: PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.ID;
        flowlayer.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        let params_to_copy = newFeature.getParams();

        let newtypestring = this.typeString + "_control";
        let paramstoadd = newFeature.getParams();
        newFeature = Device.makeFeature(newtypestring, {
            position: PositionTool.getTarget(point)
        });
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        params_to_copy = newFeature.getParams();

        newtypestring = this.typeString + "_cell";
        paramstoadd = newFeature.getParams();
        newFeature = Device.makeFeature(newtypestring, {
            position: PositionTool.getTarget(point)
        });
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        cell_layer.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}
