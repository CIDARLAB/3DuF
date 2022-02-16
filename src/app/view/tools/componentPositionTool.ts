import PositionTool from "./positionTool";
import Registry from "../../core/registry";
import Device from "../../core/device";
import ViewManager from "@/app/view/viewManager";
import paper from "paper";
import Parameter from "@/app/core/parameter";

export default class ComponentPositionTool extends PositionTool {
    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string, currentParams: { [k: string]: any } | null = null) {
        super(viewManagerDelegate, typeString, currentParams);
    }

    createNewFeature(point: paper.Point) {
        const featureIDs = [];

        const paramvalues = this.getCreationParameters(new paper.Point(0, 0));
        const newFeature = Device.makeFeature(this.typeString, paramvalues);
        this.currentFeatureID = newFeature.ID;

        this.viewManagerDelegate.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();
        params_to_copy["position"] = new Parameter("position", [point.x, point.y]);
        console.log("params_to_copy: ", params_to_copy);
        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager?.saveDeviceState();
    }
}
