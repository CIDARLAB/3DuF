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
        };

        this.__defaults = {
        };

        this.__units = {
        };

        this.__minimum = {
        };

        this.__maximum = {
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            position: "position",
            portRadius: "portRadius"
        };

        this.__targetParams = {
            portRadius: "portRadius"
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
