import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class DropletGeneratorFlowFocus extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            oilChannelWidth: "Float",
            waterChannelWidth: "Float",
            length: "Float",
            radius: "Float",
            angle: "Float",
            height: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            oilChannelWidth: 0.2 * 1000,
            waterChannelWidth: 0.4 * 1000,
            length: 0.8 * 1000,
            radius: 200,
            angle: 45,
            height: 250,
            rotation: 0
        };

        this.__units = {
            oilChannelWidth: "&mu;m",
            height: "&mu;m",
            waterChannelWidth: "&mu;m",
            radius:"&mu;m",
            length: "&mu;m",
            rotation: "&deg;",
            angle: "&deg;"
        };

        this.__minimum = {
            oilChannelWidth: 1,
            waterChannelWidth: 1,
            length: 1,
            radius: 1,
            angle: 1,
            rotation: 0
        };

        this.__maximum = {
            oilChannelWidth: 2000,
            waterChannelWidth: 2000,
            length: 20000,
            angle: 360,            
            height: 1200,
            radius: 2000,
            rotation: 360
        };

        this.__featureParams = {
            position: "position",
            oilChannelWidth: "oilChannelWidth",
            waterChannelWidth: "waterChannelWidth",
            length: "length",
            angle: "angle",
            height: "height",
            rotation: "rotation",
            radius: "radius"
        };

        this.__targetParams = {
            oilChannelWidth: "oilChannelWidth",
            waterChannelWidth: "waterChannelWidth",
            length: "length",
            angle: "angle",
            height: "height",
            rotation: "rotation",
            radius: "radius"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DROPLET GENERATOR FLOW FOCUS";
    }

    getPorts(params) {
        let orificeSize = params["orificeSize"];
        let orificeLength = params["orificeLength"];
        let oilInputWidth = params["oilInputWidth"];
        let waterInputWidth = params["waterInputWidth"];
        let outputWidth = params["outputWidth"];
        let outputLength = params["outputLength"];

        let ports = [];

        ports.push(new ComponentPort(2*port / 2, -waterInputWidth / 2, "1", "FLOW"));

        //Out
        return ports;
    }

    render2D(params, key) {
        let pos = params["position"];
        let x = pos[0];
        let y = pos[1];
        let color = params["color"];
        let oilChannelWidth = params["oilChannelWidth"];
        let waterChannelWidth = params["waterChannelWidth"];
        let length = params["length"];
        let angle = params["angle"];
        let radius = params["radius"];
        let rotation = params["rotation"];

        let ret = new paper.CompoundPath();

        let p = new paper.Point(x, y) ;
        let pwater = new paper.Path.Circle( p , radius );
        let poil1 = new paper.Path.Circle(new paper.Point(p.x - 5*radius, p.y), radius);
        let poil2 = new paper.Path.Circle(new paper.Point(p.x + 5*radius, p.y), radius);
        let size = new paper.Size(waterChannelWidth, 6*radius + length);
        let centerchannel = paper.Path.Rectangle(new paper.Point(p.x - waterChannelWidth/2, p.y), size);

        ret.addChild(pwater);
        ret.addChild(poil1);
        ret.addChild(poil2);
        ret.addChild(centerchannel);

        //Rotate the geometry
        ret.rotate(-rotation, new paper.Point(pos[0], pos[1]));

        ret.closed = true;
        ret.fillColor = color;
        return ret;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
