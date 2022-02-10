import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class PicoInjection extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
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
            rotation: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
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
            rotation: 0
        };

        this.__units = {
            componentSpacing: "μm",
            height: "μm",
            width: "μm",
            injectorWidth: "μm",
            injectorLength: "μm",
            dropletWidth: "μm",
            nozzleWidth: "μm",
            nozzleLength: "μm",
            electrodeDistance: "μm",
            electrodeWidth: "μm",
            electrodeLength: "μm",
            rotation: "°"
        };

        this.__minimum = {
            componentSpacing: 0,
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
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
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
            rotation: 360
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            injectorWidth: "injectorWidth",
            injectorLength: "injectorLength",
            dropletWidth: "dropletWidth",
            nozzleWidth: "nozzleWidth",
            nozzleLength: "nozzleLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            width: "width",
            injectorWidth: "injectorWidth",
            injectorLength: "injectorLength",
            dropletWidth: "dropletWidth",
            nozzleWidth: "nozzleWidth",
            nozzleLength: "nozzleLength",
            electrodeDistance: "electrodeDistance",
            electrodeWidth: "electrodeWidth",
            electrodeLength: "electrodeLength",
            rotation: "rotation"
        };

        this.__renderKeys = ["FLOW", "INTEGRATION"];

        this.__mint = "PICOINJECTOR";

        this.__zOffsetKeys = {
            FLOW: "height",
            INTEGRATION: "height"
        };

        this.__substrateOffset = {
            FLOW: "0",
            INTEGRATION: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const width = params.width;
        const injectorLength = params.injectorLength;
        const dropletWidth = params.dropletWidth;
        const nozzleLength = params.nozzleLength;
        const electrodeDistance = params.electrodeDistance;
        const electrodeWidth = params.electrodeWidth;
        const electrodeLength = params.electrodeLength;

        const ports = [];

        // droplet channel
        ports.push(new ComponentPort(-width / 2, 0, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(width / 2, 0, "2", LogicalLayerType.FLOW));

        // injector
        ports.push(new ComponentPort(0, -dropletWidth / 2 - nozzleLength - injectorLength, "3", LogicalLayerType.FLOW));

        return ports;
    }

    __renderFlow(params: { [k: string]: any }) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const width = params.width;
        const injectorWidth = params.injectorWidth;
        const injectorLength = params.injectorLength;
        const dropletWidth = params.dropletWidth;
        const nozzleWidth = params.nozzleWidth;
        const nozzleLength = params.nozzleLength;
        const serp = new paper.CompoundPath("");

        // droplet channel
        let topLeft = new paper.Point(x - width / 2, y - dropletWidth / 2);
        let bottomRight = new paper.Point(x + width / 2, y + dropletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // nozzle
        topLeft = new paper.Point(x - nozzleWidth / 2, y - dropletWidth / 2 - nozzleLength);
        bottomRight = new paper.Point(x + nozzleWidth / 2, y - dropletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // injector
        topLeft = new paper.Point(x - injectorWidth / 2, y - dropletWidth / 2 - nozzleLength - injectorLength);
        bottomRight = new paper.Point(x + injectorWidth / 2, y - dropletWidth / 2 - nozzleLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.rotate(rotation, new paper.Point(x, y));

        serp.fillColor = color;
        return serp;
    }

    __renderIntegrate(params: { [k: string]: any }) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const electrodeDistance = params.electrodeDistance;
        const electrodeWidth = params.electrodeWidth;
        const electrodeLength = params.electrodeLength;
        const serp = new paper.CompoundPath("");

        // middle electrode
        let topLeft = new paper.Point(x - electrodeWidth / 2, y + electrodeDistance);
        let bottomRight = new paper.Point(x + electrodeWidth / 2, y + electrodeDistance + electrodeLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left electrode
        topLeft = new paper.Point(x - electrodeWidth / 2 - 2 * electrodeWidth, y + electrodeDistance);
        bottomRight = new paper.Point(x + electrodeWidth / 2 - 2 * electrodeWidth, y + electrodeDistance + electrodeLength);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right electrode
        topLeft = new paper.Point(x - electrodeWidth / 2 + 2 * electrodeWidth, y + electrodeDistance);
        bottomRight = new paper.Point(x + electrodeWidth / 2 + 2 * electrodeWidth, y + electrodeDistance + electrodeLength);

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

    render2D(params: { [k: string]: any }, key = "FLOW") {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else if (key === "INTEGRATION") {
            return this.__renderIntegrate(params);
        }
        throw new Error("Unknown render key found in PICOINJECTOR: " + key);
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const ret = new paper.CompoundPath("");
        const flow = this.render2D(params, "FLOW");
        const integrate = this.render2D(params, "INTEGRATION");
        ret.addChild(integrate);
        ret.addChild(flow);
        ret.fillColor = params.color;
        ret.fillColor!.alpha = 0.5;
        return ret;
    }
}
