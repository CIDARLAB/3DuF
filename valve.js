import Template from "./template";
import paper from "paper";

export  default class Valve extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "rotation": "Float",
            "length": "Float",
            "width": "Float",
            "height": "Float"
        };

        this.__defaults = {
            "rotation": 0,
            "width": 1.23 * 1000,
            "length": 4.92 * 1000,
            "height": 250
        };


        this.__units = {
            "rotation": "&deg",
            "length": "&mu;m",
            "width": "&mu;m",
            "height": "&mu;m"
        };

        this.__minimum = {
            "rotation": 0,
            "width": 30,
            "length": 120,
            "height": 10
        };

        this.__maximum = {
            "rotation": 180,
            "width": 6000,
            "length": 24 * 1000,
            "height": 1200
        };

        this.__featureParams = {
            position: "position",
            length: "length",
            width: "width",
            rotation: "rotation"

        };

        this.__targetParams = {
            length: "length",
            width: "width",
            rotation: "rotation"

        };

        this.__placementTool = "ValveInsertionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "VALVE";
    }

    render2D(params, key) {
        let orientation = params["orientation"];
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let color = params["color"];
        let rotation = params["rotation"];
        let startX = px - w / 2;
        let startY = py - l / 2;
        let endX = px + w / 2;
        let endY = py + l / 2;
        let startPoint = new paper.Point(startX, startY);
        let endPoint = new paper.Point(endX, endY);
        let rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            fillColor: color,
            strokeWidth: 0
        });

        // if(orientation == "V"){
        //     rotation = 90;
        // }

        return rec.rotate(rotation, px, py);
    }

    render2DTarget(key, params){
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}