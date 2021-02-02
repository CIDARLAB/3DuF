import Template from "./template";
import paper from "paper";

export default class Via extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            radius: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            radius: 0.7 * 1000,
            height: 0
        };

        this.__units = {
            componentSpacing: "&mu;m",
            radius: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            radius: 0.8 * 10,
            height: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            radius: 2000,
            height: 0
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            radius: "radius"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            radius: "radius"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "VIA";
    }

    render2D(params, key) {
        //Regardless of the key...
        let position = params["position"];
        let radius = params["radius"];
        let color1 = params["color"];
        let pos = new paper.Point(position[0], position[1]);
        let outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;
        return outerCircle;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
