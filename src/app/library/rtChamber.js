import Template from "./template";
import {Path, CompoundPath} from "paper";

export default class RTChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            bendSpacing: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float",
            partLength: "Float",
            verticalPartLength: "Float"
        };

        this.__defaults = {
            bendSpacing: 5.8 * 1000,
            channelWidth: 0.7 * 1000,
            bendLength: 61.7 * 1000,
            orientation: "H",
            height: 250,
            partLength: 40.4 * 1000,
            verticalPartLength: 5.3 * 1000
        };

        this.__units = {
            bendSpacing: "&mu;m",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m",
            partLength: "&mu;m",
            verticalPartLength: "&mu;m"
        };

        this.__minimum = {
            bendSpacing: 10,
            channelWidth: 10,
            orientation: "V",
            bendLength: 10 * 1000,
            height: 10,
            partLength: 5 * 1000,
            verticalPartLength: 2 * 1000
        };

        this.__maximum = {
            channelWidth: 2000,
            bendSpacing: 6000,
            orientation: "V",
            bendLength: 62 * 1000,
            height: 1200,
            // new params
            partLength: 44 * 1000,
            verticalPartLength: 6 * 1000
        };

        this.__featureParams = {
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            orientation: "orientation",
            bendLength: "bendLength",
            partLength: "partLength",
            verticalPartLength: "verticalPartLength"
        };

        this.__targetParams = {
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            orientation: "orientation",
            bendLength: "bendLength",
            partLength: "partLength",
            verticalPartLength: "verticalPartLength"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "RTChamber";
    }

    render2D(params, key) {
        let cw = params["channelWidth"];
        let bl = params["bendLength"];
        let bs = params["bendSpacing"];
        let pl = params["partLength"];
        let orientation = params["orientation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let verticalPartLength = params["verticalPartLength"];

        let rt = new CompoundPath();

        let device = new Path.Rectangle(x, y, pl, cw);
        device.closed = true;

        x = x + pl;
        let externalArc = new Path.Arc({
            from: [x, y - bs - cw],
            through: [x + bs / 2 + cw, y - bs - cw + bs / 2 + cw],
            to: [x, y + cw]
        });
        externalArc.closed = true;

        let internalArc = new Path.Arc({
            from: [x, y - bs],
            through: [x + bs / 2, y - bs + bs / 2],
            to: [x, y]
        });
        internalArc.closed = true;
        externalArc = externalArc.subtract(internalArc);

        device = device.unite(externalArc);

        y = y - bs - cw;
        x = x - bl;
        let part = new Path.Rectangle(x, y, bl, cw);
        device = device.unite(part);

        part = new Path.Rectangle(x - cw, y - verticalPartLength, cw, verticalPartLength + cw);

        device = device.unite(part);

        rt.addChild(device);

        orientation == "V" ? rt.rotate(90, x + cw, y) : rt.rotate(0, x + cw, y);

        rt.fillColor = color;
        return rt;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
