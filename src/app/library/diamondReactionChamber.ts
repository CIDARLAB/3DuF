import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class DiamondReactionChamber extends Template {
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
            channelWidth: "Float",
            length: "Float",
            width: "Float",
            height: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            channelWidth: 0.8 * 1000,
            width: 1.23 * 1000,
            length: 4.92 * 1000,
            height: 250,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            channelWidth: "μm",
            length: "μm",
            width: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            channelWidth: 10,
            width: 30,
            length: 120,
            height: 10,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            channelWidth: 2000,
            width: 6000,
            length: 24 * 1000,
            height: 1200,
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            channelWidth: "channelWidth",
            length: "length",
            width: "width",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            length: "length",
            width: "width",
            rotation: "rotation",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DIAMOND REACTION CHAMBER";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const channelWidth = params.channelWidth;
        const l = params.length;
        const w = params.width;

        const ports = [];

        ports.push(new ComponentPort(-l / 2, 0, "1", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(l / 2, 0, "2", LogicalLayerType.FLOW));

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const cw = params.channelWidth;
        const l = params.length;
        const w = params.width;
        const rotation = params.rotation;
        console.log("Rotation", rotation);
        const color = params.color;
        let p0, p1, p2, p3, p4, p5;
        p0 = [px - l / 2, py - cw / 2];
        p1 = [px - l / 2, py + cw / 2];
        p2 = [px, py + w + cw / 2];
        p3 = [px + l / 2, py + cw / 2];
        p4 = [px + l / 2, py - cw / 2];
        p5 = [px, py - cw / 2 - w];
        const hex = new paper.Path();
        hex.add(new paper.Point(p0));
        hex.add(new paper.Point(p1));
        hex.add(new paper.Point(p2));
        hex.add(new paper.Point(p3));
        hex.add(new paper.Point(p4));
        hex.add(new paper.Point(p5));
        hex.closed = true;
        hex.fillColor = color;
        this.transformRender(params,hex);
        return hex;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
