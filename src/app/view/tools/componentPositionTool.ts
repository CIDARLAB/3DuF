import PositionTool from "./positionTool";
import Registry from "../../core/registry";
import Device from "../../core/device";
import ViewManager from "@/app/view/viewManager";
import paper from "paper";

export default class ComponentPositionTool extends PositionTool {
    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string, currentParams: { [k: string]: any } | null = null) {
        super(viewManagerDelegate, typeString, currentParams);
    }

    createNewFeature(point: paper.Point) {
        const featureIDs = [];

        const paramvalues = this.getCreationParameters(point);
        const newFeature = Device.makeFeature(this.typeString, paramvalues);
        this.currentFeatureID = newFeature.ID;

        this.viewManagerDelegate.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();
        console.log("TS: ", super.typeString);
        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager?.saveDeviceState();
    }
}
