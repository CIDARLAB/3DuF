import Template from "./template"; 
import paper from "paper"; 

export default class Dilution extends Template{
    constructor() {
        super(); 
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        }; 

        this.__heritable = {
            componentSpacing: "Float" ,
            channelWidth: "Float",
            length: "Float" ,
            width: "Float" ,
            height:  "Float"
        }

        this.__defaults = {
            // see if any additional values need to be added 
            componentSpacing: 1000, 
            channelWidth: 0.8*1000, 
            length: 4.92 * 1000, 
            width: 1.23 * 1000, 
            height: 250
        }

        this.__units = {
            componentSpacing: "&mu;m", 
            channelWidth: "&mu;m",
            length: "&mu;m",
            width: "&mu;m",
            height: "&mu;m"

        }

        this.__minimum = {
            componentSpacing: 0,
            channelWidth: 10,
            width: 30,
            length: 120,
            height: 10

        }

        this.__maximum = {
            componentSpacing: 10000,
            channelWidth: 2000,
            width: 6000,
            length: 24 * 1000,
            height: 1200

        }

        this.__placementTool = "componentPositionTool"

        this.__toolParams = {
            position: "position" 
        }

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            channelWidth: "channelWidth",
            length: "length",
            width: "width"
        }

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            channelWidth: "channelWidth",
            length: "length",
            width: "width",
            
        }

        this.__renderKeys = ["FLOW"]; 

        this.__mind = "DILUTION"; 
    }

    getPorts(params) {
        let length = params["length"]
        let ports = []; 
        // idk what needs to be pushed ?? aka size of component ports 
        ports.push(new ComponentPort(0, - length/2, "1", "FLOW"));
        ports.push(new ComponentPort(0, length/2, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        // drawing, user paper library 
        let position = params["position"]; 
        let px = position[0]; 
        let py = position[1]; 
        let color = params["color"]; 
        let cw = params["channelWidth"]; 
        let l = params["length"]; 
        let w = params["width"]; 
        let p0, p1, p2, p3, p4, p5; 

        // create points to add to 2D render 
        p0 = [px - cw / 2, py - l / 2];
        p1 = [px + cw / 2, py - l / 2];
        p2 = [px + w + cw / 2, py];
        p3 = [px + cw / 2, py + l / 2];
        p4 = [px - cw / 2, py + l / 2];
        p5 = [px - cw / 2 - w, py];

        let hex = new paper.Path(); 
        hex.add(new paper.Point(p0)); 
        hex.add(new paper.Point(p1)); 
        hex.add (new paper.Point(p2)); 
        hex.add (new paper.Point(p3)); 
        hex.add (new paper.Point(p4)); 
        hex.add (new paper.Point(p5)); 
        
        hex.closed = true; 
        hex.fillColor = color; 

        return hex; 
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key); 
        render.fillColor.alpha = 0.5; 
        return render; 
    }

}