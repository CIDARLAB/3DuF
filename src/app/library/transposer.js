import Template from "./template";
import paper from "paper";

export default class Transposer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            rotation: "Float",
            valveRadius: "Float",
            height: "Float",
            valveGap: "Float",
            valveSpacing: "Float",
            channelWidth: "Float"
        };

        this.__defaults = {
            rotation: 0,
            valveRadius: 1.2 * 1000,
            height: 250,
            valveGap: 0.6 * 1000,
            valveSpacing: 0.6 * 1000,
            flowChannelWidth: 500,
            controlChannelWidth: 50
        };

        this.__units = {
            rotation: "&deg;",
            valveRadius: "&mu;m",
            height: "&mu;m",
            valveGap: "&mu;m",
            valveSpacing: "&mu;m",
            flowChannelWidth: "&mu;m",
            controlChannelWidth: "&mu;m"
        };

        this.__minimum = {
            valveRadius: 0.1 * 100,
            height: 0.1 * 100,
            valveGap: 0.5 * 10,
            valveSpacing: 0.1 * 1000,
            flowChannelWidth: 0.1,
            controlChannelWidth: 0.1,
            rotation: 0
        };

        this.__maximum = {
            valveRadius: 0.2 * 10000,
            height: 1.2 * 1000,
            valveGap: 0.1 * 10000,
            valveSpacing: 0.1 * 10000,
            flowChannelWidth: 0.1 * 10000,
            controlChannelWidth: 0.1 * 10000,
            rotation: 360
        };

        this.__featureParams = {
            position: "position",
            rotation: "rotation",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            valveSpacing: "valveSpacing",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth"
        };

        this.__targetParams = {
            position: "position",
            rotation: "rotation",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            valveSpacing: "valveSpacing",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth"
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CONTROL", "INVERSE"];

        this.__mint = "TRANSPOSER";
    }

    render2D(params, key="FLOW") {
        if (key == "FLOW") {
            return this.__drawFlow(params);
        } else if (key == "CONTROL") {
            return this.__drawControl(params);
        }
    }

    render2DTarget(key, params) {
        let ret = new paper.CompoundPath();
        let flow = this.render2D(params, "FLOW");
        let control = this.render2D(params, "CONTROL");
        ret.addChild(control);
        ret.addChild(flow);
        ret.fillColor = params["color"];
        ret.fillColor.alpha = 0.5;
        return ret;
    }

    __drawFlow(params) {
        let position = params["position"];
        let valveGap = params["valveGap"];
        let radius = params["valveRadius"];
        let color = params["color"];
        let rotation = params["rotation"];
        let channelWidth = params["flowChannelWidth"];
        let valvespacing = params["valveSpacing"];
        let transposer_flow = new paper.CompoundPath();

        let px = position[0];
        let py = position[1];

        //Draw top left channel
        let topleftpoint = new paper.Point(px, py - channelWidth / 2);
        let bottomrightpoint = new paper.Point(px + 4 * valvespacing + 2 * radius + 2 * channelWidth, py + channelWidth / 2);
        let channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        //Draw Valve
        this.__createTransposerValve(transposer_flow, bottomrightpoint.x + radius, topleftpoint.y + channelWidth / 2, valveGap, radius, "H", channelWidth);

        //Draw top right channel
        topleftpoint = new paper.Point(px + 4 * valvespacing + 4 * radius + 2 * channelWidth, py - channelWidth / 2);
        bottomrightpoint = new paper.Point(px + 6 * valvespacing + 4 * radius + 3 * channelWidth, py + channelWidth / 2);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        //Draw middle channels
        topleftpoint = new paper.Point(px + 3 * valvespacing + channelWidth + 2 * radius, py + channelWidth / 2);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);
        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        //2
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + 2 * valvespacing + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        //3
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        //Bottom Channels
        topleftpoint = new paper.Point(px, py + 1.5 * channelWidth + 4 * valvespacing + 2 * 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + 2 * valvespacing + channelWidth, topleftpoint.y + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, bottomrightpoint.x + radius, topleftpoint.y + channelWidth / 2, valveGap, radius, "H", channelWidth);

        //2
        topleftpoint = new paper.Point(bottomrightpoint.x + 2 * radius, topleftpoint.y);
        bottomrightpoint = new paper.Point(topleftpoint.x + 4 * valvespacing + 2 * channelWidth + 2 * radius, topleftpoint.y + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        //Draw the right channels
        topleftpoint = new paper.Point(px + 5 * valvespacing + 2 * channelWidth + 4 * radius, py + channelWidth / 2);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        //2
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        transposer_flow.fillColor = color;

        //Draw the left channels
        topleftpoint = new paper.Point(px + valvespacing, py + 1.5 * channelWidth + 2 * valvespacing + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        this.__createTransposerValve(transposer_flow, topleftpoint.x + channelWidth / 2, bottomrightpoint.y + radius, valveGap, radius, "V", channelWidth);

        //2
        topleftpoint = new paper.Point(topleftpoint.x, bottomrightpoint.y + 2 * radius);
        bottomrightpoint = new paper.Point(topleftpoint.x + channelWidth, topleftpoint.y + valvespacing + channelWidth);
        channel = new paper.Path.Rectangle(topleftpoint, bottomrightpoint);

        transposer_flow.addChild(channel);

        transposer_flow.fillColor = color;

        transposer_flow.rotate(rotation, px + 3 * valvespacing + 1.5 * channelWidth + 2 * radius, py + channelWidth + 2 * valvespacing + 2 * radius);

        return transposer_flow;
    }

    __createTransposerValve(compound_path, xpos, ypos, valveGap, radius, orientation, channel_width) {
        let center = new paper.Point(xpos, ypos);

        //Create the basic circle
        let circ = new paper.Path.Circle(center, radius);

        //Add the tiny channel pieces that jut out
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

        let cutout = paper.Path.Rectangle({
            from: new paper.Point(xpos - radius, ypos - valveGap / 2),
            to: new paper.Point(xpos + radius, ypos + valveGap / 2)
        });

        //cutout.fillColor = "white";
        let valve = circ.subtract(cutout);

        //TODO Rotate
        if (orientation == "H") {
            valve.rotate(90, center);
        }

        compound_path.addChild(valve);
    }

    __drawControl(params) {
        let position = params["position"];
        let valveGap = params["valveGap"];
        let radius = params["valveRadius"];
        let color = params["color"];
        let rotation = params["rotation"];
        let channelWidth = params["channelWidth"];
        let valvespacing = params["valveSpacing"];
        let transposer_control = new paper.CompoundPath();

        let px = position[0];
        let py = position[1];

        //Top right valve
        let center = new paper.Point(px + 4 * valvespacing + 2 * channelWidth + 2 * radius + radius, py);
        let circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        //2nd row valves

        center = new paper.Point(px + 1.5 * channelWidth + 3 * valvespacing + 2 * radius, py + channelWidth / 2 + valvespacing + radius);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        let crosschannelstart = center;

        center = new paper.Point(center.x + 2 * valvespacing + 2 * radius + channelWidth, py + channelWidth / 2 + valvespacing + radius);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        let crosschannelend = center;

        //Draw the cross channel connecting the 2nd row valves
        let rect = new paper.Path.Rectangle({
            from: new paper.Point(crosschannelstart.x, crosschannelstart.y - channelWidth / 2),
            to: new paper.Point(crosschannelend.x, crosschannelstart.y + channelWidth / 2)
        });

        transposer_control.addChild(rect);

        //3rd Row valves

        center = new paper.Point(px + 0.5 * channelWidth + valvespacing, py + 1.5 * channelWidth + 3 * valvespacing + 2 * radius + radius);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        crosschannelstart = center;

        center = new paper.Point(center.x + 2 * valvespacing + 2 * radius + channelWidth, center.y);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        crosschannelend = center;

        //Draw the cross channel connecting the 3nd row valves
        rect = new paper.Path.Rectangle({
            from: new paper.Point(crosschannelstart.x, crosschannelstart.y - channelWidth / 2),
            to: new paper.Point(crosschannelend.x, crosschannelstart.y + channelWidth / 2)
        });

        transposer_control.addChild(rect);

        //Bottom Row valve
        center = new paper.Point(px + channelWidth + 2 * valvespacing + radius, py + 4 * valvespacing + 4 * radius + 2 * channelWidth);
        circle = new paper.Path.Circle(center, radius);
        transposer_control.addChild(circle);

        //Finally we draw the cross channel
        let topleftpoint = new paper.Point(px + valvespacing, py + channelWidth / 2 + 2 * radius + 2 * valvespacing);
        let bottomleftpoint = new paper.Point(topleftpoint.x + +4 * valvespacing + 3 * channelWidth + 4 * radius, topleftpoint.y + channelWidth);
        let rectangle = new paper.Path.Rectangle(topleftpoint, bottomleftpoint);
        transposer_control.addChild(rectangle);

        transposer_control.rotate(rotation, px + 3 * valvespacing + 1.5 * channelWidth + 2 * radius, py + channelWidth + 2 * valvespacing + 2 * radius);

        transposer_control.fillColor = color;
        return transposer_control;
    }
}
