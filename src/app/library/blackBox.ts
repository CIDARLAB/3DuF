import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType  } from "../core/init";

export default class BlackBox extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            width: "Float",
            length: "Float",
            height: "Float",
<<<<<<< HEAD
=======
            cornerRadius: "Float",
            rotation: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
>>>>>>> webpack-build
        };

        this.__defaults = {
            componentSpacing: 1000,
            width: 5000,
            length: 5000,
            height: 250,
<<<<<<< HEAD
=======
            cornerRadius: 200,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
>>>>>>> webpack-build
        };

        this.__units = {
            componentSpacing: "μm",
            width: "μm",
            length: "μm",
            height: "μm",
<<<<<<< HEAD
=======
            cornerRadius: "μm",
>>>>>>> webpack-build
            rotation: "°"
        };

        this.__minimum = {
            componentSpacing: 0,
            width: 5,
            length: 5,
            height: 1,
<<<<<<< HEAD
=======
            cornerRadius: 1,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
>>>>>>> webpack-build
        };

        this.__maximum = {
            componentSpacing: 10000,
            width: 50000,
            length: 50000,
            height: 50000,
<<<<<<< HEAD
=======
            cornerRadius: 1000,
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1
>>>>>>> webpack-build
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            length: "length",
            height: "height",
<<<<<<< HEAD
=======
            cornerRadius: "cornerRadius",
            rotation: "rotation",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
>>>>>>> webpack-build
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            width: "width",
            length: "length",
            height: "height",
<<<<<<< HEAD
=======
            cornerRadius: "cornerRadius",
            rotation: "rotation",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
>>>>>>> webpack-build
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "BLACK BOX";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const l = params.length;
        const w = params.width;

        const ports = [];

<<<<<<< HEAD
        ports.push(new ComponentPort(0, l/2, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(w, l/2, "2", LogicalLayerType.FLOW));
=======
        ports.push(new ComponentPort(0, -l / 2, "1", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(w / 2, 0, "2", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(0, l / 2, "3", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(-w / 2, 0, "4", LogicalLayerType.FLOW));
>>>>>>> webpack-build

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const l = params.length;
        const w = params.width;
<<<<<<< HEAD
        const color = params.color;
        
        const rendered = new paper.CompoundPath("");

        const rec = new paper.Path.Rectangle({
            point: new paper.Point(px, py),
            size: [w, l]
        });

        rendered.addChild(rec);

        rendered.fillColor = color;

=======
        const rotation = params.rotation;
        const color = params.color;
        const radius = params.cornerRadius;

        const rendered = new paper.CompoundPath("");

        const rec = new paper.Path.Rectangle({
            point: new paper.Point(px - w / 2, py - l / 2),
            size: [w, l]
        });

        const center = new paper.Point(px, py);
        const innercirc = new paper.Path.Circle(center, 500)

        const box = rec.subtract(innercirc);

        rendered.addChild(box);

        rendered.fillColor = color;

        this.transformRender(params,rendered);

>>>>>>> webpack-build
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
<<<<<<< HEAD
}
=======
}
>>>>>>> webpack-build
