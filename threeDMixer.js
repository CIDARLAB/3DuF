import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentport";

export  default class ThreeDMixer extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "bendSpacing": "Float",
            "numberOfBends": "Float",
            "channelWidth": "Float",
            "bendLength": "Float",
            "orientation": "String",
            "height": "Float"
        };

        this.__defaults = {
            "channelWidth": .80 * 1000,
            "bendSpacing": 1.23 * 1000,
            "numberOfBends": 1,
            "orientation": "V",
            "bendLength": 2.46 * 1000,
            "height": 250
        };


        this.__units = {
            "bendSpacing": "&mu;m",
            "numberOfBends": "",
            "channelWidth": "&mu;m",
            "bendLength": "&mu;m",
            "orientation": "",
            "height": "&mu;m"
        };

        this.__minimum = {
            "channelWidth": 10,
            "bendSpacing": 10,
            "numberOfBends": 1,
            "orientation": "H",
            "bendLength": 10,
            "height": 10,
        };

        this.__maximum = {
            "channelWidth": 2000,
            "bendSpacing": 6000,
            "numberOfBends": 20,
            "orientation": "H",
            "bendLength": 12 * 1000,
            "height": 1200,
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength"

        };

        this.__targetParams = {
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength"

        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "3DMIXER";

    }

    getPorts(params){
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let orientation = params["orientation"];
        let numberOfBends = params["numberOfBends"];

        let ports = [];

        ports.push(new ComponentPort(
            bendLength/2 + channelWidth,
            0,
            "1",
            "FLOW"
        ));

        ports.push(new ComponentPort(
            bendLength/2 + channelWidth,
            (2*numberOfBends + 1)*channelWidth + (2*numberOfBends)*bendSpacing,
            "2",
            "FLOW"
        ));

        return ports;
    }

    render2D(params, key) {
        let channelWidth = params["channelWidth"];
        let bendLength = params["bendLength"];
        let bendSpacing = params["bendSpacing"];
        let orientation = params["orientation"];
        let numBends = params["numberOfBends"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let segHalf = bendLength / 2 + channelWidth;
        let segLength = bendLength + 2 * channelWidth;
        let segBend = bendSpacing + 2 * channelWidth;
        let vRepeat = 2 * bendSpacing + 2 * channelWidth;
        let vOffset = bendSpacing + channelWidth;
        let hOffset = bendLength / 2 + channelWidth / 2;
        let serp = new paper.CompoundPath();


        if("FLOW" === key){
            //draw first segment
            serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
            for (let i = 0; i < numBends; i++) {
                serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
                // serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
                serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
                if (i == numBends - 1) {//draw half segment to close
                    serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
                } else {//draw full segment
                    serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
                }
            }

        }
        else{
            //draw first segment
            // serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
            for (let i = 0; i < numBends; i++) {
                // serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
                serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
                // serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
                // if (i == numBends - 1) {//draw half segment to close
                //     serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
                // } else {//draw full segment
                //     serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
                // }
            }
        }

        if(orientation ==="H"){
            serp.rotate(270, new paper.Point(x,y));
        }
        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key, params){
        let serp = this.render2D(params, key);

        serp.fillColor.alpha = 0.5;
        return serp;
    }
}