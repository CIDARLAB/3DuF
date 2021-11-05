import MouseTool, { MouseToolCallback } from "./mouseTool";
import Device from "@/app/core/device";
import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";

import paper from "paper";
import PositionTool from "./positionTool";
import Params from "../../core/params";
import { ComponentAPI } from "@/componentAPI";
import { ViewManager } from "@/app";

export default class InsertTextTool extends MouseTool {
    typeString: string;
    setString: string;
    currentFeatureID: string | null;
    lastPoint: paper.Point | number[] | null;

    private _text: string;
    fontSize: number;
    viewManagerDelegate: ViewManager;
    showQueue: SimpleQueue;

    constructor(viewManagerDelegate: ViewManager) {
        super();
        this.typeString = "TEXT";
        this.setString = "Standard";
        this.currentFeatureID = null;
        const ref = this;
        this.lastPoint = null;
        this._text = "TESTING-TEXT";
        this.fontSize = 12;
        this.viewManagerDelegate = viewManagerDelegate;
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
            ref.lastPoint = MouseTool.getEventPosition((event as unknown) as MouseEvent) as paper.Point;
            ref.showQueue.run();
        };
        this.down = function(event) {
            Registry.viewManager?.killParamsWindow();
            paper.project.deselectAll();
            // TODO - Add the ability to insert a non physical text element later on using Liam's Nonphysical compoennt API
            ref.createNewFeature(MouseTool.getEventPosition((event as unknown) as MouseEvent) as paper.Point);
        };
    }

    /**
     * Creates a physical test feature when using the InsertTextTool
     */
    createNewFeature(point: paper.Point) {
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
        this.viewManagerDelegate.addFeature(newFeature, this.viewManagerDelegate.activeRenderLayer);
        this.viewManagerDelegate.view.addComponent("Text", newFeature.getParams(), [newFeature.ID], true);
        this.viewManagerDelegate.saveDeviceState();
    }

    showTarget() {
        const target = PositionTool.getTarget(this.lastPoint);
        Registry.viewManager?.updateTarget(this.typeString, this.setString, target);
    }

    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;
    }
}
