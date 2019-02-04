import Template from "./template";
import paper from "paper";

export  default class RoundedChannel extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "start": "Point",
            "end": "Point"
        };

        this.__heritable = {
            "channelWidth": "Float",
            "height": "Float"
        };

        this.__defaults = {
            "channelWidth": .80 * 1000,
            "height": 250
        };


        this.__units = {
            "channelWidth": "&mu;m",
            "height": "&mu;m"
        };

        this.__minimum = {
            "channelWidth": 3,
            "height": 10,
        };

        this.__maximum = {
            "channelWidth": 2000,
            "height": 1200,
        };

        this.__featureParams = {
            start: "start",
            end: "end",
            width: "channelWidth"

        };

        this.__targetParams = {
            diameter: "channelWidth"
        };

        this.__placementTool = "DragTool";

        this.__toolParams = {
            start: "start",
            end: "end"
        };

        this.__mint = "CHANNEL";

    }

    render2D(params, key) {
        let start = params["start"];
        let end = params["end"];
        let color = params["color"];
        let width = params["width"];
        let baseColor = params["baseColor"];
        let startPoint = new paper.Point(start[0], start[1]);
        let endPoint = new paper.Point(end[0], end[1]);
        let vec = endPoint.subtract(startPoint);
        let rec = paper.Path.Rectangle({
            size: [vec.length + width, width],
            point: start,
            radius: width/2,
            fillColor: color,
            strokeWidth: 0
        });
        rec.translate([-width/2, -width / 2]);
        rec.rotate(vec.angle, start);
        return rec;

    }

    render2DTarget(key, params){
        let position = params["position"];
        let radius = params["diameter"];
        let color1 = params["color"];
        let pos = new paper.Point(position[0], position[1]);
        let outerCircle = new paper.Path.Circle(pos, radius);
        outerCircle.fillColor = color1;
        return outerCircle;
    }
}