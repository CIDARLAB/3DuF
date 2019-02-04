import Template from "./template";
import paper from "paper";

export  default class RotaryMixer extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "orientation": "String",
            "radius": "Float",
            "flowChannelWidth": "Float",
            "valveWidth": "Float",
            "valveLength": "Float",
            "valveSpacing": "Float",
            "height": "Float"
        };

        this.__defaults = {
            "orientation": "V",
            "radius": 2000,
            "flowChannelWidth": 1000,
            "valveWidth": 2.4 * 1000,
            "valveLength": 2.4 * 1000,
            "valveSpacing": 300,
            "valveRadius": 1.2 * 1000,
            "height": 250
        };


        this.__units = {
            "orientation": "",
            "radius": "&mu;m",
            "flowChannelWidth": "&mu;m",
            "valveWidth": "&mu;m",
            "valveLength": "&mu;m",
            "valveSpacing": "&mu;m",
            "height": "&mu;m"
        };

        this.__minimum = {
            "radius": 0.1 * 5000,
            "flowChannelWidth": 0.1 * 1000,
            "valveWidth": 0.1 * 2.4 * 1000,
            "valveLength": 0.1 * 2.4 * 1000,
            "valveSpacing": 0.1 * 300,
            "valveRadius": 0.1 * 1.2 * 1000,
            "height": 0.1 * 200
        };

        this.__maximum = {
            "radius": 10 * 5000,
            "flowChannelWidth": 10 * 1000,
            "valveWidth": 10 * 2.4 * 1000,
            "valveLength": 10 * 2.4 * 1000,
            "valveSpacing": 10 * 300,
            "valveRadius": 10 * 1.2 * 1000,
            "height": 10 * 200
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            position: "position",
            orientation: "orientation",
            flowChannelWidth: "flowChannelWidth",
            radius: "radius",
            valveWidth:"valveWidth",
            valveLength:"valveLength",
            valveSpacing:"valveSpacing",
            height: "height"
        };

        this.__targetParams = {
            position: "position",
            orientation: "orientation",
            flowChannelWidth: "flowChannelWidth",
            radius: "radius",
            valveWidth:"valveWidth",
            valveLength:"valveLength",
            valveSpacing:"valveSpacing",
            height: "height"
        };

        this.__mint = "ROTARY MIXER";

    }

    render2D(params, key = null) {
        if(key == "FLOW"){
            return this.__renderFlow(params);
        }else if(key == "CONTROL"){
            return this.__renderControl(params);
        }else{
            throw new Error("No valid key found");
        }
    }

    render2DTarget(key, params){
        let position = params["position"];
        let radius = params["radius"];
        let color = params["color"];
        let orientation = params["orientation"];
        let valvespacing = params["valveSpacing"];
        let valvelength = params['valveLength'];
        let flowchannelwidth = 1000; //params["flowChannelWidth"];
        let px = position[0];
        let py = position[1];
        let center = new paper.Point(px, py);
        let channellength = radius + valvelength + 2 * valvespacing; //This needs to be a real expression

        let rotarymixer = new paper.CompoundPath();

        let innercirc = new paper.Path.Circle(center, radius);
        let outercirc = new paper.Path.Circle(center, radius + flowchannelwidth);

        let rotary = outercirc.subtract(innercirc);

        rotarymixer.addChild(rotary);

        let point1 = new paper.Point(px, py - radius - flowchannelwidth);
        let point2 = new paper.Point(px + channellength, py - radius);
        let rectangle = new paper.Path.Rectangle(point1, point2);

        // rotary.unite(rectangle);
        rotarymixer.addChild(rectangle);

        let point3 = new paper.Point(px-channellength, py + radius);
        let point4 = new paper.Point(px, py + radius + flowchannelwidth);
        let rectangle2 = new paper.Path.Rectangle(point3, point4);

        //rotary.unite(rectangle2);
        rotarymixer.addChild(rectangle2);

        let rotation = 0;
        if (orientation == "V") {
            rotation = 90;
        }
        else {
            rotation = 0;
        }

        rotarymixer.fillColor = color;
        rotarymixer.fillColor.alpha = 0.5;

        return rotarymixer.rotate(rotation, px, py);
    }

    __renderFlow(params) {
        let position = params["position"];
        let radius = params["radius"];
        let color = params["color"];
        let orientation = params["orientation"];
        let valvespacing = params["valveSpacing"];
        let valvelength = params['valveLength'];
        let flowchannelwidth = params['flowChannelWidth']; //params["flowChannelWidth"];
        let px = position[0];
        let py = position[1];
        let center = new paper.Point(px, py);
        let channellength = radius + valvelength + 2 * valvespacing + flowchannelwidth; //This needs to be a real expression

        let rotarymixer = new paper.CompoundPath();

        let innercirc = new paper.Path.Circle(center, radius);
        let outercirc = new paper.Path.Circle(center, radius + flowchannelwidth);

        let rotary = outercirc.subtract(innercirc);

        rotarymixer.addChild(rotary);

        let point1 = new paper.Point(px, py - radius - flowchannelwidth);
        let point2 = new paper.Point(px + channellength, py - radius);
        let rectangle = new paper.Path.Rectangle(point1, point2);

        rotarymixer.addChild(rectangle);

        let point3 = new paper.Point(px-channellength, py + radius);
        let point4 = new paper.Point(px, py + radius + flowchannelwidth);
        let rectangle2 = new paper.Path.Rectangle(point3, point4);

        rotarymixer.addChild(rectangle2);

        let rotation = 0;
        if (orientation == "V") {
            rotation = 90;
        }
        else {
            rotation = 0;
        }
        // cutout.fillColor = "white";

        rotarymixer.fillColor = color;

        return rotarymixer.rotate(rotation, px, py);

    }

    __renderControl(params) {
        let position = params["position"];
        let radius = params["radius"];
        let color = params["color"];
        let orientation = params["orientation"];
        let valvespacing = params["valveSpacing"];
        let valvelength = params['valveLength'];
        let valvewidth = params['valveWidth'];
        let flowChannelWidth = params['flowChannelWidth'];
        let controlChannelWidth = params['controlChannelWidth']; //params["flowChannelWidth"];
        let px = position[0];
        let py = position[1];

        let rotarymixer = new paper.CompoundPath();
        let topleft = null;
        let bottomright = null;

        //Draw top right valve
        topleft = new paper.Point(px + radius + flowChannelWidth + valvespacing, py - radius - flowChannelWidth/2 - valvewidth/2 );
        let topleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(topleftrectangle);

        //Draw top middle valve
        topleft = new paper.Point(px - valvewidth/2, py - radius - flowChannelWidth/2 - valvewidth/2);
        let topmiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(topmiddlerectangle);

        //Draw middle right valve
        topleft = new paper.Point(px + radius + flowChannelWidth/2 - valvewidth/2, py - valvelength/2);
        let middlerightrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvewidth, valvelength));
        rotarymixer.addChild(middlerightrectangle);

        //Draw Bottom middle valve
        topleft = new paper.Point(px - valvelength/2, py + radius + flowChannelWidth/2 - valvewidth/2);
        let bottommiddlerectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(bottommiddlerectangle);

        //Draw bottom left valve
        topleft = new paper.Point(px - radius - valvespacing - valvelength - flowChannelWidth, py + radius + flowChannelWidth/2 - valvewidth/2);
        let bottomleftrectangle = new paper.Path.Rectangle(topleft, new paper.Size(valvelength, valvewidth));
        rotarymixer.addChild(bottomleftrectangle);

        let rotation = 0;
        if (orientation == "V") {
            rotation = 90;
        }
        else {
            rotation = 0;
        }

        rotarymixer.fillColor = color;
        return rotarymixer.rotate(rotation, px, py);
    }
}