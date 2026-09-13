import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

/**
 * Passive 3-port droplet merger T-junction (DropX ``DROPLET MERGER JUNCTION``).
 * Ports: 1 left inlet, 2 top inlet, 3 right outlet.
 */
export default class DropletMergerJunction extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            channelWidth: "Float",
            outputWidth: "Float",
            stabilizationLength: "Float",
            rotation: "Float",
            height: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            channelWidth: 400,
            outputWidth: 400,
            stabilizationLength: 1200,
            rotation: 0,
            height: 250,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            channelWidth: "μm",
            outputWidth: "μm",
            stabilizationLength: "μm",
            rotation: "°",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            channelWidth: 1,
            outputWidth: 1,
            stabilizationLength: 10,
            rotation: 0,
            height: 10,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            channelWidth: 4000,
            outputWidth: 4000,
            stabilizationLength: 50000,
            rotation: 360,
            height: 10000,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            channelWidth: "channelWidth",
            outputWidth: "outputWidth",
            stabilizationLength: "stabilizationLength",
            rotation: "rotation",
            height: "height",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            outputWidth: "outputWidth",
            stabilizationLength: "stabilizationLength",
            rotation: "rotation",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET MERGER JUNCTION";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    _arm(params: { [k: string]: any }): number {
        const cw = Number(params.channelWidth) || 400;
        const outW = Number(params.outputWidth) || cw;
        const width = Math.max(cw, outW);
        const stab = Number(params.stabilizationLength);
        return Math.max(3 * width, Number.isFinite(stab) ? stab / 2 : 3 * width);
    }

    getPorts(params: { [k: string]: any }) {
        const arm = this._arm(params);
        const ports = [];
        ports.push(new ComponentPort(0, arm, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(arm, 0, "2", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(2 * arm, arm, "3", LogicalLayerType.FLOW));
        return ports;
    }

    render2D(params: { [k: string]: any }, key: string): paper.CompoundPath {
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const cw = Number(params.channelWidth) || 400;
        const outW = Number(params.outputWidth) || cw;
        const arm = this._arm(params);
        const rotation = params.rotation || 0;
        const path = new paper.CompoundPath("");
        path.addChild(
            new paper.Path.Rectangle(new paper.Rectangle(x, y + arm - cw / 2, 2 * arm, cw))
        );
        path.addChild(
            new paper.Path.Rectangle(new paper.Rectangle(x + arm - outW / 2, y, outW, arm + cw / 2))
        );
        path.fillColor = color;
        return path.rotate(rotation, new paper.Point(x + arm, y + arm)) as unknown as paper.CompoundPath;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }): paper.CompoundPath {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
