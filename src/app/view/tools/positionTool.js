import MouseTool from "./mouseTool";

import * as Registry from "../../core/registry";
import Feature from "../../core/feature";
import Device from "../../core/device";
import SimpleQueue from "../../utils/simpleQueue";

import paper from "paper";
import Params from "../../core/params";
import Component from "../../core/component";

export default class PositionTool extends MouseTool {
    constructor(typeString, setString) {
        super();
        this.typeString = typeString;
        this.setString = setString;
        this.currentFeatureID = null;
        let ref = this;
        this.lastPoint = null;
        this.showQueue = new SimpleQueue(
            function() {
                ref.showTarget();
            },
            20,
            false
        );
        this.up = function(event) {
            // do nothing
        };
        this.move = function(event) {
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        };
        this.down = function(event) {
            Registry.viewManager.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition(event));
        };
    }

    createNewFeature(point) {
        let name = Registry.currentDevice.generateNewName(this.typeString);
        let newFeature = Device.makeFeature(
            this.typeString,
            this.setString,
            {
                position: PositionTool.getTarget(point)
            },
            name
        );
        this.currentFeatureID = newFeature.getID();
        Registry.currentLayer.addFeature(newFeature);
    }

    /**
     * Returns the 2D vector of the position of the cursor
     * @param point
     * @return {Point}
     */
    static getTarget(point) {
        let target = Registry.viewManager.snapToGrid(point);
        return [target.x, target.y];
    }

    /**
     * Renders the target
     */
    showTarget() {
        let target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    /**
     * Creates a new component and adds it to the registry's current device
     * Note: Takes the feature ids as an array
     * TODO: Modify this to take the MINT String as another parameter
     * @param typeString Type of the Feature
     * @param params Map of all the paramters
     * @param featureIDs [String] Feature id's of all the features that will be a part of this component
     */
    createNewComponent(typeString, paramdata, featureIDs) {
        let definition = Registry.featureSet.getDefinition(typeString);
        //Clean Param Data
        let cleanparamdata = {};
        for (let key in paramdata) {
            cleanparamdata[key] = paramdata[key].getValue();
        }
        let params = new Params(cleanparamdata, definition.unique, definition.heritable);
        let componentid = Feature.generateID();
        let name = Registry.currentDevice.generateNewName(typeString);
        let newComponent = new Component(typeString, params, name, definition.mint, componentid);
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
