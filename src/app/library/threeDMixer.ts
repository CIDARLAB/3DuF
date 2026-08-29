import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";
import { DEFAULT_CHANNEL_WIDTH_UM, mixerEndLayout } from "./channelWidths";

export default class ThreeDMixer extends Template {
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
            channelWidth: DEFAULT_CHANNEL_WIDTH_UM,
            edgeBend1: DEFAULT_CHANNEL_WIDTH_UM / 2,
            edgeBend2: DEFAULT_CHANNEL_WIDTH_UM / 2,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            rotation: 0,
            bendLength: 2.46 * 1000,
            height: 250,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            bendSpacing: "μm",
            numberOfBends: "",
            channelWidth: "μm",
            edgeBend1: "μm",
            edgeBend2: "μm",
            bendLength: "μm",
            rotation: "°",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            channelWidth: 10,
            edgeBend1: 0,
            edgeBend2: 0,
            bendSpacing: 10,
            numberOfBends: 1,
            rotation: 0,
            bendLength: 10,
            height: 10,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            channelWidth: 2000,
            edgeBend1: 12000,
            edgeBend2: 12000,
            bendSpacing: 6000,
            numberOfBends: 20,
            rotation: 360,
            bendLength: 12 * 1000,
            height: 1200,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
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

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "MIXER3D";

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
        const segLength = bendLength + 2 * channelWidth;
        const segBend = bendSpacing + 2 * channelWidth;
        const vRepeat = 2 * bendSpacing + 2 * channelWidth;
        const vOffset = bendSpacing + channelWidth;
        const serp = new paper.CompoundPath("");

        if (key === "FLOW") {
            // draw first segment
            serp.addChild(new paper.Path.Rectangle(new paper.Rectangle(x, y, layout.firstWidth, channelWidth)));
            for (let i = 0; i < numBends; i++) {
                serp.addChild(new paper.Path.Rectangle(new paper.Rectangle(x, y + vRepeat * i, channelWidth, segBend)));
                // serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
                serp.addChild(new paper.Path.Rectangle(new paper.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend)));
                if (i === numBends - 1) {
                    // draw incomplete end-bend to close
                    serp.addChild(new paper.Path.Rectangle(new paper.Rectangle(x + layout.lastStart, y + vRepeat * (i + 1), layout.lastWidth, channelWidth)));
                } else {
                    // draw full segment
                    serp.addChild(new paper.Path.Rectangle(new paper.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth)));
                }
            }
        } else {
            // draw first segment
            // serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
            for (let i = 0; i < numBends; i++) {
                // serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
                serp.addChild(new paper.Path.Rectangle(new paper.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth)));
                // serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
                // if (i === numBends - 1) {//draw half segment to close
                //     serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
                // } else {//draw full segment
                //     serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
                // }
            }
        }

        serp.fillColor = color;
        this.transformRender(params,serp);
        return serp;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const serp = this.render2D(params, key);
        serp.fillColor = params.color;
        serp.fillColor!.alpha = 0.5;
        return serp;
    }
}
