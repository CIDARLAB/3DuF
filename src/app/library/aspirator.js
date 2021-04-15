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
            channelLength: "Float",
            channelWidth: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            channelLength: 0.8 * 1000,
            channelWidth: 0.8 * 1000,
            rotation: 0,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            channelLength: "&mu;m",
            channelWidth: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            channelLength: 10,
            channelWidth: 10,
            rotation: 0,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            channelLength: 2000,
            channelWidth: 2000,
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
            channelLength: "channelLength",
            channelWidth: "channelWidth",
            height: "height",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelLength: "channelLength",
            channelWidth: "channelWidth",
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
        let l = params["channelLength"];
        let w = params["channelWidth"];
        let rotation = params["rotation"];
        let color = params["color"];

        let rendered = new paper.CompoundPath();

        let rec = new paper.Path.Rectangle({
            point: new paper.Point(px - w / 2, py - l / 2),
            size: [w, l],
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