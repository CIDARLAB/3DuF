import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

/**
 * NODE — same-layer channel junction (temporary T / Y meet).
 *
 * Visually a tiny disk (default radius 10 µm, negligible vs typical
 * channelWidth). All FLOW channels share the single centre terminal "1".
 * Contrast with PORT (large I/O pad to the outside) and VIA (inter-layer
 * punch with a much larger default radius).
 */
export default class Node extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            radius: "Float",
            depth: "Float"
        };

        this.__defaults = {
            componentSpacing: 2000,
            // Tiny vs channelWidth (~100–600): junction marker only.
            radius: 10,
            depth: 100
        };

        this.__units = {
            componentSpacing: "μm",
            radius: "μm",
            depth: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            radius: 1,
            depth: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            radius: 2000,
            depth: 1000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            radius: "radius"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            radius: "radius"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "NODE";

        this.__zOffsetKeys = {
            FLOW: "depth"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        // One centre hole: every CHANNEL that lands on this NODE meets here.
        const ports = [];
        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));
        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const position = params.position || [0, 0];
        const radius = Number(params.radius) || 10;
        const color1 = params.color;
        const pos = new paper.Point(position[0], position[1]);
        const disc = new paper.Path.Circle(pos, radius);
        disc.fillColor = color1;
        return disc;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
