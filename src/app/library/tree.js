import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Tree extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            flowChannelWidth: "Float",
            rotation: "Float",
            spacing: "Float",
            in: "Integer",
            out: "Integer",
            width: "Float",
            height: "Float",
            stageLength: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            flowChannelWidth: 0.8 * 1000,
            rotation: 0,
            spacing: 4 * 1000,
            in: 1,
            out: 8,
            width: 2.46 * 1000,
            height: 250,
            stageLength: 4000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            flowChannelWidth: "&mu;m",
            rotation: "&deg;",
            spacing: "&mu;m",
            in: "",
            out: "",
            width: "&mu;m",
            height: "&mu;m",
            stageLength: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            flowChannelWidth: 10,
            spacing: 30,
            in: 1,
            out: 2,
            width: 60,
            height: 10,
            stageLength: 100,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            flowChannelWidth: 2000,
            spacing: 12000,
            in: 1,
            out: 128,
            width: 12 * 1000,
            height: 1200,
            stageLength: 6000,
            rotation: 360
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            rotation: "rotation",
            spacing: "spacing",
            width: "width",
            in: "in",
            out:"out",
            stageLength: "stageLength",
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            flowChannelWidth: "flowChannelWidth",
            rotation: "rotation",
            spacing: "spacing",
            width: "width",
            in: "in",
            out: "out",
            stageLength: "stageLength",
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TREE";
    }

    getPorts(params) {
        
        let ports = [];
        let cw = params["flowChannelWidth"];
        let spacing = params["spacing"];
        let ins = params["in"];
        let outs = params["out"];
        let leafs 
        if( ins < outs){
            leafs = outs;
        }else{
            leafs = ins;
        }
        let stagelength = params["stageLength"];

        let levels = Math.ceil(Math.log2(leafs));
        let w = spacing * (leafs / 2 + 1);

        let length = levels * (cw + stagelength) + stagelength;
        let width = 2 * 0.5 * w * 2 * Math.pow(0.5, levels); 


        ports.push(new ComponentPort(0, 0, "1", "FLOW"));        

        for (let i = 0; i < leafs; i++){
            ports.push(new ComponentPort((leafs - 1) * width/2 - i * width, length, (2 + i).toString(), "FLOW"));
        }

        return ports;
    }

    render2D(params, key) {
        let position = params["position"];
        let cw = params["flowChannelWidth"];
        let rotation = params["rotation"];
        let spacing = params["spacing"];
        let ins = params["in"];
        let outs = params["out"];
        let leafs 
        if( ins < outs){
            leafs = outs;
        }else{
            leafs = ins;
        }
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
        return treepath.rotate(rotation, px, py);
    }

    __generateTwig(treepath, px, py, cw, stagelength, newspacing, level, maxlevel, islast = false) {
        //var newspacing = 2 * (spacing + cw);
        let hspacing = newspacing / 2;
        let lex = px - 0.5 * newspacing;
        let ley = py + cw + stagelength;
        let rex = px + 0.5 * newspacing;
        let rey = py + cw + stagelength;

        if (level == maxlevel) {
            islast = true;
            // console.log("Final Spacing: " + newspacing)
        }

        this.__drawtwig(treepath, px, py, cw, stagelength, newspacing, islast);
        // drawtwig(treepath, lex, ley, cw, stagelength, hspacing, islast);
        // drawtwig(treepath, rex, rey, cw, stagelength, hspacing, islast);

        if (!islast) {
            this.__generateTwig(treepath, lex, ley, cw, stagelength, hspacing, level + 1, maxlevel);
            this.__generateTwig(treepath, rex, rey, cw, stagelength, hspacing, level + 1, maxlevel);
        }
    }

    __drawtwig(treepath, px, py, cw, stagelength, spacing, drawleafs = false) {
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

        if (drawleafs) {
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
        return treepath;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
