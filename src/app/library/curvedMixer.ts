import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";
import { DEFAULT_CHANNEL_WIDTH_UM, mixerEndLayout } from "./channelWidths";

export default class CurvedMixer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            edgeBend1: "Float",
            edgeBend2: "Float",
            bendLength: "Float",
            rotation: "Float",
            height: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            channelWidth: DEFAULT_CHANNEL_WIDTH_UM,
            edgeBend1: DEFAULT_CHANNEL_WIDTH_UM / 2,
            edgeBend2: DEFAULT_CHANNEL_WIDTH_UM / 2,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            bendLength: 2.46 * 1000,
            height: 250,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            bendSpacing: "μm",
            numberOfBends: "",
            channelWidth: "μm",
            edgeBend1: "μm",
            edgeBend2: "μm",
            bendLength: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            channelWidth: 10,
            edgeBend1: 0,
            edgeBend2: 0,
            bendSpacing: 10,
            numberOfBends: 1,
            bendLength: 10,
            height: 10,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            channelWidth: 2000,
            edgeBend1: 12000,
            edgeBend2: 12000,
            bendSpacing: 6000,
            numberOfBends: 20,
            bendLength: 12 * 1000,
            height: 1200,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            channelWidth: "channelWidth",
            edgeBend1: "edgeBend1",
            edgeBend2: "edgeBend2",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            rotation: "rotation",
            bendLength: "bendLength",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            edgeBend1: "edgeBend1",
            edgeBend2: "edgeBend2",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            rotation: "rotation",
            bendLength: "bendLength",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "CURVED MIXER";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const layout = mixerEndLayout(params);
        const ports = [];
        ports.push(new ComponentPort(layout.port1x, 0, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(layout.port2x, layout.openingY2, "2", LogicalLayerType.FLOW));
        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const channelWidth = params.channelWidth;
        const bendLength = params.bendLength;
        const bendSpacing = params.bendSpacing;
        const rotation = params.rotation;
        const numBends = params.numberOfBends;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const layout = mixerEndLayout(params);
        const vRepeat = 2 * bendSpacing + 2 * channelWidth;
        const vOffset = bendSpacing + channelWidth;
        const serp = new paper.CompoundPath("");

        // draw first segment (port-centered; outer end is port + edgeBend1)
        let toprect: paper.Rectangle | paper.PathItem = new paper.Path.Rectangle(
            new paper.Rectangle(x + channelWidth - 1, y, layout.firstWidth - (channelWidth - 1), channelWidth)
        );
        (toprect as any).closed = true;
        for (let i = 0; i < numBends; i++) {
            // draw left curved segment
            let leftCurve: paper.Path.Arc | paper.PathItem = new paper.Path.Arc({
                from: [x + channelWidth, y + vRepeat * i],
                through: [x + channelWidth - (channelWidth + bendSpacing / 2), y + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth, y + vRepeat * i + bendSpacing + 2 * channelWidth]
            });
            (leftCurve as any).closed = true;
            const leftCurveSmall = new paper.Path.Arc({
                from: [x + channelWidth, y + vRepeat * i + bendSpacing + channelWidth],
                through: [x + channelWidth - bendSpacing / 2, y + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth, y + vRepeat * i + channelWidth]
            });
            leftCurveSmall.closed = true;
            leftCurve = leftCurve.subtract(leftCurveSmall);
            toprect = toprect.unite(leftCurve);
            //serp.addChild(leftCurve);
            // draw horizontal segment
            let hseg = new paper.Path.Rectangle(new paper.Rectangle(x + channelWidth - 1, y + vOffset + vRepeat * i, bendLength + 2, channelWidth));
            toprect = toprect.unite(hseg);
            // draw right curved segment
            let rightCurve: paper.Path.Arc | paper.PathItem = new paper.Path.Arc({
                from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i],
                through: [x + channelWidth + bendLength + (channelWidth + bendSpacing / 2), y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + 2 * channelWidth]
            });
            (rightCurve as any).closed = true;
            const rightCurveSmall = new paper.Path.Arc({
                from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + channelWidth],
                through: [x + channelWidth + bendLength + bendSpacing / 2, y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + channelWidth]
            });
            rightCurveSmall.closed = true;
            rightCurve = rightCurve.subtract(rightCurveSmall);
            toprect = toprect.unite(rightCurve);

            if (i === numBends - 1) {
                // draw incomplete end-bend to close (outer end is port - edgeBend2)
                const curvedLastWidth = channelWidth + bendLength + 1 - layout.lastStart;
                hseg = new paper.Path.Rectangle(new paper.Rectangle(x + layout.lastStart, y + vRepeat * (i + 1), curvedLastWidth, channelWidth));
                toprect = toprect.unite(hseg);
            } else {
                // draw full segment
                hseg = new paper.Path.Rectangle(new paper.Rectangle(x + channelWidth - 1, y + vRepeat * (i + 1), bendLength + 2, channelWidth));
                toprect = toprect.unite(hseg);
            }
            toprect = toprect.unite(hseg);
        }
        serp.addChild(toprect);

        serp.fillColor = color;
        this.transformRender(params,serp);

        return serp;
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
