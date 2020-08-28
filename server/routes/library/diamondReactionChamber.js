import Template from "./template";
import paper from "paper";

export default class DiamondReactionChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            orientation: "String",
            channelWidth: "Float",
            length: "Float",
            width: "Float",
            height: "Float"
        };

        this.__defaults = {
            orientation: "V",
            channelWidth: 0.8 * 1000,
            width: 1.23 * 1000,
            length: 4.92 * 1000,
            height: 250
        };

        this.__units = {
            orientation: "",
            channelWidth: "&mu;m",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            channelWidth: 10,
            width: 30,
            length: 120,
            height: 10
        };

        this.__maximum = {
            channelWidth: 2000,
            width: 6000,
            length: 24 * 1000,
            height: 1200
        };

        this.__featureParams = {
            position: "position",
            orientation: "orientation",
            channelWidth: "channelWidth",
            length: "length",
            width: "width"
        };

        this.__targetParams = {
            channelWidth: "channelWidth",
            length: "length",
            width: "width",
            orientation: "orientation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DIAMOND REACTION CHAMBER";
    }

    render2D(params, key) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let cw = params["channelWidth"];
        let l = params["length"];
        let w = params["width"];
        let orientation = params["orientation"];
        let color = params["color"];
        let p0, p1, p2, p3, p4, p5;
        if (orientation == "H") {
            p0 = [px - l / 2, py - cw / 2];
            p1 = [px - l / 2, py + cw / 2];
            p2 = [px, py + w + cw / 2];
            p3 = [px + l / 2, py + cw / 2];
            p4 = [px + l / 2, py - cw / 2];
            p5 = [px, py - cw / 2 - w];
        } else {
            p0 = [px - cw / 2, py - l / 2];
            p1 = [px + cw / 2, py - l / 2];
            p2 = [px + w + cw / 2, py];
            p3 = [px + cw / 2, py + l / 2];
            p4 = [px - cw / 2, py + l / 2];
            p5 = [px - cw / 2 - w, py];
        }
        let hex = new paper.Path();
        hex.add(new paper.Point(p0));
        hex.add(new paper.Point(p1));
        hex.add(new paper.Point(p2));
        hex.add(new paper.Point(p3));
        hex.add(new paper.Point(p4));
        hex.add(new paper.Point(p5));
        hex.closed = true;
        hex.fillColor = color;
        return hex;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
