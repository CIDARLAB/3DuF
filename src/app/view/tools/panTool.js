import MouseTool from "./mouseTool";

import * as Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";

export default class PanTool extends MouseTool {
    constructor() {
        super();
        this.startPoint = null;
        this.lastPoint = null;
        this.startCenter = null;
        let ref = this;
        this.updateQueue = new SimpleQueue(function() {
            ref.pan();
        }, 10);
        this.down = function(event) {
            ref.startPan(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
        this.up = function(event) {
            ref.endPan(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
        this.move = function(event) {
            ref.moveHandler(MouseTool.getEventPosition(event));
            ref.showTarget();
        };
    }

    startPan(point) {
        this.dragging = true;
        this.startPoint = point;
    }

    moveHandler(point) {
        if (this.dragging) {
            this.lastPoint = point;
            this.updateQueue.run();
            // this.pan();
        }
    }

    endPan(point) {
        this.pan();
        this.lastPoint = null;
        this.dragging = false;
        this.startPoint = null;
    }

    showTarget() {
        Registry.viewManager.removeTarget();
    }

    pan() {
        if (this.lastPoint) {
            let delta = this.lastPoint.subtract(this.startPoint);
            Registry.viewManager.moveCenter([delta.x, delta.y]);
        }
    }
}
