import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class ReverseTranscriptor extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            curvermixerRotation: "Float",
            heaterRotation: "Float",
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            curvedmixerHeight: "Float",
            heaterHeight: "Float",
            heaterWidth: "Float",
            heaterLength: "Float",
            temperature: "Float"
        };

        this.__defaults = {
            componentSpacing: 95,
            curvedmixerRotation: 90,
            heaterRotation: 0,
            bendSpacing: 140,
            numberOfBends: 5,
            channelWidth: 500,
            bendLength: 6500,
            curvedmixerHeight: 250,
            heaterHeight: 5000,
            heaterWidth: 20000,
            heaterLength: 40000,
            temperature: 52

        };

        this.__units = {
            componentSpacing: "&mu;m",
            curvedmixerRotation: "&deg;",
            heaterRotation: "&deg;",
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            curvedmixerHeight: "&mu;m",
            heaterHeight: "&mu;m",
            heaterWidth: "&mu;m",
            heaterLength: "&mu;m",
            temperature: "°C"
        };

        this.__minimum = {
            componentSpacing: 0,
            curvedmixerRotation: 0,
            heaterRotation: 0,
            bendSpacing: 10,
            numberOfBends: 1,
            channelWidth: 10,
            bendLength: 10,
            curvedmixerHeight: 10,
            heaterHeight: 10,
            heaterWidth: 10,
            heaterLength: 10,
            temperature: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            curvedmixerRotation: 360,
            heaterRotation: 360,
            bendSpacing: 6000,
            numberOfBends: 20,
            channelWidth: 2000,
            bendLength: 12 * 1000,
            curvedmixerHeight: 1200,
            heaterHeight: 10 * 1000,
            heaterWidth: 60 * 1000,
            heaterLength: 60 * 1000,
            temperature: 100
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            curvedmixerRotation: "curvedmixerRotation",
            heaterRotation: "heaterRotation",
            position: "position",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            channelWidth: "channelWidth",
            bendLength: "bendLength",
            heaterWidth: "heaterWidth",
            heaterLength: "heaterLength",
            temperature: "temperature"

        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            curvedmixerRotation: "curvedmixerRotation",
            heaterRotation: "heaterRotation",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            bendLength: "bendLength",
            heaterWidth: "heaterWidth",
            heaterLength: "heaterLength",
            temperature: "temperature"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "REVERSE TRANSCRIPTOR";
    }

    getPorts(params) {
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let numberOfBends = params["numberOfBends"];
        let heaterWidth = params["heaterWidth"];
        let heaterLength = params["heaterLength"];


        let ports = [];

        ports.push(new ComponentPort(-heaterWidth / 2, -heaterLength / 6, "1", "FLOW"));
        ports.push(new ComponentPort(bendLength / 2 + channelWidth, (2 * numberOfBends + 1) * channelWidth + 2 * numberOfBends * bendSpacing, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let cmRotation = params["curvedmixerRotation"];
        let hRotation = params["heaterRotation"];
        let numBends = params["numberOfBends"];
        let w = params["heaterWidth"];
        let l = params["heaterLength"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let 
        let segHalf = bendLength / 2 + channelWidth;
        let segLength = bendLength + 2 * channelWidth;
        let segBend = bendSpacing + 2 * channelWidth;
        let vRepeat = 2 * bendSpacing + 2 * channelWidth;
        let vOffset = bendSpacing + channelWidth;
        let hOffset = bendLength / 2 + channelWidth / 2;
        let serp = new paper.CompoundPath();
        let startX = x - w / 2;
        let startY = y - l / 2;
        let endX = x + w / 2;
        let endY = y + l / 2;
        let startPoint = new paper.Point(startX, startY);
        let endPoint = new paper.Point(endX, endY);

        let heater_rect = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            fillColor: color,
            strokeWidth: 0
        });

        let x = -w / 2;
        let y = l / 6;
        //draw first segment
        let toprect = new paper.Path.Rectangle(x + channelWidth - 1, y, bendLength / 2 + channelWidth / 2 + 1, channelWidth);
        toprect.closed = true;
        toprect = toprect.unite(heater_rect);
        for (let i = 0; i < numBends; i++) {
            //draw left curved segment
            let leftCurve = new paper.Path.Arc({
                from: [x + channelWidth, y + vRepeat * i],
                through: [x + channelWidth - (channelWidth + bendSpacing / 2), y + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth, y + vRepeat * i + bendSpacing + 2 * channelWidth]
            });
            leftCurve.closed = true;
            let leftCurveSmall = new paper.Path.Arc({
                from: [x + channelWidth, y + vRepeat * i + bendSpacing + channelWidth],
                through: [x + channelWidth - bendSpacing / 2, y + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth, y + vRepeat * i + channelWidth]
            });
            leftCurveSmall.closed = true;
            leftCurve = leftCurve.subtract(leftCurveSmall);
            toprect = toprect.unite(leftCurve);
            // serp.addChild(leftCurve);
            //draw horizontal segment
            let hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vOffset + vRepeat * i, bendLength + 2, channelWidth);
            toprect = toprect.unite(hseg);
            //draw right curved segment
            let rightCurve = new paper.Path.Arc({
                from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i],
                through: [x + channelWidth + bendLength + (channelWidth + bendSpacing / 2), y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + 2 * channelWidth]
            });
            rightCurve.closed = true;
            let rightCurveSmall = new paper.Path.Arc({
                from: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + bendSpacing + channelWidth],
                through: [x + channelWidth + bendLength + bendSpacing / 2, y + vOffset + vRepeat * i + bendSpacing / 2 + channelWidth],
                to: [x + channelWidth + bendLength, y + vOffset + vRepeat * i + channelWidth]
            });
            rightCurveSmall.closed = true;
            rightCurve = rightCurve.subtract(rightCurveSmall);
            toprect = toprect.unite(rightCurve);

            if (i == numBends - 1) {
                //draw half segment to close
                hseg = new paper.Path.Rectangle(x + channelWidth / 2 + bendLength / 2, y + vRepeat * (i + 1), (bendLength + channelWidth) / 2 + 1, channelWidth);
                toprect = toprect.unite(hseg);
            } else {
                //draw full segment
                hseg = new paper.Path.Rectangle(x + channelWidth - 1, y + vRepeat * (i + 1), bendLength + 2, channelWidth);
                toprect = toprect.unite(hseg);
            }
            toprect = toprect.unite(hseg);
        }
        serp.addChild(toprect);

        serp.fillColor = color;
        return serp.rotate(rotation, x, y);;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}