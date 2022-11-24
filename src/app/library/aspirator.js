import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Aspirator extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            length: "Float",
            width: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            length: 5000,
            width: 4000,
            rotation: 0,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            length: "&mu;m",
            width: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            length: 10,
            width: 10,
            rotation: 0,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            length: 10000,
            width: 8000,
            rotation: 360,
            height: 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            length: "length",
            width: "width",
            height: "height",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            length: "length",
            width: "width",
            height: "height",
            rotation: "rotation",
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "ASPIRATOR";
    }

    render2D(params, key) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];

        let rendered = new paper.CompoundPath();

        let recBody = new paper.Path.Rectangle({
            point: new paper.Point(px - w, py - l),
            size: [w, l],
        });

        let recSpout = new paper.Path.Rectangle({
            point: new paper.Point(px - w * 0.75, py - 1.5 * l),
            size: [w / 2, l / 2],
        });

        rendered.addChild(recBody);
        rendered.addChild(recSpout);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}