import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class thermoCycler extends Template {
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
            width: "Float",
            length: "Float",
            height: "Float",
            temperature: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };
        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            width: 20 * 1000,
            length: 40 * 1000,
            height: 5 * 1000,
            temperature: 0.03 * 1000,
            mirrorByX: 0,
            mirrorByY: 0
        };
        this.__units = {
            componentSpacing: "μm",
            rotation: "&deg",
            width: "μm",
            length: "μm",
            height: "μm",
            temperature: "°C"
        };
        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            width: 10 * 1000,
            length: 10 * 1000,
            height: 1.25 * 1000,
            temperature: 0 * 1000,
            mirrorByX: 0,
            mirrorByY: 0
        };
        this.__maximum = {
            componentSpacing: 10000,
            rotation: 90,
            width: 60 * 1000,
            length: 60 * 1000,
            height: 10 * 1000,
            temperature: 0.1 * 1000,
            mirrorByX: 1,
            mirrorByY: 1
        };
        this.__placementTool = "multilayerPositionTool";
        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            length: "length",
            width: "width",
            temperature: "temperature",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            length: "length",
            width: "width",
            temperature: "temperature",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "THERMO CYCLER";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(params: { [k: string]: any }, key: string) {
        const position = params.position;
        const rotation = params.rotation;
        const px = position[0];
        const py = position[1];
        const l = params.length;
        const w = params.width;
        const color = params.color;
        const startX = px - w / 2;
        const startY = py - l / 2;
        const endX = px + w / 2;
        const endY = py + l / 2;
        const startPoint = new paper.Point(startX, startY);
        const endPoint = new paper.Point(endX, endY);
        const rendered = new paper.CompoundPath("");
        const cirrad = l / 4;
        const centerr = new paper.Point(px - w, py - l);

        const rec = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            fillColor: color,
            strokeWidth: 0
        });
        rendered.addChild(rec);

        //    let cir = new paper.Path.Circle({
        //      center: centerr,
        //      radius: cirrad,
        //      fillColor: 'black'
        //    })
        //    rendered.addChild(cir);

        rendered.fillColor = color;
        //    cir.fillColor = 'black';
        //    rec.addChild(cir)
        this.transformRender(params,rendered);
        return rendered;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }

    getPorts(params: { [k: string]: any }) {
        const l = params.length;
        const w = params.width;

        const ports = [];

        ports.push(new ComponentPort(-w / 2, -l / 6, "1", LogicalLayerType.CONTROL));
        ports.push(new ComponentPort(-w / 2, l / 6, "2", LogicalLayerType.CONTROL));

        return ports;
    }
}
