import Template from "./template";
import paper from "paper";

export default class YTree extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            flowChannelWidth: "Float",
            rotation: "Float",
            spacing: "Float",
            leafs: "Float",
            width: "Float",
            height: "Float",
            direction: "String",
            stageLength: "Float"
        };

        this.__defaults = {
            flowChannelWidth: 0.8 * 1000,
            rotation: 0,
            spacing: 4 * 1000,
            leafs: 8,
            width: 2.46 * 1000,
            height: 250,
            direction: "IN",
            stageLength: 4000
        };

        this.__units = {
            flowChannelWidth: "&mu;m",
            orientation: "",
            spacing: "&mu;m",
            leafs: "",
            width: "&mu;m",
            height: "&mu;m",
            direction: "",
            stageLength: "&mu;m"
        };

        this.__minimum = {
            flowChannelWidth: 10,
            spacing: 30,
            leafs: 2,
            width: 60,
            height: 10,
            stageLength: 100,
            rotation: 0
        };

        this.__maximum = {
            flowChannelWidth: 2000,
            spacing: 12000,
            leafs: 2,
            width: 12 * 1000,
            height: 1200,
            stageLength: 6000,
            rotation: 360
        };

        this.__featureParams = {
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            rotation: "rotation",
            spacing: "spacing",
            width: "width",
            leafs: "leafs",
            stageLength: "stageLength",
            direction: "direction"
        };

        this.__targetParams = {
            flowChannelWidth: "flowChannelWidth",
            rotation: "rotation",
            spacing: "spacing",
            width: "width",
            leafs: "leafs",
            stageLength: "stageLength",
            direction: "direction"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "YTREE";
    }

    render2D(params, key) {
        let position = params["position"];
        let cw = params["flowChannelWidth"];
        let rotation = params["rotation"];
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

        var treepath = new paper.CompoundPath();

        this.__generateYTwig(treepath, px, py, cw, stagelength, w, 1, levels);

        //Draw the tree

        treepath.fillColor = color;
        return treepath.rotate(rotation, px, py);
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }

    __generateYTwig(treepath, px, py, cw, stagelength, newspacing, level, maxlevel, islast = false) {
        let hspacing = newspacing / 2;
        let lex = px - 0.5 * newspacing;
        let ley = py + stagelength;
        let rex = px + 0.5 * newspacing;
        let rey = py + stagelength;

        if (level == maxlevel) {
            islast = true;
        }

        this.__drawYtwig(treepath, px, py, cw, stagelength, newspacing, islast);

        if (!islast) {
            this.__generateYTwig(treepath, lex, ley, cw, stagelength, hspacing, level + 1, maxlevel);
            this.__generateYTwig(treepath, rex, rey, cw, stagelength, hspacing, level + 1, maxlevel);
        }
    }

    __drawYtwig(treepath, px, py, cw, stagelength, spacing, drawleafs = false) {
        let pivotpoint = new paper.Point(px, py);

        //stem
        let startPoint = new paper.Point(px - cw / 2, py - cw / 2);

        let angle = Math.atan(spacing / 2 / stagelength);

        let h = spacing / 2 / Math.sin(angle) + cw;

        //left leaf
        let rec = paper.Path.Rectangle({
            size: [cw, h],
            point: startPoint,
            radius: cw / 2,
            stokeWidth: 0
        });
        rec.rotate((angle * 180) / Math.PI, pivotpoint);
        treepath.addChild(rec);

        //right leaf
        rec = paper.Path.Rectangle({
            size: [cw, h],
            point: startPoint,
            radius: cw / 2,
            stokeWidth: 0
        });
        rec.rotate((-angle * 180) / Math.PI, pivotpoint);
        treepath.addChild(rec);

        return treepath;
    }
}
