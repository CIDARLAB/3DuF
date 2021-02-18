import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class CapacitanceSensor extends Template {
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
            electrodeWidth: "Float",
            electrodeLength: "Float",
            electrodeDistance: "Float",
            sensorWidth: "Float",
            sensorLength: "Float",
            channelDepth: "Float",
            electrodeDepth: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            inletWidth: 1 * 1000,
            inletLength: 10 * 1000,
            electrodeWidth: 1.5 * 1000,
            electrodeLength: 4 * 1000,
            electrodeDistance: 2 * 1000,
            sensorWidth: 1 * 1000,
            sensorLength: 3 * 1000,
            channelDepth: 1000,
            electrodeDepth: 1000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            inletWidth: "&mu;m",
            inletLength: "&mu;m",
            electrodeWidth: "&mu;m",
            electrodeLength: "&mu;m",
            electrodeDistance: "&mu;m",
            sensorWidth: "&mu;m",
            sensorLength: "&mu;m",
            channelDepth: "&mu;m",
            electrodeDepth: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            inletWidth: 0.5 * 1000,
            inletLength: 5 * 1000,
            electrodeWidth: 1 * 1000,
            electrodeLength: 2 * 1000,
            electrodeDistance: 1 * 1000,
            sensorWidth: 0.5 * 1000,
            sensorLength: 1.5 * 1000,
            channelDepth: 1000,
            electrodeDepth: 1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            inletWidth: 2 * 1000,
            inletLength: 15 * 1000,
            electrodeWidth: 3 * 1000,
            electrodeLength: 6 * 1000,
            electrodeDistance: 3 * 1000,
            sensorWidth: 1.5 * 1000,
            sensorLength: 4.5 * 1000,
            channelDepth: 1000,
            electrodeDepth: 1000
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
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            electrodeDistance: "electrodeDistance",
            sensorWidth: "sensorWidth",
            sensorLength: "sensorLength",
            channelDepth: "channelDepth",
            electrodeDepth: "electrodeDepth"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            electrodeDistance: "electrodeDistance",
            sensorWidth: "sensorWidth",
            sensorLength: "sensorLength",
            channelDepth: "channelDepth",
            electrodeDepth: "electrodeDepth"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET CAPACITANCE SENSOR";
    }

    getPorts(params) {
        let inletLength = params["inletLength"];

        let ports = [];

        ports.push(new ComponentPort(- inletLength/2, 0, "1", "FLOW"));

        ports.push(new ComponentPort(inletLength/2 , 0, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let rotation = params["rotation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let inletWidth = params["inletWidth"];
        let inletLength = params["inletLength"];
        let electrodeWidth = params["electrodeWidth"];
        let electrodeLength = params["electrodeLength"];
        let electrodeDistance = params["electrodeDistance"];
        let sensorWidth = params["sensorWidth"];
        let sensorLength = params["sensorLength"];
        let serp = new paper.CompoundPath();
        
        // inlet
        let topLeft = new paper.Point(x - inletLength/2, y - inletWidth/2);
        let bottomRight = new paper.Point(x + inletLength/2, y + inletWidth/2);
        
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top electrode
        topLeft = new paper.Point(x - electrodeWidth/2, y - inletWidth/2 - electrodeDistance - sensorWidth/2 - electrodeLength);
        bottomRight = new paper.Point(x + electrodeWidth/2, y - inletWidth/2 - electrodeDistance - sensorWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top sensor
        let elli = new paper.Path.Ellipse({
            point: [x - sensorLength/2, y - inletWidth/2 - electrodeDistance - sensorWidth],
            size: [sensorLength, sensorWidth]
        });

        serp.addChild(elli);

        // bottom electrode
        topLeft = new paper.Point(x - electrodeWidth/2, y + inletWidth/2 + electrodeDistance + sensorWidth/2 + electrodeLength);
        bottomRight = new paper.Point(x + electrodeWidth/2, y + inletWidth/2 + electrodeDistance + sensorWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom sensor
        elli = new paper.Path.Ellipse({
            point: [x - sensorLength/2, y + inletWidth/2 + electrodeDistance],
            size: [sensorLength, sensorWidth]
        })

        serp.addChild(elli);

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
