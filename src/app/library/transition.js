import Template from "./template";
import paper from "paper";

export  default class Transition extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "cw1": "Float",
            "cw2": "Float",
            "length": "Float",
            "orientation": "String",
            "height": "Float"
        };

        this.__defaults = {
            "cw1": .80 * 1000,
            "cw2": .90 * 1000,
            "length": 1.0 * 1000,
            "orientation": "V",
            "height": 250
        };


        this.__units = {
            "cw1": "&mu;m",
            "cw2": "&mu;m",
            "length": "&mu;m",
            "orientation": "",
            "height": "&mu;m"
        };

        this.__minimum = {
            "cw1": 3,
            "cw2": 3,
            "length": 10,
            "height": 10
        };

        this.__maximum = {
            "cw1": 2000,
            "cw2": 2000,
            "length": 1200,
            "height": 1200
        };

        this.__featureParams = {
            position: "position",
            cw1: "cw1",
            cw2: "cw2",
            length: "length",
            orientation: "orientation"
        };

        this.__targetParams = {
            cw1: "cw1",
            cw2: "cw2",
            length: "length",
            orientation: "orientation"
        };

        this.__placementTool = "PositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "TRANSITION";
    }

    render2D(params, key) {
        let position = params["position"];
        let cw1 = params["cw1"];
        let cw2 = params["cw2"];
        let length = params["length"];
        let orientation = params["orientation"];
        let color = params["color"];
        let trap = new paper.Path();

        if (orientation == "V") {
            trap.add(new paper.Point(position[0] - cw1 / 2, position[1]));
            trap.add(new paper.Point(position[0] + cw1 / 2, position[1]));
            trap.add(new paper.Point(position[0] + cw2 / 2, position[1] + length));
            trap.add(new paper.Point(position[0] - cw2 / 2, position[1] + length));
            //trap.add(new paper.Point(position[0] - cw1/2, position[1]));
        }
        else {
            trap.add(new paper.Point(position[0], position[1] - cw1 / 2));
            trap.add(new paper.Point(position[0], position[1] + cw1 / 2));
            trap.add(new paper.Point(position[0] + length, position[1] + cw2 / 2));
            trap.add(new paper.Point(position[0] + length, position[1] - cw2 / 2));
            //trap.add(new paper.Point(position[0], position[1] - cw1/2));
        }
        trap.closed = true;
        trap.fillColor = color;
        return trap;
    }

    render2DTarget(key, params){
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}