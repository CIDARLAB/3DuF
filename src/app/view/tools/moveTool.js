import MoveToolBar from "../ui/moveToolBar";
import MouseTool from "./mouseTool";

import * as Registry from "../../core/registry";

export default class MoveTool extends MouseTool {
    constructor() {
        super();

        //Use the startpoint to calculate the delta for movement
        this.__startPoint = null;
        this.__moveWindow = new MoveToolBar(this);
        this.__dragging = false;

        // this.dragging = false;
        // this.dragStart = null;
        // this.lastPoint = null;
        // this.currentSelectBox = null;
        // this.currentSelection = [];
        let ref = this;
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
            ref.dragHandler(event);
        };
        this.up = function(event) {
            // ref.dragging = false;
            ref.mouseUpHandler(event);
            // ref.showTarget();
        };
    }

    /**
     * Default activation method
     * @param component
     */
    activate(component) {
        // console.log("Activating the tool for a new component", component);
        //Store the component position here
        this.__currentComponent = component;
        this.__originalPosition = component.getPosition();
        this.__moveWindow.showWindow();
        this.__moveWindow.updateUIPos(this.__originalPosition);
    }

    /**
     * Default deactivation method
     */
    unactivate() {
        Registry.viewManager.resetToDefaultTool();
    }

    /**
     * Method that can process the update of the component position
     * @param xpos
     * @param ypos
     */
    processUIPosition(xpos, ypos) {
        this.__currentComponent.updateComponetPosition([xpos, ypos]);
    }

    /**
     * Updates the position of the current selected component
     * @param xpos
     * @param ypos
     * @private
     */
    __updatePosition(xpos, ypos) {
        this.processUIPosition(xpos, ypos);
        this.__moveWindow.updateUIPos([xpos * 1000, ypos * 1000]);
    }

    /**
     * Reverts the position to the original position
     */
    revertToOriginalPosition() {
        this.__currentComponent.updateComponetPosition(this.__originalPosition);
    }

    /**
     * Function that handles the dragging of the mouse
     * @param event
     */
    dragHandler(event) {
        if (this.__dragging) {
            let point = MouseTool.getEventPosition(event);
            let target = Registry.viewManager.snapToGrid(point);
            // console.log("Point:", point, target, this.__startPoint);
            let delta = {
                x: target.x - this.__startPoint.y,
                y: target.y - this.__startPoint.y
            };
            this.__startPoint = target;
            // console.log("delta:", delta);

            // let oldposition = this.__currentComponent.getPosition();
            // // console.log("oldposition:", oldposition);
            //
            // let newposition = [oldposition[0] + delta.x, oldposition[1] + delta.y];
            // console.log("Newposition:", newposition);
            // this.__currentComponent.updateComponetPosition(newposition);
            this.__updatePosition(target.x, target.y);
        }
    }

    // showTarget() {
    //     Registry.viewManager.removeTarget();
    // }

    /**
     * Method that handles the mouse up event
     * @param event
     */
    mouseUpHandler(event) {
        let point = MouseTool.getEventPosition(event);
        // console.log("Point:", point, event);
        let target = Registry.viewManager.snapToGrid(point);

        // console.log("Start:",this.__startPoint, "End:" ,target);
        this.__dragging = false;
    }

    /**
     * Method that handles the movement of the mouse cursor
     * @param event
     */
    mouseDownHandler(event) {
        let point = MouseTool.getEventPosition(event);
        let target = Registry.viewManager.snapToGrid(point);
        this.__startPoint = target;
        this.__dragging = true;
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
    //     if (component == null) {
    //         //Does not belong to a component, hence this returns
    //         paperElement.selected = true;
    //
    //     } else {
    //         //Belongs to the component so we basically select all features with this id
    //         let featureIDs = component.getFeatureIDs();
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
    //     let device_components = Registry.currentDevice.getComponents();
    //
    //     //Check against every component
    //     for (let i in device_components) {
    //         let component = device_components[i];
    //         //Check against features in the in the component
    //         let componentfeatures = component.getFeatureIDs();
    //         let index = componentfeatures.indexOf(featureid);
    //
    //         if (index != -1) {
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
    //             if (component == null) {
    //                 //Does not belong to a component hence do the normal stuff
    //                 paperFeature.selected = true;
    //
    //             } else {
    //                 //Belongs to the component so we basically select all features with this id
    //                 let featureIDs = component.getFeatureIDs();
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
