import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class LLChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            width: "Float",
            length: "Float",
            height: "Float",
            rotation: "Float",
            spacing: "Float",
            numberOfChambers: "Integer"
        };

        this.__defaults = {
            componentSpacing: 1000,
            width: 400,
            length: 5000,
            height: 250,
            spacing: 2000,
            numberOfChambers: 4,
            rotation: 0
        };

        this.__units = {
            componentSpacing: "μm",
            width: "μm",
            length: "μm",
            height: "μm",
            spacing: "μm",
            numberOfChambers: "10",
            rotation: "°"
        };

        this.__minimum = {
            componentSpacing: 0,
            width: 5,
            length: 5,
            height: 1,
            spacing: 1,
            numberOfChambers: 1,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            width: 50000,
            length: 50000,
            height: 50000,
            numberOfChambers: 1000,
            spacing: 50000,
            rotation: 360
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            numberOfChambers: "numberOfChambers",
            spacing: "spacing",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            numberOfChambers: "numberOfChambers",
            spacing: "spacing",
            rotation: "rotation"
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "LL CHAMBER";

        this.__zOffsetKeys = {
            FLOW: "height",
            CONTROL: "height"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CONTROL: "+1"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const l = params.length;
        const w = params.width;
        const rotation = params.rotation;
        const color = params.color;
        // let radius = params["cornerRadius"];

        const numArray = params.numberOfChambers;
        const spacing = params.spacing;

        const ports = [];

        ports.push(new ComponentPort(w / 2, -w, "1", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing - w / 2, -w, "2", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(w / 2, l + w, "3", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing - w / 2, l + w, "4", LogicalLayerType.FLOW));

        // //Control Ports - Left
        ports.push(new ComponentPort(0, 0.2 * l, "10", LogicalLayerType.CONTROL));

        ports.push(new ComponentPort(0, 0.5 * l, "9", LogicalLayerType.CONTROL));

        ports.push(new ComponentPort(0, 0.8 * l, "8", LogicalLayerType.CONTROL));

        // Control Ports - Right
        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing, 0.2 * l, "5", LogicalLayerType.CONTROL));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing, 0.5 * l, "6", LogicalLayerType.CONTROL));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing, 0.8 * l, "7", LogicalLayerType.CONTROL));

        return ports;
    }

    __renderFlow(params: { [k: string]: any }) {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const l = params.length;
        const w = params.width;
        const rotation = params.rotation;
        const color = params.color;
        // let radius = params["cornerRadius"];

        const numArray = params.numberOfChambers;
        const spacing = params.spacing;

        const rendered = new paper.CompoundPath("");

        let rec;

        for (let i = 0; i < numArray; i++) {
            rec = new paper.Path.Rectangle({
                point: new paper.Point(px + (i + 1) * spacing + i * w, py - 1),
                size: [w, l + 2],
                radius: 0
            });

            rendered.addChild(rec);
        }

        const topchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py - w),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(topchannel);

        const bottomchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + l),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(bottomchannel);

        rendered.fillColor = color;
        return (rendered.rotate(rotation, px, py) as unknown) as paper.CompoundPath;
    }

    __renderControl(params: { [k: string]: any }) {
        const rendered = new paper.CompoundPath("");
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const l = params.length;
        const w = params.width;
        const rotation = params.rotation;
        const color = params.color;
        // let radius = params["cornerRadius"];

        const numArray = params.numberOfChambers;
        const spacing = params.spacing;

        const topchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + 0.2 * l - w / 2),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(topchannel);

        const middlechannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + 0.5 * l - w / 2),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(middlechannel);

        const bottomchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + 0.8 * l - w / 2),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(bottomchannel);

        rendered.fillColor = color;
        return (rendered.rotate(rotation, px, py) as unknown) as paper.CompoundPath;
    }

    render2D(params: { [k: string]: any }, key = "FLOW") {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else if (key === "CONTROL") {
            return this.__renderControl(params);
        }
        throw new Error("Unknown render key found in LLCHAMBER: " + key);
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const ret = new paper.CompoundPath("");
        const flow = this.render2D(params, "FLOW");
        const control = this.render2D(params, "CONTROL");
        ret.addChild(control);
        ret.addChild(flow);
        ret.fillColor = params.color;
        ret.fillColor!.alpha = 0.5;
        return ret;
    }
}
