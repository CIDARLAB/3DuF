import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class Node extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            height: 100
        };

        this.__units = {
            componentSpacing: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            height: 1000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "NODE";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        // Regardless of the key...
        const pos = new paper.Point(0, 0);
        const outerCircle = new paper.Path.Circle(pos, 0);
        return outerCircle;
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
