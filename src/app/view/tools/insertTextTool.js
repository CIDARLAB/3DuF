import MouseTool from "./mouseTool";
import Device from "@/app/core/device";
import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";

import paper from "paper";
import PositionTool from "./positionTool";
import Params from "../../core/params";
import { ComponentAPI } from "@/componentAPI";

export default class InsertTextTool extends MouseTool {
    constructor() {
        super();
        this.typeString = "TEXT";
        this.setString = "Standard";
        this.currentFeatureID = null;
        const ref = this;
        this.lastPoint = null;
        this._text = "TESTING-TEXT";
        this.fontSize = 12;
        this.showQueue = new SimpleQueue(
            function() {
                ref.showTarget();
            },
            20,
            false
        );
        this.up = function(event) {
            // do nothing
        };
        this.move = function(event) {
            ref.lastPoint = MouseTool.getEventPosition(event);
            ref.showQueue.run();
        };
        this.down = function(event) {
            Registry.viewManager.killParamsWindow();
            paper.project.deselectAll();
            ref.createNewFeature(MouseTool.getEventPosition(event));
        };
    }

    createNewFeature(point) {
        let fixedpoint = PositionTool.getTarget(point);
        let newFeature = Device.makeFeature(
            "Text",
            {
                position: fixedpoint,
                height: 200,
                text: this._text,
                fontSize: this.fontSize * 10000
            },
            "TEXT_" + this._text,
            ComponentAPI.generateID(),
            "XY",
            null
        );
        let physical = false;
        Registry.viewManager.addFeature(newFeature, Registry.viewManager.activeRenderLayer, physical);
        if (!physical) Registry.viewManager.view.addComponent("Text", newFeature.getParams(), [newFeature.ID], false);
        Registry.viewManager.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager.updateTarget(this.typeString, this.setString, target);
    }

    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;
    }
}
