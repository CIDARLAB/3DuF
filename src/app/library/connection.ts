import Template from "./template";
import paper from "paper";

export default class Connection extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            start: "Point",
            end: "Point",
            wayPoints: "PointArray",
            segments: "SegmentArray"
        };

        this.__heritable = {
            connectionSpacing: "Float",
            channelWidth: "Float",
            height: "Float",
            /** 0 = rectangular (square) channel profile with flat ends; 1 = rounded profile (stadium outline, circular cross-section). */
            crossSection: "Float"
        };

        this.__defaults = {
            connectionSpacing: 1600,
            channelWidth: 0.8 * 1000,
            height: 250,
            crossSection: 0
        };

        this.__units = {
            connectionSpacing: "μm",
            channelWidth: "μm",
            height: "μm",
            crossSection: ""
        };

        this.__minimum = {
            connectionSpacing: 0,
            channelWidth: 3,
            height: 10,
            crossSection: 0
        };

        this.__maximum = {
            connectionSpacing: 10000,
            channelWidth: 12000,
            height: 1200,
            crossSection: 1
        };

        this.__featureParams = {
            connectionSpacing: "connectionSpacing",
            start: "start",
            end: "end",
            wayPoints: "wayPoints",
            channelWidth: "channelWidth",
            segments: "segments",
            height: "height",
            crossSection: "crossSection"
        };

        this.__targetParams = {
            connectionSpacing: "connectionSpacing",
            wayPoints: "wayPoints",
            channelWidth: "channelWidth",
            segments: "segments",
            height: "height",
            crossSection: "crossSection"
        };

        this.__placementTool = "ConnectionTool";

        this.__toolParams = {
            start: "start",
            end: "end"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "CHANNEL";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(params: { [k: string]: any }, key: string) {
        const start = params.start;
        const end = params.end;
        const color = params.color;
        const width = params.width;
        const wayPoints = params.wayPoints;
        const channelWidth = params.channelWidth;
        const segments = params.segments;
        const connectionpath = new paper.CompoundPath("");
        let startpoint, endpoint;

        let p1, p2;

        const crossSection = params.crossSection !== undefined && params.crossSection !== null ? Number(params.crossSection) : 0;
        const roundedProfile = crossSection >= 0.5;

        for (const i in segments) {
            const segment = segments[i];
            p1 = segment[0];
            p2 = segment[1];
            startpoint = new paper.Point(p1[0], p1[1]);
            endpoint = new paper.Point(p2[0], p2[1]);
            this.__drawStraightConnection(connectionpath, startpoint, endpoint, channelWidth, roundedProfile);
        }

        connectionpath.fillColor = color;
        return connectionpath;
    }

    __drawStraightConnection(
        compoundpath: paper.CompoundPath,
        startpoint: paper.Point,
        endpoint: paper.Point,
        channelWidth: number,
        roundedProfile: boolean
    ): void  {
        const vec = endpoint.subtract(startpoint);
        const radius = channelWidth / 2;
        const length = vec.length;

        // Rounded profile is rendered as a center rectangle that ends exactly on
        // the connection endpoints, plus circular end caps with radius=channelRadius.
        if (roundedProfile) {
            if (length > 0) {
                const rec = new paper.Path.Rectangle({
                    point: startpoint,
                    size: [length, channelWidth]
                });
                rec.translate(([0, -radius] as unknown) as paper.Point);
                rec.rotate(vec.angle, startpoint);
                compoundpath.addChild(rec);
            }
            compoundpath.addChild(new paper.Path.Circle(startpoint, radius));
            compoundpath.addChild(new paper.Path.Circle(endpoint, radius));
            return;
        }

        const rec = new paper.Path.Rectangle({
            point: startpoint,
            size: [length, channelWidth]
        });
        // Keep square profile centered around the centerline with no axial extension.
        rec.translate(([0, -radius] as unknown) as paper.Point);
        rec.rotate(vec.angle, startpoint);
        compoundpath.addChild(rec);
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        const thickness = params.channelWidth / 5;
        const length = params.channelWidth;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        let chair = new paper.Path.Rectangle(new paper.Rectangle(x - length / 2, y - thickness / 2, length, thickness));
        let chairtarget = chair.unite(new paper.Path.Rectangle(new paper.Rectangle(x - thickness / 2, y - length / 2, thickness, length)));
        chairtarget.fillColor = color;
        chairtarget.fillColor!.alpha = 0.5;
        return chairtarget;
    }
}
