import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Anode extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            anodeRadius: "Float",
            pegHeight: "Float",
            pegWidth: "Float",
            height: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            anodeRadius: 0.9 * 1000,
            pegHeight: 0.2*1000,
            pegWidth: 0.7*1000,
            height: 1.1 * 1000,
            rotation: 0
        };

        this.__units = {
            componentSpacing: "&mu;m",
            anodeRadius: "&mu;m",
            pegHeight: "&mu;m",
            pegWidth: "&mu;m",
            height: "&mu;m",
            rotation: "&deg;"
        };

        this.__minimum = {
            componentSpacing: 0,
            anodeRadius: 0.4 * 10,
            pegHeight: 0.1*1000,
            pegWidth: 0.1*1000,
            height: 10,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            anodeRadius: 2000,
            pegHeight: 2*1000,
            pegWidth: 2*1000,
            height: 1200,
            rotation: 90
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            anodeRadius: "anodeRadius",
            pegHeight: "pegHeight",
            pegWidth: "pegWidth",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            anodeRadius: "anodeRadius",
            pegHeight: "pegHeight",
            pegWidth: "pegWidth",
            rotation: "rotation"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "ANODE";
    }

    render2D(params, key) {
        //Regardless of the key...
        let position = params["position"];
        let radius = params["anodeRadius"];
        let pegheight = params["pegHeight"];
        let pegwidth = params["pegWidth"];
        let rotation = params["rotation"];
        let color1 = params["color"];
        let pos = new paper.Point(position[0], position[1]);
        let outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;

        let peg = new paper.Path.Rectangle(
            position[0]-pegwidth/2,position[1]-pegheight/2,
            pegwidth,pegheight)
	let finalCircle = outerCircle.subtract(peg);
        finalCircle.fillColor = color1;
        outerCircle.remove()
        peg.remove()
        return finalCircle.rotate(rotation, pos);
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }

    getPorts(params) {
        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        return ports;
    }
}
