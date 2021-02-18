import Template from "./template";
import paper from "paper";

export default class Valve3D extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            rotation: "Float",
            valveRadius: "Float",
            height: "Float",
            gap: "Float",
            width: "Float",
            length: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            valveRadius: 1.2 * 1000,
            height: 250,
            gap: 0.6 * 1000,
            width: 2.4 * 1000,
            length: 2.4 * 1000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            valveRadius: "&mu;m",
            height: "&mu;m",
            gap: "&mu;m",
            width: "&mu;m",
            length: "&mu;m",
            rotation: "&deg;"
        };

        this.__minimum = {
            componentSpacing: 0,
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            gap: 0.5 * 10,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            gap: 0.1 * 10000,
            rotation: 180
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            gap: "gap"
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL", "INVERSE"];

        this.__mint = "VALVE3D";
    }

    getPorts(params) {
        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "CONTROL"));

        return ports;
    }

    __drawFlow(params) {
        let position = params["position"];
        let gap = params["gap"];
        let radius = params["valveRadius"];
        let color = params["color"];
        let rotation = params["rotation"];

        let center = new paper.Point(position[0], position[1]);
        // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
        let circ = new paper.Path.Circle(center, radius);
        //circ.fillColor = color;
        //   if (String(color) == "3F51B5") {
        let cutout = paper.Path.Rectangle({
            from: new paper.Point(position[0] - radius, position[1] - gap / 2),
            to: new paper.Point(position[0] + radius, position[1] + gap / 2)
        });
        //cutout.fillColor = "white";
        let valve = circ.subtract(cutout);
        valve.rotate(rotation, center);
        valve.fillColor = color;
        return valve;
    }

    __drawControll(params) {
        let position = params["position"];
        let gap = params["gap"];
        let radius = params["valveRadius"];
        let color = params["color"];
        let rotation = params["rotation"];
        let center = new paper.Point(position[0], position[1]);
        // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
        let circ = new paper.Path.Circle(center, radius);
        circ.fillColor = color;
        return circ;
    }

    render2D(params, key = "FLOW") {
        if (key == "FLOW") {
            return this.__drawFlow(params);
        } else if (key == "CONTROL") {
            return this.__drawControll(params);
        } else if (key == "INVERSE") {
            return this.__drawInverseFlow(params);
        } else {
            throw new Error("No render procedure defined for component:" + this.__mint + ", key: " + key);
        }
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, "FLOW");
        render.fillColor.alpha = 0.5;
        return render;
    }

    __drawInverseFlow(params) {
        let position = params["position"];
        let gap = params["gap"];
        let radius = params["valveRadius"];
        let color = params["color"];
        console.log("Coloer:", color);
        let rotation = params["rotation"];
        let center = new paper.Point(position[0], position[1]);
        // let h0p0, h0p1, h0p2, h1p0, h1p1, h1p2;
        let circ = new paper.Path.Circle(center, radius);
        circ.fillColor = color;
        return circ.rotate(rotation, center);
    }
}
