import MoveToolBar from "../ui/moveToolBar";

var Registry = require("../../core/registry");
var MouseTool = require("./MouseTool");
var SimpleQueue = require("../../utils/simpleQueue");

export default class MoveTool extends MouseTool {
    constructor() {
        super();

        this.__moveWindow = new MoveToolBar(this);

        // this.dragging = false;
        // this.dragStart = null;
        // this.lastPoint = null;
        // this.currentSelectBox = null;
        // this.currentSelection = [];
        let ref = this;
        // this.updateQueue = new SimpleQueue(function () {
        //     ref.dragHandler();
        // }, 20);
        this.down = function (event) {
            // Registry.viewManager.killParamsWindow();
            ref.mouseDownHandler(event);
            // ref.dragging = true;
            // ref.showTarget();
        };
        this.move = function (event) {
            // if (ref.dragging) {
            //     ref.lastPoint = MouseTool.getEventPosition(event);
            //     ref.updateQueue.run();
            // }
            // ref.showTarget();
        };
        this.up = function (event) {
            // ref.dragging = false;
            ref.mouseUpHandler(MouseTool.getEventPosition(event));
            // ref.showTarget();
        }

    }

    activate(component){
        console.log("Activating the tool for a new component", component);
        //Store the component position here
        this.__currentComponent = component;
        this.__originalPosition = component.getPosition();
        this.__moveWindow.showWindow();
        this.__moveWindow.updateUIPos(this.__originalPosition);
    }

    unactivate(){
        Registry.viewManager.resetToDefaultTool();
    }

    processUIPosition(xpos, ypos){
        console.log("new position", xpos, ypos);
        this.__currentComponent.updateComponetPosition([xpos, ypos]);
    }

    revertToOriginalPosition(){
        this.__currentComponent.updateComponetPosition(this.__originalPosition);
    }

    dragHandler() {
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

    mouseUpHandler(event) {
        // if (this.currentSelectBox) {
        //     this.currentSelection = Registry.viewManager.hitFeaturesWithViewElement(this.currentSelectBox);
        //     this.selectFeatures();
        // }
        // this.killSelectBox();
        console.log("Up event", event);
    }

    removeFeatures() {
        if (this.currentSelection.length > 0) {
            for (let i = 0; i < this.currentSelection.length; i++) {
                let paperFeature = this.currentSelection[i];
                Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
            }
            this.currentSelection = [];
            Registry.canvasManager.render();
        }
    }

    mouseDownHandler(event) {
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
        //         // let func = PageSetup.paramsWindowFunction(feat.getType(), feat.getSet());
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
        console.log("Down event", event)
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
