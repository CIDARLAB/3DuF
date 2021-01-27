import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class LLChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            width: "Float",
            length: "Float",
            height: "Float",
            rotation: "Float",
            spacing: "Float",
            numberOfChambers: "Integer"
        };

        this.__defaults = {
            width: 400,
            length: 5000,
            height: 250,
            spacing: 2000,
            numberOfChambers: 4,
            rotation: 0
        };

        this.__units = {
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m",
            spacing: "&mu;m",
            numberOfChambers: "10",
            rotation: "&deg;"
        };

        this.__minimum = {
            width: 5,
            length: 5,
            height: 1,
            spacing: 1,
            numberOfChambers: 1,
            rotation: 0
        };

        this.__maximum = {
            width: 50000,
            length: 50000,
            height: 50000,
            numberOfChambers: 1000,
            spacing: 50000,
            rotation: 360
        };

        this.__featureParams = {
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            numberOfChambers: "numberOfChambers",
            spacing: "spacing",
            rotation: "rotation"
        };

        this.__targetParams = {
            position: "position",
            width: "width",
            length: "length",
            height: "height",
            numberOfChambers: "numberOfChambers",
            spacing: "spacing",
            rotation: "rotation"
        };

        this.__placementTool = "multilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "LL CHAMBER";
    }

    getPorts(params) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        // let radius = params["cornerRadius"];

        let numArray = params["numberOfChambers"];
        let spacing = params["spacing"];

        let ports = [];

        ports.push(new ComponentPort(w / 2, -w, "1", "FLOW"));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing - w / 2, -w, "2", "FLOW"));

        ports.push(new ComponentPort(w / 2, l + w, "3", "FLOW"));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing - w / 2, l + w, "4", "FLOW"));

        // //Control Ports - Left
        ports.push(new ComponentPort(0, 0.2 * l, "10", "CONTROL"));

        ports.push(new ComponentPort(0, 0.5 * l, "9", "CONTROL"));

        ports.push(new ComponentPort(0, 0.8 * l, "8", "CONTROL"));

        //Control Ports - Right
        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing, 0.2 * l, "5", "CONTROL"));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing, 0.5 * l, "6", "CONTROL"));

        ports.push(new ComponentPort(numArray * w + (numArray + 1) * spacing, 0.8 * l, "7", "CONTROL"));

        return ports;
    }

    __renderFlow(params) {
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        // let radius = params["cornerRadius"];

        let numArray = params["numberOfChambers"];
        let spacing = params["spacing"];

        let rendered = new paper.CompoundPath();

        let rec;

        for (let i = 0; i < numArray; i++) {
            rec = new paper.Path.Rectangle({
                point: new paper.Point(px + (i + 1) * spacing + i * w, py - 1),
                size: [w, l + 2],
                radius: 0
            });

            rendered.addChild(rec);
        }

        let topchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py - w),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(topchannel);

        let bottomchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + l),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(bottomchannel);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
    }

    __renderControl(params) {
        let rendered = new paper.CompoundPath();
        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        // let radius = params["cornerRadius"];

        let numArray = params["numberOfChambers"];
        let spacing = params["spacing"];

        let topchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + 0.2 * l - w / 2),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(topchannel);

        let middlechannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + 0.5 * l - w / 2),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(middlechannel);

        let bottomchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + 0.8 * l - w / 2),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(bottomchannel);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
    }

    render2D(params, key="FLOW") {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else {
            return this.__renderControl(params);
        }

        let position = params["position"];
        let px = position[0];
        let py = position[1];
        let l = params["length"];
        let w = params["width"];
        let rotation = params["rotation"];
        let color = params["color"];
        // let radius = params["cornerRadius"];

        let numArray = params["numberOfChambers"];
        let spacing = params["spacing"];

        let rendered = new paper.CompoundPath();

        let rec;

        for (let i = 0; i < numArray; i++) {
            rec = new paper.Path.Rectangle({
                point: new paper.Point(px + (i + 1) * spacing + i * w, py - 1),
                size: [w, l + 2],
                radius: 0
            });

            rendered.addChild(rec);
        }

        let topchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py - w),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(topchannel);

        let bottomchannel = new paper.Path.Rectangle({
            point: new paper.Point(px, py + l),
            size: [numArray * w + (numArray + 1) * spacing, w]
        });

        rendered.addChild(bottomchannel);

        rendered.fillColor = color;
        return rendered.rotate(rotation, px, py);
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
}
