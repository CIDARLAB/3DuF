import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import CSG from "@jscad/csg";

export default class SquareCellTrap extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            chamberWidth: "Float",
            height: "Float",
            chamberLength: "Float",
            channelWidth: "Float"

        };

        this.__defaults = {
            height: 1.1 * 1000,
            chamberWidth: 1000,
            chamberLength: 1000,
            channelWidth: 1000

        };

        this.__units = {
            chamberWidth: "&mu;m",
            chamberLength:"&mu;m",
            channelWidth: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            height: 1,
            chamberWidth: 1,
            chamberLength: 1,
            channelWidth: 1
        };

        this.__maximum = {
            height: 1.1 * 10000,
            chamberWidth: 10000,
            chamberLength: 10000,
            channelWidth: 10000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            chamberWidth:"chamberWidth",
            channelWidth:"channelWidth",
            chamberLength:"chamberLength",
            height:"height",
            position: "position"
        };

        this.__targetParams = {
            chamberWidth:"chamberWidth",
            chamberLength:"chamberLength",
            channelWidth:"channelWidth",
            height:"height"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "SQUARE CELL TRAP";
    }

    render2D(params, key) {
        //Regardless of the key...
        let position = params["position"];
        let color1 = params["color"];
        let chamberWidth = params["chamberWidth"];
        let chamberLength = params["chamberLength"];
        let channelWidth = params["channelWidth"];
        let height = params["height"];

        let pos = new paper.Point(position[0], position[1]);
        let size = new paper.Size(2*chamberWidth + channelWidth, 2*chamberLength + channelWidth);
        let box = new paper.Path.Rectangle(pos, size);
        box.fillColor = color1;
        return box;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }

    getPorts(params) {
        let ports = [];
        let chamberWidth = params["chamberWidth"];
        let chamberLength = params["chamberLength"];
        let channelWidth = params["channelWidth"];

        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "1", "FLOW"));
        ports.push(new ComponentPort(2*chamberWidth + channelWidth, chamberLength + channelWidth/2, "2", "FLOW"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 2*chamberLength + channelWidth, "3", "FLOW"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "4", "FLOW"));

        return ports;
    }

}
