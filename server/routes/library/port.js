import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import CSG from "@jscad/csg";

export default class Port extends Template {
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
            height: 1.1 * 1000
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

        this.__featureParams = {
            position: "position",
            portRadius: "portRadius"
        };

        this.__targetParams = {
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
        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        return ports;
    }

    render3D(params, key){
        let position = params["position"];
        let radius = params["portRadius"];
        let color1 = params["color"];
        let pos = new paper.Point(position[0], position[1]);

        let cylinder = CSG.cylinder({start: [1, 2, 3], end: [4, 5, 6], radiusStart: 7, radiusEnd: 8, resolution: 72});

        console.log("Testing the csg thing:", cylinder);
        
        return cylinder;
    }
}
