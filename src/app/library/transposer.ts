import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Transposer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            rotation: "Float",
            valveRadius: "Float",
            height: "Float",
            valveGap: "Float",
            valveSpacing: "Float",
            flowChannelWidth: "Float",
            controlChannelWidth: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            valveRadius: 1.2 * 1000,
            height: 250,
            valveGap: 0.6 * 1000,
            valveSpacing: 0.6 * 1000,
            flowChannelWidth: 500,
            controlChannelWidth: 500,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            valveRadius: "μm",
            height: "μm",
            valveGap: "μm",
            valveSpacing: "μm",
            flowChannelWidth: "μm",
            controlChannelWidth: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            valveGap: 0.5 * 10,
            valveSpacing: 0.1 * 1000,
            flowChannelWidth: 0.1,
            controlChannelWidth: 0.1,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            valveGap: 0.1 * 10000,
            valveSpacing: 0.1 * 10000,
            flowChannelWidth: 0.1 * 10000,
            controlChannelWidth: 0.1 * 10000,
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            valveSpacing: "valveSpacing",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            valveSpacing: "valveSpacing",
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

        this.__mint = "TRANSPOSER";

        this.__zOffsetKeys = {
            FLOW: "height",
            CONTROL: "height",
            INVERSE: "height"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CONTROL: "+1",
            INVERSE: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const ports = [];

        const radius = params.valveRadius;
        const channelWidth = params.flowChannelWidth;
        const valvespacing = params.valveSpacing;

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(6 * valvespacing + 4 * radius + 3 * channelWidth, 0, "2", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(0, 2 * channelWidth + 4 * valvespacing + 2 * 2 * radius, "3", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(6 * valvespacing + 4 * radius + 3 * channelWidth, 2 * channelWidth + 4 * valvespacing + 2 * 2 * radius, "4", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(-2 * radius - channelWidth / 2, channelWidth + 2 * valvespacing + 2 * radius, "5", LogicalLayerType.CONTROL));
        ports.push(new ComponentPort(5 * valvespacing + 6 * radius + 3 * channelWidth, channelWidth + 2 * valvespacing + 2 * radius, "6", LogicalLayerType.CONTROL));
        return ports;
    }

    render2D(params: { [k: string]: any }, key = "FLOW") {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        }

        throw new Error("Unknown key: " + key);

    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        const ret = new paper.CompoundPath("");
        const flow = this.render2D(params, "FLOW");
        const control = this.render2D(params, "CONTROL");
        ret.addChild(control as paper.CompoundPath);
        ret.addChild(flow as paper.CompoundPath);
        ret.fillColor = params.color;
        ret.fillColor!.alpha = 0.5;
        return ret;
    }

    __drawFlow(params: { [k: string]: any }) {
        const position = params.position;
        const valveGap = params.valveGap;
        const radius = params.valveRadius;
        const color = params.color;
        const rotation = params.rotation;
        const channelWidth = params.flowChannelWidth;
        const valvespacing = params.valveSpacing;
        const transposer_flow = new paper.CompoundPath("");

        const px = position[0];
        const py = position[1];

        const mirrorByX = params.mirrorByX;

        // Draw top left channel
        let topleftpoint = new paper.Point(px, py - channelWidth / 2);
        let bottomrightpoint = new paper.Point(px + 4 * valvespacing + 2 * radius + 2 * channelWidth, py + channelWidth / 2);
        let channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        // Draw Valve
        this.__createTransposerValve(transposer_flow, bottomrightpoint.x + radius, topleftpoint.y + channelWidth / 2, valveGap, radius, "H", channelWidth);

        // Draw top right channel
        topleftpoint = new paper.Point(px + 4 * valvespacing + 4 * radius + 2 * channelWidth, py - channelWidth / 2);
        bottomrightpoint = new paper.Point(px + 6 * valvespacing + 4 * radius + 3 * channelWidth, py + channelWidth / 2);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        // Draw middle channels
        topleftpoint = new paper.Point(px + 3 * valvespacing + channelWidth + 2 * radius, py + channelWidth / 2);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);
        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        // 2
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + 2 * valvespacing + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        // 3
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        // Bottom Channels
        topleftpoint = new paper.Point(px, py + 1.5 * channelWidth + 4 * valvespacing + 2 * 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + 2 * valvespacing + channelWidth, topleftpoint.y + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, bottomrightpoint.x + radius, topleftpoint.y + channelWidth / 2, valveGap, radius, "H", channelWidth);

        // 2
        topleftpoint = new paper.Point(bottomrightpoint.x + 2 * radius, topleftpoint.y);
        bottomrightpoint = new paper.Point(topleftpoint.x + 4 * valvespacing + 2 * channelWidth + 2 * radius, topleftpoint.y + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        // Draw the right channels
        topleftpoint = new paper.Point(px + 5 * valvespacing + 2 * channelWidth + 4 * radius, py + channelWidth / 2);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        // 2
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        transposer_flow.fillColor = color;

        // Draw the left channels
        topleftpoint = new paper.Point(px + valvespacing, py + 1.5 * channelWidth + 2 * valvespacing + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        // 2
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        transposer_flow.fillColor = color;

        this.transformRender(params,transposer_flow);
        return transposer_flow;
    }

    __createTransposerValve(compound_path: paper.CompoundPath, xpos: number, ypos: number, valveGap: number, radius: number, orientation: string, channel_width: number): void  {
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
            from: new paper.Point(xpos - radius, ypos - valveGap / 2),
            to: new paper.Point(xpos + radius, ypos + valveGap / 2)
        });

        // cutout.fillColor = "white";
        const valve = circ.subtract(cutout);

        // TODO Rotate
        if (orientation === "H") {
            valve.rotate(90, center);
        }

        compound_path.addChild(valve);
    }

    __drawControl(params: { [k: string]: any }) {
        const position = params.position;
        const valveGap = params.valveGap;
        const radius = params.valveRadius;
        const color = params.color;
        const rotation = params.rotation;
        const channelWidth = params.controlChannelWidth;
        const valvespacing = params.valveSpacing;
        const transposer_control = new paper.CompoundPath("");

        const px = position[0];
        const py = position[1];

        const mirrorByX = params.mirrorByX;

        // Top right valve
        let center = new paper.Point(px + 4 * valvespacing + 2 * channelWidth + 2 * radius + radius, py);
        let circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        let topLeft = new paper.Point(px + 4 * valvespacing + 2 * channelWidth + 2 * radius + radius - channelWidth / 2, py - 2 * radius);
        let bottomRight = new paper.Point(px + 4 * valvespacing + 2 * channelWidth + 2 * radius + radius + channelWidth / 2, py);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(px - 2 * radius, py - 2 * radius - channelWidth / 2);
        bottomRight = new paper.Point(px + 4 * valvespacing + 2 * channelWidth + 2 * radius + radius + channelWidth / 2, py - 2 * radius + channelWidth / 2);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 2nd row valves

        center = new paper.Point(px + 1.5 * channelWidth + 3 * valvespacing + 2 * radius, py + channelWidth / 2 + valvespacing + radius);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        let crosschannelstart = center;

        center = new paper.Point(center.x + 2 * valvespacing + 2 * radius + channelWidth, py + channelWidth / 2 + valvespacing + radius);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        let crosschannelend = center;

        // Draw the cross channel connecting the 2nd row valves
        let rect = new paper.Path.Rectangle({
            from: new paper.Point(crosschannelstart.x, crosschannelstart.y - channelWidth / 2),
            to: new paper.Point(crosschannelend.x, crosschannelstart.y + channelWidth / 2)
        });

        transposer_control.addChild(rect);

        topLeft = new paper.Point(crosschannelend.x, crosschannelstart.y - channelWidth / 2);
        bottomRight = new paper.Point(crosschannelend.x + 2 * radius, crosschannelstart.y + channelWidth / 2);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(crosschannelend.x + 2 * radius - channelWidth / 2, crosschannelstart.y - channelWidth / 2);
        bottomRight = new paper.Point(crosschannelend.x + 2 * radius + channelWidth / 2, py + 1.5 * channelWidth + 3 * valvespacing + 2 * radius + radius);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 3rd Row valves

        center = new paper.Point(px + 0.5 * channelWidth + valvespacing, py + 1.5 * channelWidth + 3 * valvespacing + 2 * radius + radius);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        crosschannelstart = center;

        center = new paper.Point(center.x + 2 * valvespacing + 2 * radius + channelWidth, center.y);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        crosschannelend = center;

        // Draw the cross channel connecting the 3nd row valves
        rect = new paper.Path.Rectangle({
            from: new paper.Point(crosschannelstart.x, crosschannelstart.y - channelWidth / 2),
            to: new paper.Point(crosschannelend.x, crosschannelstart.y + channelWidth / 2)
        });

        transposer_control.addChild(rect);

        topLeft = new paper.Point(crosschannelend.x, crosschannelstart.y - channelWidth / 2);
        bottomRight = new paper.Point(center.x + 2 * valvespacing + 4 * radius + channelWidth + channelWidth / 2, crosschannelstart.y + channelWidth / 2);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // Bottom Row valve
        center = new paper.Point(px + channelWidth + 2 * valvespacing + radius, py + 4 * valvespacing + 4 * radius + 2 * channelWidth);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        topLeft = new paper.Point(px - 2 * radius - channelWidth / 2, py - 2 * radius - channelWidth / 2);
        bottomRight = new paper.Point(px - 2 * radius + channelWidth / 2, py + 4 * valvespacing + 6 * radius + 2 * channelWidth);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(px - 2 * radius - channelWidth / 2, py + 4 * valvespacing + 6 * radius + 2 * channelWidth - channelWidth / 2);
        bottomRight = new paper.Point(px + channelWidth + 2 * valvespacing + radius, py + 4 * valvespacing + 6 * radius + 2 * channelWidth + channelWidth / 2);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(px + channelWidth + 2 * valvespacing + radius - channelWidth / 2, py + 4 * valvespacing + 4 * radius + 2 * channelWidth);
        bottomRight = new paper.Point(px + channelWidth + 2 * valvespacing + radius + channelWidth / 2, py + 4 * valvespacing + 6 * radius + 2 * channelWidth + channelWidth / 2);
        transposer_control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // Finally we draw the cross channel
        const topleftpoint = new paper.Point(px + valvespacing, py + channelWidth / 2 + 2 * radius + 2 * valvespacing);
        const bottomleftpoint = new paper.Point(topleftpoint.x + +4 * valvespacing + 3 * channelWidth + 4 * radius, topleftpoint.y + channelWidth);
        const rectangle = new paper.Path.Rectangle(topleftpoint, bottomleftpoint);
        transposer_control.addChild(rectangle);

        this.transformRender(params,transposer_control);


        transposer_control.fillColor = color;
        return transposer_control;
    }
}
