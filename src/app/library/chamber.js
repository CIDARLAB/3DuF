import Template from "./template";
import paper from "paper";

export  default class Chamber extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "width": "Float",
            "length": "Float",
            "height": "Float",
            "cornerRadius": "Float",
            "rotation": "Float"
        };

        this.__defaults = {
            "width": 5000,
            "length": 5000,
            "height": 250,
            "cornerRadius": 200,
            "rotation": 0
        };


        this.__units = {
            "width": "&mu;m",
            "length": "&mu;m",
            "height": "&mu;m",
            "cornerRadius": "&mu;m",
            "rotation": "&deg;"
        };

        this.__minimum = {
            "width": 5,
            "length": 5,
            "height": 1,
            "cornerRadius": 1,
            "rotation": 0
        };

        this.__maximum = {
            "width": 50000,
            "length": 50000,
            "height": 50000,
            "cornerRadius": 1000,
            "rotation": 90
        };

        this.__featureParams = {
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            cornerRadius: "cornerRadius",
            rotation: "rotation"
        };

        this.__targetParams = {
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            cornerRadius: "cornerRadius",
            rotation: "rotation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "REACTION CHAMBER";

    }

    render2D(params, key) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        let radius = params["cornerRadius"];

        let rendered = new paper.CompoundPath();

        let rec = new paper.Path.Rectangle({
            point: new paper.Point(px - w / 2, py - l / 2),
            size: [w, l],
            radius: radius
        });

        rendered.addChild(rec);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
    }

    render2DTarget(key, params){
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}