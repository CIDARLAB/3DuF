import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LessStencilFunc } from "three";

export default class Sorter extends Template{
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
            electrodeDistance: "Float",
            electrodeWidth: "Float",
            electrodeLength: "Float",
            outletWidth: "Float",
            angle: "Float",
            wasteWidth: "Float",
            outputLength: "Float",
            keepWidth: "Float",
            pressureWidth: "Float",
            pressureSpacing: "Float",
            numberofDistributors: "Float",
            channelDepth: "Float",
            electrodeDepth: "Float",
            pressureDepth: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            inletWidth: 0.8 * 1000,
            inletLength: 4 * 1000,
            electrodeDistance: 1 * 1000,
            electrodeWidth: 0.7 * 1000,
            electrodeLength: 5 * 1000,
            outletWidth: 0.8 * 1000,
            angle: 45,
            wasteWidth: 1.2 * 1000,
            outputLength: 4 * 1000,
            keepWidth: 2 * 1000,
            pressureWidth: 0.4 * 1000,
            pressureSpacing: 1.5 * 1000,
            numberofDistributors: 5,
            channelDepth: 1000,
            electrodeDepth: 1000,
            pressureDepth: 1000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            inletWidth: "&mu;m",
            inletLength: "&mu;m",
            electrodeDistance: "&mu;m",
            electrodeWidth: "&mu;m",
            electrodeLength: "&mu;m",
            outletWidth: "&mu;m",
            angle: "&deg;",
            wasteWidth: "&mu;m",
            outputLength: "&mu;m",
            keepWidth: "&mu;m",
            pressureWidth: "&mu;m",
            pressureSpacing: "&mu;m",
            numberofDistributors: "&mu;m",
            channelDepth: "&mu;m",
            electrodeDepth: "&mu;m",
            pressureDepth: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            inletWidth: 0.5 * 1000,
            inletLength: 2 * 1000,
            electrodeDistance: 0.5 * 1000,
            electrodeWidth: 0.5 * 1000,
            electrodeLength: 2.5 * 1000,
            outletWidth: 0.5 * 1000,
            angle: 0,
            wasteWidth: 0.5 * 1000,
            outputLength: 2 * 1000,
            keepWidth: 2 * 1000,
            pressureWidth: 0.2 * 1000,
            pressureSpacing: 0.5 * 1000,
            numberofDistributors: 1,
            channelDepth: 1000,
            electrodeDepth: 1000,
            pressureDepth: 1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            inletWidth: 2 * 1000,
            inletLength: 6 * 1000,
            electrodeDistance: 1.5 * 1000,
            electrodeWidth: 1.5 * 1000,
            electrodeLength: 7.5 * 1000,
            outletWidth: 2 * 1000,
            angle: 180,
            wasteWidth: 1.5 * 1000,
            outputLength: 6 * 1000,
            keepWidth: 3.5 * 1000,
            pressureWidth: 1 * 1000,
            pressureSpacing: 2 * 1000,
            numberofDistributors: 10,
            channelDepth: 1000,
            electrodeDepth: 1000,
            pressureDepth: 1000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            outletWidth: "outletWidth",
            angle: "angle",
            wasteWidth: "wasteWidth",
            outputLength: "outputLength",
            keepWidth: "keepWidth",
            pressureWidth: "pressureWidth",
            pressureSpacing: "pressureSpacing",
            numberofDistributors: "numberofDistributors",
            channelDepth: "channelDepth",
            electrodeDepth: "electrodeDepth",
            pressureDepth: "pressureDepth"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            outletWidth: "outletWidth",
            angle: "angle",
            wasteWidth: "wasteWidth",
            outputLength: "outputLength",
            keepWidth: "keepWidth",
            pressureWidth: "pressureWidth",
            pressureSpacing: "pressureSpacing",
            numberofDistributors: "numberofDistributors",
            channelDepth: "channelDepth",
            electrodeDepth: "electrodeDepth",
            pressureDepth: "pressureDepth"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET SORTER";
    }

    getPorts(params) {
        let inletLength = params["inletLength"];
        let angle = params["angle"];
        let outputLength = params["outputLength"];
        let pressureWidth = params["pressureWidth"];
        let pressureSpacing = params["pressureSpacing"];
        let numberofDistributors = params["numberofDistributors"];

        let outletLen = ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth)) / Math.cos((angle/2) * Math.PI / 180);

        let ports = [];

        ports.push(new ComponentPort(- inletLength, 0, "1", "FLOW"));

        ports.push(new ComponentPort(outletLen * Math.cos(angle/2 * Math.PI / 180) + outputLength, - ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth) - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180), "2", "FLOW"));

        ports.push(new ComponentPort(outletLen * Math.cos(angle/2 * Math.PI / 180) + outputLength, ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth) - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180), "3", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let rotation = params["rotation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let inletWidth = params["inletWidth"];
        let inletLength = params["inletLength"];
        let electrodeDistance = params["electrodeDistance"];
        let electrodeWidth = params["electrodeWidth"];
        let electrodeLength = params["electrodeLength"];
        let outletWidth = params["outletWidth"];
        let angle = params["angle"];
        let wasteWidth = params["wasteWidth"];
        let outputLength = params["outputLength"];
        let keepWidth = params["keepWidth"];
        let pressureWidth = params["pressureWidth"];
        let pressureSpacing = params["pressureSpacing"];
        let numberofDistributors = params["numberofDistributors"];
        let serp = new paper.CompoundPath();

        // pressure distributors
        for (let i = 0; i < numberofDistributors; i++){

            let newRightX = (i + 1.5) * (pressureSpacing + pressureWidth);

            let newLeftX = newRightX - pressureWidth;

            let pHeight = (newRightX - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180);
            // upper
            let topLeft = new paper.Point(x + newLeftX, y - pHeight);
            let bottomRight = new paper.Point(x + newRightX, y);
            serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

            // lower
            topLeft = new paper.Point(x + newLeftX, y + pHeight);
            bottomRight = new paper.Point(x + newRightX, y);
            serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));
        }

        let outletLen = ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth)) / Math.cos((angle/2) * Math.PI / 180);
        let topLeft = new paper.Point(x, y - outletWidth/2);
        let bottomRight = new paper.Point(x + outletLen, y + outletWidth/2);

        // upper outlet
        let outlet = new paper.Path.Rectangle(topLeft, bottomRight);
        outlet.rotate(-angle/2, new paper.Point(x, y));
        serp.addChild(outlet);

        // lower outlet
        outlet = new paper.Path.Rectangle(topLeft, bottomRight);
        outlet.rotate(angle/2, new paper.Point(x, y));
        serp.addChild(outlet);

        // inlet
        topLeft = new paper.Point(x - inletLength, y - inletWidth/2);
        bottomRight = new paper.Point(x, y + inletWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // waste
        topLeft = new paper.Point(x + outletLen * Math.cos(angle/2 * Math.PI / 180), y - ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth) - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180) - wasteWidth/2);
        bottomRight = new paper.Point(x + outletLen * Math.cos(angle/2 * Math.PI / 180) + outputLength, y - ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth) - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180) + wasteWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // keep
        topLeft = new paper.Point(x + outletLen * Math.cos(angle/2 * Math.PI / 180), y + ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth) - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180) - keepWidth/2);
        bottomRight = new paper.Point(x + outletLen * Math.cos(angle/2 * Math.PI / 180) + outputLength, y + ((numberofDistributors + 0.5) * (pressureSpacing + pressureWidth) - (pressureWidth/2)) * Math.tan((angle/2) * Math.PI / 180) + keepWidth/2);

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
        topLeft = new paper.Point(x - electrodeWidth/2 + 2 * electrodeWidth, y + electrodeDistance + 2 * electrodeWidth * Math.tan(angle/2 * Math.PI / 180));
        bottomRight = new paper.Point(x + electrodeWidth/2 + 2 * electrodeWidth, y + electrodeDistance + 2 * electrodeWidth * Math.tan(angle/2 * Math.PI / 180) + electrodeLength);

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