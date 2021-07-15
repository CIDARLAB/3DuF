import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class SawtoothMixer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            channelWidth: 0.8 * 1000,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            rotation: 0,
            bendLength: 2.46 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",

            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            rotation: 0,
            bendLength: 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            rotation: 360,
            bendLength: 12 * 1000,
            height: 1200
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            rotation: "rotation",
            bendLength: "bendLength"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            rotation: "rotation",
            bendLength: "bendLength"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "MIXER";
    }

    getPorts(params) {
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let rotation = params["rotation"];
        let numBends = params["numberOfBends"];
        let theta = Math.atan(0.5 * bendSpacing / bendLength);
        let endWidth = channelWidth / (Math.cos(theta));

        let ports = [];

        ports.push(new ComponentPort(0, 0.5 * endWidth, "1", "FLOW"));

        ports.push(new ComponentPort(0, 4 * bendSpacing * numBends - (2 * numBends - 0.5) * endWidth, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let rotation = params["rotation"];
        let numBends = params["numberOfBends"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let theta = Math.atan(0.5 * bendSpacing / bendLength);
        let cornerWidth = channelWidth / (Math.sin(theta));
        let endWidth = channelWidth / (Math.cos(theta));

        //draw first segment
        let hex = new paper.Path();

        let p0,p1,p2,p3;
        p0 = [x, y];
        hex.add(new paper.Point(p0));

        let pr1, pl1, pr2, pl2;
        for (let i = 0; i < numBends; i++) {
            pr1 = [x + 2 * bendLength, y + bendSpacing + i * 4 * bendSpacing - 2 * i * endWidth];
            pl1 = [x - 2 * bendLength + cornerWidth, y + 3 * bendSpacing + i * 4 * bendSpacing - (2 * i + 1) * endWidth];
            hex.add(new paper.Point(pr1));
            hex.add(new paper.Point(pl1));
        }
        p1 = [x, y + numBends * 4 * bendSpacing - 2 * numBends * endWidth];
        p2 = [x, y + numBends * 4 * bendSpacing  - (1 + 2 * (numBends - 1)) * endWidth];
        hex.add(new paper.Point(p1));
        hex.add(new paper.Point(p2));
        for (let i = 0; i < numBends; i++) {
            pl2 = [x - 2 * bendLength, y + 3 * bendSpacing + (numBends - 1 - i) * 4 * bendSpacing - (2 * (numBends - i) - 1) * endWidth];
            pr2 = [x + 2 * bendLength - cornerWidth, y + bendSpacing + (numBends - 1 - i) * 4 * bendSpacing - 2 * (numBends -1 - i) * endWidth];
            hex.add(new paper.Point(pl2));
            hex.add(new paper.Point(pr2));
        }
        p3 = [x, y + endWidth];
        hex.add(new paper.Point(p3));

        hex.closed = true;
        hex.rotate(rotation, new paper.Point(x, y));
        hex.fillColor = color;
        return hex;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
