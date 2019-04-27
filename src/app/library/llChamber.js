import Template from "./template";
import paper from "paper";

export  default class LLChamber extends Template{
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
            "rotation": "Float",
            "spacing": "Float",
            "numberOfChambers": "Integer"
        };

        this.__defaults = {
            "width": 800,
            "length": 5000,
            "height": 250,
            "spacing": 10000,
            "numberOfChambers": 10,
            "rotation": 0
        };


        this.__units = {
            "width": "&mu;m",
            "length": "&mu;m",
            "height": "&mu;m",
            "spacing": "&mu;m",
            "numberOfChambers": "10",
            "rotation": "&deg;"
        };

        this.__minimum = {
            "width": 5,
            "length": 5,
            "height": 1,
            "spacing": 1,
            "numberOfChambers": 1,
            "rotation": 0
        };

        this.__maximum = {
            "width": 50000,
            "length": 50000,
            "height": 50000,
            "numberOfChambers": 1000,
            "spacing": 50000,
            "rotation": 90
        };

        this.__featureParams = {
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            numberOfChambers: "numberOfChambers",
            spacing : "spacing",
            rotation: "rotation"
        };

        this.__targetParams = {
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            numberOfChambers: "numberOfChambers",
            spacing : "spacing",
            rotation: "rotation"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "LL CHAMBER";

    }

    render2D(params, key) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        // let radius = params["cornerRadius"];

        let numArray = params["numberOfChambers"];
        let spacing = params["spacing"];


        let rendered = new paper.CompoundPath();

        let rec;

        for(let i = 0; i < numArray; i++){
            rec = new paper.Path.Rectangle({
                point: new paper.Point(px  + (i+1)*spacing + i*w, py-1),
                size: [w, l +2],
                radius: 0
            });

            rendered.addChild(rec);

        }

        let topchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py - w),
            size:[ (numArray )*(w)  + (numArray+1) * spacing, w],
        });

        rendered.addChild(topchannel);

        let bottomchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + l),
            size:[ (numArray )*(w)  + (numArray+1) * spacing, w],
        });

        rendered.addChild(bottomchannel);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
    }

    render2DTarget(key, params){
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}