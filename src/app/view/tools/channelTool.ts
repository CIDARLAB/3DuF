import MouseTool from "./mouseTool";

import Registry from "../../core/registry";
import SimpleQueue from "../../utils/simpleQueue";
import Device from "../../core/device";
import paper from "paper";
import { Point, ToolPaperObject } from "@/app/core/init";
import ViewManager from "../viewManager";

export default class ChannelTool extends MouseTool {
    typeString: string;
    setString: string;
    startPoint: Point | null;
    lastPoint: Point | null;
    currentChannelID: string | null;
    currentTarget: any;
    dragging: boolean;

    showQueue: SimpleQueue;
    updateQueue: SimpleQueue;

    constructor(viewManager: ViewManager, typeString: string, setString: string) {
        super(viewManager);
        this.typeString = typeString;
        this.setString = setString;
        this.startPoint = null;
        this.lastPoint = null;
        this.currentChannelID = null;
        this.currentTarget = null;
        this.dragging = false;
        const ref = this;

        this.showQueue = new SimpleQueue(
            function() {
                if(ref.lastPoint === null){
                    return;
                }
                ref.showTarget(new paper.Point(ref.lastPoint));
            },
            20,
            false
        );

        this.updateQueue = new SimpleQueue(
            function() {
                ref.updateChannel();
            },
            20,
            false
        );

        this.down = function(event) {
            Registry.viewManager?.killParamsWindow();
            paper.project.deselectAll();
            ref.dragging = true;
            ref.initChannel();
        };
        this.up = function(event) {
            ref.dragging = false;
            ref.finishChannel((MouseTool.getEventPosition((event as unknown) as MouseEvent) as unknown) as Point);
        };
        this.move = function(event) {
            ref.lastPoint = (MouseTool.getEventPosition((event as unknown) as MouseEvent) as unknown) as Point;
            if (ref.dragging) {
                ref.updateQueue.run();
            }
            ref.showQueue.run();
        };
    }

    static makeReticle(point: paper.Point) {
        const size = 10 / paper.view.zoom;
        const ret = new paper.Path.Circle(point, size);
        ret.fillColor = new paper.Color(0.5, 0, 1, 0.5);
        return ret;
    }

    abort(): void  {
        this.dragging = false;
        if (this.currentTarget) {
            this.currentTarget.remove();
        }
        if (this.currentChannelID) {
            Registry.viewManager?.removeFeatureByID(this.currentChannelID);
        }
    }

    showTarget(point: paper.Point): void  {
        const target = ChannelTool.getTarget(this.lastPoint!);
        Registry.viewManager?.updateTarget(this.typeString, this.setString, target, {});
    }

    initChannel(): void  {
        this.startPoint = ChannelTool.getTarget(this.lastPoint!);
        this.lastPoint = this.startPoint;
    }

    updateChannel(): void  {
        if (this.lastPoint && this.startPoint) {
            if (this.currentChannelID) {
                const target = ChannelTool.getTarget(this.lastPoint);
                const feat = this.viewManagerDelegate.currentLayer.getFeature(this.currentChannelID);
                feat?.updateParameter("end", target);
            } else {
                const newChannel = ChannelTool.createChannel(this.startPoint, this.startPoint, this.typeString, this.setString);
                this.currentChannelID = newChannel.ID;
                Registry.viewManager?.addFeature(newChannel);
            }
        }
    }

    finishChannel(point: Point): void  {
        const target = ChannelTool.getTarget(point);
        if (this.currentChannelID) {
            if (this.startPoint![0] === target[0] && this.startPoint![1] === target[1]) {
                Registry.viewManager?.removeFeatureByID(this.currentChannelID);
            }
        } else {
            this.updateChannel();
        }
        this.currentChannelID = null;
        this.startPoint = null;
        Registry.viewManager?.saveDeviceState();
    }

    static createChannel(start: any, end: any, typestring: string | null = null, setstring: string | null = null) {
        return Device.makeFeature(typestring!, {
            start: start,
            end: end
        });
    }

    // TODO: Re-establish target selection logic from earlier demo
    static getTarget(point: Point): Point {
        if (Registry.viewManager === null){
            throw new Error("ViewManager not initialized");
        }
        const target = Registry.viewManager.snapToGrid(point);
        return target;
    }
}
