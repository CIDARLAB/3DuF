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
        // Set winding before adding children. Default even-odd punches a hole
        // wherever two rounded end-caps meet (mux 90° corners, shared trunks).
        connectionpath.fillRule = "nonzero";
        let startpoint, endpoint;

        let p1, p2;

        const crossSection = params.crossSection !== undefined && params.crossSection !== null ? Number(params.crossSection) : 0;
        const roundedProfile = crossSection >= 0.5;

        if (!Array.isArray(segments) || segments.length === 0) {
            console.warn("[3DuF] Connection render skipped: missing segments", params);
            connectionpath.fillColor = color;
            return connectionpath;
        }

        const capAt = this.__roundedCapLookup(segments, wayPoints);

        for (const i in segments) {
            const segment = segments[i];
            if (!segment || segment.length < 2 || !segment[0] || !segment[1]) {
                console.warn("[3DuF] Connection render skipped a malformed segment", segment);
                continue;
            }
            p1 = segment[0];
            p2 = segment[1];
            startpoint = new paper.Point(p1[0], p1[1]);
            endpoint = new paper.Point(p2[0], p2[1]);
            const startKey = this.__pointKey(p1);
            const endKey = this.__pointKey(p2);
            this.__drawStraightConnection(
                connectionpath,
                startpoint,
                endpoint,
                channelWidth,
                roundedProfile,
                capAt.has(startKey),
                capAt.has(endKey)
            );
        }

        // Square segments stop on the centerline, so a 90° turn leaves a
        // channelWidth/2 hole on the outer corner. Rounded stadiums add a
        // circle at every endpoint; CompoundPath defaults to even-odd, so
        // two coincident joint circles cancel and reopen that same hole.
        // Fill every orthogonal joint and keep a nonzero winding so the
        // outermost mux bend stays connected.
        this.__fillSquareChannelCorners(connectionpath, segments, channelWidth);
        connectionpath.fillRule = "nonzero";
        connectionpath.fillColor = color;
        return connectionpath;
    }

    __pointKey(p: [number, number] | number[]): string {
        return `${Math.round(Number(p[0]))},${Math.round(Number(p[1]))}`;
    }

    /**
     * Round caps belong at true terminals and at touching corners. Valve-gap
     * ends are extra vertices that do not match the original wayPoints and do
     * not coincide with another segment — those stay square so the FLOW
     * channel is interrupted at the valve gap instead of the stadium caps
     * filling it.
     */
    __roundedCapLookup(
        segments: Array<[[number, number], [number, number]]>,
        wayPoints: Array<[number, number]> | undefined
    ): Set<string> {
        const capAt = new Set<string>();
        if (Array.isArray(wayPoints)) {
            for (const wp of wayPoints) {
                if (wp && wp.length >= 2) {
                    capAt.add(this.__pointKey(wp));
                }
            }
        }
        const counts = new Map<string, number>();
        for (const segment of segments) {
            if (!segment || segment.length < 2) {
                continue;
            }
            for (const pt of [segment[0], segment[1]]) {
                if (!pt || pt.length < 2) {
                    continue;
                }
                const key = this.__pointKey(pt);
                counts.set(key, (counts.get(key) || 0) + 1);
            }
        }
        counts.forEach((count, key) => {
            if (count > 1) {
                capAt.add(key);
            }
        });
        return capAt;
    }

    __fillSquareChannelCorners(
        compoundpath: paper.CompoundPath,
        segments: Array<[[number, number], [number, number]]>,
        channelWidth: number
    ): void {
        if (!Array.isArray(segments) || segments.length < 2 || !channelWidth) {
            return;
        }
        const radius = channelWidth / 2;
        const nonzero: Array<[[number, number], [number, number]]> = [];
        for (const segment of segments) {
            if (!segment || segment.length < 2) {
                continue;
            }
            const a = segment[0];
            const b = segment[1];
            if (!a || !b || a.length < 2 || b.length < 2) {
                continue;
            }
            if (a[0] === b[0] && a[1] === b[1]) {
                continue;
            }
            nonzero.push(segment);
        }
        for (let i = 1; i < nonzero.length; i++) {
            const prev = nonzero[i - 1];
            const next = nonzero[i];
            const d0x = Math.sign(prev[1][0] - prev[0][0]);
            const d0y = Math.sign(prev[1][1] - prev[0][1]);
            const d1x = Math.sign(next[1][0] - next[0][0]);
            const d1y = Math.sign(next[1][1] - next[0][1]);
            if (d0x === d1x && d0y === d1y) {
                continue;
            }
            const joint = next[0];
            compoundpath.addChild(
                new paper.Path.Rectangle({
                    point: [joint[0] - radius, joint[1] - radius],
                    size: [channelWidth, channelWidth]
                })
            );
        }
    }

    __drawStraightConnection(
        compoundpath: paper.CompoundPath,
        startpoint: paper.Point,
        endpoint: paper.Point,
        channelWidth: number,
        roundedProfile: boolean,
        capStart = true,
        capEnd = true
    ): void  {
        const vec = endpoint.subtract(startpoint);
        const radius = channelWidth / 2;
        const length = vec.length;

        // Rounded profile is a center rectangle that ends on the connection
        // endpoints, plus circular caps at terminals / corners. Valve-gap ends
        // stay square so the FLOW channel is broken at the valve, not filled.
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
            if (capStart) {
                compoundpath.addChild(new paper.Path.Circle(startpoint, radius));
            }
            if (capEnd) {
                compoundpath.addChild(new paper.Path.Circle(endpoint, radius));
            }
            return;
        }

        const rec = new paper.Path.Rectangle({
            point: startpoint,
            size: [length, channelWidth]
        });
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
