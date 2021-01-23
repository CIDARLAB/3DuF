import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import CSG from "@jscad/csg";

export default class LogicArray extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            chamberWidth: "Float",
            height: "Float",
            chamberLength: "Float",
            flowChannelWidth: "Float",
            controlChanelWidth: "Float",
            portRadius: "Float"

        };

        this.__defaults = {
            height: 1.1 * 1000,
            chamberWidth: 1000,
            chamberLength: 1000,
            flowChannelWidth: 1000,
            controlChanelWidth: 1000,
            portRadius: 1000


        };

        this.__units = {
            chamberWidth: "&mu;m",
            chamberLength:"&mu;m",
            flowChannelWidth: "&mu;m",
            controlChanelWidth: "&mu;m",
            portRadius: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            height: 1,
            chamberWidth: 1,
            chamberLength: 1,
            flowChannelWidth: 1,
            controlChanelWidth: 1,
            portRadius: 1,
        };

        this.__maximum = {
            height: 1.1 * 10000,
            chamberWidth: 10000,
            chamberLength: 10000,
            flowChannelWidth: 10000,
            controlChanelWidth: 10000,
            portRadius: 10000,
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            chamberWidth:"chamberWidth",
            flowChannelWidth: "flowChannelWidth",
            controlChanelWidth: "controlChannelWidth",
            portRadius: "portRadius",
            chamberLength:"chamberLength",
            height:"height",
            position: "position"
        };

        this.__targetParams = {
            chamberWidth:"chamberWidth",
            flowChannelWidth: "flowChannelWidth",
            controlChanelWidth: "controlChannelWidth",
            portRadius: "portRadius",
            chamberLength:"chamberLength",
            height:"height"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "LOGIC ARRAY";
    }

    render2D(params, key) {
        //Regardless of the key...
        let position = params["position"];
        let color1 = params["color"];
        let chamberWidth = params["chamberWidth"];
        let chamberLength = params["chamberLength"];
        let channelWidth = params["channelWidth"];
        let height = params["height"];

        let pos = new paper.Point(position[0], position[1]);
        let size = new paper.Size(12*chamberWidth + 12*chamberLength);
        let box = new paper.Path.Rectangle(pos, size);
        box.fillColor = color1;
        return box;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }

    getPorts(params) {
        let ports = [];
        let chamberWidth = params["chamberWidth"];
        let chamberLength = params["chamberLength"];
        let channelWidth = params["channelWidth"];

        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "1", "FLOW"));
        ports.push(new ComponentPort(12*chamberWidth + channelWidth, chamberLength + channelWidth/2, "2", "FLOW"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 12*chamberLength + channelWidth, "3", "FLOW"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "4", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "5", "CONTROL"));
        ports.push(new ComponentPort(12*chamberWidth + channelWidth, chamberLength + channelWidth/2, "6", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 12*chamberLength + channelWidth, "7", "CONTROL"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "8", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "9", "CONTROL"));
        ports.push(new ComponentPort(12*chamberWidth + channelWidth, chamberLength + channelWidth/2, "10", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 12*chamberLength + channelWidth, "11", "CONTROL"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "12", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "13", "CONTROL"));
        ports.push(new ComponentPort(12*chamberWidth + channelWidth, chamberLength + channelWidth/2, "14", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 12*chamberLength + channelWidth, "15", "CONTROL"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "16", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "17", "CONTROL"));
        ports.push(new ComponentPort(12*chamberWidth + channelWidth, chamberLength + channelWidth/2, "18", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 12*chamberLength + channelWidth, "19", "CONTROL"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "20", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 0, "21", "CONTROL"));
        ports.push(new ComponentPort(12*chamberWidth + channelWidth, chamberLength + channelWidth/2, "22", "CONTROL"));
        ports.push(new ComponentPort(chamberWidth + channelWidth/2, 12*chamberLength + channelWidth, "23", "CONTROL"));
        ports.push(new ComponentPort(0, chamberLength + channelWidth/2, "24", "CONTROL"));

        return ports;
    }

}
