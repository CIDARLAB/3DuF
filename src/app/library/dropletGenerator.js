import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class DropletGenerator extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            orificeSize: "Float",
            orificeLength: "Float",
            oilInputWidth: "Float",
            waterInputWidth: "Float",
            outputWidth: "Float",
            outputLength: "Float",
            height: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            orificeSize: 0.2 * 1000,
            orificeLength: 0.4 * 1000,
            oilInputWidth: 0.8 * 1000,
            waterInputWidth: 0.6 * 1000,
            outputWidth: 0.6 * 1000,
            outputLength: 0.6 * 1000,
            height: 250,
            rotation: 0
        };

        this.__units = {
            orificeSize: "&mu;m",
            height: "&mu;m",
            orificeLength: "&mu;m",
            oilInputWidth: "&mu;m",
            waterInputWidth: "&mu;m",
            outputWidth: "&mu;m",
            outputLength: "&mu;m",
            rotation: "&deg;"
        };

        this.__minimum = {
            orificeSize: 10,
            orificeLength: 10,
            oilInputWidth: 10,
            waterInputWidth: 10,
            outputWidth: 10,
            outputLength: 10,
            height: 10,
            rotation: 0
        };

        this.__maximum = {
            orificeSize: 2000,
            orificeLength: 2000,
            oilInputWidth: 2000,
            waterInputWidth: 2000,
            outputWidth: 2000,
            outputLength: 2000,
            height: 1200,
            rotation: 360
        };

        this.__featureParams = {
            position: "position",
            orificeSize: "orificeSize",
            orificeLength: "orificeLength",
            oilInputWidth: "oilInputWidth",
            waterInputWidth: "waterInputWidth",
            outputWidth: "outputWidth",
            outputLength: "outputLength",
            height: "height",
            rotation: "rotation"
        };

        this.__targetParams = {
            orificeSize: "orificeSize",
            orificeLength: "orificeLength",
            oilInputWidth: "oilInputWidth",
            waterInputWidth: "waterInputWidth",
            outputWidth: "outputWidth",
            outputLength: "outputLength",
            height: "height",
            rotation: "rotation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "NOZZLE DROPLET GENERATOR";
    }

    getPorts(params) {
        let orificeSize = params["orificeSize"];
        let orificeLength = params["orificeLength"];
        let oilInputWidth = params["oilInputWidth"];
        let waterInputWidth = params["waterInputWidth"];
        let outputWidth = params["outputWidth"];
        let outputLength = params["outputLength"];

        let ports = [];

        //Oil Top
        ports.push(new ComponentPort(oilInputWidth / 2, -waterInputWidth / 2, "1", "FLOW"));

        //Out
        ports.push(new ComponentPort(oilInputWidth + orificeLength + outputLength, 0, "2", "FLOW"));

        //Oil Bottom
        ports.push(new ComponentPort(oilInputWidth / 2, waterInputWidth / 2, "3", "FLOW"));

        //Input
        ports.push(new ComponentPort(0, 0, "4", "FLOW"));

        return ports;
    }

    render2D(params, key="FLOW") {
        let pos = params["position"];
        let x = pos[0];
        let y = pos[1];
        let color = params["color"];
        let orificeSize = params["orificeSize"];
        let orificeLength = params["orificeLength"];
        let oilInputWidth = params["oilInputWidth"];
        let waterInputWidth = params["waterInputWidth"];
        let outputWidth = params["outputWidth"];
        let outputLength = params["outputLength"];
        let rotation = params["rotation"];

        let ret = new paper.Path();

        let p1 = new paper.Point(x, y - waterInputWidth / 2);

        let p2 = new paper.Point(p1.x + oilInputWidth, p1.y);

        let p3 = new paper.Point(p2.x, p2.y + (waterInputWidth / 2 - orificeSize / 2));

        let p4 = new paper.Point(p3.x + orificeLength, p3.y);

        let p5 = new paper.Point(p4.x, p4.y - (outputWidth / 2 - orificeSize / 2));

        let p6 = new paper.Point(p5.x + outputLength, p5.y);

        let p7 = new paper.Point(p6.x, p6.y + outputWidth);

        let p8 = new paper.Point(p7.x - outputLength, p7.y);

        let p9 = new paper.Point(p8.x, p8.y - (outputWidth / 2 - orificeSize / 2));

        let p10 = new paper.Point(p9.x - orificeLength, p9.y);

        let p11 = new paper.Point(p10.x, p10.y + (waterInputWidth / 2 - orificeSize / 2));

        let p12 = new paper.Point(p11.x - oilInputWidth, p11.y);

        ret.add(p1);
        ret.add(p2);
        ret.add(p3);
        ret.add(p4);
        ret.add(p5);
        ret.add(p6);
        ret.add(p7);
        ret.add(p8);
        ret.add(p9);
        ret.add(p10);
        ret.add(p11);
        ret.add(p12);

        //Rotate the geometry
        ret.rotate(-rotation, new paper.Point(pos[0], pos[1]));

        ret.closed = true;
        ret.fillColor = color;
        return ret;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
