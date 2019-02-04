import Template from "./template";
import paper from "paper";

export  default class Mux extends Template{
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
            "length": "Float",
            "height": "Float",
            "direction": "String",
            "stageLength":"Float",
            "controlChannelWidth": "Float"
        };

        this.__defaults = {
            "flowChannelWidth": .80 * 1000,
            "orientation": "V",
            "spacing": 4 * 1000,
            "leafs": 8,
            "width": 1.6 * 1000,
            "length": 1.6 * 1000,
            "height": 250,
            "direction": "IN",
            "stageLength": 4000,
            "controlChannelWidth": .40 * 1000
        };


        this.__units = {
            "flowChannelWidth": "&mu;m",
            "orientation": "",
            "spacing": "&mu;m",
            "leafs": "",
            "width": "&mu;m",
            "length": "&mu;m",
            "height": "&mu;m",
            "direction": "",
            "stageLength":"&mu;m",
            "controlChannelWidth": "&mu;m"
        };

        this.__minimum = {
            "flowChannelWidth": 10,
            "spacing": 30,
            "leafs": 2,
            "width": 60,
            "length": 60,
            "height": 10,
            "stageLength": 100,
            "controlChannelWidth": 10
        };

        this.__maximum = {
            "flowChannelWidth": 2000,
            "spacing": 12000,
            "leafs": 2,
            "width": 12 * 1000,
            "length": 12 * 1000,
            "height": 1200,
            "stageLength": 6000,
            "controlChannelWidth": 2000
        };

        this.__featureParams = {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            length: "length",
            leafs: "leafs",
            stageLength: "stageLength",
            direction : "direction"
        };

        this.__targetParams = {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            orientation: "orientation",
            spacing: "spacing",
            width: "width",
            length: "length",
            leafs: "leafs",
            stageLength: "stageLength",
            direction : "direction"

        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "MUX";

    }


    __drawFlow(params){
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

        this.__generateMuxTwig(treepath, px, py, cw, stagelength, w, 1, levels);


        //Draw the tree

        treepath.fillColor = color;
        let rotation = 0;
        if (orientation == "H" && direction == "OUT") {
            rotation = 180;
        } else if (orientation == "V" && direction == "IN") {
            rotation = 270;
        } else if (orientation == "V" && direction == "OUT") {
            rotation = 90;
        }
        return treepath.rotate(rotation, px, py);
    }

    __drawControl(params){
        let position = params["position"];
        let cw = params["flowChannelWidth"];
        let ctlcw = params["controlChannelWidth"];
        let orientation = params["orientation"];
        let direction = params["direction"];
        let spacing = params["spacing"];
        let leafs = params["leafs"];
        let color = params["color"];
        let stagelength = params["stageLength"];
        let valvelength = params["length"];
        let valvewidth = params["width"];
        let px = position[0];
        let py = position[1];

        let treeWidth = (leafs - 1) * spacing + leafs * cw + valvewidth;
        let leftEdge = px - treeWidth / 2;
        let rightEdge = px + treeWidth / 2;

        let levels = Math.ceil(Math.log2(leafs));

        let isodd = !(leafs % 2);
        let w = spacing * (leafs / 2 + 1);
        let l = (levels + 1) * stagelength;

        // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

        var treepath = new paper.CompoundPath();

        this.__generateMuxControlTwig(treepath, px, py, cw, ctlcw, stagelength, w, 1, levels, valvewidth, valvelength, leftEdge, rightEdge);


        //Draw the tree

        treepath.fillColor = color;
        var rotation = 0;
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

    render2D(params, key) {
        if(key == "FLOW"){
            return this.__drawFlow(params);
        } else if (key == "CONTROL"){
            return this.__drawControl(params);
        }
    }

    render2DTarget(key, params){
        let render = this.render2D(params, "FLOW");
        render.fillColor.alpha = 0.5;
        return render;
    }

    __generateMuxTwig(treepath, px, py,cw, stagelength , newspacing, level, maxlevel, islast=false) {
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

        this.__drawmuxtwig(treepath, px, py, cw, stagelength, newspacing, islast);

        if(!islast){
            this.__generateMuxTwig(treepath, lex, ley, cw, stagelength, hspacing, level+1, maxlevel);
            this.__generateMuxTwig(treepath, rex, rey, cw, stagelength, hspacing, level+1, maxlevel);
        }
    }

    __drawmuxtwig(treepath, px, py, cw, stagelength, spacing, drawleafs=false) {
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

    __generateMuxControlTwig(treepath, px, py,cw, ctlcw, stagelength , newspacing, level, maxlevel, valvewidth, valvelength,
                             leftEdge, rightEdge, islast=false,) {
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

        this.__drawmuxcontroltwig(treepath, px, py, cw, ctlcw, stagelength, newspacing, valvewidth, valvelength, leftEdge, rightEdge, islast);

        if(!islast){
            this.__generateMuxControlTwig(treepath, lex, ley, cw, ctlcw, stagelength, hspacing, level+1, maxlevel, valvewidth, valvelength, leftEdge, rightEdge);
            this.__generateMuxControlTwig(treepath, rex, rey, cw, ctlcw, stagelength, hspacing, level+1, maxlevel, valvewidth, valvelength, leftEdge, rightEdge);
        }
    }


    __drawmuxcontroltwig(treepath, px, py, cw, ctlcw, stagelength, spacing, valvewidth, valvelength, leftEdge, rightEdge, drawleafs=false) {
        //stem - don't bother with valves

        //Draw 2 valves
        //left leaf
        let lstartx = px - 0.5 * (cw + spacing);
        let lendx = lstartx + cw;
        let lstarty = py + stagelength + cw;
        let lendy = lstarty + stagelength;

        let lcenterx = (lstartx + lendx)/2;
        let lcentery = lstarty + Math.abs(lstarty - lendy)/4;

        // //right leaf
        let rstartx = px + 0.5 * (spacing - cw);
        let rendx = rstartx + cw;
        let rstarty = py + stagelength + cw;
        let rendy = rstarty + stagelength;

        let rcenterx = (rstartx + rendx)/2;
        let rcentery = rstarty + Math.abs(rstarty - rendy)*3/4;


        let startPoint = new paper.Point(lcenterx - valvewidth/2 , lcentery - valvelength/2);
        let endPoint = new paper.Point(lcenterx + valvewidth/2 , lcentery + valvewidth/2);
        let rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);

        let leftChannelStart = new paper.Point(startPoint.x, lcentery - ctlcw/2);
        let leftChannelEnd = new paper.Point(leftEdge, lcentery + ctlcw/2);

        let leftChannel = paper.Path.Rectangle({
            from: leftChannelStart,
            to: leftChannelEnd,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(leftChannel);

        startPoint = new paper.Point(rcenterx - valvewidth/2 , rcentery - valvelength/2);
        endPoint = new paper.Point(rcenterx + valvewidth/2 , rcentery + valvewidth/2);
        rec = paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });

        treepath.addChild(rec);
        let rightChannelStart = new paper.Point(endPoint.x, rcentery - ctlcw/2);
        let rightChannelEnd = new paper.Point(rightEdge, rcentery + ctlcw/2);

        let rightChannel = paper.Path.Rectangle({
            from: rightChannelStart,
            to: rightChannelEnd,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rightChannel);

        return treepath
    };
}