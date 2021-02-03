import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Valve extends Template {
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
            width: 1.23 * 1000,
            length: 4.92 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            width: 30,
            length: 120,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 180,
            width: 6000,
            length: 24 * 1000,
            height: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            length: "length",
            width: "width",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            length: "length",
            width: "width",
            rotation: "rotation"
        };

        this.__placementTool = "ValveInsertionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["CONTROL"];

        this.__mint = "VALVE";
    }

    getPorts(params) {
        let l = params["length"];
        let w = params["width"];

        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "CONTROL"));

        return ports;
    }

    render2D(params, key = "FLOW") {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let color = params["color"];
        let rotation = params["rotation"];
        let startX = px - w / 2;
        let startY = py - l / 2;
        let endX = px + w / 2;
        let endY = py + l / 2;
        let startPoint = new paper.Point(startX, startY);
        let endPoint = new paper.Point(endX, endY);
        let rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            fillColor: color,
            strokeWidth: 0
        });

        return rec.rotate(rotation, px, py);
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, (key = "FLOW"));
        render.fillColor.alpha = 0.5;
        return render;
    }
}
