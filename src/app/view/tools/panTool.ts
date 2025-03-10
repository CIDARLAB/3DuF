import MouseTool from "./mouseTool";
import paper from "paper";
import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";
import ViewManager from "../viewManager";

export default class PanTool extends MouseTool {
    startPoint: paper.Point | number[] | null;
    lastPoint: paper.Point | number[] | null;
    startCenter: paper.Point | number[] | null;

    updateQueue: SimpleQueue;

    dragging?: boolean;

    constructor(viewManager: ViewManager) {
        super(viewManager);
        this.startPoint = null;
        this.lastPoint = null;
        this.startCenter = null;
        const ref = this;
        this.updateQueue = new SimpleQueue(function () {
            ref.pan();
        }, 10);
        this.down = function (event) {
            ref.startPan(MouseTool.getEventPosition(event as unknown as MouseEvent)!);
            ref.showTarget();
        };
        this.up = function (event) {
            ref.endPan(MouseTool.getEventPosition(event as unknown as MouseEvent)!);
            ref.showTarget();
        };
        this.move = function (event) {
            ref.moveHandler(MouseTool.getEventPosition(event as unknown as MouseEvent)!);
            ref.showTarget();
        };
    }

    startPan(point: paper.Point): void  {
        this.dragging = true;
        this.startPoint = point;
    }

    moveHandler(point: paper.Point): void  {
        if (this.dragging) {
            this.lastPoint = point;
            this.updateQueue.run();
            // this.pan();
        }
    }

    endPan(point: paper.Point): void  {
        this.pan();
        this.lastPoint = null;
        this.dragging = false;
        this.startPoint = null;
    }

    showTarget(): void  {
        Registry.viewManager?.removeTarget();
    }

    pan(): void  {
        if (this.lastPoint) {
            const delta = (this.lastPoint as paper.Point).subtract(this.startPoint as paper.Point);
            Registry.viewManager?.moveCenter([delta.x, delta.y] as unknown as paper.Point);
        }
    }
}
