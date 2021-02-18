import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Node extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            height: 100
        };

        this.__units = {
            componentSpacing: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            height: 1000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "NODE";
    }

    getPorts(params) {
        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        //Regardless of the key...
        let pos = new paper.Point(0, 0);
        let outerCircle = new paper.Path.Circle(pos, 0);
        return outerCircle;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }

}
