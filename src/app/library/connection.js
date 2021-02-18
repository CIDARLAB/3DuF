import Template from "./template";
import paper from "paper";

export default class Connection extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            start: "Point",
            end: "Point",
            wayPoints: "PointArray",
            segments: "SegmentArray"
        };

        this.__heritable = {
            connectionSpacing: "Float",
            channelWidth: "Float",
            height: "Float"
        };

        this.__defaults = {
            connectionSpacing: 1600,
            channelWidth: 0.8 * 1000,
            height: 250
        };

        this.__units = {
            connectionSpacing: "&mu;m",
            channelWidth: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            connectionSpacing: 0,
            channelWidth: 3,
            height: 10
        };

        this.__maximum = {
            connectionSpacing: 10000,
            channelWidth: 2000,
            height: 1200
        };

        this.__featureParams = {
            connectionSpacing: "connectionSpacing",
            start: "start",
            end: "end",
            wayPoints: "wayPoints",
            channelWidth: "channelWidth",
            segments: "segments",
            height: "height"
        };

        this.__targetParams = {
            connectionSpacing: "connectionSpacing",
            wayPoints: "wayPoints",
            channelWidth: "channelWidth",
            segments: "segments",
            height: "height"
        };

        this.__placementTool = "ConnectionTool";

        this.__toolParams = {
            start: "start",
            end: "end"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "CHANNEL";
    }

    render2D(params, key) {
        let start = params["start"];
        let end = params["end"];
        let color = params["color"];
        let width = params["width"];
        let wayPoints = params["wayPoints"];
        let channelWidth = params["channelWidth"];
        let segments = params["segments"];
        let connectionpath = new paper.CompoundPath();
        let startpoint, endpoint;

        let p1, p2;

        for (let i in segments) {
            let segment = segments[i];
            p1 = segment[0];
            p2 = segment[1];
            startpoint = new paper.Point(p1[0], p1[1]);
            endpoint = new paper.Point(p2[0], p2[1]);
            this.__drawStraightConnection(connectionpath, startpoint, endpoint, channelWidth);
        }

        connectionpath.fillColor = color;
        return connectionpath;
    }

    __drawStraightConnection(compoundpath, startpoint, endpoint, channelWidth) {
        //edit the points
        let vec = endpoint.subtract(startpoint);
        let rec = new paper.Path.Rectangle({
            point: startpoint,
            radius: channelWidth / 2,
            size: [vec.length + channelWidth, channelWidth]
        });
        rec.translate([-channelWidth / 2, -channelWidth / 2]);
        rec.rotate(vec.angle, startpoint);

        compoundpath.addChild(rec);
    }

    render2DTarget(key, params) {
        let thickness = params["channelWidth"] / 5;
        let length = params["channelWidth"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let chair = new paper.Path.Rectangle(x - length / 2, y - thickness / 2, length, thickness);
        chair = chair.unite(new paper.Path.Rectangle(x - thickness / 2, y - length / 2, thickness, length));
        chair.fillColor = color;
        chair.fillColor.alpha = 0.5;
        return chair;
    }
}
