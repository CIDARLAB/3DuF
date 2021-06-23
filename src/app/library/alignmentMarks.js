import Template from "./template";
import paper from "paper";

export default class AlignmentMarks extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            width: "Float",
            length: "Float",
            height: "Float"
        };

        this.__defaults = {
            width: 4000,
            length: 4000,
            height: 250
        };

        this.__units = {
            width: "&mu;m",
            length: "&mu;m",
            height: "&mu;m"
        };

        this.__minimum = {
            width: 10,
            length: 10,
            height: 10
        };

        this.__maximum = {
            width: 200000,
            length: 200000,
            height: 1200
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            position: "position",
            width: "width",
            length: "length"
        };

        this.__targetParams = {
            width: "width",
            length: "length"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "ALIGNMENT MARKS";
    }

    render2D(params, key) {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        }
    }

    render2DTarget(key, params) {
        let position = params["position"];
        let width = params["width"];
        let length = params["length"];
        let color = params["color"];
        let center = new paper.Point(position[0], position[1]);
        let ret = new paper.CompoundPath();
        let topleftpoint = new paper.Point(position[0] - width, position[1] - length);
        let bottomrightpoint = new paper.Point(position[0] + width, position[1] + length);

        let topleftrect = new paper.Path.Rectangle(topleftpoint, center);

        ret.addChild(topleftrect);

        let bottomrightrect = new paper.Path.Rectangle(position, bottomrightpoint);

        ret.addChild(bottomrightrect);

        let topmiddlepoint = new paper.Point(position[0], position[1] - length);
        let middlerightpoint = new paper.Point(position[0] + width, position[1]);
        let middleleftpoint = new paper.Point(position[0] - width, position[1]);
        let bottommiddlepoint = new paper.Point(position[0], position[1] + length);

        let toprightrect = new paper.Path.Rectangle(topmiddlepoint, middlerightpoint);

        ret.addChild(toprightrect);

        let bottomleftrect = new paper.Path.Rectangle(middleleftpoint, bottommiddlepoint);

        ret.addChild(bottomleftrect);

        ret.fillColor = color;

        ret.fillColor.alpha = 0.5;

        return ret;
    }

    __drawFlow(params) {
        let position = params["position"];
        let width = params["width"];
        let length = params["length"];
        let color = params["color"];
        let center = new paper.Point(position[0], position[1]);
        let ret = new paper.CompoundPath();
        let topleftpoint = new paper.Point(position[0] - width, position[1] - length);
        let bottomrightpoint = new paper.Point(position[0] + width, position[1] + length);

        let topleftrect = new paper.Path.Rectangle(topleftpoint, center);

        ret.addChild(topleftrect);

        let bottomrightrect = new paper.Path.Rectangle(position, bottomrightpoint);

        ret.addChild(bottomrightrect);

        ret.fillColor = color;
        return ret;
    }

    __drawControl(params) {
        let position = params["position"];
        let width = params["width"];
        let length = params["length"];
        let color = params["color"];
        let here = new paper.Point(position[0], position[1]);
        let ret = new paper.CompoundPath();
        let topmiddlepoint = new paper.Point(position[0], position[1] - length);
        let middlerightpoint = new paper.Point(position[0] + width, position[1]);
        let middleleftpoint = new paper.Point(position[0] - width, position[1]);
        let bottommiddlepoint = new paper.Point(position[0], position[1] + length);

        let toprightrect = new paper.Path.Rectangle(topmiddlepoint, middlerightpoint);

        ret.addChild(toprightrect);

        let bottomleftrect = new paper.Path.Rectangle(middleleftpoint, bottommiddlepoint);

        ret.addChild(bottomleftrect);

        ret.fillColor = color;
        return ret;
    }
}
