import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Pump extends Template {
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
            height: "Float",
            spacing: "Float",
            flowChannelWidth: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            width: 600,
            length: 300,
            height: 250,
            spacing: 1000,
            flowChannelWidth: 300
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m",
            spacing: "&mu;m",
            flowChannelWidth: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            width: 30,
            length: 120,
            height: 10,
            spacing: 10,
            flowChannelWidth: 1
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            width: 6000,
            length: 24 * 1000,
            height: 1200,
            spacing: 10000,
            flowChannelWidth: 10000
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            length: "length",
            width: "width",
            rotation: "rotation",
            spacing: "spacing",
            flowChannelWidth: "flowChannelWidth"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            length: "length",
            width: "width",
            rotation: "rotation",
            spacing: "spacing",
            flowChannelWidth: "flowChannelWidth"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "PUMP";
    }

    getPorts(params) {
        let l = params["length"];
        let w = params["width"];
        let spacing = params["spacing"];

        let ports = [];

        ports.push(new ComponentPort(0, -l / 2 - spacing, "1", "FLOW"));

        ports.push(new ComponentPort(0, l / 2 + spacing, "2", "FLOW"));

        ports.push(new ComponentPort(0, -spacing, "3", "CONTROL"));

        ports.push(new ComponentPort(0, 0, "4", "CONTROL"));

        ports.push(new ComponentPort(0, spacing, "5", "CONTROL"));

        return ports;
    }

    __drawFlow(params) {
        let rec;
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let color = params["color"];
        let rotation = params["rotation"];
        let spacing = params["spacing"];
        let channelwidth = params["flowChannelWidth"];

        let startX = px - w / 2;
        let startY = py - l / 2;
        let endX = px + w / 2;
        let endY = py + l / 2;

        let ret = new paper.CompoundPath();

        let startPoint = new paper.Point(startX, startY);
        let endPoint = new paper.Point(endX, endY);

        rec = paper.Path.Rectangle({
            from: new paper.Point(px - channelwidth / 2, py - spacing - l / 2),
            to: new paper.Point(px + channelwidth / 2, py + spacing + l / 2)
        });

        ret.addChild(rec);

        ret.fillColor = color;
        return ret.rotate(rotation, px, py);
    }

    __drawControl(params) {
        let rec;
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let color = params["color"];
        let rotation = params["rotation"];
        let spacing = params["spacing"];

        let startX = px - w / 2;
        let startY = py - l / 2;
        let endX = px + w / 2;
        let endY = py + l / 2;

        let ret = new paper.CompoundPath();

        let startPoint = new paper.Point(startX, startY);
        let endPoint = new paper.Point(endX, endY);

        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            fillColor: color,
            strokeWidth: 0
        });

        ret.addChild(rec);

        let topcenter = new paper.Point(px, py - spacing);

        rec = paper.Path.Rectangle({
            from: new paper.Point(topcenter.x - w / 2, topcenter.y - l / 2),
            to: new paper.Point(topcenter.x + w / 2, topcenter.y + l / 2)
        });

        ret.addChild(rec);

        let bottomcenter = new paper.Point(px, py + spacing);
        rec = paper.Path.Rectangle({
            from: new paper.Point(bottomcenter.x - w / 2, bottomcenter.y - l / 2),
            to: new paper.Point(bottomcenter.x + w / 2, bottomcenter.y + l / 2)
        });

        ret.addChild(rec);

        ret.fillColor = color;
        return ret.rotate(rotation, px, py);
    }

    render2D(params, key = "FLOW") {
        if (key == "FLOW") {
            return this.__drawFlow(params);
        } else if (key == "CONTROL") {
            return this.__drawControl(params);
        }
    }

    render2DTarget(key, params) {
        let ret = new paper.CompoundPath();
        let flow = this.render2D(params, "FLOW");
        let control = this.render2D(params, "CONTROL");
        ret.addChild(control);
        ret.addChild(flow);
        ret.fillColor = params["color"];
        ret.fillColor.alpha = 0.5;
        return ret;
    }
}
