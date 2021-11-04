import PositionTool from "./positionTool";

import Registry from "../../core/registry";
import Device from "../../core/device";
import ViewManager from "@/app/view/viewManager";
export default class CellPositionTool extends PositionTool {
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

        const params_to_copy = newFeature.getParams();

        const newtypestring = this.typeString + "_cell";
        const paramstoadd = newFeature.getParams();
        newFeature = Device.makeFeature(newtypestring, paramvalues);
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, cell_layer);
        featureIDs.push(newFeature.ID);

        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager!.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters);
    }
}
