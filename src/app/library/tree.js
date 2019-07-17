import Template from "./template";
import paper from "paper";

export  default class Tree extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "flowChannelWidth": "Float",
            "orientation": "String",
            "spacing": "Float",
            "leafs": "Float",
            "width": "Float",
            "height": "Float",
            "direction": "String",
            "stageLength":"Float"
        };

        this.__defaults = {
            "flowChannelWidth": .80 * 1000,
            "orientation": "V",
            "spacing": 4 * 1000,
            "leafs": 8,
            "width": 2.46 * 1000,
            "height": 250,
            "direction": "IN",
            "stageLength": 4000
        };


        this.__units = {
            "flowChannelWidth": "&mu;m",
            "orientation": "",
            "spacing": "&mu;m",
            "leafs": "",
            "width": "&mu;m",
            "height": "&mu;m",
            "direction": "",
            "stageLength":"&mu;m"
        };

        this.__minimum = {
            "flowChannelWidth": 10,
            "spacing": 30,
            "leafs": 2,
            "width": 60,
            "height": 10,
            "stageLength": 100
        };

        this.__maximum = {
            "flowChannelWidth": 2000,
            "spacing": 12000,
            "leafs": 2,
            "width": 12 * 1000,
            "height": 1200,
            "stageLength": 6000
        };

        this.__featureParams = {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            leafs: "leafs",
            stageLength: "stageLength",
            direction : "direction"

        };

        this.__targetParams = {
            flowChannelWidth: "flowChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            leafs: "leafs",
            stageLength: "stageLength",
            direction:"direction"

        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TREE";
    }

    render2D(params, key) {
        let position = params["position"];
        let cw = params["flowChannelWidth"];
        let orientation = params["orientation"];
        let direction = params["direction"];
        let spacing = params["spacing"];
        let leafs = params["leafs"];
        let color = params["color"];
        let stagelength = params["stageLength"];
        let px = position[0];
        let py = position[1];

        let levels = Math.ceil(Math.log2(leafs));
        let isodd = false; //This is used to figure out how many lines have to be made
        if (leafs % 2 == 0) {
            isodd = false;
        } else {
            isodd = true;
        }
        let w = spacing * (leafs / 2 + 1);
        let l = (levels + 1) * stagelength;

        // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

        let treepath = new paper.CompoundPath();

        this.__generateTwig(treepath, px, py, cw, stagelength, w, 1, levels);


        //Draw the tree

        treepath.fillColor = color;
        let rotation = 0;
        // console.log("Orientation: " + orientation);
        // console.log("Direction: " + direction);
        if (orientation == "H" && direction == "OUT") {
            rotation = 180;
        } else if (orientation == "V" && direction == "IN") {
            rotation = 270;
        } else if (orientation == "V" && direction == "OUT") {
            rotation = 90;
        }
        return treepath.rotate(rotation, px, py);

    }

    __generateTwig(treepath, px, py,cw, stagelength , newspacing, level, maxlevel, islast=false) {
        //var newspacing = 2 * (spacing + cw);
        let hspacing = newspacing/2;
        let lex = px - 0.5 * newspacing;
        let ley = py + cw + stagelength;
        let rex = px + 0.5 * newspacing;
        let rey = py + cw + stagelength;

        if(level == maxlevel){
            islast = true;
            // console.log("Final Spacing: " + newspacing)
        }

        this.__drawtwig(treepath, px, py, cw, stagelength, newspacing, islast);
        // drawtwig(treepath, lex, ley, cw, stagelength, hspacing, islast);
        // drawtwig(treepath, rex, rey, cw, stagelength, hspacing, islast);


        if(!islast){
            this.__generateTwig(treepath, lex, ley, cw, stagelength, hspacing, level+1, maxlevel);
            this.__generateTwig(treepath, rex, rey, cw, stagelength, hspacing, level+1, maxlevel);
        }
    }

    __drawtwig(treepath, px, py, cw, stagelength, spacing, drawleafs=false) {
        //stem
        let startPoint = new paper.Point(px - cw / 2, py);
        let endPoint = new paper.Point(px + cw / 2, py + stagelength);
        let rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });

        treepath.addChild(rec);

        //Draw 2 leafs
        //left leaf
        let lstartx = px - 0.5 * (cw + spacing);
        let lendx = lstartx + cw;
        let lstarty = py + stagelength + cw;
        let lendy = lstarty + stagelength;

        // //right leaf
        let rstartx = px + 0.5 * (spacing - cw);
        let rendx = rstartx + cw;
        let rstarty = py + stagelength + cw;
        let rendy = rstarty + stagelength;

        if(drawleafs){
            startPoint = new paper.Point(lstartx, lstarty);
            endPoint = new paper.Point(lendx, lendy);
            rec = paper.Path.Rectangle({
                from: startPoint,
                to: endPoint,
                radius: 0,
                strokeWidth: 0
            });
            treepath.addChild(rec);

            startPoint = new paper.Point(rstartx, rstarty);
            endPoint = new paper.Point(rendx, rendy);
            rec = paper.Path.Rectangle({
                from: startPoint,
                to: endPoint,
                radius: 0,
                strokeWidth: 0
            });
            treepath.addChild(rec);

        }


        //Horizontal bar
        let hstartx = px - 0.5 * (cw + spacing);
        let hendx = rendx;
        let hstarty = py + stagelength;
        let hendy = hstarty + cw;
        startPoint = new paper.Point(hstartx, hstarty);
        endPoint = new paper.Point(hendx, hendy);
        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);
        return treepath
    }

    render2DTarget(key, params){
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}