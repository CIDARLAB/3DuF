import MouseTool from "./mouseTool";
import paper from "paper";
import Registry from "../../core/registry";
import { Point } from "@/app/core/init";
import ViewManager from "../viewManager";

export default class MoveTool extends MouseTool {
    private __startPoint: Point | null;
    private __dragging: boolean;

    private __currentComponent: any;
    private __originalPosition: Point | null = null;
    private _viewManagerDelegate: ViewManager;

    callback: ((...args: any[]) => any) | null;

    constructor(viewManagerDelegate: ViewManager) {
        super();

        // Use the startpoint to calculate the delta for movement
        this.__startPoint = null;
        this.__dragging = false;
        this.callback = null;

        this._viewManagerDelegate = viewManagerDelegate;

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
    activate(component: any, callback: (...args: any[]) => any): void  {
        // console.log("Activating the tool for a new component", component);
        // Store the component position here
        this.__currentComponent = component;
        this.__originalPosition = component.getPosition();
        this.callback = callback;
    }

    /**
     * Default deactivation method
     */
    deactivate(): void  {
        this._viewManagerDelegate.resetToDefaultTool();
    }

    /**
     * Method that can process the update of the component position
     * @param xpos
     * @param ypos
     */
    processUIPosition(xpos: number, ypos: number): void  {
        this.__currentComponent.updateComponentPosition([xpos, ypos]);
        this.callback!(xpos, ypos);
    }

    /**
     * Updates the position of the current selected component
     * @param xpos
     * @param ypos
     * @private
     */
    __updatePosition(xpos: number, ypos: number): void  {
        this.processUIPosition(xpos, ypos);
    }

    /**
     * Reverts the position to the original position
     */
    revertToOriginalPosition(): void  {
        this.__currentComponent.updateComponentPosition(this.__originalPosition);
    }

    /**
     * Function that handles the dragging of the mouse
     * @param event
     */
    dragHandler(event: MouseEvent): void  {
        if (this._viewManagerDelegate === null) {
            throw new Error("No view manager set!");
        }
        if (this.__dragging) {
            const point = MouseTool.getEventPosition(event);
            let target: paper.Point = new paper.Point(point.x, point.y);
            if (point !== null && point !== undefined) {
                let snappoint = this._viewManagerDelegate.snapToGrid([point.x, point.y]);
                target = new paper.Point(snappoint[0], snappoint[1]);
            }
            // const delta = {
            //     x: (target).x - this.__startPoint[0],
            //     y: (target).y - this.__startPoint[1]
            // };
            this.__startPoint = [target.x, target.y];
            // console.log("delta:", delta);

            // let oldposition = this.__currentComponent.getPosition();
            // // console.log("oldposition:", oldposition);
            //
            // let newposition = [oldposition[0] + delta.x, oldposition[1] + delta.y];
            // console.log("Newposition:", newposition);
            // this.__currentComponent.updateComponentPosition(newposition);
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
    mouseUpHandler(event: MouseEvent): void  {
        const point = MouseTool.getEventPosition(event);
        if (point === null){
            throw new Error("Point is null for move tool event handler");
        }
        const targettosnap: Point = [point.x, point.y];
        const target = this._viewManagerDelegate.snapToGrid(targettosnap);

        // console.log("Start:",this.__startPoint, "End:" ,target);
        this.__dragging = false;
    }

    /**
     * Method that handles the movement of the mouse cursor
     * @param event
     */
    mouseDownHandler(event: MouseEvent): void  {
        const point = MouseTool.getEventPosition(event);
        if (point === null){
            throw new Error("Point is null for move tool event handler");
        }
        const targettosnap: Point = [point.x, point.y];
        const target = this._viewManagerDelegate.snapToGrid(targettosnap);
        this.__startPoint = target;
        this.__dragging = true;
    }
}
