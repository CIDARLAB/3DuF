import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Splitter extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
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
            outletLength2: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
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
            outletLength2: 3 * 1000,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            height: "μm",
            inletWidth: "μm",
            inletLength: "μm",
            outletWidth1: "μm",
            outletLength1: "μm",
            outletWidth2: "μm",
            outletLength2: "μm"
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
            outletLength2: 2 * 1000,
            mirrorByX: 0,
            mirrorByY: 0
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
            outletLength2: 5 * 1000,
            mirrorByX: 1,
            mirrorByY: 1
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
            outletLength2: "outletLength2",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
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
            outletLength2: "outletLength2",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET SPLITTER";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const inletWidth = params.inletWidth;
        const inletLength = params.inletLength;
        const outletWidth1 = params.outletWidth1;
        const outletLength1 = params.outletLength1;
        const outletWidth2 = params.outletWidth2;
        const outletLength2 = params.outletLength2;

        const ports = [];

        // inlet
        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

        // outlet 1
        ports.push(new ComponentPort(inletLength - outletWidth1 / 2, -inletWidth / 2 - outletLength1, "2", LogicalLayerType.FLOW));

        // outlet 2
        ports.push(new ComponentPort(inletLength - outletWidth2 / 2, inletWidth / 2 + outletLength2, "3", LogicalLayerType.FLOW));

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const inletWidth = params.inletWidth;
        const inletLength = params.inletLength;
        const outletWidth1 = params.outletWidth1;
        const outletLength1 = params.outletLength1;
        const outletWidth2 = params.outletWidth2;
        const outletLength2 = params.outletLength2;

        const serp = new paper.CompoundPath("");

        // inlet
        let topLeft = new paper.Point(x, y - inletWidth / 2);
        let bottomRight = new paper.Point(x + inletLength, y + inletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // outlet 1
        topLeft = new paper.Point(x + inletLength - outletWidth1, y - inletWidth / 2 - outletLength1);
        bottomRight = new paper.Point(x + inletLength, y - inletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // outlet 2
        topLeft = new paper.Point(x + inletLength - outletWidth2, y + inletWidth / 2);
        bottomRight = new paper.Point(x + inletLength, y + inletWidth / 2 + outletLength2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        this.transformRender(params,serp);

        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const serp = this.render2D(params, key);
        serp.fillColor!.alpha = 0.5;
        return serp;
    }
}
