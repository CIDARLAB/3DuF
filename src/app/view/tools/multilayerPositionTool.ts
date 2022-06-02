import PositionTool from "./positionTool";
import { ComponentAPI } from "@/componentAPI";
import Registry from "../../core/registry";
import Device from "../../core/device";
import ViewManager from "@/app/view/viewManager";
import paper from "paper";
import Parameter from "@/app/core/parameter";

export default class MultilayerPositionTool extends PositionTool {
    constructor(viewManagerDelegate: ViewManager, typeString: string, setString: string, currentParameters: { [k: string]: any } | null = null) {
        super(viewManagerDelegate, typeString, currentParameters);
    }

    createNewFeature(point: paper.Point): void  {
        const featureIDs = [];
        const currentlevel = Math.floor(Registry.viewManager!.renderLayers.indexOf(Registry.currentLayer!) / 3);
        const flowlayer = currentlevel * 3;
        const controllayer = currentlevel * 3 + 1;
        const intlayer = currentlevel * 3 + 2;

        // Set up flow layer component
        const paramvalues = this.getCreationParameters(new paper.Point(0, 0));
        let newFeature = Device.makeFeature(this.typeString, paramvalues);
        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, flowlayer);
        const params_to_copy = newFeature.getParams();    
        featureIDs.push(newFeature.ID);

        let newtypestring;
        if (ComponentAPI.library[this.typeString + "_control"]) {
            newtypestring = this.typeString + "_control";
            newFeature = Device.makeFeature(newtypestring, paramvalues);

            this.currentFeatureID = newFeature.ID;
            this.viewManagerDelegate.addFeature(newFeature, controllayer);

            featureIDs.push(newFeature.ID);
        }

        // Set up integration layer component
        if (ComponentAPI.library[this.typeString + "_integration"]) {
            newtypestring = this.typeString + "_integration";
            newFeature = Device.makeFeature(newtypestring, paramvalues);

            this.currentFeatureID = newFeature.ID;
            this.viewManagerDelegate.addFeature(newFeature, intlayer);

            featureIDs.push(newFeature.ID);
        }
    
        params_to_copy["position"] = new Parameter("position", [point.x, point.y]);
        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        Registry.viewManager?.saveDeviceState();
    }

    showTarget(): void  {
        if (this.lastPoint === null) {
            return;
        }
        const target = PositionTool.getTarget(this.lastPoint);
        this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters!);
    }
}
