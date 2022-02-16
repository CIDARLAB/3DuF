import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType, paperObject  } from "../core/init";
import { CompoundPath } from "paper/dist/paper-core";

export default class DogboneInsert extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            rotation: "Float",
            length: "Float",
            width: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            width: 1200,
            length: 7480,
            height: 250
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            length: "μm",
            width: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            width: 30,
            length: 120,
            height: 10,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            width: 6000,
            length: 24 * 1000,
            height: 1200,
            rotation: 360
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            length: "length",
            width: "width"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            length: "length",
            width: "width",
            rotation: "rotation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DOGBONE INSERT";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const l = params.length;
        const w = params.width;

        const ports = [];

        ports.push(new ComponentPort(-l / 2 + 1 / 3 * w, 0, "1", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(l / 2 - 1 / 3 * w, 0, "2", LogicalLayerType.FLOW));

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const length = params.length;
        const width = params.width;
        const rotation = params.rotation;
        const color = params.color;

        const radius = 1 / 6 * width;

        const serp: paper.CompoundPath = new paper.CompoundPath([]);

        let insert = new paper.PathItem;

        // Produce rectangle
        const rect = new paper.Path.Rectangle(new paper.Point(px - length / 2, py - width / 2), new paper.Size(length, width));
        const rect2 = new paper.Path.Rectangle(new paper.Point(px - length / 2 + radius, py - width / 2), new paper.Size(length - 2 * radius, width));
        // Add half cricles to ends
        //let circle: paper.Path= new paper.Path.Circle(new paper.Point(px - length / 2 + radius, py - 2 * radius), radius);
        //insert = rect.unite(circle);
        //circle= new paper.Path.Circle(new paper.Point(px - length / 2 + radius, py + 2 * radius), radius);
        //insert = insert.unite(circle);
        //circle= new paper.Path.Circle(new paper.Point(px + length / 2 - radius, py - 2 * radius), radius);
        //insert = insert.unite(circle);
        //circle= new paper.Path.Circle(new paper.Point(px + length / 2 - radius, py + 2 * radius), radius);
        //insert = insert.unite(circle);

        // Cut-out half-circles into rectangle
        let circle = new paper.Path.Circle(new paper.Point(px - length / 2 + radius, py), radius);
        //insert = rect.exclude(circle, {trace:false});
        //circle= new paper.Path.Circle(new paper.Point(px + length / 2 - radius, py), radius);
        insert = rect2.intersect(circle);
        insert = rect2.exclude(insert);

        //insert = insert.subtract(rect2);

        serp.addChild(insert);
        serp.fillColor = color;
        serp.rotate(rotation, new paper.Point(px, py));
        return serp;
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
