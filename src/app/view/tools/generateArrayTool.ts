import MouseTool, { MouseToolCallback } from "./mouseTool";

import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";
import Component from "@/app/core/component";

export default class GenerateArrayTool extends MouseTool {
    private __currentComponent?: any;
    private __originalPosition?: any;
    constructor() {
        super();

        // this.dragging = false;
        // this.dragStart = null;
        // this.lastPoint = null;
        // this.currentSelectBox = null;
        // this.currentSelection = [];
        const ref = this;
        // this.updateQueue = new SimpleQueue(function () {
        //     ref.dragHandler();
        // }, 20);
        this.down = function(event) {
            // Registry.viewManager.killParamsWindow();
            ref.mouseDownHandler(event);
            // ref.dragging = true;
            // ref.showTarget();
        };
        this.move = function(event) {
            // if (ref.dragging) {
            //     ref.lastPoint = MouseTool.getEventPosition(event);
            //     ref.updateQueue.run();
            // }
            // ref.showTarget();
        };
        this.up = function(event) {
            // ref.dragging = false;
            ref.mouseUpHandler((MouseTool.getEventPosition((event as unknown) as MouseEvent) as unknown) as MouseToolCallback);
            // ref.showTarget();
        };
    }

    activate(component: Component): void  {
        console.log("Activating the tool for a new component", component);
        // Store the component position here
        this.__currentComponent = component;
    }

    deactivate(): void  {
        Registry.viewManager?.resetToDefaultTool();
    }

    generateArray(xdim: number, ydim: number, xspacing: number, yspacing: number): void  {
        console.log("Generate array:", xdim, ydim, xspacing, yspacing);
        const xposref = this.__currentComponent.getPosition()[0];
        const yposref = this.__currentComponent.getPosition()[1];
        const name = this.__currentComponent.name;
        this.__currentComponent.name = name + "_1_1";
        const replicas = [];
        // Loop to create the components at the new positions
        for (let y = 0; y < ydim; y++) {
            for (let x = 0; x < xdim; x++) {
                // Skip the x=0, y=0 because thats the initial one
                if (x === 0 && y === 0) {
                    continue;
                }
                const xpos = xposref + x * xspacing;
                const ypos = yposref + y * yspacing;
                replicas.push(this.__currentComponent.replicate(xpos, ypos, name + "_" + String(x + 1) + "_" + String(y + 1)));
            }
        }

        // Add the replicas to the device
        console.log(replicas);
        replicas.forEach(function(replica) {
            Registry.currentDevice?.addComponent(replica);
        });

        Registry.viewManager?.saveDeviceState();
    }

    revertToOriginalPosition(): void  {
        this.__currentComponent.updateComponentPosition(this.__originalPosition);
    }

    dragHandler(): void  {
        // if (this.dragStart) {
        //     if (this.currentSelectBox) {
        //         this.currentSelectBox.remove();
        //     }
        //     this.currentSelectBox = this.rectSelect(this.dragStart, this.lastPoint);
        // }
    }

    // showTarget() {
    //     Registry.viewManager.removeTarget();
    // }

    mouseUpHandler(event: MouseToolCallback): void  {
        // if (this.currentSelectBox) {
        //     this.currentSelection = Registry.viewManager.hitFeaturesWithViewElement(this.currentSelectBox);
        //     this.selectFeatures();
        // }
        // this.killSelectBox();
        console.log("Up event", event);
    }

    mouseDownHandler(event: MouseToolCallback): void  {
        // let point = MouseTool.getEventPosition(event);
        // let target = this.hitFeature(point);
        // if (target) {
        //     if (target.selected) {
        //         let feat = Registry.currentDevice.getFeatureByID(target.featureID);
        //         Registry.viewManager.updateDefaultsFromFeature(feat);
        //         let rightclickmenu = new RightClickMenu(feat);
        //         rightclickmenu.show(event);
        //         Registry.viewManager.rightClickMenu = rightclickmenu;
        //         this.rightClickMenu = rightclickmenu;
        //         // let func = PageSetup.getParamsWindowCallbackFunction(feat.getType(), feat.getSet());
        //         //func(event);
        //     } else {
        //         this.deselectFeatures();
        //         this.selectFeature(target);
        //     }
        //
        //
        // } else {
        //     this.deselectFeatures();
        //     this.dragStart = point;
        // }
        console.log("Down event", event);
    }

    // killSelectBox() {
    //     if (this.currentSelectBox) {
    //         this.currentSelectBox.remove();
    //         this.currentSelectBox = null;
    //     }
    //     this.dragStart = null;
    // }
    //
    // hitFeature(point) {
    //     let target = Registry.viewManager.hitFeature(point);
    //     return target;
    // }

    /**
     * Function that is fired when we click to select a single object on the paperjs canvas
     * @param paperElement
     */
    // selectFeature(paperElement) {
    //     this.currentSelection.push(paperElement);
    //
    //     //Find the component that owns this feature and then select all of the friends
    //     let component = this.__getComponentWithFeatureID(paperElement.featureID);
    //     if (component === null) {
    //         //Does not belong to a component, hence this returns
    //         paperElement.selected = true;
    //
    //     } else {
    //         //Belongs to the component so we basically select all features with this id
    //         let featureIDs = component.featureIDs;
    //         for (let i in featureIDs) {
    //             let featureid = featureIDs[i];
    //             let actualfeature = Registry.viewManager.view.paperFeatures[featureid];
    //             actualfeature.selected = true;
    //         }
    //
    //         Registry.viewManager.view.selectedComponents.push(component);
    //     }
    // }

    // /**
    //  * Finds and return the corresponding Component Object in the Registry's current device associated with
    //  * the featureid. Returns null if no component is found.
    //  *
    //  * @param featureid
    //  * @return {Component}
    //  * @private
    //  */
    // __getComponentWithFeatureID(featureid) {
    //     // Get component with the features
    //
    //     let device_components = Registry.currentDevice.components;
    //
    //     //Check against every component
    //     for (let i in device_components) {
    //         let component = device_components[i];
    //         //Check against features in the in the component
    //         let componentfeatures = component.featureIDs;
    //         let index = componentfeatures.indexOf(featureid);
    //
    //         if (index !== -1) {
    //             //Found it !!
    //             console.log("Found Feature: " + featureid + " in component: " + component.getID());
    //             return component;
    //         }
    //     }
    //
    //     return null;
    // }

    /**
     * Function that is fired when we drag and select an area on the paperjs canvas
     */
    // selectFeatures() {
    //     if (this.currentSelection) {
    //         for (let i = 0; i < this.currentSelection.length; i++) {
    //             let paperFeature = this.currentSelection[i];
    //
    //             //Find the component that owns this feature and then select all of the friends
    //             let component = this.__getComponentWithFeatureID(paperFeature.featureID);
    //
    //             if (component === null) {
    //                 //Does not belong to a component hence do the normal stuff
    //                 paperFeature.selected = true;
    //
    //             } else {
    //                 //Belongs to the component so we basically select all features with this id
    //                 let featureIDs = component.featureIDs;
    //                 for (let i in featureIDs) {
    //                     let featureid = featureIDs[i];
    //                     let actualfeature = Registry.viewManager.view.paperFeatures[featureid];
    //                     actualfeature.selected = true;
    //                 }
    //
    //                 Registry.viewManager.view.selectedComponents.push(component);
    //             }
    //
    //         }
    //     }
    // }

    // deselectFeatures() {
    //     if(this.rightClickMenu){
    //         this.rightClickMenu.close();
    //         this.rightClickMenu = null;
    //     }
    //     paper.project.deselectAll();
    //     this.currentSelection = [];
    // }

    // abort() {
    //     this.deselectFeatures();
    //     this.killSelectBox();
    // }

    // rectSelect(point1, point2) {
    //     let rect = new paper.Path.Rectangle(point1, point2);
    //     rect.fillColor = new paper.Color(0, .3, 1, .4);
    //     rect.strokeColor = new paper.Color(0, 0, 0);
    //     rect.strokeWidth = 2;
    //     rect.selected = true;
    //     return rect;
    // }
}
