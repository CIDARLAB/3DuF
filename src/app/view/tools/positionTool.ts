import MouseTool from "./mouseTool";

import Registry from "../../core/registry";
import Feature from "../../core/feature";
import Device from "../../core/device";
import SimpleQueue from "../../utils/simpleQueue";

import paper from "paper";
import Params from "../../core/params";
import Component from "../../core/component";
import { ComponentAPI } from "@/componentAPI";
import MapUtils from "../../utils/mapUtils";
import ViewManager from "@/app/view/viewManager";

export default class PositionTool extends MouseTool {
    viewManagerDelegate: ViewManager;
    typeString: string;
    setString: string;
    currentFeatureID: string | null;
    currentParameters: { [k: string]: any } | null;

    lastPoint: paper.Point | number[] | null;

    showQueue: SimpleQueue;

    constructor(viewManagerDelegate: ViewManager, typeString: string, currentParameters: { [k: string]: any } | null = null) {
        super();
        this.viewManagerDelegate = viewManagerDelegate;
        this.typeString = typeString;
        this.setString = "Basic";
        this.currentFeatureID = null;
        this.currentParameters = currentParameters;
        const ref = this;
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
            ref.lastPoint = MouseTool.getEventPosition((event as unknown) as MouseEvent) as paper.Point;
            ref.showQueue.run();
        };
        this.down = function(event) {
            ref.viewManagerDelegate.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition((event as unknown) as MouseEvent)!);
        };
    }

    createNewFeature(point: paper.Point) {
        const name = this.viewManagerDelegate.currentDevice?.generateNewName(this.typeString);
        const newFeature = Device.makeFeature(
            this.typeString,
            {
                position: PositionTool.getTarget(point)
            },
            name
        );
        this.currentFeatureID = newFeature.ID;
        this.viewManagerDelegate.addFeature(newFeature);
    }

    /**
     * Returns the 2D vector of the position of the cursor
     * @param point
     * @return {Point}
     */
    static getTarget(point: paper.Point) {
        const target = Registry.viewManager?.snapToGrid((point as unknown) as number[]);
        return [(target as any).x, (target as any).y];
    }

    /**
     * Renders the target
     */
    showTarget() {
        const target = PositionTool.getTarget((this.lastPoint as unknown) as paper.Point);
        this.viewManagerDelegate.updateTarget(this.typeString, this.setString, target, this.currentParameters!);
    }

    /**
     * Creates a new component and adds it to the registry's current device
     * Note: Takes the feature ids as an array
     * TODO: Modify this to take the MINT String as another parameter
     * @param typeString Type of the Feature
     * @param params Map of all the paramters
     * @param featureIDs [String] Feature id's of all the features that will be a part of this component
     */
    createNewComponent(typeString: string, paramdata: { [k: string]: any }, featureIDs: string[]) {
        const definition = ComponentAPI.getDefinition(typeString);
        // Clean Param Data
        const cleanparamdata: { [k: string]: any } = {};
        for (const key in paramdata) {
            cleanparamdata[key] = paramdata[key].value;
        }
        const params = new Params(cleanparamdata, MapUtils.toMap(definition!.unique), MapUtils.toMap(definition!.heritable));
        const componentid = ComponentAPI.generateID();
        const name = Registry.currentDevice!.generateNewName(typeString);
        const newComponent = new Component(params, name, definition!.mint, componentid);
        let feature;

        for (const i in featureIDs) {
            newComponent.addFeatureID(featureIDs[i]);

            // Update the component reference
            feature = Registry.currentDevice!.getFeatureByID(featureIDs[i]);
            feature.referenceID = componentid;
        }

        this.viewManagerDelegate.currentDevice!.addComponent(newComponent);
        return newComponent;
    }

    deactivate() {}

    getCreationParameters(position: paper.Point) {
        const paramvalues = {
            position: PositionTool.getTarget(position)
        };
        console.log(this.currentParameters);
        for (const item of this.currentParameters) {
            console.log(item);
            const param = item.name;
            const value = item.value;
            (paramvalues as any)[param] = value;
        }
        return paramvalues;
    }
}
