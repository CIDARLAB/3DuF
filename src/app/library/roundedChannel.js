import Template from "./template";
import paper from "paper";

export default class RoundedChannel extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            start: "Point",
            end: "Point"
        };

        this.__heritable = {
            channelWidth: "Float",
            height: "Float"
        };

        this.__defaults = {
            channelWidth: 0.8 * 1000,
            height: 250
        };

        this.__units = {
            channelWidth: "μm",
            height: "μm"
        };

        this.__minimum = {
            channelWidth: 3,
            height: 10
        };

        this.__maximum = {
            channelWidth: 2000,
            height: 1200
        };

        this.__featureParams = {
            start: "start",
            end: "end",
            width: "channelWidth"
        };

        this.__targetParams = {
            diameter: "channelWidth"
        };

        this.__placementTool = "DragTool";

        this.__toolParams = {
            start: "start",
            end: "end"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "ROUNDED CHANNEL";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(params, key) {
        const start = params.start;
        const end = params.end;
        const color = params.color;
        const width = params.width;
        const baseColor = params.baseColor;
        const startPoint = new paper.Point(start[0], start[1]);
        const endPoint = new paper.Point(end[0], end[1]);
        const vec = endPoint.subtract(startPoint);
        const rec = paper.Path.Rectangle({
            size: [vec.length + width, width],
            point: start,
            radius: width / 2,
            fillColor: color,
            strokeWidth: 0
        });
        rec.translate([-width / 2, -width / 2]);
        rec.rotate(vec.angle, start);
        return rec;
    }

    render2DTarget(key, params) {
        const position = params.position;
        const radius = params.diameter;
        const color1 = params.color;
        const pos = new paper.Point(position[0], position[1]);
        const outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;
        return outerCircle;
    }
}
