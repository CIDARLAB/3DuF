import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Splitter extends Template{
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
            height: "Float",
            inletWidth: "Float",
            inletLength: "Float",
            outletWidth1: "Float",
            outletLength1: "Float",
            outletWidth2: "Float",
            outletLength2: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            inletWidth: 2 * 1000,
            inletLength: 6 * 1000,
            outletWidth1: 1 * 1000,
            outletLength1: 3 * 1000,
            outletWidth2: 2 * 1000,
            outletLength2: 3 * 1000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            inletWidth: "&mu;m",
            inletLength: "&mu;m",
            outletWidth1: "&mu;m",
            outletLength1: "&mu;m",
            outletWidth2: "&mu;m",
            outletLength2: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            inletWidth: 1 * 1000,
            inletLength: 3 * 1000,
            outletWidth1: 0.5 * 1000,
            outletLength1: 2 * 1000,
            outletWidth2: 0.5 * 1000,
            outletLength2: 2 * 1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            inletWidth: 3 * 1000,
            inletLength: 8 * 1000,
            outletWidth1: 3 * 1000,
            outletLength1: 5 * 1000,
            outletWidth2: 3 * 1000,
            outletLength2: 5 * 1000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            height: "height",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            outletWidth1: "outletWidth1",
            outletLength1: "outletLength1",
            outletWidth2: "outletWidth2",
            outletLength2: "outletLength2"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            height: "height",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            outletWidth1: "outletWidth1",
            outletLength1: "outletLength1",
            outletWidth2: "outletWidth2",
            outletLength2: "outletLength2"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET SPLITTER";
    }

    getPorts(params) {
        let inletWidth = params["inletWidth"];
        let inletLength = params["inletLength"];
        let outletWidth1 = params["outletWidth1"];
        let outletLength1 = params["outletLength1"];
        let outletWidth2 = params["outletWidth2"];
        let outletLength2 = params["outletLength2"];

        let ports = [];

        // inlet
        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        // outlet 1
        ports.push(new ComponentPort(inletLength - outletWidth1/2, - inletWidth/2 - outletLength1, "2", "FLOW"));

        // outlet 2
        ports.push(new ComponentPort(inletLength - outletWidth2/2, inletWidth/2 + outletLength2, "3", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let rotation = params["rotation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let inletWidth = params["inletWidth"];
        let inletLength = params["inletLength"];
        let outletWidth1 = params["outletWidth1"];
        let outletLength1 = params["outletLength1"];
        let outletWidth2 = params["outletWidth2"];
        let outletLength2 = params["outletLength2"];

        let serp = new paper.CompoundPath();      
        
        // inlet
        let topLeft = new paper.Point(x, y - inletWidth/2);
        let bottomRight = new paper.Point(x + inletLength, y + inletWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // outlet 1
        topLeft = new paper.Point(x + inletLength - outletWidth1, y - inletWidth/2 - outletLength1);
        bottomRight = new paper.Point(x + inletLength, y - inletWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // outlet 2
        topLeft = new paper.Point(x + inletLength - outletWidth2, y + inletWidth/2);
        bottomRight = new paper.Point(x + inletLength, y + inletWidth/2 + outletLength2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.rotate(rotation, new paper.Point(x, y));
        
        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key, params) {
        let serp = this.render2D(params, key);

        serp.fillColor.alpha = 0.5;
        return serp;
    }
}