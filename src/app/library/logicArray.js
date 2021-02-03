import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class LogicArray extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            chamberWidth: "Float",
            height: "Float",
            chamberLength: "Float",
            flowChannelWidth: "Float",
            controlChannelWidth: "Float",
            portRadius: "Float",
            rotation: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            height: 1.1 * 1000,
            chamberWidth: 1.5 * 1000,
            chamberLength: 1.5 * 1000,
            flowChannelWidth: 0.6 * 1000,
            controlChannelWidth: 0.4 * 1000,
            portRadius: 1000,
            rotation: 0
        };

        this.__units = {
            componentSpacing: "&mu;m",
            chamberWidth: "&mu;m",
            chamberLength: "&mu;m",
            flowChannelWidth: "&mu;m",
            controlChannelWidth: "&mu;m",
            portRadius: "&mu;m",
            height: "&mu;m",
            rotation: "&deg;"
        };

        this.__minimum = {
            componentSpacing: 0,
            height: 1,
            chamberWidth: 1,
            chamberLength: 1,
            flowChannelWidth: 1,
            controlChannelWidth: 1,
            portRadius: 1,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            height: 1.1 * 10000,
            chamberWidth: 10000,
            chamberLength: 10000,
            flowChannelWidth: 10000,
            controlChannelWidth: 10000,
            portRadius: 10000,
            rotation: 360
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            chamberWidth: "chamberWidth",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            portRadius: "portRadius",
            chamberLength: "chamberLength",
            height: "height",
            position: "position",
            rotation: "rotation"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            chamberWidth: "chamberWidth",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            portRadius: "portRadius",
            chamberLength: "chamberLength",
            height: "height",
            rotation: "rotation"
        };

        this.__renderKeys = ["FLOW", "CONTROL", "CELL"];

        this.__mint = "LOGIC ARRAY";
    }

    render2D(params, key) {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        } else if (key === "CELL") {
            console.log("cell");
            return this.__drawCell(params);
        }
        return box;
    }

    __drawFlow(params) {
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let spacing = params["componentSpacing"];
        let chamberWidth = params["chamberWidth"];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let portRadius = params["portRadius"];
        let chamberLength = params["chamberLength"];
        let rotation = params["rotation"];

        let ret = new paper.CompoundPath();
        let topDistance = 14 * spacing;
        let inWidth = 5 * spacing;
        let pathLength = 20 * spacing;
        let extraLength = 2 * spacing;

        // middle path
        let topLeft = new paper.Point(x, y - flowChannelWidth / 2);
        let bottomRight = new paper.Point(x + pathLength, y + flowChannelWidth / 2);

        let rec = new paper.Path.Rectangle(topLeft, bottomRight);

        //// left
        topLeft = new paper.Point(x + (2 * inWidth) / 3 - controlChannelWidth, y - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + (2 * inWidth) / 3 + controlChannelWidth, y + flowChannelWidth / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second left
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth, y - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth, y + flowChannelWidth / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// right
        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth, y - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth, y + flowChannelWidth / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        // top part ** cut
        topLeft = new paper.Point(x, y - topDistance - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth, y - topDistance + flowChannelWidth / 2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        topLeft = new paper.Point(x + inWidth / 3 - controlChannelWidth, y - topDistance - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth / 3 + controlChannelWidth, y - topDistance + flowChannelWidth / 2 + controlChannelWidth);

        let cutrec = new paper.Path.Rectangle(topLeft, bottomRight);

        rec = rec.subtract(cutrec);

        ret.addChild(rec);

        topLeft = new paper.Point(x + inWidth - flowChannelWidth / 2, y - topDistance - topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + flowChannelWidth / 2, y - topDistance + topDistance / 2);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth, y - topDistance - topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength, y - topDistance - topDistance / 2 + flowChannelWidth);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength - flowChannelWidth, y - topDistance - topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength, y - topDistance + topDistance / 2);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top part bottom line ** cut for control
        topLeft = new paper.Point(x + inWidth, y - topDistance + topDistance / 2 - flowChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength, y - topDistance + topDistance / 2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        //// left
        topLeft = new paper.Point(x + pathLength / 2 - extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 - extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second left
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second right
        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// right
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        // bottom part ** cut
        topLeft = new paper.Point(x, y + topDistance + flowChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth, y + topDistance - flowChannelWidth / 2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        topLeft = new paper.Point(x + inWidth / 3 - controlChannelWidth, y + topDistance - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth / 3 + controlChannelWidth, y + topDistance + flowChannelWidth / 2 + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        topLeft = new paper.Point(x + inWidth - flowChannelWidth / 2, y + topDistance + topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + flowChannelWidth / 2, y + topDistance - topDistance / 2);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth, y + topDistance + topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength, y + topDistance + topDistance / 2 - flowChannelWidth);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength - flowChannelWidth, y + topDistance + topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength, y + topDistance - topDistance / 2);

        ret.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom part top line ** cut for control
        topLeft = new paper.Point(x + inWidth, y + topDistance - topDistance / 2 + flowChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength, y + topDistance - topDistance / 2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        //// left
        topLeft = new paper.Point(x + pathLength / 2 - extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 - extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second left
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second right
        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// right
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        // insde middle ** cut
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - flowChannelWidth / 2, y - topDistance / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + flowChannelWidth / 2, y + topDistance / 2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        //// top
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y - topDistance / 2 + 4 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y - topDistance / 2 + 4 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// bottom
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y + topDistance / 2 - 4 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y + topDistance / 2 - 4 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        // inside left ** cut
        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2, y - topDistance - topDistance / 4);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2, y + topDistance + topDistance / 4);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        //// top
        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y - topDistance / 2 - 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y - topDistance / 2 - 5 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second top
        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y - topDistance / 2 + 3 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y - topDistance / 2 + 3 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second bottom
        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y + topDistance / 2 - 3 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y + topDistance / 2 - 3 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// bottom
        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y + topDistance / 2 + 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y + topDistance / 2 + 5 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        let circ = new paper.Path.Circle(new paper.Point(x + pathLength / 2, y - topDistance - topDistance / 4), portRadius);

        ret.addChild(circ);

        circ = new paper.Path.Circle(new paper.Point(x + pathLength / 2, y + topDistance + topDistance / 4), portRadius);

        ret.addChild(circ);

        // inside right ** cut
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth, y - topDistance - topDistance / 4);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2, y + topDistance + topDistance / 4);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        //// top
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y - topDistance / 2 - 2 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y - topDistance / 2 - 2 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second top
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y - topDistance / 2 + 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y - topDistance / 2 + 5 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// second bottom
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y + topDistance / 2 - 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y + topDistance / 2 - 5 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        //// bottom
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y + topDistance / 2 + 2 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y + topDistance / 2 + 2 * spacing + controlChannelWidth);
        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
        ret.addChild(rec);

        circ = new paper.Path.Circle(new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth / 2, y - topDistance - topDistance / 4), portRadius);

        ret.addChild(circ);

        circ = new paper.Path.Circle(new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth / 2, y + topDistance + topDistance / 4), portRadius);

        ret.addChild(circ);

        ret.fillColor = color;
        ret.rotate(rotation, new paper.Point(x, y));
        return ret;
    }

    __drawControl(params) {
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let spacing = params["componentSpacing"];
        let chamberWidth = params["chamberWidth"];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let portRadius = params["portRadius"];
        let chamberLength = params["chamberLength"];
        let rotation = params["rotation"];

        let ret = new paper.CompoundPath();
        let topDistance = 14 * spacing;
        let inWidth = 5 * spacing;
        let pathLength = 20 * spacing;

        let extraLength = 2 * spacing;

        let control = new paper.CompoundPath();

        // control 24
        let topLeft = new paper.Point(x + inWidth / 3 - controlChannelWidth / 2, y - topDistance - topDistance / 2 - extraLength);
        let bottomRight = new paper.Point(x + inWidth / 3 + controlChannelWidth / 2, y - topDistance);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth / 3 - controlChannelWidth, y - topDistance - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth / 3 + controlChannelWidth, y - topDistance + flowChannelWidth / 2 + controlChannelWidth);

        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // cnotrol 25
        topLeft = new paper.Point(x + (2 * inWidth) / 3 - controlChannelWidth / 2, y - topDistance - topDistance / 2 - extraLength);
        bottomRight = new paper.Point(x + (2 * inWidth) / 3 + controlChannelWidth / 2, y);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + (2 * inWidth) / 3 - controlChannelWidth, y - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + (2 * inWidth) / 3 + controlChannelWidth, y + flowChannelWidth / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 26
        topLeft = new paper.Point(x + inWidth / 3 - controlChannelWidth / 2, y + topDistance + topDistance / 2 + extraLength);
        bottomRight = new paper.Point(x + inWidth / 3 + controlChannelWidth / 2, y + topDistance);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth / 3 - controlChannelWidth, y + topDistance - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth / 3 + controlChannelWidth, y + topDistance + flowChannelWidth / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 8
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth / 2, y - topDistance / 2 - 2 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 - 2 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y - topDistance / 2 - 2 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y - topDistance / 2 - 2 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 7
        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength, y - topDistance / 2 - 3 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 - 3 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth / 2, y - topDistance / 2 - 3 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth / 2, y - topDistance / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 6
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength, y - topDistance / 2 - 4 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 - 4 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth / 2, y - topDistance / 2 - 4 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth / 2, y - topDistance / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 5
        topLeft = new paper.Point(x + pathLength / 2, y - topDistance / 2 - 5 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 - 5 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y - topDistance / 2 - 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y - topDistance / 2 - 5 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 4
        topLeft = new paper.Point(x + pathLength / 2 - extraLength, y - topDistance / 2 - 6 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 - 6 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - extraLength - controlChannelWidth / 2, y - topDistance / 2 - 6 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + pathLength / 2 - extraLength + controlChannelWidth / 2, y - topDistance / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 - extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 19
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth / 2, y + topDistance / 2 + 2 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 + 2 * spacing - controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y + topDistance / 2 + 2 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y + topDistance / 2 + 2 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 20
        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength, y + topDistance / 2 + 3 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 + 3 * spacing - controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth / 2, y + topDistance / 2 + 3 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth / 2, y + topDistance / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 21
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength, y + topDistance / 2 + 4 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 + 4 * spacing - controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth / 2, y + topDistance / 2 + 4 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth / 2, y + topDistance / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 22
        topLeft = new paper.Point(x + pathLength / 2, y + topDistance / 2 + 5 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 + 5 * spacing - controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y + topDistance / 2 + 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y + topDistance / 2 + 5 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 23
        topLeft = new paper.Point(x + pathLength / 2 - extraLength, y + topDistance / 2 + 6 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 + 6 * spacing - controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - extraLength - controlChannelWidth / 2, y + topDistance / 2 + 6 * spacing + controlChannelWidth / 2);
        bottomRight = new paper.Point(x + pathLength / 2 - extraLength + controlChannelWidth / 2, y + topDistance / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 - extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 9
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength, y - topDistance / 2 + 2 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 + 2 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength - controlChannelWidth / 2, y - topDistance / 2);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength + controlChannelWidth / 2, y - topDistance / 2 + 2 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength - controlChannelWidth, y - topDistance / 2 - flowChannelWidth - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength + controlChannelWidth, y - topDistance / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 18
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength, y + topDistance / 2 - 2 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 - 2 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength - controlChannelWidth / 2, y + topDistance / 2);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength + controlChannelWidth / 2, y + topDistance / 2 - 2 * spacing - controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength - controlChannelWidth, y + topDistance / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + extraLength + controlChannelWidth, y + topDistance / 2 + flowChannelWidth + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 10
        topLeft = new paper.Point(x + pathLength / 2, y - topDistance / 2 + 3 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 + 3 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y - topDistance / 2 + 3 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y - topDistance / 2 + 3 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 17
        topLeft = new paper.Point(x + pathLength / 2, y + topDistance / 2 - 3 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 - 3 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y + topDistance / 2 - 3 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y + topDistance / 2 - 3 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 11
        topLeft = new paper.Point(x + inWidth + pathLength / 2, y - topDistance / 2 + 4 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 + 4 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y - topDistance / 2 + 4 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y - topDistance / 2 + 4 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 16
        topLeft = new paper.Point(x + inWidth + pathLength / 2, y + topDistance / 2 - 4 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 - 4 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - flowChannelWidth / 2 - controlChannelWidth, y + topDistance / 2 - 4 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + flowChannelWidth / 2 + controlChannelWidth, y + topDistance / 2 - 4 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 12
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2, y - topDistance / 2 + 5 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 + 5 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y - topDistance / 2 + 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y - topDistance / 2 + 5 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 15
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2, y + topDistance / 2 - 5 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 - 5 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - flowChannelWidth - controlChannelWidth, y + topDistance / 2 - 5 * spacing - controlChannelWidth);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + controlChannelWidth, y + topDistance / 2 - 5 * spacing + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 13
        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength, y - topDistance / 2 + 6 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y - topDistance / 2 + 6 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth / 2, y - topDistance / 2 + 6 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth / 2, y + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 - extraLength - controlChannelWidth, y - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 - extraLength + controlChannelWidth, y + flowChannelWidth / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // control 14
        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength, y + topDistance / 2 - 6 * spacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + inWidth + pathLength + extraLength, y + topDistance / 2 - 6 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth / 2, y);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth / 2, y + topDistance / 2 - 6 * spacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + inWidth + pathLength / 2 + extraLength - controlChannelWidth, y - flowChannelWidth / 2 - controlChannelWidth);
        bottomRight = new paper.Point(x + inWidth + pathLength / 2 + extraLength + controlChannelWidth, y + flowChannelWidth / 2 + controlChannelWidth);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        control.fillColor = color;
        control.rotate(rotation, new paper.Point(x, y));

        return control;
    }

    getPorts(params) {
        let ports = [];
        let chamberWidth = params["chamberWidth"];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let portRadius = params["portRadius"];
        let chamberLength = params["chamberLength"];
        let rotation = params["rotation"];
        let spacing = params["componentSpacing"];

        let topDistance = 14 * spacing;
        let inWidth = 5 * spacing;
        let pathLength = 20 * spacing;

        let extraLength = 2 * spacing;

        // flow
        ports.push(new ComponentPort(0, -topDistance, "1", "FLOW"));
        ports.push(new ComponentPort(0, 0, "2", "FLOW"));
        ports.push(new ComponentPort(0, topDistance, "3", "FLOW"));

        // control
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 - 6 * spacing, "4", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 - 5 * spacing, "5", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 - 4 * spacing, "6", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 - 3 * spacing, "7", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 - 2 * spacing, "8", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 + 2 * spacing, "9", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 + 3 * spacing, "10", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 + 4 * spacing, "11", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 + 5 * spacing, "12", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, -topDistance / 2 + 6 * spacing, "13", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 - 6 * spacing, "14", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 - 5 * spacing, "15", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 - 4 * spacing, "16", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 - 3 * spacing, "17", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 - 2 * spacing, "18", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 + 2 * spacing, "19", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 + 3 * spacing, "20", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 + 4 * spacing, "21", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 + 5 * spacing, "22", "CONTROL"));
        ports.push(new ComponentPort(inWidth + pathLength + extraLength, topDistance / 2 + 6 * spacing, "23", "CONTROL"));
        ports.push(new ComponentPort(inWidth / 3, -topDistance - topDistance / 2 - extraLength, "24", "CONTROL"));
        ports.push(new ComponentPort((2 * inWidth) / 3, -topDistance - topDistance / 2 - extraLength, "25", "CONTROL"));
        ports.push(new ComponentPort(inWidth / 3, topDistance + topDistance / 2 + extraLength, "26", "CONTROL"));

        return ports;
    }

    __drawCell(params) {
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let spacing = params["componentSpacing"];
        let chamberWidth = params["chamberWidth"];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let portRadius = params["portRadius"];
        let chamberLength = params["chamberLength"];
        let rotation = params["rotation"];

        let ret = new paper.CompoundPath();
        let topDistance = 14 * spacing;
        let inWidth = 5 * spacing;
        let pathLength = 20 * spacing;

        let extraLength = 2 * spacing;

        let cell = new paper.CompoundPath();

        // top left
        let topLeft = new paper.Point(x + pathLength / 2 - chamberWidth / 2, y - topDistance / 2 - chamberLength / 2 - flowChannelWidth / 2);
        let bottomRight = new paper.Point(x + pathLength / 2 + chamberWidth / 2, y - topDistance / 2 + chamberLength / 2 - flowChannelWidth / 2);
        cell.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top right
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - chamberWidth / 2 - flowChannelWidth / 2, y - topDistance / 2 - chamberLength / 2 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + chamberWidth / 2 - flowChannelWidth / 2, y - topDistance / 2 + chamberLength / 2 - flowChannelWidth / 2);
        cell.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom left
        topLeft = new paper.Point(x + pathLength / 2 - chamberWidth / 2, y + topDistance / 2 - chamberLength / 2 + flowChannelWidth / 2);
        bottomRight = new paper.Point(x + pathLength / 2 + chamberWidth / 2, y + topDistance / 2 + chamberLength / 2 + flowChannelWidth / 2);
        cell.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top right
        topLeft = new paper.Point(x + 2 * inWidth + pathLength / 2 - chamberWidth / 2 - flowChannelWidth / 2, y + topDistance / 2 - chamberLength / 2 + flowChannelWidth / 2);
        bottomRight = new paper.Point(x + 2 * inWidth + pathLength / 2 + chamberWidth / 2 - flowChannelWidth / 2, y + topDistance / 2 + chamberLength / 2 + flowChannelWidth / 2);
        cell.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        cell.fillColor = color;
        cell.rotate(rotation, new paper.Point(x, y));

        return cell;
    }

    render2DTarget(key, params) {
        let render = this.__drawFlow(params);
        render.addChild(this.__drawControl(params));
        render.addChild(this.__drawCell(params));

        render.fillColor.alpha = 0.5;
        return render;
    }
}
