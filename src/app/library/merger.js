import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Merger extends Template {
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
            outletWidth: "Float",
            outletLength: "Float",
            chamberHeight: "Float",
            chamberLength: "Float",
            channelDepth: "Float",
            electrodeDepth: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            inletWidth: 2 * 1000,
            inletLength: 4 * 1000,
            electrodeWidth: 1000,
            electrodeLength: 5 * 1000,
            electrodeDistance: 1000,
            outletWidth: 2 * 1000,
            outletLength: 4 * 1000,
            chamberHeight: 2.7 * 1000,
            chamberLength: 2 * 1000,
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
            outletWidth: "μm",
            outletLength: "μm",
            chamberHeight: "μm",
            chamberLength: "μm",
            channelDepth: "μm",
            electrodeDepth: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            inletWidth: 1000,
            inletLength: 1000,
            electrodeWidth: 500,
            electrodeLength: 3 * 1000,
            electrodeDistance: 500,
            outletWidth: 1000,
            outletLength: 1000,
            chamberHeight: 1000,
            chamberLength: 1000,
            channelDepth: 1000,
            electrodeDepth: 1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            inletWidth: 3 * 1000,
            inletLength: 6 * 1000,
            electrodeWidth: 3 * 1000,
            electrodeLength: 7 * 1000,
            electrodeDistance: 1500,
            outletWidth: 3 * 1000,
            outletLength: 6 * 1000,
            chamberHeight: 4 * 1000,
            chamberLength: 4 * 1000,
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
            outletWidth: "outletWidth",
            outletLength: "outletLength",
            chamberHeight: "chamberHeight",
            chamberLength: "chamberLength",
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
            outletWidth: "outletWidth",
            outletLength: "outletLength",
            chamberHeight: "chamberHeight",
            chamberLength: "chamberLength",
            channelDepth: "channelDepth",
            electrodeDepth: "electrodeDepth"
        };

        this.__renderKeys = ["FLOW", "INTEGRATE"];

        this.__mint = "DROPLET MERGER";
    }

    getPorts(params) {
        const inletLength = params.inletLength.value;
        const outletLength = params.outletLength.value;
        const chamberLength = params.chamberLength.value;

        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        ports.push(new ComponentPort(inletLength + chamberLength + outletLength, 0, "2", "FLOW"));

        return ports;
    }

    __renderFlow(params, key) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const inletWidth = params.inletWidth;
        const inletLength = params.inletLength;
        const outletWidth = params.outletWidth;
        const outletLength = params.outletLength;
        const chamberHeight = params.chamberHeight;
        const chamberLength = params.chamberLength;
        const channelDepth = params.channelDepth;
        const electrodeDepth = params.electrodeDepth;

        const serp = new paper.CompoundPath();

        // inlet
        let topLeft = new paper.Point(x, y - inletWidth / 2);
        let bottomRight = new paper.Point(x + inletLength, y + inletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // merge chamber
        topLeft = new paper.Point(x + inletLength, y - chamberHeight / 2);
        bottomRight = new paper.Point(x + inletLength + chamberLength, y + chamberHeight / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // outlet
        topLeft = new paper.Point(x + inletLength + chamberLength, y - outletWidth / 2);
        bottomRight = new paper.Point(x + inletLength + chamberLength + outletLength, y + outletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.rotate(rotation, new paper.Point(x, y));

        serp.fillColor = color;
        return serp;
    }

    __renderIntegrate(params, key) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const inletLength = params.inletLength;
        const electrodeWidth = params.electrodeWidth;
        const electrodeLength = params.electrodeLength;
        const electrodeDistance = params.electrodeDistance;
        const channelDepth = params.channelDepth;
        const electrodeDepth = params.electrodeDepth;

        const serp = new paper.CompoundPath();

        // left electrode
        let topLeft = new paper.Point(x + inletLength, y - electrodeLength / 2);
        let bottomRight = new paper.Point(x + inletLength + electrodeWidth, y + electrodeLength / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right electrode
        topLeft = new paper.Point(x + inletLength + electrodeWidth + electrodeDistance, y - electrodeLength / 2);
        bottomRight = new paper.Point(x + inletLength + 2 * electrodeWidth + electrodeDistance, y + electrodeLength / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.rotate(rotation, new paper.Point(x, y));

        serp.fillColor = color;
        return serp;
    }

    // render2DTarget(key, params) {
    //     const serp = this.render2D(params, key);

    //     serp.fillColor.alpha = 0.5;
    //     return serp;
    // }

    render2D(params, key = "FLOW") {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else if (key === "INTEGRATE") {
            return this.__renderIntegrate(params);
        }
        throw new Error("Unknown render key found in DROPLET MERGER: " + key);
    }

    render2DTarget(key, params) {
        const ret = new paper.CompoundPath();
        const flow = this.render2D(params, "FLOW");
        const integrate = this.render2D(params, "INTEGRATE");
        ret.addChild(integrate);
        ret.addChild(flow);
        ret.fillColor = params.color;
        ret.fillColor.alpha = 0.5;
        return ret;
    }
}
