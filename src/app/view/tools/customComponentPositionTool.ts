import PositionTool from "./positionTool";
import Registry from "../../core/registry";
import Feature from "../../core/feature";
import CustomComponent from "../../core/customComponent";
import Params from "../../core/params";
import Component from "../../core/component";
import { ComponentAPI } from "@/componentAPI";

export default class CustomComponentPositionTool extends PositionTool {
    private __customComponent: CustomComponent;

    constructor(customcomponent: CustomComponent, setString: string) {
        super(customcomponent.type, setString);

        this.__customComponent = customcomponent;
    }

    createNewFeature(point: paper.Point) {
        const featureIDs = [];
        // console.log("Custom Component:", this.__customComponent);

        const newFeature = Feature.makeCustomComponentFeature(this.__customComponent, this.setString, {
            position: PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.ID;

        Registry.viewManager?.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        // TODO: Change the component generation
        this.createNewCustomComponent(params_to_copy, featureIDs);
        Registry.viewManager?.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager?.updateTarget(this.typeString, this.setString, target);
    }

    createNewCustomComponent(paramdata: { [k: string]: any }, featureIDs: string[]) {
        const definition = CustomComponent.defaultParameterDefinitions();
        // Clean Param Data
        const cleanparamdata: { [k: string]: any } = {};
        for (const key in paramdata) {
            cleanparamdata[key] = paramdata[key].value;
        }
        // console.log(cleanparamdata);
        const params = new Params(cleanparamdata, (definition.unique as unknown) as Map<string, string>, (definition.heritable as unknown) as Map<string, string>);
        const componentid = ComponentAPI.generateID();
        console.log(this.__customComponent.entity, this.__customComponent.type);
        const name = Registry.currentDevice?.generateNewName(this.__customComponent.entity);
        const newComponent = new Component(this.__customComponent.entity, params, name, this.__customComponent.entity, componentid);
        let feature;

        for (const i in featureIDs) {
            newComponent.addFeatureID(featureIDs[i]);

            // Update the component reference
            feature = Registry.currentDevice?.getFeatureByID(featureIDs[i]);
            feature!.referenceID = componentid;
        }

        Registry.currentDevice?.addComponent(newComponent);
        return newComponent;
    }
}
