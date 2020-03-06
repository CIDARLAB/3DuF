import paper from "paper";

export default class RatsNestRenderer2D {
    static renderRatsNest(connectionlist, device) {
        let ratsnestgroup = new paper.Group();
        let start, end, sink, render, sourceid, sinkid;
        for (let i in connectionlist) {
            let connection = connectionlist[i];
            let source = connection.source;
            let sinks = connection.sinks;
            // console.log("Sinks", sinks, sinks.length);
            for (let ii in sinks) {
                sink = sinks[ii];
                let startcomponent = source.component;
                let endcomponent = sink.component;
                start = startcomponent.getCenterPosition();
                end = endcomponent.getCenterPosition();
                // console.log(start, end);
                render = RatsNestRenderer2D.renderRatsNestConnection(start, end);
                ratsnestgroup.addChild(render);
            }
        }

        return ratsnestgroup;
    }

    static renderRatsNestConnection(start, end) {
        let vstart = new paper.Point(start[0], start[1]);
        let vend = new paper.Point(end[0], end[1]);

        let vpath = new paper.Path(vstart, vend);

        vpath.strokeColor = "#696965";
        vpath.strokeWidth = 500;
        vpath.strokeCap = "round";

        vpath.dashArray = [1000, 1300];
        return vpath;
    }
}
