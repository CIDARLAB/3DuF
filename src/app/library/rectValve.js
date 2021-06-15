import Template from "./template";
import paper from "paper";

export default class RectValve extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            portRadius: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            portRadius: 0.7 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            portRadius: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            portRadius: 0.8 * 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            portRadius: 2000,
            height: 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "VALVE";
    }

    render2D(params, key) {
        //Regardless of the key...
        let start = params["start"];
        let end = params["end"];
        let color = params["color"];
        let width = params["width"];
        let baseColor = params["baseColor"];
        let startPoint = new paper.Point(start[0], start[1]);
        let endPoint = new paper.Point(end[0], end[1]);
        let vec = endPoint.subtract(startPoint);
        let rec = paper.Path.Rectangle({
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
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
    }
}
