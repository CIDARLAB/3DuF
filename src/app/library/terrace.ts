import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Terrace extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            insideRadius: "Float",
            outsideRadius: "Float",
            length: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            insideRadius: 0.7 * 1000,
            outsideRadius: 1 * 1000,
            length: 4.0 * 1000,
            height: 1.1 * 1000
        };

        this.__units = {
            componentSpacing: "μm",
            insideRadius: "μm",
            outsideRadius: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            insideRadius: 0.5 * 10,
            outsideRadius: 0.8 * 10,
            length: 1.0 * 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            insideRadius: 5000,
            outsideRadius: 5000,
            length: 20000,
            height: 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            insideRadius: "insideRadius",
            outsideRadius: "outsideRadius",
            length: "length"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            insideRadius: "insideRadius",
            outsideRadius: "outsideRadius",
            length: "length"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TERRACE";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(params: { [k: string]: any }, key: string) {
        //Instead of making 4 seperate triangles, just find the 4 points of the diamond, already found 2 of them
        const position = params.position;
        const outsideRadius = params.outsideRadius;
        const insideRadius = params.insideRadius;
        const length = params.length;
        const color1 = params.color;
        const pos = new paper.Point(position[0], position[1]);

        const circle = new paper.Path.Circle(pos, outsideRadius);

        const tangent_point = new paper.Point(outsideRadius * Math.cos((5 * Math.PI) / 6), outsideRadius * Math.sin((5 * Math.PI) / 6));
        const p1 = new paper.Point(tangent_point.x - tangent_point.y / Math.tan(Math.PI / 3), 0);
        const p2 = new paper.Point(0, -p1.x * Math.tan(Math.PI / 3));
        const p3 = new paper.Point(-p1.x, p1.y);
        const p4 = new paper.Point(p2.x, -p2.y);

        const inside_circle = new paper.Path.Circle(pos, insideRadius);

        const diamond = new paper.Path();
        diamond.add(p1);
        diamond.add(p2);
        diamond.add(p3);
        diamond.add(p4);
        diamond.closed = true;
        diamond.translate(pos);

        let terrace = diamond.subtract(inside_circle);

        const subtraction_rec = terrace.bounds;

        const subtraction_path = new paper.Path.Rectangle(terrace.bounds);
        subtraction_path.translate(new paper.Point(0, subtraction_rec.height / 2 + length / 2));
        terrace = terrace.subtract(subtraction_path);

        subtraction_path.scale(1, -1, new paper.Point(position));

        terrace = terrace.subtract(subtraction_path);

        terrace.fillColor = color1;
        this.transformRender(params, terrace as paper.CompoundPath);

        return terrace;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }

    getPorts(params: { [k: string]: any }) {
        const render = this.render2D(params, "FLOW");

        const rec = render.bounds;

        const ports = [];

        ports.push(new ComponentPort(0, -rec.height / 2, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(0, rec.height / 2, "2", LogicalLayerType.FLOW));

        return ports;
    }
}
