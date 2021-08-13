import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class DropletMerger extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            inputWidth1: "Float",
            inputWidth2: "Float",
            outputWidth: "Float",
            stabilizationLength: "Float",
            rotation: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            inputWidth1: 400,
            inputWidth2: 400,
            outputWidth: 400,
            stabilizationLength: 5000,
            rotation: 0,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            inputWidth1: "&mu;m",
            inputWidth2: "&mu;m",
            outputWidth: "&mu;m",
            stabilizationLength: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            inputWidth1: 1,
            inputWidth2: 1,
            outputWidth: 1,
            stabilizationLength: 10,
            rotation: 0,
            height: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            inputWidth1: 10000,
            inputWidth2: 10000,
            outputWidth: 10000,
            stabilizationLength: 500000,
            rotation: 360,
            height: 10000
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            inputWidth1: "inputWidth1",
            inputWidth2: "inputWidth2",
            outputWidth: "outputWidth",
            stabilizationLength: "stabilizationLength",
            rotation: "rotation;",
            height: "height"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            inputWidth1: "inputWidth1",
            inputWidth2: "inputWidth2",
            outputWidth: "outputWidth",
            stabilizationLength: "stabilizationLength",
            rotation: "rotation;"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET MERGER";
    }

    getPorts(params) {
        const channelWidth = params.channelWidth.value;
        const bendLength = params.bendLength.value;
        const bendSpacing = params.bendSpacing.value;
        const rotation = params.rotation.value;
        const numberOfBends = params.numberOfBends.value;

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
        serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
        for (let i = 0; i < numBends; i++) {
            serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
            serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
            serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
            if (i === numBends - 1) {
                // draw half segment to close
                serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
            } else {
                // draw full segment
                serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
            }
        }

        serp.fillColor = color;
        return serp.rotate(rotation, new paper.Point(x, y));
    }

    render2DTarget(key, params) {
        const serp = this.render2D(params, key);

        serp.fillColor.alpha = 0.5;
        return serp;
    }
}
