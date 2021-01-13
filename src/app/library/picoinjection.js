import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class PicoInjection extends Template{
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            // bendSpacing: "Float",
            // numberOfBends: "Float",
            // channelWidth: "Float",
            // bendLength: "Float",
            // orientation: "String",
            height: "Float",
            width: "Float",
            injectorWidth: "Float",
            injectorLength: "Float",
            dropletWidth: "Float",
            nozzleWidth: "Float",
            nozzleLength: "Float",
            electrodeDistance: "Float",
            electrodeWidth: "Float",
            electrodeLength: "Float",
            orientation: "String"
        };

        this.__defaults = {
            // channelWidth: 0.8 * 1000,
            // bendSpacing: 1.23 * 1000,
            // numberOfBends: 1,
            // orientation: "V",
            // bendLength: 2.46 * 1000,
            height: 250,
            width: 10 * 1000,
            injectorWidth: 2 * 1000,
            injectorLength: 3 * 1000,
            dropletWidth: 0.8 * 1000,
            nozzleWidth: 0.4 * 1000,
            nozzleLength: 0.4 * 1000,
            electrodeDistance: 0.8 * 1000,
            electrodeWidth: 0.8 * 1000,
            electrodeLength: 3 * 1000,
            orientation: "V"
        };

        this.__units = {
            // bendSpacing: "&mu;m",
            // numberOfBends: "",
            // channelWidth: "&mu;m",
            // bendLength: "&mu;m",
            // orientation: "",
            height: "&mu;m",
            width: "&mu;m",
            injectorWidth: "&mu;m",
            injectorLength: "&mu;m",
            dropletWidth: "&mu;m",
            nozzleWidth: "&mu;m",
            nozzleLength: "&mu;m",
            electrodeDistance: "&mu;m",
            electrodeWidth: "&mu;m",
            electrodeLength: "&mu;m",
            orientation: ""
        };

        this.__minimum = {
            // channelWidth: 10,
            // bendSpacing: 10,
            // numberOfBends: 1,
            // orientation: "H",
            // bendLength: 10,
            height: 10,
            width: 5 * 1000,
            injectorWidth: 1000,
            injectorLength: 1000,
            dropletWidth: 100,
            nozzleWidth: 80,
            nozzleLength: 80,
            electrodeDistance: 100,
            electrodeWidth: 100,
            electrodeLength: 1000,
            orientation: "H"
        };

        this.__maximum = {
            // channelWidth: 2000,
            // bendSpacing: 6000,
            // numberOfBends: 20,
            // orientation: "H",
            // bendLength: 12 * 1000,
            height: 1200,
            width: 20 * 1000,
            injectorWidth: 4000,
            injectorLength: 5000,
            dropletWidth: 2000,
            nozzleWidth: 1000,
            nozzleLength: 500,
            electrodeDistance: 2000,
            electrodeWidth: 2000,
            electrodeLength: 5000,
            orientation: "H"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            position: "position",
            // channelWidth: "channelWidth",
            // bendSpacing: "bendSpacing",
            // numberOfBends: "numberOfBends",
            // orientation: "orientation",
            // bendLength: "bendLength"
            width: "width",
            injectorWidth: "injectorWidth",
            injectorLength: "injectorLength",
            dropletWidth: "dropletWidth",
            nozzleWidth: "nozzleWidth",
            nozzleLength: "nozzleLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            orientation: "orientation"
        };

        this.__targetParams = {
            // channelWidth: "channelWidth",
            // bendSpacing: "bendSpacing",
            // numberOfBends: "numberOfBends",
            // orientation: "orientation",
            // bendLength: "bendLength"
            width: "width",
            injectorWidth: "injectorWidth",
            injectorLength: "injectorLength",
            dropletWidth: "dropletWidth",
            nozzleWidth: "nozzleWidth",
            nozzleLength: "nozzleLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            orientation: "orientation"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "PICOINJECTION";
    }

    getPorts(params) {
        // let channelWidth = params["channelWidth"];
        // let bendLength = params["bendLength"];
        // let bendSpacing = params["bendSpacing"];
        // let orientation = params["orientation"];
        // let numberOfBends = params["numberOfBends"];
        let width = params["width"];
        let injectorLength = params["injectorLength"];
        let dropletWidth = params["dropletWidth"];
        let nozzleLength = params["nozzleLength"];
        let electrodeDistance = params["electrodeDistance"];
        let electrodeWidth = params["electrodeWidth"];
        let electrodeLength = params["electrodeLength"];

        let ports = [];

        // droplet channel
        ports.push(new ComponentPort(-width/2, 0, "1", "FLOW"));
        ports.push(new ComponentPort(width/2, 0, "2", "FLOW"));

        // injector
        ports.push(new ComponentPort(0, - dropletWidth/2 - nozzleLength - injectorLength, "3", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let orientation = params["orientation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let width = params["width"];
        let injectorWidth = params["injectorWidth"];
        let injectorLength = params["injectorLength"];
        let dropletWidth = params["dropletWidth"];
        let nozzleWidth = params["nozzleWidth"];
        let nozzleLength = params["nozzleLength"];
        let electrodeDistance = params["electrodeDistance"];
        let electrodeWidth = params["electrodeWidth"];
        let electrodeLength = params["electrodeLength"];
        let serp = new paper.CompoundPath();

        // droplet channel
        let topLeft = new paper.Point(x - width/2, y - dropletWidth/2);
        let bottomRight = new paper.Point(x + width/2, y + dropletWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // nozzle
        topLeft = new paper.Point(x - nozzleWidth/2, y - dropletWidth/2 - nozzleLength);
        bottomRight = new paper.Point(x + nozzleWidth/2, y - dropletWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // injector
        topLeft = new paper.Point(x - injectorWidth/2, y - dropletWidth/2 - nozzleLength - injectorLength);
        bottomRight = new paper.Point(x + injectorWidth/2, y - dropletWidth/2 - nozzleLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // middle electrode
        topLeft = new paper.Point(x - electrodeWidth/2, y + electrodeDistance);
        bottomRight = new paper.Point(x + electrodeWidth/2, y + electrodeDistance + electrodeLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left electrode
        topLeft = new paper.Point(x - electrodeWidth/2 - 2 * electrodeWidth, y + electrodeDistance);
        bottomRight = new paper.Point(x + electrodeWidth/2 - 2 * electrodeWidth, y + electrodeDistance + electrodeLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right electrode
        topLeft = new paper.Point(x - electrodeWidth/2 + 2 * electrodeWidth, y + electrodeDistance);
        bottomRight = new paper.Point(x + electrodeWidth/2 + 2 * electrodeWidth, y + electrodeDistance + electrodeLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        if (orientation === "H") {
            serp.rotate(270, new paper.Point(x, y));
        }
        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key, params) {
        let serp = this.render2D(params, key);

        serp.fillColor.alpha = 0.5;
        return serp;
    }
}