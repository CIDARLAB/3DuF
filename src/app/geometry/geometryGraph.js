import GeometryEdge from "./geometryEdge";
import graphlib from '@dagrejs/graphlib';
import paper from 'paper';

export default class GeometryGraph{
    constructor(){
        //TODO: Do all the initializations here
        this.__nodes = new Map();
        this.__nodecount = 0;
        this.__edgecount = 0;
        this.__edgeData = new Map();

        this.__networkGraph = new graphlib.Graph({directed:false});

    }

    addEdge(start, end, data){
        let startnode = this.findNode(start);
        let endnode = this.findNode(end);

        let edgeobject = new GeometryEdge(startnode, endnode, data.type, String(this.__edgecount++), data);

        this.__edgeData.set(edgeobject.id, edgeobject);

        this.__networkGraph.setEdge(startnode, endnode, edgeobject.id);

    }

    findNode(node) {
        for(let key of this.__nodes.keys()){
            let nodetocheck = this.__nodes.get(key);

            if(node.x == nodetocheck.x && node.y==nodetocheck.y){
                return key;
            }
        }

        //If it comes to this, then it means that the node does not exist
        let newkey = String(this.__nodecount++);
        this.__nodes.set( newkey , node);

        return newkey;
    }

    generateGeometry() {
        //TODO: Generate Geometry
        console.log("Cycles:", graphlib.alg.findCycles(this.__networkGraph));
        console.log("Edges:", this.__networkGraph.edges());

        let path = paper.CompoundPath();

        let graphcomponents = graphlib.alg.components(this.__networkGraph)
        console.log("Components:", graphcomponents);

        /*
        Step 1 - Iterate through each of the components
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
    }
}