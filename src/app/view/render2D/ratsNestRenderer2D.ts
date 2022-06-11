import Connection from "@/app/core/connection";
import { Point } from "@/app/core/init";
import paper from "paper";
import Device from "@/app/core/device";

export default class RatsNestRenderer2D {
    static renderRatsNest(connectionlist: Array<Connection>, device: Device) {
        const ratsnestgroup = new paper.Group();
        let start, end, sink, render, sourceid, sinkid;
        for (const i in connectionlist) {
            const connection = connectionlist[i];
            const source = connection.source;
            if (source === null) {
                console.error(`source ${connection.id} is null, cannot render rats nest`);
                continue;
            }
            const sinks = connection.sinks;
            // console.log("Sinks", sinks, sinks.length);
            for (const ii in sinks) {
                sink = sinks[ii];
                const startcomponent = source.component;
                const endcomponent = sink.component;
                start = startcomponent.getCenterPosition();
                end = endcomponent.getCenterPosition();
                // console.log(start, end);
                render = RatsNestRenderer2D.renderRatsNestConnection(start, end);
                ratsnestgroup.addChild(render);
            }
        }

        return ratsnestgroup;
    }

    static renderRatsNestConnection(start: Point, end: Point) {
        const vstart = new paper.Point(start[0], start[1]);
        const vend = new paper.Point(end[0], end[1]);

        const vpath = new paper.Path([vstart, vend]);

        vpath.strokeColor = new paper.Color("#696965");
        vpath.strokeWidth = 500;
        vpath.strokeCap = "round";

        vpath.dashArray = [1000, 1300];
        return vpath;
    }
}
