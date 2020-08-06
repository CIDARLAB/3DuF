import Template from "./template";
import { Path, CompoundPath } from "paper";

export default class PCRChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float",
            // new params 
            intermediatePartLength: "Float",
            curvature: "Float"
        };

        this.__defaults = {
            channelWidth: 0.500 * 1000,
            bendSpacing: 2.358 * 1000,
            numberOfBends: 10,
            orientation: "H",
            bendLength: 9.142 * 1000,
            height: 250,
            // new params
            intermediatePartLength: 3.0 * 1000,
            curvature: 100
        };

        this.__units = {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m",
            // new params
            intermediatePartLength: "&mu;m",
            curvature: "&mu;m"
        };

        this.__minimum = {
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            orientation: "V",
            bendLength: 10,
            height: 10,
            // new params
            intermediatePartLength: 5,
            curvature: 50
        };

        this.__maximum = {
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            orientation: "V",
            bendLength: 12 * 1000,
            height: 1200,
            // new params
            intermediatePartLength: 4 * 1000,
            curvature: 300
        };

        this.__featureParams = {
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            // new params
            intermediatePartLength: "intermediatePartLength",
            curvature: "curvature"
        };

        this.__targetParams = {
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            // new params
            intermediatePartLength: "intermediatePartLength",
            curvature: "curvature"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "PCRChamber";
    }

    render2D(params, key) {
        let cw = params["channelWidth"];
        let bl = params["bendLength"];
        let bs = params["bendSpacing"];
        let pl = params["intermediatePartLength"];
        let orientation = params["orientation"];
        let cycles = params["numberOfBends"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let curve = params["curvature"];

        let plotArc = (x, y, r1, r2, left=true) => {
            let x_intermediate = left ? x - r1 : x + r1;
            let externalArc = new Path.Arc({
                from: [x, y],
                through: [x_intermediate, y + r1],
                to: [x, y + 2 * r1],
            });
            externalArc.closed = true;

            x_intermediate = left ? x - r2 : x + r2;
            let internalArc = new Path.Arc({
                from: [x, y + r1 - r2],
                through: [x_intermediate, y + r1 - r2 + r2],
                to: [x, y + r1 - r2 + 2 * r2],
            });
            internalArc.closed = true;
            return externalArc.subtract(internalArc);
        };

        let plotRec = (x, y, length, width, curve) => {
            return new Path.Rectangle(x, y, length, width, curve);
        };

        let plotStraightSegments = (x, y, bendLength, partLength, channelWidth, curve) => {
            let len = (bendLength - partLength) / 2;
            let part1 = plotRec(x, y, len, channelWidth / 2);
            let part2 = plotRec(x + len, y - channelWidth/4, partLength, channelWidth, curve);
            let part3 = plotRec(x + len + partLength, y, bendLength - partLength - len, channelWidth / 2);

            return {part1, part2, part3};
        };

        let pcr = new CompoundPath();

        // define narrow part length
        let narrowPartLength = (bl - pl) / 2;

        // define device
        let device = plotRec(x + cw + narrowPartLength, y + 3 * cw / 4, narrowPartLength, cw / 2);
        device.closed = true;

        let cycleLength = 2 * bs + 2 * cw;
        let offset = bs + cw;

        // define the custom parts for the output
        let x_offset = cw + narrowPartLength;
        let leftArc = plotArc(x + x_offset, y + 3 * cw / 4, bs/2 + cw/2, bs/2);
        let seg1 = plotRec(x + x_offset, y + offset, pl, cw, curve);
        let seg2 = plotRec(x + x_offset + pl, y + offset + cw / 4, narrowPartLength, cw/2);
        let rightArc = plotArc(x + bl, y + offset, bs/2 + cw, bs/2, false);
        let seg3 = plotRec(x, y + cycleLength + cw/4, bl + 2, cw / 2);

        device = device.unite(leftArc);
        device = device.unite(seg1);
        device = device.unite(seg2);
        device = device.unite(rightArc);
        device = device.unite(seg3);

        let seg;
        let externalRadius = bs/2 + cw;
        let internalRadius = bs/2;
        for (let i = 1; i < cycles + 1; i++) {
            //draw left curved segment
            leftArc = plotArc(x, y + cycleLength * i, externalRadius, internalRadius, true);
            device = device.unite(leftArc);

            //draw straight segments
            let segments = plotStraightSegments(x, y + offset + cycleLength * i + cw / 4, bl, pl, cw, curve);
            device = device.unite(segments.part1);
            device = device.unite(segments.part2);
            device = device.unite(segments.part3);

            //draw right curved segment
            rightArc = plotArc(x + bl, y + offset + cycleLength * i, externalRadius, internalRadius, false);
            device = device.unite(rightArc);

            //draw straight segment
            seg = plotRec(x, y + cycleLength * (i + 1) + cw / 4, bl + 2, cw / 2);
            device = device.unite(seg);
        }
        // define the custom parts for the input
        leftArc = plotArc(x, y + cycleLength * (cycles + 1), externalRadius, internalRadius, true);
        device = device.unite(leftArc);
        seg = plotRec(x, y + offset + cycleLength * (cycles + 1), bl + externalRadius, cw);
        device = device.unite(seg);

        pcr.addChild(device);

        orientation == "V" ? pcr.rotate(0, x + cw, y) : pcr.rotate(90, x + cw, y);

        pcr.fillColor = color;
        return pcr;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
