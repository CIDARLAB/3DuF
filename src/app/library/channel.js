import Template from "./template";
import paper from "paper";

export default class Channel extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            start: "Point",
            end: "Point"
        };

        this.__defaults = {
            channelWidth: 0.8 * 1000,
            height: 250
        };

        this.__heritable = {
            channelWidth: "Float",
            height: "Float"
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

        this.__placementTool = "DragTool";

        this.__toolParams = {
            start: "start",
            end: "end"
        };

        this.__featureParams = {
            start: "start",
            end: "end",
            width: "channelWidth"
        };

        this.__targetParams = {
            diameter: "channelWidth",
            channelWidth: "channelWidth"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "CHANNEL";
    }

    render2D(params, key) {
        // Regardless of the key...
        const start = params.start;
        const end = params.end;
        const color = params.color;
        const width = params.width;
        const baseColor = params.baseColor;
        const startPoint = new paper.Point(start[0], start[1]);
        const endPoint = new paper.Point(end[0], end[1]);
        const vec = endPoint.subtract(startPoint);
        const rec = paper.Path.Rectangle({
            size: [vec.length, width],
            point: start,
            //  radius: width/2,
            fillColor: color,
            strokeWidth: 0
        });
        rec.translate([0, -width / 2]);
        rec.rotate(vec.angle, start);
        return rec;
    }

    render2DTarget(key, params) {
        const thickness = params.channelWidth / 5;
        const length = params.channelWidth;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        let chair = new paper.Path.Rectangle(x - length / 2, y - thickness / 2, length, thickness);
        chair = chair.unite(new paper.Path.Rectangle(x - thickness / 2, y - length / 2, thickness, length));
        chair.fillColor = color;
        chair.fillColor.alpha = 0.5;
        return chair;
    }
}
