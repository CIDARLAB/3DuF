import PositionTool from "./positionTool";

import Registry from "../../core/registry";
import Device from "../../core/device";
import { ViewManager } from "@/app";

export default class ControlCellPositionTool extends PositionTool {
    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string, currentParameters = null) {
        super(viewManagerDelegate, typeString, setString, currentParameters);
    }

    createNewFeature(point: paper.Point) {
        const featureIDs = [];

        const currentlevel = Math.floor(Registry.viewManager!.renderLayers.indexOf(Registry.currentLayer!) / 3);
        const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;
        const cell_layer = currentlevel * 3;

        const paramvalues = this.getCreationParameters(point);
        let newFeature = Device.makeFeature(this.typeString, paramvalues);

        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, flowlayer);

        featureIDs.push(newFeature.ID);

        let params_to_copy = newFeature.getParams();

        let newtypestring = this.typeString + "_control";
        let paramstoadd = newFeature.getParams();
        newFeature = Device.makeFeature(newtypestring, paramvalues);
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        controllayer.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        params_to_copy = newFeature.getParams();

        newtypestring = this.typeString + "_cell";
        paramstoadd = newFeature.getParams();
        newFeature = Device.makeFeature(newtypestring, paramvalues);
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        cell_layer.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager?.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager?.updateTarget(this.typeString, this.setString, target, this.currentParameters);
    }
}
