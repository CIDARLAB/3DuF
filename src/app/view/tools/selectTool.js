import MouseTool from "./mouseTool";

import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";
import paper from "paper";

export default class SelectTool extends MouseTool {
    constructor() {
        super();
        this.dragging = false;
        this.dragStart = null;
        this.lastPoint = null;
        this.currentSelectBox = null;
        this.currentSelection = [];
        const ref = this;
        this.updateQueue = new SimpleQueue(function() {
            ref.dragHandler();
        }, 20);

        this.down = function(event) {
            Registry.viewManager.killParamsWindow();
            ref.mouseDownHandler(event);
            ref.dragging = true;
            ref.showTarget();
        };

        this.move = function(event) {
            if (ref.dragging) {
                ref.lastPoint = MouseTool.getEventPosition(event);
                ref.updateQueue.run();
            }
            ref.showTarget();
        };

        this.up = function(event) {
            ref.dragging = false;
            ref.mouseUpHandler(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
    }

    keyHandler(event) {
        if (event.key === "delete" || event.key === "backspace") {
            console.log("Removing feature");
            this.removeFeatures();
        }
        if (event.key === "c") {
            console.log("Detected a ctrlC");
            console.log(this.currentSelection);
        }
    }

    dragHandler() {
        if (this.dragStart) {
            if (this.currentSelectBox) {
                this.currentSelectBox.remove();
            }
            this.currentSelectBox = this.rectSelect(this.dragStart, this.lastPoint);
        }
    }

    showTarget() {
        Registry.viewManager.removeTarget();
    }

    mouseUpHandler(point) {
        if (this.currentSelectBox) {
            this.currentSelection = Registry.viewManager.hitFeaturesWithViewElement(this.currentSelectBox);
            this.selectFeatures();
        }
        this.killSelectBox();
    }

    removeFeatures() {
        if (this.currentSelection.length > 0) {
            for (let i = 0; i < this.currentSelection.length; i++) {
                const paperFeature = this.currentSelection[i];
                Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
            }
            this.currentSelection = [];
            Registry.canvasManager.render();
        }
    }

    mouseDownHandler(event) {
        const point = MouseTool.getEventPosition(event);
        const target = this.hitFeature(point);
        if (target) {
            if (target.selected) {
                const feat = Registry.currentDevice.getFeatureByID(target.featureID);
                Registry.viewManager.updateDefaultsFromFeature(feat);
            } else {
                this.deselectFeatures();
                this.selectFeature(target);
            }
        } else {
            this.deselectFeatures();
            this.dragStart = point;
        }
    }

    killSelectBox() {
        if (this.currentSelectBox) {
            this.currentSelectBox.remove();
            this.currentSelectBox = null;
        }
        this.dragStart = null;
    }

    hitFeature(point) {
        const target = Registry.viewManager.hitFeature(point);
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
        } else {
            // Belongs to the component so we basically select all features with this id
            const featureIDs = component.featureIDs;
            for (const i in featureIDs) {
                const featureid = featureIDs[i];
                const actualfeature = Registry.viewManager.view.paperFeatures[featureid];
                actualfeature.selected = true;
            }

            Registry.viewManager.view.selectedComponents.push(component);
        }
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

        const device_components = Registry.currentDevice.components;

        // Check against every component
        for (const i in device_components) {
            const component = device_components[i];
            // Check against features in the in the component
            const componentfeatures = component.featureIDs;
            const index = componentfeatures.indexOf(featureid);

            if (index !== -1) {
                // Found it !!
                console.log("Found Feature: " + featureid + " in component: " + component.getID());
                return component;
            }
        }

        return null;
    }

    /**
     * Function that is fired when we drag and select an area on the paperjs canvas
     */
    selectFeatures() {
        if (this.currentSelection) {
            for (let i = 0; i < this.currentSelection.length; i++) {
                const paperFeature = this.currentSelection[i];

                // Find the component that owns this feature and then select all of the friends
                const component = this.__getComponentWithFeatureID(paperFeature.featureID);

                if (component === null) {
                    // Does not belong to a component hence do the normal stuff
                    paperFeature.selected = true;
                } else {
                    // Belongs to the component so we basically select all features with this id
                    const featureIDs = component.featureIDs;
                    for (const j in featureIDs) {
                        const featureid = featureIDs[j];
                        const actualfeature = Registry.viewManager.view.paperFeatures[featureid];
                        actualfeature.selected = true;
                    }

                    Registry.viewManager.view.selectedComponents.push(component);
                }
            }
        }
    }

    deselectFeatures() {
        paper.project.deselectAll();
        this.currentSelection = [];
    }

    abort() {
        this.deselectFeatures();
        this.killSelectBox();
    }

    rectSelect(point1, point2) {
        const rect = new paper.Path.Rectangle(point1, point2);
        rect.fillColor = new paper.Color(0, 0.3, 1, 0.4);
        rect.strokeColor = new paper.Color(0, 0, 0);
        rect.strokeWidth = 2;
        rect.selected = true;
        return rect;
    }
}
