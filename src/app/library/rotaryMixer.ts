import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType, Point } from "../core/init";
import FloatValue from "../core/parameters/floatValue";
import Device from "../core/device";

export default class RotaryMixer extends Template {
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
            radius: "Float",
            flowChannelWidth: "Float",
            controlChannelWidth: "Float",
            valveWidth: "Float",
            valveLength: "Float",
            valveSpacing: "Float",
            height: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
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
            height: 250,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            radius: "μm",
            flowChannelWidth: "μm",
            controlChannelWidth: "μm",
            valveWidth: "μm",
            valveLength: "μm",
            valveSpacing: "μm",
            height: "μm"
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
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
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
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__placementTool = "multilayerPositionTool";

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
            height: "height",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
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
            height: "height",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "ROTARY MIXER";

        this.__zOffsetKeys = {
            FLOW: "height",
            CONTROL: "height"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CONTROL: "+1"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const position = params.position;
        const radius = params.radius;
        const valvespacing = params.valveSpacing;
        const valvelength = params.valveLength;
        const valvewidth = params.valveWidth;
        const flowChannelWidth = params.flowChannelWidth; // params["flowChannelWidth"];
        const channellength = radius + valvelength + 2 * valvespacing + flowChannelWidth; // This needs to be a real expression
        const px = position[0];
        const py = position[1];
        const center = new paper.Point(px, py);

        const ports = [];

        ports.push(new ComponentPort(channellength, -radius - flowChannelWidth / 2, "1", LogicalLayerType.FLOW));
        ports.push(new ComponentPort(-channellength, radius + flowChannelWidth / 2, "2", LogicalLayerType.FLOW));

        // top right
        ports.push(
            new ComponentPort(radius + flowChannelWidth + valvespacing + valvelength / 2, -radius - flowChannelWidth / 2 - valvewidth, "3", LogicalLayerType.CONTROL)
        );
        // top middle
        ports.push(new ComponentPort(0, -radius - flowChannelWidth / 2 - valvewidth, "4", LogicalLayerType.CONTROL));
        // middle right
        ports.push(new ComponentPort(flowChannelWidth / 2 + radius + valvewidth, 0, "5", LogicalLayerType.CONTROL));
        // bottom middle
        ports.push(new ComponentPort(0, radius + flowChannelWidth / 2 + valvewidth, "6", LogicalLayerType.CONTROL));
        // bottom left
        ports.push(
            new ComponentPort(-radius - valvespacing - valvelength - flowChannelWidth / 2, radius + flowChannelWidth / 2 + valvewidth, "7", LogicalLayerType.CONTROL)
        );

        // this.mirrorPorts(params,ports)

        return ports;
    }


    render2D(params: { [k: string]: any }, key: string) {
        if (key === "FLOW") {
            return this.__renderFlow(params);
        } else if (key === "CONTROL") {
            return this.__renderControl(params);
        } 
        throw new Error("No valid key found");
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        const rotarymixer_flow = this.__renderFlow(params);
        const rotarymixer_control = this.__renderControl(params);
        const ret = new paper.CompoundPath("");
        ret.addChild(rotarymixer_flow);
        ret.addChild(rotarymixer_control);
        ret.fillColor = params.color;
        ret.fillColor!.alpha = 0.5;

        return ret;
    }

    __renderFlow(params: { [k: string]: any }) {
        const position = params.position;
        const radius = params.radius;
        const color = params.color;
        const rotation = params.rotation;
        const valvespacing = params.valveSpacing;
        const valvelength = params.valveLength;
        const valvewidth = params.valveWidth;
        const flowChannelWidth = params.flowChannelWidth; // params["flowChannelWidth"];
        const px = position[0];
        const py = position[1];
        const center = new paper.Point(px, py);
        const channellength = radius + valvelength + 2 * valvespacing + flowChannelWidth; // This needs to be a real expression
        const mirrorByX = params.mirrorByX;
        const mirrorByY = params.mirrorByY;

        const rotarymixer = new paper.CompoundPath("");

        const innercirc = new paper.Path.Circle(center, radius);
        const outercirc = new paper.Path.Circle(center, radius + flowChannelWidth);

        let rotary = outercirc.subtract(innercirc);

        //removes the rectangles from the rotary(circle) where the valves will be

        let topleft = new paper.Point(px - valvelength / 2, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        const topmiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotary = rotary.subtract(topmiddlerectangle);

        topleft = new paper.Point(px + radius + flowChannelWidth / 2 - valvewidth / 2, py - valvelength / 2);
        const middlerightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvewidth, valvelength));
        rotary = rotary.subtract(middlerightrectangle);

        topleft = new paper.Point(px - valvelength / 2, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        const bottommiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotary = rotary.subtract(bottommiddlerectangle);

        rotarymixer.addChild(rotary);

        //Render the flow connection leaving the rotary
        const point1 = new paper.Point(px, py - radius - flowChannelWidth);
        const point2 = new paper.Point(px + channellength, py - radius);
        let rectangle: paper.Path.Rectangle | paper.PathItem = new paper.Path.Rectangle(point1, point2);

        //Remove from the connection (rectangle) where the top right valve will be
        topleft = new paper.Point(px + radius + flowChannelWidth + valvespacing, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        const toprightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rectangle = rectangle.subtract(toprightrectangle);

        //Remove from the connection (rectangle) where the top middle valve will be
        rectangle = rectangle.subtract(topmiddlerectangle);

        rotarymixer.addChild(rectangle);

        const point3 = new paper.Point(px - channellength, py + radius);
        const point4 = new paper.Point(px, py + radius + flowChannelWidth);
        let rectangle2: paper.Path.Rectangle | paper.PathItem = new paper.Path.Rectangle(point3, point4);

        topleft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        const bottomleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rectangle2 = rectangle2.subtract(bottomleftrectangle);

        rectangle2 = rectangle2.subtract(bottommiddlerectangle);

        //Rectangle that represents the flow connection entering the mixer
        rotarymixer.addChild(rectangle2);

        rotarymixer.fillColor = color;
        this.mirrorRender(params,rotarymixer);
        rotarymixer.rotate(rotation, new paper.Point(px, py));
        return rotarymixer;
    }

    __renderControl(params: { [k: string]: any }) {
        const position = params.position;
        const radius = params.radius;
        const color = params.color;
        const rotation = params.rotation;
        const valvespacing = params.valveSpacing;
        const valvelength = params.valveLength;
        const valvewidth = params.valveWidth;
        const flowChannelWidth = params.flowChannelWidth;
        const controlChannelWidth = params.controlChannelWidth; // params["flowChannelWidth"];
        const mirrorByX = params.mirrorByX;
        const mirrorByY = params.mirrorByY;
        const px = position[0];
        const py = position[1];

        const rotarymixer = new paper.CompoundPath("");
        let topleft = null;
        const bottomright = null;

        // Draw top right valve
        topleft = new paper.Point(px + radius + flowChannelWidth + valvespacing, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        const topleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(topleftrectangle);

        let topLeft = new paper.Point(px + radius + flowChannelWidth + valvespacing + valvelength / 2 - controlChannelWidth / 2, py - radius - flowChannelWidth / 2 - valvewidth);
        let bottomRight = new paper.Point(px + radius + flowChannelWidth + valvespacing + valvelength / 2 + controlChannelWidth / 2, py - radius);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // Draw top middle valve
        topleft = new paper.Point(px - valvelength / 2, py - radius - flowChannelWidth / 2 - valvewidth / 2);
        const topmiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(topmiddlerectangle);

        topLeft = new paper.Point(px - controlChannelWidth / 2, py - radius - flowChannelWidth / 2 - valvewidth);
        bottomRight = new paper.Point(px + controlChannelWidth / 2, py - radius);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // Draw middle right valve
        topleft = new paper.Point(px + radius + flowChannelWidth / 2 - valvewidth / 2, py - valvelength / 2);
        const middlerightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvewidth, valvelength));
        rotarymixer.addChild(middlerightrectangle);

        topLeft = new paper.Point(px + flowChannelWidth / 2 + radius, py - controlChannelWidth / 2);
        bottomRight = new paper.Point(px + flowChannelWidth / 2 + radius + valvewidth, py + controlChannelWidth / 2);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // Draw Bottom middle valve
        topleft = new paper.Point(px - valvelength / 2, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        const bottommiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(bottommiddlerectangle);

        topLeft = new paper.Point(px - controlChannelWidth / 2, py + radius + flowChannelWidth / 2);
        bottomRight = new paper.Point(px + controlChannelWidth / 2, py + radius + flowChannelWidth / 2 + valvewidth);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // Draw bottom left valve
        topleft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth, py + radius + flowChannelWidth / 2 - valvewidth / 2);
        const bottomleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(bottomleftrectangle);

        topLeft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth / 2 - controlChannelWidth / 2, py + radius + flowChannelWidth / 2);
        bottomRight = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth / 2 + controlChannelWidth / 2, py + radius + flowChannelWidth / 2 + valvewidth);
        rotarymixer.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        rotarymixer.fillColor = color;
        this.mirrorRender(params,rotarymixer);
        rotarymixer.rotate(rotation, new paper.Point(px, py));
        return rotarymixer;
    }
}