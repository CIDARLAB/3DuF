import PositionTool from "./positionTool";
import * as Registry from "../../core/registry";
import Feature from "../../core/feature";
import CustomComponent from "../../core/customComponent";
import Params from "../../core/params";
import Component from "../../core/component";

export default class CustomComponentPositionTool extends PositionTool {
    constructor(customcomponent, setString) {
        super(customcomponent.type, setString);

        this.__customComponent = customcomponent;
    }

    createNewFeature(point) {
        let featureIDs = [];
        // console.log("Custom Component:", this.__customComponent);

        let newFeature = Feature.makeCustomComponentFeature(this.__customComponent, this.setString, {
            position: PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.getID();

        Registry.currentLayer.addFeature(newFeature);

        featureIDs.push(newFeature.getID());

        let params_to_copy = newFeature.getParams();

        //TODO: Change the component generation
        this.createNewCustomComponent(params_to_copy, featureIDs);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    createNewCustomComponent(paramdata, featureIDs) {
        let definition = CustomComponent.defaultParameterDefinitions();
        //Clean Param Data
        let cleanparamdata = {};
        for (let key in paramdata) {
            cleanparamdata[key] = paramdata[key].getValue();
        }
        // console.log(cleanparamdata);
        let params = new Params(cleanparamdata, definition.unique, definition.heritable);
        let componentid = Feature.generateID();
        console.log(this.__customComponent.entity, this.__customComponent.type);
        let name = Registry.currentDevice.generateNewName(this.__customComponent.entity);
        let newComponent = new Component(this.__customComponent.entity, params, name, this.__customComponent.entity, componentid);
        let feature;

        for (let i in featureIDs) {
            newComponent.addFeatureID(featureIDs[i]);

            //Update the component reference
            feature = Registry.currentDevice.getFeatureByID(featureIDs[i]);
            feature.referenceID = componentid;
        }

        Registry.currentDevice.addComponent(newComponent);
        return newComponent;
    }
}
