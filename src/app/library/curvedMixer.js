import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class CurvedMixer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            channelWidth: 0.8 * 1000,
            bendSpacing: 1.23 * 1000,
            numberOfBends: 1,
            bendLength: 2.46 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            bendSpacing: "μm",
            numberOfBends: "",
            channelWidth: "μm",
            bendLength: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            bendLength: 10,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            bendLength: 12 * 1000,
            height: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            rotation: "rotation",
            bendLength: "bendLength"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            rotation: "rotation",
            bendLength: "bendLength"
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

    getPorts(params) {
        const channelWidth = params.channelWidth;
        const bendLength = params.bendLength;
        const bendSpacing = params.bendSpacing;
        const numberOfBends = params.numberOfBends;

        const ports = [];

        ports.push(new ComponentPort(bendLength / 2 + channelWidth, 0, "1", "FLOW"));

        ports.push(new ComponentPort(bendLength / 2 + channelWidth, (2 * numberOfBends + 1) * channelWidth + 2 * numberOfBends * bendSpacing, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        const channelWidth = params.channelWidth;
        const bendLength = params.bendLength;
        const bendSpacing = params.bendSpacing;
        const rotation = params.rotation;
        const numBends = params.numberOfBends;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const segHalf = bendLength / 2 + channelWidth;
        const segLength = bendLength + 2 * channelWidth;
        const segBend = bendSpacing + 2 * channelWidth;
        const vRepeat = 2 * bendSpacing + 2 * channelWidth;
        const vOffset = bendSpacing + channelWidth;
        const hOffset = bendLength / 2 + channelWidth / 2;
        const serp = new paper.CompoundPath();

        // draw first segment
        let toprect = new paper.Path.Rectangle(x + channelWidth - 1, y, bendLength / 2 + channelWidth / 2 + 1, channelWidth);
        toprect.closed = true;
        for (let i = 0; i < numBends; i++) {
            // draw left curved segment
            let leftCurve = new paper.Path.Arc({
                from: [x + channelWidth, y + vRepeat * i],
                through: [x + channelWidth - (channelWidth + bendSpacing / 2), y + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth, y + vRepeat * i + bendSpacing + 2 * channelWidth]
            });
            leftCurve.closed = true;
            const leftCurveSmall = new paper.Path.Arc({
                from: [x + channelWidth, y + vRepeat * i + bendSpacing + channelWidth],
                through: [x + channelWidth - bendSpacing / 2, y + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth, y + vRepeat * i + channelWidth]
            });
            leftCurveSmall.closed = true;
            leftCurve = leftCurve.subtract(leftCurveSmall);
            toprect = toprect.unite(leftCurve);
            // serp.addChild(leftCurve);
            // draw horizontal segment
            let hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vOffset + vRepeat * i, bendLength + 2, channelWidth);
            toprect = toprect.unite(hseg);
            // draw right curved segment
            let rightCurve = new paper.Path.Arc({
                from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i],
                through: [x + channelWidth + bendLength + (channelWidth + bendSpacing / 2), y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + 2 * channelWidth]
            });
            rightCurve.closed = true;
            const rightCurveSmall = new paper.Path.Arc({
                from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + channelWidth],
                through: [x + channelWidth + bendLength + bendSpacing / 2, y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + channelWidth]
            });
            rightCurveSmall.closed = true;
            rightCurve = rightCurve.subtract(rightCurveSmall);
            toprect = toprect.unite(rightCurve);

            if (i === numBends - 1) {
                // draw half segment to close
                hseg = new paper.Path.Rectangle(x + channelWidth / 2 + bendLength / 2, y + vRepeat * (i + 1), (bendLength + channelWidth) / 2 + 1, channelWidth);
                toprect = toprect.unite(hseg);
            } else {
                // draw full segment
                hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vRepeat * (i + 1), bendLength + 2, channelWidth);
                toprect = toprect.unite(hseg);
            }
            toprect = toprect.unite(hseg);
        }
        serp.addChild(toprect);

        serp.fillColor = color;
        return serp.rotate(rotation, x, y);
    }

    render2DTarget(key, params) {
        const render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
