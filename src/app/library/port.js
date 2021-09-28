import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Port extends Template {
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
            height: 1.1 * 1000
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

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            portRadius: "portRadius"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            portRadius: "portRadius"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "PORT";
    }

    render2D(params, key) {
        //Regardless of the key...
        let position = params["position"];
        let radius = params["portRadius"];
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

    getPorts(params) {
        let radius = params["portRadius"];

        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        return ports;
    }
}
