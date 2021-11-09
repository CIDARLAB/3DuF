import MouseTool from "@/app/view/tools/mouseTool";
import { Registry, ViewManager } from "@/app";
export default class Step2MouseTool extends MouseTool {
    private viewManagerDelegate: ViewManager;
    constructor(viewManager: ViewManager) {
        super();
        this.viewManagerDelegate = viewManager;
    }

    private mouseDown(event: any) {
        console.log("mouseDown");
        const point = MouseTool.getEventPosition(event);
        const targetfeature = this.hitFeature(point);
        if (targetfeature !== null) {
            // const targetcomponent = this.__getComponentWithFeatureID(targetfeature.featureID);
            // if (targetcomponent !== null) {
            //     console.log("Found Component: " + targetcomponent.id);
            //     const component = this.__getComponentWithFeatureID(targetfeature.featureID);
            //     console.log("Selected console", component);
            // }
        }
    }

    hitFeature(point: any) {
        const target = this.viewManagerDelegate.hitFeature(point);
        return target;
    }

    /**
     * Finds and return the corresponding Component Object in the Registry's current device associated with
     * the featureid. Returns null if no component is found.
     *
     * @param featureid
     * @return {Component}
     * @private
     */
    __getComponentWithFeatureID(featureid: string) {
        // Get component with the features

        if (Registry.viewManager == null) {
            throw "nothing in device";
        }

        const device_components = Registry.viewManager.currentDevice.components;

        // Check against every component
        for (const i in device_components) {
            const component = device_components[i];
            // Check against features in the in the component
            const componentfeatures = component.featureIDs;
            const index = componentfeatures.indexOf(featureid);

            if (index !== -1) {
                // Found it !!
                console.log("Found Feature: " + featureid + " in component: " + component.id);
                return component;
            }
        }

        return null;
    }
}
