import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { Path, Point } from "paper/dist/paper-core";
import { ToolPaperObject } from "../core/init";

export default class ToroidalMixer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            neckAngle: "Float",
            neckLength: "Float",
            neckWidth: "Float",
            numberOfMixers: "Float",
            channelWidth: "Float",
            innerDiameter: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            channelWidth: 0.8 * 1000,
            neckAngle: 120,
            neckLength: 1000,
            neckWidth: 800,
            numberOfMixers: 1,
            innerDiameter: 2.46 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            neckAngle: "°",
            neckLength: "μm",
            neckWidth: "μm",
            numberOfMixers: "",
            channelWidth: "μm",
            innerDiameter: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            channelWidth: 10,
            neckAngle: 0,
            neckLength: 0,
            neckWidth: 10,
            numberOfMixers: 1,
            innerDiameter: 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            channelWidth: 2000,
            neckAngle: 360,
            neckLength: 10000,
            neckWidth: 2000,
            numberOfMixers: 20,
            innerDiameter: 12 * 1000,
            height: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            channelWidth: "channelWidth",
            neckAngle: "neckAngle",
            neckLength: "neckLength",
            neckWidth: "neckWidth",
            numberOfMixers: "numberOfMixers",
            rotation: "rotation",
            innerDiameter: "innerDiameter"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            neckAngle: "neckAngle",
            neckLength: "neckLength",
            neckWidth: "neckWidth",
            numberOfMixers: "numberOfMixers",
            rotation: "rotation",
            innerDiameter: "innerDiameter"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TOROIDAL MIXER";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [index: string]: any }) {
        const y: number = params.position[1];
        const channelWidth: number = params.channelWidth;
        const innerDiameter: number = params.innerDiameter;
        const neckLength: number = params.neckLength;
        const neckAngle: number = params.neckAngle;
        const numberOfMixers: number = params.numberOfMixers;
        const y_center: number = y + Math.abs((neckLength + channelWidth + 0.5 * innerDiameter) * Math.sin((0.5 * neckAngle * Math.PI) / 180));
        const diameter: number = 2 * (y_center - y);
        const y_neckComponent: number = neckLength * Math.sin((0.5 * neckAngle * Math.PI) / 180);

        const ports: Array<ComponentPort> = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        if (numberOfMixers % 2 == 1) {
            ports.push(
                new ComponentPort(
                    0,
                    (numberOfMixers - 1) * diameter - (numberOfMixers - 2) * y_neckComponent + diameter - neckLength * Math.sin((0.5 * neckAngle * Math.PI) / 180),
                    "2",
                    "FLOW"
                )
            );
        } else {
            ports.push(
                new ComponentPort(
                    -1 * neckLength * Math.cos((0.5 * neckAngle * Math.PI) / 180),
                    (numberOfMixers - 1) * diameter - (numberOfMixers - 2) * y_neckComponent + diameter - neckLength * Math.sin((0.5 * neckAngle * Math.PI) / 180),
                    "2",
                    "FLOW"
                )
            );
        }

        return ports;
    }

    render2D(params: { [index: string]: any }, key: string): paper.CompoundPath {
        const channelWidth: number = params.channelWidth;
        const innerDiameter: number = params.innerDiameter;
        const neckAngle: number = params.neckAngle;
        const neckWidth: number = params.neckWidth;
        const rotation: number = params.rotation;
        const neckLength: number = params.neckLength;
        const numMixers: number = params.numberOfMixers;
        const x: number = params.position[0];
        const y: number = params.position[1];
        const color: any = params.color;
        const serp: paper.CompoundPath = new paper.CompoundPath([]);
        const x_center: number = x - (neckLength + channelWidth + 0.5 * innerDiameter) * Math.cos((0.5 * neckAngle * Math.PI) / 180);
        const y_center: number = y + Math.abs((neckLength + channelWidth + 0.5 * innerDiameter) * Math.sin((0.5 * neckAngle * Math.PI) / 180));
        const center: paper.Point = new paper.Point(x_center, y_center);
        const diameter: number = 2 * (y_center - y);
        const y_neckComponent: number = neckLength * Math.sin((0.5 * neckAngle * Math.PI) / 180);

        let mixerUnit: paper.PathItem;

        //Initial ring
        let outerCircle: paper.Path = new paper.Path.Circle(center, 0.5 * innerDiameter + channelWidth);
        let innerCircle: paper.Path = new paper.Path.Circle(center, 0.5 * innerDiameter);
        mixerUnit = outerCircle.subtract(innerCircle);
        //Initial neck
        let neck: paper.Path = new paper.Path.Rectangle(new paper.Point(x - neckLength - channelWidth, y - 0.5 * neckWidth), new paper.Size(neckLength + channelWidth, neckWidth));
        neck.rotate((-1 * neckAngle) / 2, new paper.Point(x, y));
        mixerUnit = mixerUnit.unite(neck);
        //Trailing neck
        neck = new paper.Path.Rectangle(new paper.Point(x - neckLength - channelWidth, y - 0.5 * neckWidth + diameter), new paper.Size(neckLength + channelWidth, neckWidth));
        neck.rotate(neckAngle / 2, new paper.Point(x, y + diameter));
        mixerUnit = mixerUnit.unite(neck);

        let y_val: number;
        let x_centerAnalog: number;
        let y_centerAnalog: number;
        let centerAnalog: paper.Point;
        let numRepeats: number = numMixers - 1;
        for (let i = 1; i <= numRepeats; i++) {
            y_val = y + i * diameter - (i - 1) * y_neckComponent;
            if (i % 2 == 1) {
                x_centerAnalog = x + (channelWidth + 0.5 * innerDiameter) * Math.cos((0.5 * neckAngle * Math.PI) / 180);
                y_centerAnalog = y_val + Math.abs((channelWidth + 0.5 * innerDiameter) * Math.sin((0.5 * neckAngle * Math.PI) / 180));
                centerAnalog = new paper.Point(x_centerAnalog, y_centerAnalog);
                //Add next ring
                outerCircle = new paper.Path.Circle(centerAnalog, 0.5 * innerDiameter + channelWidth);
                innerCircle = new paper.Path.Circle(centerAnalog, 0.5 * innerDiameter);
                mixerUnit = mixerUnit.unite(outerCircle.subtract(innerCircle));
                //Complete inter-ring connection
                neck = new paper.Path.Rectangle(new paper.Point(x, y_val - 0.5 * neckWidth), new paper.Size(channelWidth, neckWidth));
                neck.rotate(neckAngle / 2, new paper.Point(x, y_val));
                mixerUnit = mixerUnit.unite(neck);
                //Add trailing neck
                neck = new paper.Path.Rectangle(
                    new paper.Point(x - neckLength, y_val - 0.5 * neckWidth + (2 * channelWidth + innerDiameter) * Math.sin((0.5 * neckAngle * Math.PI) / 180)),
                    new paper.Size(neckLength + channelWidth, neckWidth)
                );
                neck.rotate((-1 * neckAngle) / 2, new paper.Point(x, y_val + (2 * channelWidth + innerDiameter) * Math.sin((0.5 * neckAngle * Math.PI) / 180)));
                mixerUnit = mixerUnit.unite(neck);
            } else {
                y_centerAnalog = y_val + Math.abs((channelWidth + 0.5 * innerDiameter) * Math.sin((0.5 * neckAngle * Math.PI) / 180));
                centerAnalog = new paper.Point(x_center, y_centerAnalog);
                //Add next ring
                outerCircle = new paper.Path.Circle(centerAnalog, 0.5 * innerDiameter + channelWidth);
                innerCircle = new paper.Path.Circle(centerAnalog, 0.5 * innerDiameter);
                mixerUnit = mixerUnit.unite(outerCircle.subtract(innerCircle));
                //Complete inter-ring connection
                neck = new paper.Path.Rectangle(
                    new paper.Point(x - channelWidth - neckLength * Math.cos((0.5 * neckAngle * Math.PI) / 180), y_val - 0.5 * neckWidth),
                    new paper.Size(channelWidth, neckWidth)
                );
                neck.rotate((-1 * neckAngle) / 2, new paper.Point(x - neckLength * Math.cos((0.5 * neckAngle * Math.PI) / 180), y_val));
                mixerUnit = mixerUnit.unite(neck);
                //Add trailing neck
                neck = new paper.Path.Rectangle(
                    new paper.Point(x - neckLength - channelWidth, y_val - 0.5 * neckWidth + diameter - neckLength * Math.sin((0.5 * neckAngle * Math.PI) / 180)),
                    new paper.Size(neckLength + channelWidth, neckWidth)
                );
                neck.rotate(neckAngle / 2, new paper.Point(x, y_val + diameter - neckLength * Math.sin((0.5 * neckAngle * Math.PI) / 180)));
                mixerUnit = mixerUnit.unite(neck);
            }
        }
        serp.addChild(mixerUnit);
        serp.fillColor = color;
        serp.rotate(rotation, new paper.Point(x, y));
        return serp;
    }

    render2DTarget(key: string, params: { [index: string]: any }): paper.CompoundPath {
        const render = this.render2D(params, key);
        if (render.fillColor != null) render.fillColor.alpha = 0.5;
        return render;
    }
}
