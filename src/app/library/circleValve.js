import Template from "./template";
import paper from "paper";

export  default class CircleValve extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "radius1": "Float",
            "radius2": "Float",
            "height": "Float"
        };

        this.__defaults = {
            "radius1": 1.4 * 1000,
            "radius2": 1.2 * 1000,
            "height": 250
        };


        this.__units = {
            "radius1": "&mu;m",
            "radius2": "&mu;m",
            "height": "&mu;m"
        };

        this.__minimum = {
            "radius1": 10,
            "radius2": 10,
            "height": 10
        };

        this.__maximum = {
            "radius1": 2000,
            "radius2": 2000,
            "height": 1200
        };

        this.__featureParams = {
            position: "position",
            radius1: "portRadius",
            radius2: "radius2"
        };

        this.__targetParams = {
            radius1: "portRadius",
            radius2: "radius2"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "CIRCLE VALVE";

    }

    render2D(params, key) {
        let position = params["position"];
        let radius = params["portRadius"];
        let color1 = params["color"];
        let pos = new paper.Point(position[0], position[1]);
        let outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;
        return outerCircle;

    }

    render2DTarget(key, params){
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;

    }
}