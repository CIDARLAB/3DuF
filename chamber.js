import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Chamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            width: "Float",
            length: "Float",
            height: "Float",
            cornerRadius: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            width: 5000,
            length: 5000,
            height: 250,
            cornerRadius: 200,
            rotation: 0
        };

        this.__units = {
            componentSpacing: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m",
            cornerRadius: "&mu;m",
            rotation: "&deg;"
        };

        this.__minimum = {
            componentSpacing: 0,
            width: 5,
            length: 5,
            height: 1,
            cornerRadius: 1,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            width: 50000,
            length: 50000,
            height: 50000,
            cornerRadius: 1000,
            rotation: 360
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            cornerRadius: "cornerRadius",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            cornerRadius: "cornerRadius",
            rotation: "rotation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "REACTION CHAMBER";
    }

    getPorts(params) {
        let l = params["length"];
        let w = params["width"];

        let ports = [];

        ports.push(new ComponentPort(0, -l / 2, "1", "FLOW"));

        ports.push(new ComponentPort(w / 2, 0, "2", "FLOW"));

        ports.push(new ComponentPort(0, l / 2, "3", "FLOW"));

        ports.push(new ComponentPort(-w / 2, 0, "4", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        let radius = params["cornerRadius"];

        let rendered = new paper.CompoundPath();

        let rec = new paper.Path.Rectangle({
            point: new paper.Point(px - w / 2, py - l / 2),
            size: [w, l],
            radius: radius
        });

        rendered.addChild(rec);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
