import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import Layer from "../core/layer";

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
            componentSpacing: "μm",
            rotation: "°",
            height: "μm",
            inletWidth: "μm",
            inletLength: "μm",
            electrodeWidth: "μm",
            electrodeLength: "μm",
            electrodeDistance: "μm",
            sensorWidth: "μm",
            sensorLength: "μm",
            channelDepth: "μm",
            electrodeDepth: "μm"
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

        this.__placementTool = "multilayerPositionTool";

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

        this.__renderKeys = ["FLOW", "INTEGRATE"];

        this.__mint = "DROPLET CAPACITANCE SENSOR";

        this.__zOffsetKeys = {
            FLOW: "height",
            INTEGRATION: "electrodeDepth"
        };

        this.__substrateOffset = {
            FLOW: "0",
            INTEGRATION: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const inletLength = params.inletLength;

        const ports = [];

        ports.push(new ComponentPort(-inletLength / 2, 0, "1", ("FLOW" as unknown) as Layer));

        ports.push(new ComponentPort(inletLength / 2, 0, "2", ("FLOW" as unknown) as Layer));

        return ports;
    }

    __renderFlow(params: { [k: string]: any }, key: string) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const inletWidth = params.inletWidth;
        const inletLength = params.inletLength;
        const serp = new paper.CompoundPath();

        // inlet
        const topLeft = new paper.Point(x - inletLength / 2, y - inletWidth / 2);
        const bottomRight = new paper.Point(x + inletLength / 2, y + inletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.fillColor = color;
        return serp;
    }

    __renderIntegrate(params: { [k: string]: any }, key: string) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const inletWidth = params.inletWidth;
        const electrodeWidth = params.electrodeWidth;
        const electrodeLength = params.electrodeLength;
        const electrodeDistance = params.electrodeDistance;
        const sensorWidth = params.sensorWidth;
        const sensorLength = params.sensorLength;
        const serp = new paper.CompoundPath();

        // top electrode
        let topLeft = new paper.Point(x - electrodeWidth / 2, y - inletWidth / 2 - electrodeDistance - sensorWidth / 2 - electrodeLength);
        let bottomRight = new paper.Point(x + electrodeWidth / 2, y - inletWidth / 2 - electrodeDistance - sensorWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top sensor
        let elli = new paper.Path.Ellipse({
            point: [x - sensorLength / 2, y - inletWidth / 2 - electrodeDistance - sensorWidth],
            size: [sensorLength, sensorWidth]
        });

        serp.addChild(elli);

        // bottom electrode
        topLeft = new paper.Point(x - electrodeWidth / 2, y + inletWidth / 2 + electrodeDistance + sensorWidth / 2 + electrodeLength);
        bottomRight = new paper.Point(x + electrodeWidth / 2, y + inletWidth / 2 + electrodeDistance + sensorWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom sensor
        elli = new paper.Path.Ellipse({
            point: [x - sensorLength / 2, y + inletWidth / 2 + electrodeDistance],
            size: [sensorLength, sensorWidth]
        });

        serp.addChild(elli);

        serp.rotate(rotation, new paper.Point(x, y));

        serp.fillColor = color;
        return serp;
    }

    render2D(params: { [k: string]: any }, key = "FLOW") {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else if (key === "INTEGRATE") {
            return this.__renderIntegrate(params);
        }
        throw new Error("Unknown render key found in DROPLET CAPACITANCE SENSOR: " + key);
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const ret = new paper.CompoundPath();
        const flow = this.render2D(params, "FLOW");
        const integrate = this.render2D(params, "INTEGRATE");
        ret.addChild(integrate);
        ret.addChild(flow);
        ret.fillColor = params.color;
        ret.fillColor!.alpha = 0.5;
        return ret;
    }
}
