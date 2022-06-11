import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Valve3D extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            rotation: "Float",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            width: "Float",
            length: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            valveRadius: 1.2 * 1000,
            height: 250,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000
        };

        this.__units = {
            componentSpacing: "μm",
            valveRadius: "μm",
            height: "μm",
            gap: "μm",
            width: "μm",
            length: "μm",
            rotation: "°"
        };

        this.__minimum = {
            componentSpacing: 0,
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0,
            width: 10,
            length: 10

        };

        this.__maximum = {
            componentSpacing: 10000,
            valveRadius: 0.3 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180,
            width: 3 * 1000,
            length: 3 * 1000
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        };

        this.__placementTool = "valveInsertionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL", "INVERSE"];

        this.__mint = "VALVE3D";

        this.__zOffsetKeys = {
            FLOW: "height",
            CONTROL: "height",
            INVERSE: "height"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CONTROL: "+1",
            INVERSE: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.CONTROL));

        return ports;
    }

    __drawFlow(params: { [k: string]: any }) {
        const position = params.position;
        const gap = params.gap;
        const radius = params.valveRadius;
        const color = params.color;
        const rotation = params.rotation;

        const center = new paper.Point(position[0], position[1]);
        // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
        const circ = new paper.Path.Circle(center, radius);
        // circ.fillColor = color;
        //   if (String(color) === "3F51B5") {
        const cutout = new paper.Path.Rectangle({
            from: new paper.Point(position[0] - radius, position[1] - gap / 2),
            to: new paper.Point(position[0] + radius, position[1] + gap / 2)
        });
        // cutout.fillColor = "white";
        const valve = circ.subtract(cutout);
        valve.rotate(rotation, center);
        valve.fillColor = color;
        return valve;
    }

    __drawControl(params: { [k: string]: any }) {
        const position = params.position;
        const gap = params.gap;
        const radius = params.valveRadius;
        const color = params.color;
        const rotation = params.rotation;
        const center = new paper.Point(position[0], position[1]);
        // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
        const circ = new paper.Path.Circle(center, radius);
        circ.fillColor = color;
        return circ;
    }

    render2D(params: { [k: string]: any }, key = "FLOW") {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        } else if (key === "INVERSE") {
            return this.__drawInverseFlow(params);
        } else {
            throw new Error("No render procedure defined for component:" + this.__mint + ", key: " + key);
        }
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        const render = this.render2D(params, "FLOW");
        render.fillColor!.alpha = 0.5;
        return render;
    }

    __drawInverseFlow(params: { [k: string]: any }): paper.PathItem  {
        const position = params.position;
        const gap = params.gap;
        const radius = params.valveRadius;
        const color = params.color;
        console.log("Color:", color);
        const rotation = params.rotation;
        const center = new paper.Point(position[0], position[1]);
        // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
        const circ = new paper.Path.Circle(center, radius);
        circ.fillColor = color;
        return (circ.rotate(rotation, center) as unknown) as paper.Path.Circle;
    }
}
