import Template from "./template";
import paper from "paper";

export default class Text extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            portRadius: "Float",
            height: "Float"
        };

        this.__defaults = {
            portRadius: 0.7 * 1000,
            height: 250
        };

        this.__units = {
            portRadius: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            portRadius: 0.8 * 10,
            height: 10
        };

        this.__maximum = {
            portRadius: 2000,
            height: 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };
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
        const render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
    }
}
