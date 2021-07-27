import PositionTool from "./positionTool";
<<<<<<< HEAD
import Registry from '../../core/registry';
import Feature from '../../core/feature';
=======
import Registry from "../../core/registry";
import Feature from "../../core/feature";
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
import CustomComponent from "../../core/customComponent";
import Params from "../../core/params";
import Component from "../../core/component";

export default class CustomComponentPositionTool extends PositionTool {
    constructor(customcomponent, setString) {
        super(customcomponent.type, setString);

        this.__customComponent = customcomponent;
    }

    createNewFeature(point) {
        const featureIDs = [];
        // console.log("Custom Component:", this.__customComponent);

        const newFeature = Feature.makeCustomComponentFeature(this.__customComponent, this.setString, {
            position: PositionTool.getTarget(point)
        });
        this.currentFeatureID = newFeature.ID;

        Registry.currentLayer.addFeature(newFeature);

        featureIDs.push(newFeature.ID);

        const params_to_copy = newFeature.getParams();

        // TODO: Change the component generation
        this.createNewCustomComponent(params_to_copy, featureIDs);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    createNewCustomComponent(paramdata, featureIDs) {
        const definition = CustomComponent.defaultParameterDefinitions();
        // Clean Param Data
        const cleanparamdata = {};
        for (const key in paramdata) {
            cleanparamdata[key] = paramdata[key].getValue();
        }
        // console.log(cleanparamdata);
        const params = new Params(cleanparamdata, definition.unique, definition.heritable);
        const componentid = Feature.generateID();
        console.log(this.__customComponent.entity, this.__customComponent.type);
        const name = Registry.currentDevice.generateNewName(this.__customComponent.entity);
        const newComponent = new Component(this.__customComponent.entity, params, name, this.__customComponent.entity, componentid);
        let feature;

        for (const i in featureIDs) {
            newComponent.addFeatureID(featureIDs[i]);

            // Update the component reference
            feature = Registry.currentDevice.getFeatureByID(featureIDs[i]);
            feature.referenceID = componentid;
        }

        Registry.currentDevice.addComponent(newComponent);
        return newComponent;
    }
}
