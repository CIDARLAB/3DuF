import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Incubation extends Template {
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
            channelWidth: "Float",
            length: "Float",
            width: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            channelWidth: 0.8 * 1000,
            width: 1.23 * 1000,
            length: 4.92 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            channelWidth: "&mu;m",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            channelWidth: 10,
            width: 30,
            length: 120,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            channelWidth: 2000,
            width: 6000,
            length: 24 * 1000,
            height: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            channelWidth: "channelWidth",
            length: "length",
            width: "width"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            length: "length",
            width: "width",
            rotation: "rotation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "INCUBATION";
    }

    getPorts(params) {
        let length = params["length"];

        let ports = [];

        ports.push(new ComponentPort(0, - length/2, "1", "FLOW"));

        ports.push(new ComponentPort(0, length/2, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let cw = params["channelWidth"];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        let p0, p1, p2, p3, p4, p5;
        // if (rotation == "H") {
        //     p0 = [px - l / 2, py - cw / 2];
        //     p1 = [px - l / 2, py + cw / 2];
        //     p2 = [px, py + w + cw / 2];
        //     p3 = [px + l / 2, py + cw / 2];
        //     p4 = [px + l / 2, py - cw / 2];
        //     p5 = [px, py - cw / 2 - w];
        // } else {
            p0 = [px - cw / 2, py - l / 2];
            p1 = [px + cw / 2, py - l / 2];
            p2 = [px + w + cw / 2, py];
            p3 = [px + cw / 2, py + l / 2];
            p4 = [px - cw / 2, py + l / 2];
            p5 = [px - cw / 2 - w, py];
        // }
        let hex = new paper.Path();
        hex.add(new paper.Point(p0));
        hex.add(new paper.Point(p1));
        hex.add(new paper.Point(p2));
        hex.add(new paper.Point(p3));
        hex.add(new paper.Point(p4));
        hex.add(new paper.Point(p5));
        hex.closed = true;
        hex.fillColor = color;

        hex.rotate(rotation, new paper.Point(px, py));

        return hex;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
