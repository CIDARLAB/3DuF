import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class RotaryMixer extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            rotation: "Float",
            radius: "Float",
            flowChannelWidth: "Float",
            controlChannelWidth: "Float",
            valveWidth: "Float",
            valveLength: "Float",
            valveSpacing: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            radius: 2000,
            flowChannelWidth: 1000,
            controlChannelWidth: 500,
            valveWidth: 2.4 * 1000,
            valveLength: 1 * 1000,
            valveSpacing: 300,
            valveRadius: 1.2 * 1000,
            height: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            radius: "&mu;m",
            flowChannelWidth: "&mu;m",
            controlChannelWidth: "&mu;m",
            valveWidth: "&mu;m",
            valveLength: "&mu;m",
            valveSpacing: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            radius: 0.1 * 5000,
            flowChannelWidth: 0.1 * 1000,
            controlChannelWidth: 0.1 * 1000,
            valveWidth: 0.1 * 2.4 * 1000,
            valveLength: 0.1 * 2.4 * 1000,
            valveSpacing: 0.1 * 300,
            valveRadius: 0.1 * 1.2 * 1000,
            height: 0.1 * 200,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            radius: 10 * 5000,
            flowChannelWidth: 10 * 1000,
            controlChannelWidth: 10 * 1000,
            valveWidth: 10 * 2.4 * 1000,
            valveLength: 10 * 2.4 * 1000,
            valveSpacing: 10 * 300,
            valveRadius: 10 * 1.2 * 1000,
            height: 10 * 200,
            rotation: 360
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            radius: "radius",
            valveWidth: "valveWidth",
            valveLength: "valveLength",
            valveSpacing: "valveSpacing",
            height: "height"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            radius: "radius",
            valveWidth: "valveWidth",
            valveLength: "valveLength",
            valveSpacing: "valveSpacing",
            height: "height"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "ROTARY MIXER";
    }

    getPorts(params) {
        let radius = params["radius"];
        let valvespacing = params["valveSpacing"];
        let valvelength = params["valveLength"];
        let valvewidth = params["valveWidth"];
        let flowChannelWidth = params["flowChannelWidth"]; //params["flowChannelWidth"];
        let channellength = radius + valvelength + 2 * valvespacing + flowChannelWidth; //This needs to be a real expression

        let ports = [];

        ports.push(new ComponentPort(channellength, -radius - flowChannelWidth / 2, "1", "FLOW"));
        ports.push(new ComponentPort(-channellength, radius + flowChannelWidth / 2, "2", "FLOW"));

        //top right
        ports.push(new ComponentPort(radius + flowChannelWidth + valvespacing + valvelength / 2, -radius - flowChannelWidth / 2 - valvewidth, "3", "CONTROL"));
        //top bottom
        ports.push(new ComponentPort(0, -radius - flowChannelWidth / 2 - valvewidth, "4", "CONTROL"));
        //middle right
        ports.push(new ComponentPort(flowChannelWidth / 2 + radius + valvewidth, 0, "5", "CONTROL"));
        //bottom middle
        ports.push(new ComponentPort(0, radius + flowChannelWidth / 2 + valvewidth, "6", "CONTROL"));
        //bottom left
        ports.push(new ComponentPort(-radius - valvespacing - valvelength - flowChannelWidth / 2, radius + flowChannelWidth / 2 + valvewidth, "7", "CONTROL"));

        return ports;
    }

    render2D(params, key = null) {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else if (key === "CONTROL") {
            return this.__renderControl(params);
        } else {
            throw new Error("No valid key found");
        }
    }

    render2DTarget(key, params) {
        let rotarymixer = this.__renderFlow(params);
        rotarymixer.addChild(this.__renderControl(params));
        rotarymixer.fillColor.alpha = 0.5;

        return rotarymixer;
    }

    __renderFlow(params) {
        let position = params["position"];
        let radius = params["radius"];
        let color = params["color"];
        let rotation = params["rotation"];
        let valvespacing = params["valveSpacing"];
        let valvelength = params["valveLength"];
        let valvewidth = params["valveWidth"];
        let flowChannelWidth = params["flowChannelWidth"]; //params["flowChannelWidth"];
        let px = position[0];
        let py = position[1];
        let center = new paper.Point(px, py);
        let channellength = radius + valvelength + 2 * valvespacing + flowChannelWidth; //This needs to be a real expression

        let rotarymixer = new paper.CompoundPath();

        let innercirc = new paper.Path.Circle(center, radius);
        let outercirc = new paper.Path.Circle(center, radius + flowChannelWidth);

        let rotary = outercirc.subtract(innercirc);

        let topleft = new paper.Point(px - valvelength / 2, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        let topmiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotary = rotary.subtract(topmiddlerectangle);

        topleft = new paper.Point(px + radius + flowChannelWidth / 2 - valvewidth / 2, py - valvelength / 2);
        let middlerightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvewidth, valvelength));
        rotary = rotary.subtract(middlerightrectangle);

        topleft = new paper.Point(px - valvelength / 2, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        let bottommiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotary = rotary.subtract(bottommiddlerectangle);

        rotarymixer.addChild(rotary);

        let point1 = new paper.Point(px, py - radius - flowChannelWidth);
        let point2 = new paper.Point(px + channellength, py - radius);
        let rectangle = new paper.Path.Rectangle(point1, point2);

        topleft = new paper.Point(px + radius + flowChannelWidth + valvespacing, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        let topleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rectangle = rectangle.subtract(topleftrectangle);

        rectangle = rectangle.subtract(topmiddlerectangle);

        rotarymixer.addChild(rectangle);

        let point3 = new paper.Point(px - channellength, py + radius);
        let point4 = new paper.Point(px, py + radius + flowChannelWidth);
        let rectangle2 = new paper.Path.Rectangle(point3, point4);

        topleft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        let bottomleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rectangle2 = rectangle2.subtract(bottomleftrectangle);

        rectangle2 = rectangle2.subtract(bottommiddlerectangle);

        rotarymixer.addChild(rectangle2);

        rotarymixer.fillColor = color;

        return rotarymixer.rotate(rotation, px, py);
    }

    __renderControl(params) {
        let position = params["position"];
        let radius = params["radius"];
        let color = params["color"];
        let rotation = params["rotation"];
        let valvespacing = params["valveSpacing"];
        let valvelength = params["valveLength"];
        let valvewidth = params["valveWidth"];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"]; //params["flowChannelWidth"];
        let px = position[0];
        let py = position[1];

        let rotarymixer = new paper.CompoundPath();
        let topleft = null;
        let bottomright = null;

        //Draw top right valve
        topleft = new paper.Point(px + radius + flowChannelWidth + valvespacing, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        let topleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(topleftrectangle);

        let topLeft = new paper.Point(px + radius + flowChannelWidth + valvespacing + valvelength / 2 - controlChannelWidth / 2, py - radius - flowChannelWidth / 2 - valvewidth);
        let bottomRight = new paper.Point(px + radius + flowChannelWidth + valvespacing + valvelength / 2 + controlChannelWidth / 2, py - radius);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        //Draw top middle valve
        topleft = new paper.Point(px - valvelength / 2, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        let topmiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(topmiddlerectangle);

        topLeft = new paper.Point(px - controlChannelWidth / 2, py - radius - flowChannelWidth / 2 - valvewidth);
        bottomRight = new paper.Point(px + controlChannelWidth / 2, py - radius);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        //Draw middle right valve
        topleft = new paper.Point(px + radius + flowChannelWidth / 2 - valvewidth / 2, py - valvelength / 2);
        let middlerightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvewidth, valvelength));
        rotarymixer.addChild(middlerightrectangle);

        topLeft = new paper.Point(px + flowChannelWidth / 2 + radius, py - controlChannelWidth / 2);
        bottomRight = new paper.Point(px + flowChannelWidth / 2 + radius + valvewidth, py + controlChannelWidth / 2);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        //Draw Bottom middle valve
        topleft = new paper.Point(px - valvelength / 2, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        let bottommiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(bottommiddlerectangle);

        topLeft = new paper.Point(px - controlChannelWidth / 2, py + radius + flowChannelWidth / 2);
        bottomRight = new paper.Point(px + controlChannelWidth / 2, py + radius + flowChannelWidth / 2 + valvewidth);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        //Draw bottom left valve
        topleft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        let bottomleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(bottomleftrectangle);

        topLeft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth / 2 - controlChannelWidth / 2, py + radius + flowChannelWidth / 2);
        bottomRight = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth / 2 + controlChannelWidth / 2, py + radius + flowChannelWidth / 2 + valvewidth);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        rotarymixer.fillColor = color;
        return rotarymixer.rotate(rotation, px, py);
    }
}
