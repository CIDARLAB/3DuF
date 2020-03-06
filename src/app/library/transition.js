import Template from "./template";
import paper from "paper";

export default class Transition extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            cw1: "Float",
            cw2: "Float",
            length: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            cw1: 0.8 * 1000,
            cw2: 0.9 * 1000,
            length: 1.0 * 1000,
            rotation: 0,
            height: 250
        };

        this.__units = {
            cw1: "&mu;m",
            cw2: "&mu;m",
            length: "&mu;m",
            rotation: "&deg",
            height: "&mu;m"
        };

        this.__minimum = {
            cw1: 3,
            cw2: 3,
            length: 10,
            height: 10,
            rotation: 0
        };

        this.__maximum = {
            rotation: 180,
            cw1: 2000,
            cw2: 2000,
            length: 1200,
            height: 1200
        };

        this.__featureParams = {
            position: "position",
            cw1: "cw1",
            cw2: "cw2",
            length: "length",
            rotation: "rotation"
        };

        this.__targetParams = {
            cw1: "cw1",
            cw2: "cw2",
            length: "length",
            rotation: "rotation"
        };

        this.__placementTool = "PositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TRANSITION";
    }

    render2D(params, key) {
        let position = params["position"];
        let cw1 = params["cw1"];
        let cw2 = params["cw2"];
        let length = params["length"];
        let rotation = params["rotation"];
        let color = params["color"];
        let trap = new paper.Path();

        trap.add(new paper.Point(position[0] - cw1 / 2, position[1]));
        trap.add(new paper.Point(position[0] + cw1 / 2, position[1]));
        trap.add(new paper.Point(position[0] + cw2 / 2, position[1] + length));
        trap.add(new paper.Point(position[0] - cw2 / 2, position[1] + length));
        //trap.add(new paper.Point(position[0] - cw1/2, position[1]));

        trap.closed = true;
        trap.fillColor = color;
        return trap.rotate(rotation, position[0], position[1]);
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
