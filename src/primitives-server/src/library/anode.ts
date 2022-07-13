import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class Anode extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            anodeRadius: "Float",
            pegHeight: "Float",
            pegWidth: "Float",
            height: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            anodeRadius: 0.9 * 1000,
            pegHeight: 0.2 * 1000,
            pegWidth: 0.7 * 1000,
            height: 1.1 * 1000,
            rotation: 0
        };

        this.__units = {
            componentSpacing: "μm",
            anodeRadius: "μm",
            pegHeight: "μm",
            pegWidth: "μm",
            height: "μm",
            rotation: "°"
        };

        this.__minimum = {
            componentSpacing: 0,
            anodeRadius: 0.4 * 10,
            pegHeight: 0.1 * 1000,
            pegWidth: 0.1 * 1000,
            height: 10,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            anodeRadius: 2000,
            pegHeight: 2 * 1000,
            pegWidth: 2 * 1000,
            height: 1200,
            rotation: 90
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            anodeRadius: "anodeRadius",
            pegHeight: "pegHeight",
            pegWidth: "pegWidth",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            anodeRadius: "anodeRadius",
            pegHeight: "pegHeight",
            pegWidth: "pegWidth",
            rotation: "rotation"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "ANODE";
    }

    render2D(params: { [k: string]: any }, key: string): paper.PathItem {
        // Regardless of the key...
        const position = params.position;
        const radius = params.anodeRadius;
        const pegheight = params.pegHeight;
        const pegwidth = params.pegWidth;
        const rotation = params.rotation;
        const color1 = params.color;
        const pos = new paper.Point(position[0], position[1]);
        const outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;

        const peg = new paper.Path.Rectangle(new paper.Rectangle(position[0] - pegwidth / 2, position[1] - pegheight / 2, pegwidth, pegheight));
        const finalCircle = outerCircle.subtract(peg);
        finalCircle.fillColor = color1;
        outerCircle.remove();
        peg.remove();
        return (finalCircle.rotate(rotation, pos) as unknown) as paper.PathItem;
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }

    getPorts(params: any) {
        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

        return ports;
    }
}
