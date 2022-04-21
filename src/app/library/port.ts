import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class Port extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            portRadius: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            portRadius: 100,
            height: 1.1 * 1000
        };

        this.__units = {
            componentSpacing: "μm",
            portRadius: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            portRadius: 0.8 * 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            portRadius: 3000,
            height: 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            portRadius: "portRadius"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            portRadius: "portRadius"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "PORT";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(params: { [k: string]: any }, key: string) {
        // Regardless of the key...
        const position = params.position;
        const radius = params.portRadius;
        const color1 = params.color;
        const pos = new paper.Point(position[0], position[1]);
        const outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;
        return outerCircle;
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }

    getPorts(params: { [k: string]: any }) {
        const radius = params.portRadius;

        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

        return ports;
    }
}
