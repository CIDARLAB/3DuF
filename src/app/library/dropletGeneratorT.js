import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class DropletGeneratorT extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            oilChannelWidth: "Float",
            waterChannelWidth: "Float",
            length: "Float",
            radius: "Float",
            // angle: "Float",
            height: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            oilChannelWidth: 0.6 * 1000,
            waterChannelWidth: 0.3 * 1000,
            length: 5 * 1000,
            radius: 500,
            height: 250,
            rotation: 0
        };

        this.__units = {
            componentSpacing: "&mu;m",
            oilChannelWidth: "&mu;m",
            height: "&mu;m",
            waterChannelWidth: "&mu;m",
            radius: "&mu;m",
            rotation: "&deg;",
            length: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            oilChannelWidth: 1,
            waterChannelWidth: 1,
            radius: 1,
            rotation: 0,
            length: 0 * 1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            oilChannelWidth: 2000,
            waterChannelWidth: 2000,
            height: 1200,
            radius: 2000,
            rotation: 360,
            length: 8 * 1000
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            oilChannelWidth: "oilChannelWidth",
            waterChannelWidth: "waterChannelWidth",
            height: "height",
            rotation: "rotation",
            radius: "radius",
            length: "length"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            oilChannelWidth: "oilChannelWidth",
            waterChannelWidth: "waterChannelWidth",
            height: "height",
            rotation: "rotation",
            radius: "radius",
            length: "length"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET GENERATOR T";
    }

    getPorts(params) {
        let length = params["length"];

        let ports = [];

        ports.push(new ComponentPort(length / 2, 0, "1", "FLOW"));

        //Out
        return ports;
    }

    render2D(params, key) {
        let pos = params["position"];
        let x = pos[0];
        let y = pos[1];
        let color = params["color"];
        let oilChannelWidth = params["oilChannelWidth"];
        let waterChannelWidth = params["waterChannelWidth"];
        let radius = params["radius"];
        let rotation = params["rotation"];
        let length = params["length"];

        let ret = new paper.CompoundPath();

        let topLeft = new paper.Point(x - length / 2, y - oilChannelWidth / 2);
        let bottomRight = new paper.Point(x + length / 2, y + oilChannelWidth / 2);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        let circ = new paper.Path.Circle(new paper.Point(x - length / 2, y), radius);

        ret.addChild(circ);

        topLeft = new paper.Point(x - waterChannelWidth / 2, y);
        bottomRight = new paper.Point(x + waterChannelWidth / 2, y + length / 2);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        circ = new paper.Path.Circle(new paper.Point(x, y + length / 2), radius);

        ret.addChild(circ);

        //Rotate the geometry
        ret.closed = true;
        ret.rotate(-rotation, new paper.Point(x, y));
        ret.fillColor = color;

        return ret;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);

        render.fillColor.alpha = 0.5;
        return render;
    }
}
