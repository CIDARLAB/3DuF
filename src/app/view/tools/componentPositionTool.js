import PositionTool from "./positionTool";
import * as Registry from "../../core/registry";
import Device from "../../core/device";

export default class ComponentPositionTool extends PositionTool {
    constructor(typeString, setString) {
        super(typeString, setString);
    }

    createNewFeature(point) {
        let featureIDs = [];

        let newFeature = Device.makeFeature(this.typeString, this.setString, {
            position: PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();

        Registry.currentLayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }
}
