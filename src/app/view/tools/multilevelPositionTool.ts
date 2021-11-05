import PositionTool from "./positionTool";
import { ComponentAPI } from "@/componentAPI";
import Registry from "../../core/registry";
import Device from "../../core/device";
import ViewManager from "@/app/view/viewManager";
import Layer from "@/app/core/layer";
import RenderLayer from "../renderLayer";

export default class MultilevelPositionTool extends PositionTool {
    flowlayer: RenderLayer | null;
    controllayer: RenderLayer | null;
    intlayer: RenderLayer | null;

    constructor(
        viewManagerDelegate: ViewManager,
        typeString: string,
        setString: string,
        flowLayer = Registry.currentLayer,
        controlLayer = null,
        intLayer = null,
        currentParameters = null
    ) {
        super(viewManagerDelegate, typeString, setString, currentParameters);
        this.flowlayer = flowLayer;
        this.controllayer = controlLayer;
        this.intlayer = intLayer;
    }

    createNewFeature(point: paper.Point) {
        const featureIDs = [];

        // Set up flow layer component
        const paramvalues = this.getCreationParameters(point);
        let newFeature = Device.makeFeature(this.typeString, paramvalues);
        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature, this.flowlayer);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        let newtypestring;
        const paramstoadd = newFeature.getParams();
        // Set up control layer component
        if (ComponentAPI.library[this.typeString + "_control"]) {
            newFeature.setParams(paramstoadd);

            this.currentFeatureID = newFeature.ID;
            this.viewManagerDelegate.addFeature(newFeature, this.controllayer);

            featureIDs.push(newFeature.ID);
        }

        // Set up integration layer component
        if (ComponentAPI.library[this.typeString + "_integration"]) {
            newtypestring = this.typeString + "_integration";
            newFeature = Device.makeFeature(newtypestring, paramvalues);
            newFeature.setParams(paramstoadd);

            this.currentFeatureID = newFeature.ID;
            this.viewManagerDelegate.addFeature(newFeature, this.intlayer);

            featureIDs.push(newFeature.ID);
        }

        super.createNewComponent(this.typeString, params_to_copy, featureIDs);
        this.viewManagerDelegate.saveDeviceState();
    }

    showTarget() {
        if (this.lastPoint === null){
            return;
        }
        const target = PositionTool.getTarget(new paper.Point(this.lastPoint));
        this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters);
    }
}
