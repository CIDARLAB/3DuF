import RightClickMenu from "../ui/rightClickMenu";
import MouseTool from "./mouseTool";

import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";
import paper from "paper";
import EventBus from "@/events/events";

// Mouse tool for use with uF Guide Tool
// Allows for selection only of nonphysical features

export default class RenderMouseTool extends MouseTool {
    constructor(viewManager, paperview) {
        super();
        this.viewManagerDelegate = viewManager;
        this.paperView = paperview;
        this.dragging = false;
        this.dragStart = null;
        this.lastPoint = null;
        this.currentSelectBox = null;
        this.currentSelection = [];
        const ref = this;
        this.updateQueue = new SimpleQueue(function () {
            ref.dragHandler();
        }, 20);
        this.down = function (event) {
            this.viewManagerDelegate.killParamsWindow();
            ref.mouseDownHandler(event);
            ref.dragging = true;
            ref.showTarget();
        };
        this.move = function (event) {
            if (ref.dragging) {
                ref.lastPoint = MouseTool.getEventPosition(event);
                ref.updateQueue.run();
            }
            ref.showTarget();
        };
        this.up = function (event) {
            ref.dragging = false;
            ref.mouseUpHandler(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
    }

    keyHandler(event) {}

    dragHandler() {}

    showTarget() {
        this.viewManagerDelegate.removeTarget();
    }

    mouseUpHandler(point) {
        if (this.currentSelectBox) {
            this.currentSelection = this.viewManagerDelegate.hitFeaturesWithViewElement(this.currentSelectBox);
            this.selectFeatures();
        }
    }

    mouseDownHandler(event) {
        const point = MouseTool.getEventPosition(event);
        const target = this.hitFeature(point);
        if (target) {
            // if (this.viewManagerDelegate.getNonphysComponentForFeatureID(target.featureID) && this.viewManagerDelegate.getNonphysComponentForFeatureID(target.featureID).mint == "TEXT") {
            const element = this.viewManagerDelegate.getNonphysElementFromFeatureID(target.featureID);
            if (element && element.type == "Text") {
                if (target.selected) {
                    const feat = this.viewManagerDelegate.getFeatureByID(target.featureID);
                    this.viewManagerDelegate.updateDefaultsFromFeature(feat);
                    // Check if the feature is a part of a component
                    if (feat.referenceID === null) {
                        throw new Error("ReferenceID of feature is null");
                    } else {
                        if (element !== null) {
                            EventBus.get().emit(EventBus.DBL_CLICK_ELEMENT, event, element);
                        } else {
                            EventBus.get().emit(EventBus.DBL_CLICK_FEATURE, event, feat);
                        }
                    }
                } else {
                    this.deselectFeatures();
                    this.selectFeature(target);
                }
            } else {
                this.deselectFeatures();
            }
        } else {
            this.deselectFeatures();
        }
    }

    hitFeature(point) {
        const target = this.viewManagerDelegate.view.hitFeature(point, true, true);
        return target;
    }

    /**
     * Function that is fired when we click to select a single object on the paperjs canvas
     * @param paperElement
     */
    selectFeature(paperElement) {
        this.currentSelection.push(paperElement);

        // Find the component that owns this feature and then select all of the friends
        const component = this.__getComponentWithFeatureID(paperElement.featureID);
        if (component === null) {
            // Does not belong to a component, hence this returns
            paperElement.selected = true;
        } else if (component !== null) {
            // Belongs to the component so we basically select all features with this id
            const featureIDs = component.featureIDs;
            for (const i in featureIDs) {
                const featureid = featureIDs[i];
                const actualfeature = this.viewManagerDelegate.view.paperFeatures[featureid];
                actualfeature.selected = true;
            }

            this.viewManagerDelegate.view.selectedComponents.push(component);
        } else {
            throw new Error("Totally got the selection logic wrong, reimplement this");
        }
    }

    deselectFeatures() {
        if (this.rightClickMenu) {
            this.rightClickMenu.close();
        }
        this.paperView.clearSelectedItems();
        this.currentSelection = [];
    }

    /**
     * Finds and return the corresponding Component Object in the Registry's current device associated with
     * the featureid. Returns null if no component is found.
     *
     * @param featureid
     * @return {Component}
     * @private
     */
    __getComponentWithFeatureID(featureid) {
        // Get component with the features

        const device_components = this.viewManagerDelegate.nonphysComponents;

        // Check against every component
        for (const i in device_components) {
            const component = device_components[i];
            // Check against features in the in the component
            const componentfeatures = component.featureIDs;
            const index = componentfeatures.indexOf(featureid);

            if (index !== -1) {
                // Found it !!
                return component;
            }
        }

        return null;
    }
}