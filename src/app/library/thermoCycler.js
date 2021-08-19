import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class thermoCycler extends Template {
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
            width: "Float",
            length: "Float",
            height: "Float",
            temperature: "Float"
        };
        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            width: 20 * 1000,
            length: 40 * 1000,
            height: 5 * 1000,
            temperature: 0.03 * 1000
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
            temperature: 0 * 1000
        };
        this.__maximum = {
            componentSpacing: 10000,
            rotation: 90,
            width: 60 * 1000,
            length: 60 * 1000,
            height: 10 * 1000,
            temperature: 0.1 * 1000
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
            temperature: "temperature"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            length: "length",
            width: "width",
            temperature: "temperature"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "THERMO CYCLER";
    }

    render2D(params, key) {
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
        const rendered = new paper.CompoundPath();
        const cirrad = l / 4;
        const centerr = new paper.Point(px - w, py - l);

        const rec = paper.Path.Rectangle({
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
        return rendered.rotate(rotation, px, py);
    }

    render2DTarget(key, params) {
        const render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }

    getPorts(params) {
        const l = params.length;
        const w = params.width;

        const ports = [];

        ports.push(new ComponentPort(-w / 2, -l / 6, "1", "CONTROL"));
        ports.push(new ComponentPort(-w / 2, l / 6, "2", "CONTROL"));

        return ports;
    }
}
