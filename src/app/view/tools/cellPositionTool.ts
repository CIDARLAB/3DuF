import PositionTool from "./positionTool";
import paper from "paper";
import Registry from "../../core/registry";
import Device from "../../core/device";
import ViewManager from "@/app/view/viewManager";
import Parameter from "../../core/parameter";
export default class CellPositionTool extends PositionTool {
    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string, currentParameters = null) {
        super(viewManagerDelegate, typeString, currentParameters);
    }

    createNewFeature(point: paper.Point) {
        console.log("POINT: ", point);
        const featureIDs = [];
        const currentlevel = Math.floor(Registry.viewManager!.renderLayers.indexOf(Registry.currentLayer!) / 3);
        const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;
        const cell_layer = currentlevel * 3;

        const paramvalues = this.getCreationParameters(new paper.Point(0, 0));
        let newFeature = Device.makeFeature(this.typeString, paramvalues);
        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, flowlayer);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        const params_point = PositionTool.getTarget([point.x, point.y]);
        const newtypestring = this.typeString + "_cell";
        const paramstoadd = newFeature.getParams();
        paramstoadd["position"] = new Parameter("position", params_point);
        newFeature = Device.makeFeature(newtypestring, paramvalues);
        newFeature.setParams(paramstoadd);

        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, cell_layer);
        featureIDs.push(newFeature.ID);

        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager!.saveDeviceState();
    }

    showTarget() {
        if (this.lastPoint === null) {
            return;
        }
        if (this.currentParameters === null) {
            throw new Error("No parameters set");
        }
        const target = PositionTool.getTarget(this.lastPoint);
        this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters);
    }
}
