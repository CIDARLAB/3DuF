import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Mux extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            flowChannelWidth: "Float",
            rotation: "Float",
            leafPitch: "Float",
            in: "Integer",
            out: "Integer",
            valveWidth: "Float",
            length: "Float",
            height: "Float",
            stageLength: "Float",
            controlChannelWidth: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            flowChannelWidth: 0.8 * 1000,
            rotation: 0,
            leafPitch: 4000,
            in: 1,
            out: 8,
            valveWidth: 1800,
            length: 500,
            height: 250,
            stageLength: 4000,
            controlChannelWidth: 0.4 * 1000,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            flowChannelWidth: "μm",
            rotation: "°",
            leafPitch: "μm",
            in: "",
            out: "",
            valveWidth: "μm",
            length: "μm",
            height: "μm",
            stageLength: "μm",
            controlChannelWidth: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            flowChannelWidth: 10,
            leafPitch: 100,
            in: 1,
            out: 2,
            valveWidth: 60,
            length: 60,
            height: 10,
            stageLength: 100,
            controlChannelWidth: 10,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            flowChannelWidth: 2000,
            leafPitch: 20000,
            in: 1,
            out: 1024,
            valveWidth: 12 * 1000,
            length: 12 * 1000,
            height: 1200,
            stageLength: 6000,
            controlChannelWidth: 2000,
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            rotation: "rotation",
            leafPitch: "leafPitch",
            valveWidth: "valveWidth",
            length: "length",
            in: "in",
            out: "out",
            stageLength: "stageLength",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            rotation: "rotation",
            leafPitch: "leafPitch",
            valveWidth: "valveWidth",
            length: "length",
            in: "in",
            out: "out",
            stageLength: "stageLength",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "MUX";

        this.__zOffsetKeys = {
            FLOW: "height",
            CONTROL: "height"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CONTROL: "+1"
        };
    }

    __drawFlow(params: { [k: string]: any }): paper.CompoundPath  {
        const position = params.position;
        const cw = params.flowChannelWidth;
        let rotation = params.rotation;
        const ins = params.in;
        const outs = params.out;
        let leafs;
        if (ins < outs) {
            leafs = outs;
        } else {
            leafs = ins;
            rotation += 180;
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
        const w = this.__muxFanWidth(params, leafs, levels);
        const l = (levels + 1) * stagelength;

        // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

        const treepath = new paper.CompoundPath("");

        this.__generateMuxTwig(treepath, px, py, cw, stagelength, w, 1, levels);

        // Draw the tree

        treepath.fillColor = color;
        return (treepath.rotate(rotation, new paper.Point(px, py)) as unknown) as paper.CompoundPath;
    }

    __drawControl(params: { [k: string]: any }): paper.CompoundPath  {
        const position = params.position;
        const cw = params.flowChannelWidth;
        const ctlcw = params.controlChannelWidth;
        let rotation = params.rotation;
        const ins = params.in;
        const outs = params.out;
        let leafs;
        if (ins < outs) {
            leafs = outs;
        } else {
            leafs = ins;
            rotation += 180;
        }
        const color = params.color;
        const stagelength = params.stageLength;
        const valvelength = params.length;
        const valvewidth = this.__muxValveWidth(params);
        const px = position[0];
        const py = position[1];

        const levels = Math.ceil(Math.log2(leafs));
        const w = this.__muxFanWidth(params, leafs, levels);
        const pitch = 2 * 0.5 * w * 2 * Math.pow(0.5, levels);
        const treeWidth = this.__muxTreeWidth(pitch, leafs, cw, valvewidth);
        const leftEdge = px - treeWidth / 2;
        const rightEdge = px + treeWidth / 2;

        const isodd = !(leafs % 2);
        const l = (levels + 1) * stagelength;

        // console.log("CW: " + cw +  " levels: "+ levels +  " width: " + w + " length: " + l)

        const treepath = new paper.CompoundPath("");

        this.__generateMuxControlTwig(treepath, px, py, cw, ctlcw, stagelength, w, 1, levels, valvewidth, valvelength, leftEdge, rightEdge);

        // Draw the tree

        treepath.fillColor = color;
        return (treepath.rotate(rotation, new paper.Point(px, py)) as unknown) as paper.CompoundPath;
    }

    getPorts(params: { [k: string]: any }) {
        const ports = [];
        const cw = params.flowChannelWidth;
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
        const w = this.__muxFanWidth(params, leafs, levels);

        const length = levels * (cw + stagelength) + stagelength;
        const width = 2 * 0.5 * w * 2 * Math.pow(0.5, levels);

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

        for (let i = 0; i < leafs; i++) {
            ports.push(new ComponentPort(((leafs - 1) * width) / 2 - i * width, length, (2 + i).toString(), LogicalLayerType.FLOW));
        }

        let count = 2 + leafs;
        const lstarty = stagelength + cw;
        const valveAlong = this.__muxValveAlong(stagelength, cw, params.length);
        const offsets = this.__muxValveCenterOffsets(stagelength, valveAlong);
        const lcentery = lstarty + offsets.left;
        const valvewidth = this.__muxValveWidth(params);
        const treeWidth = this.__muxTreeWidth(width, leafs, cw, valvewidth);

        const leftEdge = -treeWidth / 2;
        const rightEdge = treeWidth / 2;

        const rstarty = stagelength + cw;
        const rcentery = rstarty + offsets.right;

        for (let i = 0; i < Math.log2(leafs); i++) {
            ports.push(new ComponentPort(leftEdge, i * (cw + stagelength) + lcentery, count.toString(), LogicalLayerType.CONTROL));
            count++;
            ports.push(new ComponentPort(rightEdge, i * (cw + stagelength) + rcentery, count.toString(), LogicalLayerType.CONTROL));
            count++;
        }

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string): paper.CompoundPath  {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        }
        throw new Error("Unknown key: " + key);
    }

    render2DTarget(key: string | null, params: { [k: string]: any }): paper.CompoundPath  {
        const render = this.render2D(params, "FLOW");
        render?.addChild(this.render2D(params, "CONTROL") as paper.Item);
        render!.fillColor!.alpha = 0.5;
        return render;
    }

    __generateMuxTwig(treepath: paper.CompoundPath, px: number, py: number, cw: number, stagelength: number, newspacing: number, level: number, maxlevel: number, islast = false): void  {
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

        this.__drawmuxtwig(treepath, px, py, cw, stagelength, newspacing, islast);

        if (!islast) {
            this.__generateMuxTwig(treepath, lex, ley, cw, stagelength, hspacing, level + 1, maxlevel);
            this.__generateMuxTwig(treepath, rex, rey, cw, stagelength, hspacing, level + 1, maxlevel);
        }
    }

    __muxValveWidth(params: { [k: string]: any }): number {
        const named = Number(params.valveWidth);
        if (Number.isFinite(named) && named > 0) {
            return named;
        }
        const legacy = Number(params.width);
        if (Number.isFinite(legacy) && legacy > 0) {
            return legacy;
        }
        return 1800;
    }

    __muxFanWidth(params: { [k: string]: any }, leafs: number, levels: number): number {
        const leafPitch = Number(params.leafPitch || 0);
        if (leafPitch > 0) {
            return leafPitch * Math.pow(2, Math.max(levels - 1, 0));
        }
        const spacing = Number(params.spacing || 0);
        if (spacing > 0) {
            return spacing * (leafs / 2 + 1);
        }
        return 4000 * Math.pow(2, Math.max(levels - 1, 0));
    }

    __muxTreeWidth(pitch: number, leafs: number, cw: number, valvewidth: number): number {
        return (leafs - 1) * pitch + valvewidth + 2 * cw;
    }

    __muxValveAlong(stagelength: number, cw: number, valvelength: number): number {
        const cap = Math.max(Math.min(stagelength * 0.25, stagelength - 2 * Math.max(cw, 0)), Math.max(cw, 1));
        const wanted = valvelength > 0 ? valvelength : cap;
        return Math.min(wanted, cap);
    }

    __muxValveAcross(valvewidth: number, twigSpacing: number, cw: number): number {
        const wanted = valvewidth > 0 ? valvewidth : cw * 2.8;
        const cap = twigSpacing > 0 ? twigSpacing * 0.7 : wanted;
        return Math.min(wanted, Math.max(cw * 1.2, cap));
    }

    __muxValveCenterOffsets(stagelength: number, along: number): { left: number; right: number } {
        const slack = Math.max(stagelength - along, 0);
        const half = along / 2;
        return {
            left: half + slack * 0.4,
            right: half + slack * 0.6
        };
    }

    __drawmuxtwig(treepath: paper.CompoundPath, px: number, py: number, cw: number, stagelength: number, spacing: number, drawleafs = false): paper.CompoundPath  {
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

    __generateMuxControlTwig(
        treepath: paper.CompoundPath,
        px: number,
        py: number,
        cw: number,
        ctlcw: number,
        stagelength: number,
        newspacing: number,
        level: number,
        maxlevel: number,
        valvewidth: number,
        valvelength: number,
        leftEdge: number,
        rightEdge: number,
        islast = false
    ): void  {
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

        this.__drawmuxcontroltwig(treepath, px, py, cw, ctlcw, stagelength, newspacing, valvewidth, valvelength, leftEdge, rightEdge, islast);

        if (!islast) {
            this.__generateMuxControlTwig(treepath, lex, ley, cw, ctlcw, stagelength, hspacing, level + 1, maxlevel, valvewidth, valvelength, leftEdge, rightEdge);
            this.__generateMuxControlTwig(treepath, rex, rey, cw, ctlcw, stagelength, hspacing, level + 1, maxlevel, valvewidth, valvelength, leftEdge, rightEdge);
        }
    }

    __drawmuxcontroltwig(
        treepath: paper.CompoundPath,
        px: number,
        py: number,
        cw: number,
        ctlcw: number,
        stagelength: number,
        spacing: number,
        valvewidth: number,
        valvelength: number,
        leftEdge: number,
        rightEdge: number,
        drawleafs = false
    ): paper.CompoundPath  {
        // stem - don't bother with valves

        // Draw 2 valves
        // left leaf
        const lstartx = px - 0.5 * (cw + spacing);
        const lendx = lstartx + cw;
        const lstarty = py + stagelength + cw;
        const lendy = lstarty + stagelength;

        const lcenterx = (lstartx + lendx) / 2;
        const thick = this.__muxValveAlong(stagelength, cw, valvelength);
        const across = this.__muxValveAcross(valvewidth, spacing, cw);
        const offsets = this.__muxValveCenterOffsets(stagelength, thick);
        const lcentery = lstarty + offsets.left;

        // //right leaf
        const rstartx = px + 0.5 * (spacing - cw);
        const rendx = rstartx + cw;
        const rstarty = py + stagelength + cw;
        const rendy = rstarty + stagelength;

        const rcenterx = (rstartx + rendx) / 2;
        const rcentery = rstarty + offsets.right;

        let startPoint = new paper.Point(lcenterx - across / 2, lcentery - thick / 2);
        let endPoint = new paper.Point(lcenterx + across / 2, lcentery + thick / 2);
        let rec = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rec);

        const leftChannelStart = new paper.Point(startPoint.x, lcentery - ctlcw / 2);
        const leftChannelEnd = new paper.Point(leftEdge, lcentery + ctlcw / 2);

        const leftChannel = new paper.Path.Rectangle({
            from: leftChannelStart,
            to: leftChannelEnd,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(leftChannel);

        startPoint = new paper.Point(rcenterx - across / 2, rcentery - thick / 2);
        endPoint = new paper.Point(rcenterx + across / 2, rcentery + thick / 2);
        rec = new paper.Path.Rectangle({
            from: startPoint,
            to: endPoint,
            radius: 0,
            strokeWidth: 0
        });

        treepath.addChild(rec);
        const rightChannelStart = new paper.Point(endPoint.x, rcentery - ctlcw / 2);
        const rightChannelEnd = new paper.Point(rightEdge, rcentery + ctlcw / 2);

        const rightChannel = new paper.Path.Rectangle({
            from: rightChannelStart,
            to: rightChannelEnd,
            radius: 0,
            strokeWidth: 0
        });
        treepath.addChild(rightChannel);

        return treepath;
    }
}
