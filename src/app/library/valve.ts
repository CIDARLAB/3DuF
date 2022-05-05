import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Valve extends Template {
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
            length: "Float",
            width: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            width: 200,
            length: 200,
            height: 250
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "&deg",
            length: "μm",
            width: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            width: 30,
            length: 120,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 180,
            width: 6000,
            length: 24 * 1000,
            height: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            length: "length",
            width: "width",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            length: "length",
            width: "width",
            rotation: "rotation"
        };

        this.__placementTool = "valveInsertionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["CONTROL"];

        this.__mint = "VALVE";

        this.__zOffsetKeys = {
            CONTROL: "height"
        };

        this.__substrateOffset = {
            CONTROL: "+1"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const l = params.length;
        const w = params.width;

        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.CONTROL));

        return ports;
    }

    render2D(params: { [k: string]: any }, key = "CONTROL") {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const l = params.length;
        const w = params.width;
        const color = params.color;
        const rotation = params.rotation;
        const startX = px - w / 2;
        const startY = py - l / 2;
        const endX = px + w / 2;
        const endY = py + l / 2;
        const startPoint = new paper.Point(startX, startY);
        const endPoint = new paper.Point(endX, endY);
        const rec = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            fillColor: color,
            strokeWidth: 0
        });
        rec.rotate(rotation, new paper.Point(px, py));
        let compoundPath = new paper.CompoundPath(rec);
        compoundPath.fillColor = color;
        return (compoundPath);
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const render = this.render2D(params, "CONTROL");
        render.fillColor = params.color;
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
