import GeometryEdge from "./geometryEdge";
import graphlib from "@dagrejs/graphlib";
import paper from "paper";

export default class GeometryGraph {
    constructor() {
        //TODO: Do all the initializations here
        this.__nodes = new Map();
        this.__nodecount = 0;
        this.__edgecount = 0;
        this.__edgeData = new Map();

        this.__networkGraph = new graphlib.Graph({ directed: false });
    }

    addEdge(start, end, data) {
        let startnode = this.findNode(start);
        let endnode = this.findNode(end);

        let edgeobject = new GeometryEdge(startnode, endnode, data.type, String(this.__edgecount++), data);

        this.__edgeData.set(edgeobject.id, edgeobject);

        this.__networkGraph.setEdge(startnode, endnode, edgeobject.id);
    }

    findNode(node) {
        for (let key of this.__nodes.keys()) {
            let nodetocheck = this.__nodes.get(key);

            if (GeometryGraph.computeDistance(node, nodetocheck) < 0.000001) {
                return key;
            }
        }

        //If it comes to this, then it means that the node does not exist
        let newkey = String(this.__nodecount++);
        this.__nodes.set(newkey, node);

        return newkey;
    }

    generateGeometry() {
        // console.log("Cycles:", graphlib.alg.findCycles(this.__networkGraph));
        // console.log("Edges:", this.__networkGraph.edges());
        // console.log("Nodes:", this.__nodes);
        // console.log("Edge Data:", this.__edgeData);
        let path = new paper.CompoundPath();

        //graphlib.alg.findCycles(this.__networkGraph);
        let graphcomponents = graphlib.alg.components(this.__networkGraph);
        // console.log("Components:", graphcomponents);

        /*
        Step 1 - Iterate through each of the components (disconnected components)
        Step 2 - Draw outline for each of the components
         */

        for (let component of graphcomponents) {
            this.drawComponent(component, path);
        }

        return path;
    }

    drawComponent(component, path) {
        /*
        Step 1 - Take the starting node
        Step 2 - start traversing through the component and start making a path with segments
         */

        // console.log("Graph component",component);

        //Get the first item in the component

        // let startnode = this.__nodes.get(component[0]);
        // console.log("startnode", startnode);

        let segments = [];
        let startnode = this.__nodes.get(component[0]);
        let endnode = null;
        // console.log("test ?");
        //Get traversal
        let traversal = graphlib.alg.preorder(this.__networkGraph, component[0]);

        let childpath = new paper.Path();

        for (let i = 0; i < traversal.length; i++) {
            let noderef = traversal[i];
            let node = this.__nodes.get(noderef);
            let nextnoderef;
            if (i + 1 === traversal.length) {
                //Last Node
                nextnoderef = traversal[0];
            } else {
                //All other nodes
                nextnoderef = traversal[i + 1];
            }

            //Get the edge
            let edge = this.__getEdge(noderef, nextnoderef);

            // console.log("Edge:", edge);
            // console.log("Edge Type:", edge.type);
            switch (edge.type) {
            case "LINE":
                childpath.add(new paper.Point(node.x, node.y));
                break;
            case "ARC":
                childpath.add(new paper.Point(node.x, node.y));
                let nextnode = this.__nodes.get(nextnoderef);
                let endpoint = new paper.Point(nextnode.x, nextnode.y);
                let midpoint = this.getARCMidpoint(edge.dxfData);
                childpath.arcTo(midpoint, endpoint);
                break;
            }
        }

        path.addChild(childpath);

        // //Generate Lines for everything
        // for(let i = 0; i< traversal.length; i++ ){
        //     let node = this.__nodes.get(traversal[i]);
        //
        //     console.log("Line:", "Start", startnode, "End" , endnode);
        //     //TODO: Draw curve for curves
        //     let line = new paper.Path.Line(new paper.Point(startnode.x, endnode.y), new paper.Point(endnode.x, endnode.y));
        //     childpath.add(line);
        // }
        //
        // startnode = endnode;
        // endnode = this.__nodes.get(component[0]);
        // console.log("Line:", "Start", startnode, "End" , endnode);
        //
        // //Last segment to close everything off
        // childpath.add(new paper.Path.Line(
        //     // new paper.Point(startnode.x, endnode.y),
        //     new paper.Point(endnode.x, endnode.y))
        // );
        //
        // console.log(path);

        //Now join all the segments
        // let joinedpath = null;
        // for(let i = 0; i < segments.length; i++){
        //     if(joinedpath == null){
        //         joinedpath = segments[i];
        //     }
        //     joinedpath.join(segments[i]);
        // }

        // console.log("Joined Path", joinedpath);
        // console.log("Segments:", segments);

        // path.addChild(joinedpath);
    }

    getARCMidpoint(dxfData) {
        // console.log("DXF:",dxfData);
        let center = new paper.Point(dxfData.center.x, dxfData.center.y);
        let radius = dxfData.radius;
        let startAngle = dxfData.startAngle;
        let endAngle = dxfData.endAngle; //* 180/Math.PI;
        let midAngle = (startAngle + endAngle) / 2;

        let midpoint = new paper.Point(center.x + radius * Math.cos(midAngle), center.y + radius * Math.sin(midAngle));

        return midpoint;
    }

    __getEdge(source, target) {
        let edgeref = this.__networkGraph.edge(source, target);
        return this.__edgeData.get(edgeref);
    }

    static computeDistance(node, nodetocheck) {
        let sqdist = Math.pow(node.x - nodetocheck.x, 2) + Math.pow(node.y - nodetocheck.y, 2);
        //TODO: check if there is a z component
        return Math.sqrt(sqdist);
    }
}
