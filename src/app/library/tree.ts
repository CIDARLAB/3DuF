import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import Layer from "../core/layer";

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
            componentSpacing: "μm",
            flowChannelWidth: "μm",
            rotation: "°",
            spacing: "μm",
            in: "",
            out: "",
            width: "μm",
            height: "μm",
            stageLength: "μm"
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
            out: "out",
            stageLength: "stageLength"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            flowChannelWidth: "flowChannelWidth",
            rotation: "rotation",
            spacing: "spacing",
            width: "width",
            in: "in",
            out: "out",
            stageLength: "stageLength"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "TREE";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const ports = [];
        const cw = params.flowChannelWidth;
        const spacing = params.spacing;
        const ins = params.in;
        const outs = params.out;
        let leafs;
        if (ins < outs) {
            leafs = outs;
        } else {
            leafs = ins;
        }
        const stagelength = params.stageLength;

        const levels = Math.ceil(Math.log2(leafs));
        const w = spacing * (leafs / 2 + 1);

        const length = levels * (cw + stagelength) + stagelength;
        const width = 2 * 0.5 * w * 2 * Math.pow(0.5, levels);

        ports.push(new ComponentPort(0, 0, "1", ("FLOW" as unknown) as Layer));

        for (let i = 0; i < leafs; i++) {
            ports.push(new ComponentPort(((leafs - 1) * width) / 2 - i * width, length, (2 + i).toString(), ("FLOW" as unknown) as Layer));
        }

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const position = params.position;
        const cw = params.flowChannelWidth;
        const rotation = params.rotation;
        const spacing = params.spacing;
        const ins = params.in;
        const outs = params.out;
        let leafs;
        if (ins < outs) {
            leafs = outs;
        } else {
            leafs = ins;
        }
        const color = params.color;
        const stagelength = params.stageLength;
        const px = position[0];
        const py = position[1];

        const levels = Math.ceil(Math.log2(leafs));
        let isodd = false; // This is used to figure out how many lines have to be made
        if (leafs % 2 === 0) {
            isodd = false;
        } else {
            isodd = true;
        }
        const w = spacing * (leafs / 2 + 1);
        const l = (levels + 1) * stagelength;

        // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

        const treepath = new paper.CompoundPath();

        this.__generateTwig(treepath, px, py, cw, stagelength, w, 1, levels);

        // Draw the tree

        treepath.fillColor = color;
        return (treepath.rotate(rotation, new paper.Point(px, py)) as unknown) as paper.CompoundPath;
    }

    __generateTwig(treepath: paper.CompoundPath, px: number, py: number, cw: number, stagelength: number, newspacing: number, level: number, maxlevel: number, islast = false) {
        // var newspacing = 2 * (spacing + cw);
        const hspacing = newspacing / 2;
        const lex = px - 0.5 * newspacing;
        const ley = py + cw + stagelength;
        const rex = px + 0.5 * newspacing;
        const rey = py + cw + stagelength;

        if (level === maxlevel) {
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

    __drawtwig(treepath: paper.CompoundPath, px: number, py: number, cw: number, stagelength: number, spacing: number, drawleafs = false) {
        // stem
        let startPoint = new paper.Point(px - cw / 2, py);
        let endPoint = new paper.Point(px + cw / 2, py + stagelength);
        let rec = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });

        treepath.addChild(rec);

        // Draw 2 leafs
        // left leaf
        const lstartx = px - 0.5 * (cw + spacing);
        const lendx = lstartx + cw;
        const lstarty = py + stagelength + cw;
        const lendy = lstarty + stagelength;

        // //right leaf
        const rstartx = px + 0.5 * (spacing - cw);
        const rendx = rstartx + cw;
        const rstarty = py + stagelength + cw;
        const rendy = rstarty + stagelength;

        if (drawleafs) {
            startPoint = new paper.Point(lstartx, lstarty);
            endPoint = new paper.Point(lendx, lendy);
            rec = new paper.Path.Rectangle({
                from: startPoint,
                to: endPoint,
                radius: 0,
                strokeWidth: 0
            });
            treepath.addChild(rec);

            startPoint = new paper.Point(rstartx, rstarty);
            endPoint = new paper.Point(rendx, rendy);
            rec = new paper.Path.Rectangle({
                from: startPoint,
                to: endPoint,
                radius: 0,
                strokeWidth: 0
            });
            treepath.addChild(rec);
        }

        // Horizontal bar
        const hstartx = px - 0.5 * (cw + spacing);
        const hendx = rendx;
        const hstarty = py + stagelength;
        const hendy = hstarty + cw;
        startPoint = new paper.Point(hstartx, hstarty);
        endPoint = new paper.Point(hendx, hendy);
        rec = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);
        return treepath;
    }

    render2DTarget(key: string, params: { [k: string]: any }) {
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
