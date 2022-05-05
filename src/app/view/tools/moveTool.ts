import MouseTool from "./mouseTool";
import paper from "paper";
import Registry from "../../core/registry";
import { Component } from "vue";

export default class MoveTool extends MouseTool {
    private __startPoint?: paper.Point | number[] | null;
    private __dragging: boolean;

    private __currentComponent?: any;
    private __originalPosition?: paper.Point | number[] | null;
    callback: ((...args: any[]) => any) | null;

    constructor() {
        super();

        // Use the startpoint to calculate the delta for movement
        this.__startPoint = null;
        this.__dragging = false;
        this.callback = null;

        // this.dragging = false;
        // this.dragStart = null;
        // this.lastPoint = null;
        // this.currentSelectBox = null;
        // this.currentSelection = [];
        const ref = this;
        // this.updateQueue = new SimpleQueue(function () {
        //     ref.dragHandler();
        // }, 20);
        this.down = function (event) {
            // Registry.viewManager.killParamsWindow();
            ref.mouseDownHandler(event as unknown as MouseEvent);
            // ref.dragging = true;
            // ref.showTarget();
        };
        this.move = function (event) {
            // if (ref.dragging) {
            //     ref.lastPoint = MouseTool.getEventPosition(event);
            //     ref.updateQueue.run();
            // }
            // ref.showTarget();
            ref.dragHandler(event as unknown as MouseEvent);
        };
        this.up = function (event) {
            // ref.dragging = false;
            ref.mouseUpHandler(event as unknown as MouseEvent);
            // ref.showTarget();
        };
    }

    /**
     * Default activation method
     * @param component
     */
    activate(component: any, callback: (...args: any[]) => any) {
        // console.log("Activating the tool for a new component", component);
        // Store the component position here
        this.__currentComponent = component;
        this.__originalPosition = component.getPosition();
        this.callback = callback;
    }

    /**
     * Default deactivation method
     */
    deactivate() {
        Registry.viewManager?.resetToDefaultTool();
    }

    /**
     * Method that can process the update of the component position
     * @param xpos
     * @param ypos
     */
    processUIPosition(xpos: number, ypos: number) {
        this.__currentComponent.updateComponentPosition([xpos, ypos]);
        this.callback!(xpos, ypos);
    }

    /**
     * Updates the position of the current selected component
     * @param xpos
     * @param ypos
     * @private
     */
    __updatePosition(xpos: number, ypos: number) {
        this.processUIPosition(xpos, ypos);
    }

    /**
     * Reverts the position to the original position
     */
    revertToOriginalPosition() {
        this.__currentComponent.updateComponentPosition(this.__originalPosition);
    }

    /**
     * Function that handles the dragging of the mouse
     * @param event
     */
    dragHandler(event: MouseEvent) {
        if (this.__dragging) {
            const point = MouseTool.getEventPosition(event);
            const target = Registry.viewManager?.snapToGrid(point as unknown as number[]);
            // console.log("Point:", point, target, this.__startPoint);
            const delta = {
                x: (target as any).x - (this.__startPoint as any).y,
                y: (target as any).y - (this.__startPoint as any).y
            };
            this.__startPoint = target;
            // console.log("delta:", delta);

            // let oldposition = this.__currentComponent.getPosition();
            // // console.log("oldposition:", oldposition);
            //
            // let newposition = [oldposition[0] + delta.x, oldposition[1] + delta.y];
            // console.log("Newposition:", newposition);
            // this.__currentComponent.updateComponentPosition(newposition);
            this.__updatePosition((target as any).x, (target as any).y);
        }
    }

    // showTarget() {
    //     Registry.viewManager.removeTarget();
    // }

    /**
     * Method that handles the mouse up event
     * @param event
     */
    mouseUpHandler(event: MouseEvent) {
        const point = MouseTool.getEventPosition(event);
        // console.log("Point:", point, event);
        const target = Registry.viewManager?.snapToGrid(point as unknown as number[]);

        // console.log("Start:",this.__startPoint, "End:" ,target);
        this.__dragging = false;
    }

    /**
     * Method that handles the movement of the mouse cursor
     * @param event
     */
    mouseDownHandler(event: MouseEvent) {
        const point = MouseTool.getEventPosition(event);
        const target = Registry.viewManager?.snapToGrid(point as unknown as number[]);
        this.__startPoint = target;
        this.__dragging = true;
    }
}