import Template from "./template";
import paper, { CompoundPath } from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class ThreeDMux extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            in: "Integer",
            out: "Integer",
            flowChannelWidth: "Float",
            controlChannelWidth: "Float",
            leafSpace: "Float",
            outletLength: "Float",
            valveRadius: "Float",
            valveGap: "Float",
            depth: "Float",
            rotation: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float",
            componentSpacing: "Float"
        };

        this.__defaults = {
            in: 1,
            out: 8,
            flowChannelWidth: 500,
            controlChannelWidth: 600,
            leafSpace: 4000,
            outletLength: 24000,
            valveRadius: 1.2 * 1000,
            valveGap: 0.6 * 1000,
            depth: 0.8 * 1000,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0,
            componentSpacing: 2000
        };

        this.__units = {
            in: "",
            out: "",
            flowChannelWidth: "μm",
            controlChannelWidth: "μm",
            leafSpace: "μm",
            outletLength: "μm",
            valveRadius: "μm",
            valveGap: "μm",
            depth: "μm",
            rotation: "°",
            componentSpacing: "μm"
        };

        this.__minimum = {
            in: 1,
            out: 2,
            flowChannelWidth: 25,
            controlChannelWidth: 10,
            leafSpace: 100,
            outletLength: 1000,
            valveRadius: 0.1 * 100,
            valveGap: 0.5 * 10,
            depth: 0.1 * 100,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0,
            componentSpacing: 0
        };

        this.__maximum = {
            in: 1,
            out: 128,
            flowChannelWidth: 25e3,
            controlChannelWidth: 1000,
            leafSpace: 20000,
            outletLength: 200000,
            valveRadius: 0.2 * 10000,
            valveGap: 0.1 * 10000,
            depth: 1.2 * 1000,
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1,
            componentSpacing: 10000
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            in: "in",
            out: "out",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            leafSpace: "leafSpace",
            outletLength: "outletLength",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            in: "in",
            out: "out",
            position: "position",
            rotation: "rotation",
            radius1: "valveRadius",
            radius2: "valveRadius",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            leafSpace: "leafSpace",
            outletLength: "outletLength",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL", "INVERSE"];

        this.__mint = "MUX3D";

        this.__zOffsetKeys = {
            FLOW: "depth",
            CONTROL: "depth",
            INVERSE: "depth"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CONTROL: "+1",
            INVERSE: "0"
        };
    }


    __mux3dFlowChannelWidth(params: { [k: string]: any }): number {
        const named = Number(params.flowChannelWidth);
        if (Number.isFinite(named) && named > 0) {
            return named;
        }
        const legacy = Number(params.channelWidth);
        if (Number.isFinite(legacy) && legacy > 0) {
            return legacy;
        }
        return 500;
    }

    __mux3dValveGap(params: { [k: string]: any }): number {
        const named = Number(params.valveGap);
        if (Number.isFinite(named) && named > 0) {
            return named;
        }
        const legacy = Number(params.gap);
        if (Number.isFinite(legacy) && legacy > 0) {
            return legacy;
        }
        return 600;
    }

    __mux3dLeafSpace(params: { [k: string]: any }): number {
        const named = Number(params.leafSpace);
        if (Number.isFinite(named) && named > 0) {
            return named;
        }
        return 4000;
    }

    __mux3dOutletLength(params: { [k: string]: any }, N: number): number {
        const named = Number(params.outletLength);
        if (Number.isFinite(named) && named > 0) {
            return named;
        }
        // Legacy: stageSpace was a per-leaf vertical pitch (vert = N * stageSpace).
        const legacy = Number(params.stageSpace);
        if (Number.isFinite(legacy) && legacy > 0) {
            return N * legacy;
        }
        return 24000;
    }

    __mux3dExtents(params: { [k: string]: any }, N: number): { bottomlinelength: number; vertlinelength: number } {
        return {
            bottomlinelength: N * this.__mux3dLeafSpace(params),
            vertlinelength: this.__mux3dOutletLength(params, N)
        };
    }

    /**
     * Per mux-bit stage along each outlet channel: left/right valve centers at
     * 0.3 / 0.7 of the stage (same ratio as MUX __muxValveCenterOffsets).
     */
    __mux3dValveRowYs(py: number, outletLength: number, valvenum: number): { left: number; right: number }[] {
        const stages = Math.max(valvenum, 1);
        const stageLen = outletLength / stages;
        const rows: { left: number; right: number }[] = [];
        for (let j = 0; j < stages; j++) {
            const base = py + j * stageLen;
            rows.push({
                left: base + stageLen * 0.3,
                right: base + stageLen * 0.7
            });
        }
        return rows;
    }

    render2D(params: { [k: string]: any }, key: string) {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        } else if (key === "INVERSE") {
            return this.__drawInverse(params);
        }else{
            throw new Error("Unknown key threedmux: " + key);
        }
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        const ret = new paper.CompoundPath("");
        const flow = this.render2D(params, "FLOW");
        const control = this.render2D(params, "CONTROL");
        ret.addChild((control as unknown) as paper.CompoundPath);
        ret.addChild((flow as unknown) as paper.CompoundPath);
        ret.fillColor = params.color;
        ret.fillColor!.alpha = 0.5;
        return ret;
    }

    getPorts(params: { [k: string]: any }) {
        const ins = params.in;
        const outs = params.out;
        let N;
        let rotation = params.rotation;

        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }

        const { bottomlinelength: horizontal_length, vertlinelength: vertical_length } = this.__mux3dExtents(params, N);
        const ports = [];

        for (let i = 0; i < N; i++) {
            const xpos = i * (horizontal_length / (N - 1));
            ports.push(new ComponentPort(xpos, 0, (i + 1).toString(), LogicalLayerType.FLOW));
        }

        ports.push(new ComponentPort(horizontal_length / 2, vertical_length + N * 1000, (N + 1).toString(), LogicalLayerType.FLOW));
        const bottomlinelength = horizontal_length;
        const vertlinelength = vertical_length;

        const leftInput = -N * 1000;
        const rightInput = bottomlinelength + N * 1000;
        let indexN = N;
        const valvenum = Math.log(N) / Math.log(2);
        const valveRows = this.__mux3dValveRowYs(0, vertlinelength, valvenum);

        let count = N + 2;

        for (let j = 0; j < valvenum; j++) {
            indexN /= 2;
            ports.push(new ComponentPort(leftInput, valveRows[j].left, count.toString(), LogicalLayerType.CONTROL));
            count++;
            ports.push(new ComponentPort(rightInput, valveRows[j].right, count.toString(), LogicalLayerType.CONTROL));
            count++;
        }

        return ports;
    }

    __drawFlow(params: { [k: string]: any }) {
        const position = params.position;
        const gap = this.__mux3dValveGap(params);
        const radius = params.valveRadius;
        const color = params.color;
        let rotation = params.rotation;
        const channelWidth = this.__mux3dFlowChannelWidth(params);
        const threedmux_flow = new paper.CompoundPath("");

        const px = position[0];
        const py = position[1];
        const ins = params.in;
        const outs = params.out;
        let N;
        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }
        const { bottomlinelength, vertlinelength } = this.__mux3dExtents(params, N);

        const bottomlineleft = new paper.Point(px - channelWidth / 2, py - channelWidth / 2 + vertlinelength);
        const bottomlineright = new paper.Point(px + bottomlinelength + channelWidth / 2, py + channelWidth / 2 + vertlinelength);
        const channel = new paper.Path.Rectangle(bottomlineleft, bottomlineright);

        threedmux_flow.addChild(channel);

        const valvenum = Math.log(N) / Math.log(2);
        const valveRows = this.__mux3dValveRowYs(py, vertlinelength, valvenum);
        const branchArray = new Array(N);

        // create base flow
        for (let i = 0; i < N; i++) {
            const xposbranch = i * (bottomlinelength / (N - 1));

            const vertlinebottom = new paper.Point(px + xposbranch - channelWidth / 2, py + vertlinelength);
            const vertlinetop = new paper.Point(px + xposbranch + channelWidth / 2, py);
            branchArray[i] = new paper.Path.Rectangle(vertlinebottom, vertlinetop);
        }

        // create output port
        const portCon = new paper.Point(px + bottomlinelength / 2 - channelWidth / 2, py + vertlinelength);
        const portOut = new paper.Point(px + bottomlinelength / 2 + channelWidth / 2, py + vertlinelength + N * 1000);

        const portRec = new paper.Path.Rectangle(portCon, portOut);

        threedmux_flow.addChild(portRec);

        // add valves and remove parts of channels (0.3 / 0.7 within each stage)
        let cur_N = N;
        const xpos = px;

        for (let j = 0; j < valvenum; j++) {
            const leftY = valveRows[j].left;
            const rightY = valveRows[j].right;

            // left side
            let count1 = 0;
            const increment1 = cur_N / 2;
            while (count1 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + ((count1 + w) * bottomlinelength) / (N - 1);

                    const cutrec = new paper.Path.Rectangle({
                        from: new paper.Point(current_xpos - channelWidth / 2, leftY - gap / 2),
                        to: new paper.Point(current_xpos + channelWidth / 2, leftY + gap / 2)
                    });

                    this.__createthreedmuxValve(threedmux_flow, current_xpos, leftY, gap, radius, rotation, channelWidth);
                    branchArray[count1 + w] = branchArray[count1 + w].subtract(cutrec);
                }

                count1 += 2 * increment1;
            }

            // right side
            let count2 = 0;
            const increment2 = cur_N / 2;

            while (count2 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + bottomlinelength - ((count2 + w) * bottomlinelength) / (N - 1);

                    const cutrec = new paper.Path.Rectangle({
                        from: new paper.Point(current_xpos - channelWidth / 2, rightY - gap / 2),
                        to: new paper.Point(current_xpos + channelWidth / 2, rightY + gap / 2)
                    });

                    branchArray[N - 1 - w - count2] = branchArray[N - 1 - w - count2].subtract(cutrec);
                    this.__createthreedmuxValve(threedmux_flow, current_xpos, rightY, gap, radius, rotation, channelWidth);
                }
                count2 += increment2 + cur_N / 2;
            }
            cur_N = cur_N / 2;
        }

        for (let i = 0; i < N; i++) {
            threedmux_flow.addChild(branchArray[i]);
            // threedmux_flow.addChild(centerArray[i]);
        }

        threedmux_flow.fillColor = color;

        threedmux_flow.rotate(rotation, new paper.Point(px, py));

        return threedmux_flow;
    }

    __createthreedmuxValve(compound_path: paper.CompoundPath, xpos: number, ypos: number, gap: number, radius: number, rotation: number, channel_width: number): void  {
        const center = new paper.Point(xpos, ypos);

        // Create the basic circle
        let circ: paper.Path.Circle | paper.PathItem = new paper.Path.Circle(center, radius);

        // Add the tiny channel pieces that jut out
        let rec = new paper.Path.Rectangle({
            point: new paper.Point(xpos - channel_width / 2, ypos - radius),
            size: [channel_width, radius],
            stokeWidth: 0
        });

        circ = circ.unite(rec);

        rec = new paper.Path.Rectangle({
            point: new paper.Point(xpos - channel_width / 2, ypos),
            size: [channel_width, radius],
            stokeWidth: 0
        });

        circ = circ.unite(rec);

        const cutout = new paper.Path.Rectangle({
            from: new paper.Point(xpos - radius, ypos - gap / 2),
            to: new paper.Point(xpos + radius, ypos + gap / 2)
        });

        const valve = circ.subtract(cutout);

        compound_path.addChild(valve);
    }

    __drawControl(params: { [k: string]: any }) {
        const position = params.position;
        const radius = params.valveRadius;
        const color = params.color;
        let rotation = params.rotation;
        const channelWidth = params.controlChannelWidth;
        const threedmux_control = new paper.CompoundPath("");

        const px = position[0];
        const py = position[1];

        const ins = params.in;
        const outs = params.out;

        let N;
        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }

        const { bottomlinelength, vertlinelength } = this.__mux3dExtents(params, N);

        const leftInput = px - N * 1000;
        const rightInput = px + bottomlinelength + N * 1000;
        let indexN = N;
        const valvenum = Math.log(N) / Math.log(2);
        const valveRows = this.__mux3dValveRowYs(py, vertlinelength, valvenum);

        for (let j = 0; j < valvenum; j++) {
            indexN /= 2;
            const cur_ind_left = N - indexN - 1;
            const leftY = valveRows[j].left;
            const rightY = valveRows[j].right;

            const leftsideLeft = new paper.Point(leftInput, leftY - channelWidth / 2);
            const leftsideRight = new paper.Point(px + cur_ind_left * (bottomlinelength / (N - 1)), leftY + channelWidth / 2);
            threedmux_control.addChild(new paper.Path.Rectangle(leftsideLeft, leftsideRight));

            const cur_ind_right = indexN;
            const rightsideLeft = new paper.Point(px + cur_ind_right * (bottomlinelength / (N - 1)), rightY - channelWidth / 2);
            const rightsideRight = new paper.Point(rightInput, rightY + channelWidth / 2);
            threedmux_control.addChild(new paper.Path.Rectangle(rightsideLeft, rightsideRight));
        }

        let cur_N = N;
        const xpos = px;

        for (let j = 0; j < valvenum; j++) {
            const leftY = valveRows[j].left;
            const rightY = valveRows[j].right;

            let count1 = 0;
            const increment1 = cur_N / 2;
            while (count1 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + ((count1 + w) * bottomlinelength) / (N - 1);
                    threedmux_control.addChild(new paper.Path.Circle(new paper.Point(current_xpos, leftY), radius));
                }
                count1 += 2 * increment1;
            }

            let count2 = 0;
            const increment2 = cur_N / 2;
            while (count2 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + bottomlinelength - ((count2 + w) * bottomlinelength) / (N - 1);
                    threedmux_control.addChild(new paper.Path.Circle(new paper.Point(current_xpos, rightY), radius));
                }
                count2 += increment2 + cur_N / 2;
            }
            cur_N = cur_N / 2;
        }

        threedmux_control.fillColor = color;
        threedmux_control.rotate(rotation, new paper.Point(px, py));

        return threedmux_control;
    }

    __drawInverse(params: { [k: string]: any }) {
        const position = params.position;
        const radius = params.valveRadius;
        const color = params.color;
        let rotation = params.rotation;
        const threedmux_control = new paper.CompoundPath("");

        const px = position[0];
        const py = position[1];

        const ins = params.in;
        const outs = params.out;

        let N;
        if (ins < outs) {
            N = outs;
        } else {
            N = ins;
            rotation += 180;
        }

        const { bottomlinelength, vertlinelength } = this.__mux3dExtents(params, N);

        const valvenum = Math.log(N) / Math.log(2);
        const valveRows = this.__mux3dValveRowYs(py, vertlinelength, valvenum);

        let cur_N = N;
        const xpos = px;

        for (let j = 0; j < valvenum; j++) {
            const leftY = valveRows[j].left;
            const rightY = valveRows[j].right;

            let count1 = 0;
            const increment1 = cur_N / 2;
            while (count1 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + ((count1 + w) * bottomlinelength) / (N - 1);
                    threedmux_control.addChild(new paper.Path.Circle(new paper.Point(current_xpos, leftY), radius));
                }
                count1 += 2 * increment1;
            }

            let count2 = 0;
            const increment2 = cur_N / 2;
            while (count2 < N) {
                for (let w = 0; w < cur_N / 2; w++) {
                    const current_xpos = xpos + bottomlinelength - ((count2 + w) * bottomlinelength) / (N - 1);
                    threedmux_control.addChild(new paper.Path.Circle(new paper.Point(current_xpos, rightY), radius));
                }
                count2 += increment2 + cur_N / 2;
            }
            cur_N = cur_N / 2;
        }

        threedmux_control.fillColor = color;
        threedmux_control.rotate(rotation, new paper.Point(px, py));

        return threedmux_control;
    }
}