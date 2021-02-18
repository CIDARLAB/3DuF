import Template from "./template";
import paper, { CompoundPath } from "paper";
import ComponentPort from "../core/componentPort";
import { tokTypes } from "acorn";
import components from "@dagrejs/graphlib/lib/alg/components";

export default class ChemostatRing extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            flowChannelWidth: "Float",
            controlChannelWidth: "Float",
            chemostatChannelWidth: "Float",
            radius: "Float",
            rotation: "Float",
            volume: "Float",
            height: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            flowChannelWidth: 100,
            controlChannelWidth: 50,
            chemostatChannelWidth: 100,
            radius: 400,
            rotation: 0,
            volume: 30000000,
            height: 20
        };

        this.__units = {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            componentSpacing: "&mu;m",
            flowChannelWidth: "&mu;m",
            controlChannelWidth: "&mu;m",
            chemostatChannelWidth: "&mu;m",
            radius: "&mu;m",
            rotation: "&deg;",
            volume: "&mu;m3",
            height: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            flowChannelWidth: 0.1 * 1000,
            controlChannelWidth: 0.1 * 1000,
            chemostatChannelWidth: 0.2 * 1000,
            radius: 0.2 * 1000,
            rotation: 0,
            volume: 0.1 * 1000 * 1 * 1000 * 4 * 0.2 * 1000,
            height: 0.2 * 1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            flowChannelWidth: 0.3 * 10000,
            controlChannelWidth: 0.15 * 10000,
            chemostatChannelWidth: 0.5 * 10000,
            radius: 10000,
            rotation: 260,
            volume: 0.5 * 10000 * 10 * 1000 * 4 * 1 * 10000,
            height: 1 * 10000
        };

        this.__placementTool = "MultilayerPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            position: "position",
            componentSpacing: "componentSpacing",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            chemostatChannelWidth: "chemostatChannelWidth",
            radius: "radius",
            rotation: "rotation",
            volume: "volume",
            height: "height"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            flowChannelWidth: "flowChannelWidth",
            controlChannelWidth: "controlChannelWidth",
            chemostatChannelWidth: "chemostatChannelWidth",
            radius: "radius",
            rotation: "rotation",
            volume: "volume",
            height: "height"
        };

        this.__renderKeys = ["FLOW", "CONTROL"];

        this.__mint = "CHEMOSTAT RING";
    }

    getPorts(params) {
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let chemostatChannelWidth = params["chemostatChannelWidth"];
        let volume = params["volume"];
        let height = params["height"];
        let radius = params["radius"];

        let area = volume / height;
        let chemostatLength = area / (4 * chemostatChannelWidth);

        let controlSpacing = chemostatLength / 10;
        let controlendpoint = (-7 * chemostatLength) / 8;
        let bendDist = chemostatLength / 15;

        let ports = [];

        // flow
        ports.push(new ComponentPort(-chemostatLength / 3 - chemostatLength / 2, -chemostatLength / 3, "1", "FLOW"));
        ports.push(new ComponentPort(-chemostatLength / 3 - chemostatLength / 5, -chemostatLength / 3 - chemostatLength / 3, "2", "FLOW"));
        ports.push(new ComponentPort(-chemostatLength / 3 + chemostatLength / 5, -chemostatLength / 3 - chemostatLength / 3, "3", "FLOW"));
        ports.push(new ComponentPort(-chemostatLength / 3 + chemostatLength / 2, -chemostatLength / 3, "4", "FLOW"));
        // ports.push(new ComponentPort(chemostatChannelWidth + chemostatLength + 2 * chemostatLength/5, chemostatChannelWidth/2 + 7 * chemostatLength/11, "5", "FLOW"));

        // control
        // 1
        ports.push(new ComponentPort(-chemostatLength / 3 - chemostatLength / 5 - controlSpacing - radius, controlendpoint, "5", "CONTROL"));
        // 2
        ports.push(new ComponentPort(-chemostatLength / 3 - chemostatLength / 5 + 1.3 * radius, controlendpoint, "6", "CONTROL"));
        // 3
        ports.push(new ComponentPort(-chemostatLength / 3 - chemostatLength / 5 + 1.7 * radius, controlendpoint, "7", "CONTROL"));
        // 4
        ports.push(new ComponentPort(-chemostatLength / 3 + chemostatLength / 5 - controlSpacing - radius, controlendpoint, "8", "CONTROL"));
        // 5
        ports.push(new ComponentPort(-chemostatLength / 3 + chemostatLength / 5 + 1.3 * radius, controlendpoint, "9", "CONTROL"));
        // 6
        ports.push(new ComponentPort(-chemostatLength / 3 + chemostatLength / 5 + 1.7 * radius, controlendpoint, "10", "CONTROL"));

        let originx = chemostatChannelWidth / 2 + (3 * chemostatLength) / 7;
        let originy = chemostatChannelWidth / 2;

        // 7
        ports.push(new ComponentPort(originx - controlSpacing - 0.5 * radius, controlendpoint, "11", "CONTROL"));
        // 8
        ports.push(new ComponentPort(originx + 1.3 * radius, controlendpoint, "12", "CONTROL"));
        // 9
        ports.push(new ComponentPort(originx + 1.7 * radius, controlendpoint, "13", "CONTROL"));

        originx = (5 * chemostatLength) / 6;
        originy = chemostatChannelWidth / 2;

        // 10
        ports.push(new ComponentPort(originx - controlSpacing - 0.5 * radius, controlendpoint, "14", "CONTROL"));
        // 11
        ports.push(new ComponentPort(originx + 1.3 * radius, controlendpoint, "15", "CONTROL"));
        // 12
        ports.push(new ComponentPort(originx + 1.7 * radius, controlendpoint, "16", "CONTROL"));

        originx = chemostatChannelWidth / 2;
        originy = chemostatLength / 5;

        // 13
        ports.push(new ComponentPort(controlendpoint, originy - controlSpacing - 0.5 * radius, "17", "CONTROL"));
        // 14
        ports.push(new ComponentPort(controlendpoint, originy + 1.3 * radius, "18", "CONTROL"));
        // 15
        ports.push(new ComponentPort(controlendpoint, originy + 1.7 * radius, "19", "CONTROL"));

        originx = chemostatChannelWidth / 2;
        originy = chemostatLength / 5 + chemostatLength / 2;

        // 16
        ports.push(new ComponentPort(controlendpoint, originy - controlSpacing - 0.5 * radius, "20", "CONTROL"));
        // 17
        ports.push(new ComponentPort(controlendpoint, originy + 1.3 * radius, "21", "CONTROL"));
        // 18
        ports.push(new ComponentPort(controlendpoint, originy + 1.7 * radius, "22", "CONTROL"));

        originx = chemostatChannelWidth / 2 + chemostatLength;
        originy = chemostatChannelWidth / 2 + (2 * chemostatLength) / 5;

        // 19
        ports.push(new ComponentPort(2 * chemostatLength, originy - controlSpacing - 0.5 * radius, "23", "CONTROL"));
        // 20
        ports.push(new ComponentPort(2 * chemostatLength, originy + 1.3 * radius, "24", "CONTROL"));
        // 21
        ports.push(new ComponentPort(2 * chemostatLength, originy + 1.7 * radius, "25", "CONTROL"));

        originx = chemostatChannelWidth / 2 + chemostatLength;
        originy = chemostatChannelWidth / 2 + (4 * chemostatLength) / 5;

        // 22
        ports.push(new ComponentPort(2 * chemostatLength, originy - controlSpacing - 0.5 * radius, "26", "CONTROL"));
        // 23
        ports.push(new ComponentPort(2 * chemostatLength, originy + 1.3 * radius, "27", "CONTROL"));
        // 24
        ports.push(new ComponentPort(2 * chemostatLength, originy + 1.7 * radius, "28", "CONTROL"));

        originx = chemostatChannelWidth / 2 + chemostatLength / 4;
        originy = chemostatLength + chemostatChannelWidth / 2;

        // 25
        ports.push(new ComponentPort(originx - 0.3 * controlSpacing, 2 * chemostatLength, "29", "CONTROL"));
        // 26
        ports.push(new ComponentPort(originx + 0.5 * controlSpacing, 2 * chemostatLength, "30", "CONTROL"));
        // 27
        ports.push(new ComponentPort(originx + 0.4 * controlSpacing + 0.3 * controlSpacing, 2 * chemostatLength, "31", "CONTROL"));

        originx = chemostatChannelWidth / 2 + (3 * chemostatLength) / 7;
        originy = chemostatLength + chemostatChannelWidth / 2;

        // 28
        ports.push(new ComponentPort(originx - 0.3 * controlSpacing, 2 * chemostatLength, "32", "CONTROL"));
        // 29
        ports.push(new ComponentPort(originx - 0.5 * controlSpacing, 2 * chemostatLength, "33", "CONTROL"));
        // 30
        ports.push(new ComponentPort(originx + 0.3 * controlSpacing, 2 * chemostatLength, "34", "CONTROL"));

        // 31
        ports.push(new ComponentPort(originx + 0.55 * controlSpacing, 2 * chemostatLength, "35", "CONTROL"));
        // 32
        ports.push(new ComponentPort(originx + 0.85 * controlSpacing, 2 * chemostatLength, "36", "CONTROL"));
        // 33
        ports.push(new ComponentPort(originx + 1.15 * controlSpacing, 2 * chemostatLength, "37", "CONTROL"));

        originx = chemostatChannelWidth / 2 + (3 * chemostatLength) / 5;
        originy = chemostatLength + chemostatChannelWidth / 2;

        // 34
        ports.push(new ComponentPort(originx - 0.3 * controlSpacing, 2 * chemostatLength, "38", "CONTROL"));
        // 35
        ports.push(new ComponentPort(originx + 0.5 * controlSpacing, 2 * chemostatLength, "49", "CONTROL"));
        // 36
        ports.push(new ComponentPort(originx + 0.4 * controlSpacing + 0.3 * controlSpacing, 2 * chemostatLength, "40", "CONTROL"));
        return ports;
    }

    render2D(params, key) {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CONTROL") {
            return this.__drawControl(params);
        }
    }

    __drawFlow(params) {
        let x = params["position"][0];
        let y = params["position"][1];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let chemostatChannelWidth = params["chemostatChannelWidth"];
        let volume = params["volume"];
        let height = params["height"];
        let radius = params["radius"];
        let rotation = params["rotation"];
        let color = params["color"];
        let serp = new paper.CompoundPath();

        let area = volume / height;
        let chemostatLength = area / (4 * chemostatChannelWidth);

        //// chemostat ring

        // chemostat ring top
        let topLeft = new paper.Point(x + chemostatChannelWidth, y);
        let bottomRight = new paper.Point(x + chemostatChannelWidth + chemostatLength, y + chemostatChannelWidth);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // chemostat ring right
        topLeft = new paper.Point(x + chemostatLength, y + chemostatChannelWidth);
        bottomRight = new paper.Point(x + chemostatChannelWidth + chemostatLength, y + chemostatChannelWidth + chemostatLength);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // chemostat ring bottom
        topLeft = new paper.Point(x, y + chemostatLength);
        bottomRight = new paper.Point(x + chemostatLength, y + chemostatLength + chemostatChannelWidth);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // chemostat ring left
        topLeft = new paper.Point(x, y);
        bottomRight = new paper.Point(x + chemostatChannelWidth, y + chemostatLength);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in top left vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength / 4 - flowChannelWidth / 2, y + chemostatChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength / 4 + flowChannelWidth / 2, y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in top right vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 - flowChannelWidth / 2, y + chemostatChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 + flowChannelWidth / 2, y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in top right hori
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5, y + chemostatChannelWidth / 2 + chemostatLength / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength, y + chemostatChannelWidth / 2 + chemostatLength / 5 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in top bottom hori
        topLeft = new paper.Point(x + chemostatChannelWidth / 2, y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5, y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in middle left hori
        topLeft = new paper.Point(x + chemostatChannelWidth / 2, y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength / 4, y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 5 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in middle middle vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength / 4 - flowChannelWidth / 2, y + chemostatChannelWidth / 2 + chemostatLength / 2);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth / 2 + chemostatLength / 4 + flowChannelWidth / 2,
            y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in middle middle hori
        topLeft = new paper.Point(
            x + chemostatChannelWidth / 2 + chemostatLength / 4 - flowChannelWidth / 2,
            y + chemostatChannelWidth / 2 + chemostatLength / 2 - flowChannelWidth / 2
        );
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + (5 * chemostatLength) / 7, y + chemostatChannelWidth / 2 + chemostatLength / 2 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in top circle
        let center = new paper.Point(x + chemostatChannelWidth / 2 + (5 * chemostatLength) / 7, y + chemostatChannelWidth / 2 + chemostatLength / 2);
        let circ = new paper.Path.Circle(center, radius);
        serp.addChild(circ);

        // calc H
        let xval = Math.abs((5 * chemostatLength) / 7 - (3 * chemostatLength) / 5);
        let yval = Math.abs(chemostatChannelWidth / 2 + chemostatLength / 2 - (chemostatChannelWidth / 2 + (2 * chemostatLength) / 5));
        let hval = Math.sqrt(Math.pow(xval, 2) + Math.pow(yval, 2));
        let angt = (Math.asin(yval / hval) * 180) / Math.PI;

        // in tilt
        topLeft = new paper.Point(
            x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 - flowChannelWidth / 2,
            y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5 - flowChannelWidth / 2
        );
        bottomRight = new paper.Point(
            x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 - flowChannelWidth / 2 + hval,
            y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5 + flowChannelWidth / 2
        );
        serp.addChild(
            new paper.Path.Rectangle(topLeft, bottomRight).rotate(
                angt,
                new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5, y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5)
            )
        );

        // in circle bottom vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (5 * chemostatLength) / 7 - flowChannelWidth / 2, y + chemostatChannelWidth / 2 + chemostatLength / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + (5 * chemostatLength) / 7 + flowChannelWidth / 2, y + chemostatChannelWidth / 2 + (7 * chemostatLength) / 11);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in circle bottom hori
        topLeft = new paper.Point(
            x + chemostatChannelWidth / 2 + (5 * chemostatLength) / 7 - flowChannelWidth / 2,
            y + chemostatChannelWidth / 2 + (7 * chemostatLength) / 11 - flowChannelWidth / 2
        );
        bottomRight = new paper.Point(x + chemostatLength, y + chemostatChannelWidth / 2 + (7 * chemostatLength) / 11 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in bottom right vert
        topLeft = new paper.Point(x + (5 * chemostatLength) / 6 - flowChannelWidth / 2, y + chemostatChannelWidth / 2 + (7 * chemostatLength) / 11);
        bottomRight = new paper.Point(x + (5 * chemostatLength) / 6 + flowChannelWidth / 2, y + chemostatChannelWidth / 2 + chemostatLength);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in bottom middle vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 7 - flowChannelWidth / 2, y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 6);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 7 + flowChannelWidth / 2, y + chemostatChannelWidth / 2 + chemostatLength);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // in bottom circle
        center = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 7, y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 6);
        serp.addChild(new paper.Path.Circle(center, radius));

        //// stuff outside the ring

        // left top hori
        topLeft = new paper.Point(x - chemostatLength / 3, y + chemostatLength / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x, y + chemostatLength / 5 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left top vert
        topLeft = new paper.Point(x - chemostatLength / 3 - flowChannelWidth / 2, y - chemostatLength / 3);
        bottomRight = new paper.Point(x - chemostatLength / 3 + flowChannelWidth / 2, y + chemostatLength / 5 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left flow port hori bar
        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 2, y - chemostatLength / 3 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 2, y - chemostatLength / 3 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // horizontal circles
        // left
        // center = new paper.Point(x - chemostatLength/3 - chemostatLength/2, y - chemostatLength/3);
        // serp.addChild(new paper.Path.Circle(center, radius));
        // right
        // center = new paper.Point(x - chemostatLength/3 + chemostatLength/2, y - chemostatLength/3);
        // serp.addChild(new paper.Path.Circle(center, radius));

        // left flow port vert
        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - flowChannelWidth / 2, y - chemostatLength / 3 - chemostatLength / 3);
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + flowChannelWidth / 2, y - chemostatLength / 3);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right flow port vert
        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - flowChannelWidth / 2, y - chemostatLength / 3 - chemostatLength / 3);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + flowChannelWidth / 2, y - chemostatLength / 3);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top circles
        // left
        // center = new paper.Point(x - chemostatLength/3 - chemostatLength/5, y - chemostatLength/3 - chemostatLength/3);
        // serp.addChild(new paper.Path.Circle(center, radius));

        // right
        // center = new paper.Point(x - chemostatLength/3 + chemostatLength/5, y - chemostatLength/3 - chemostatLength/3);
        // serp.addChild(new paper.Path.Circle(center, radius));

        // left vert line that goes to bottom
        topLeft = new paper.Point(x - chemostatLength / 5 - flowChannelWidth / 2, y + chemostatLength / 5);
        bottomRight = new paper.Point(x - chemostatLength / 5 + flowChannelWidth / 2, y + chemostatLength + chemostatChannelWidth + chemostatLength / 5);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left middle hori
        topLeft = new paper.Point(x - chemostatLength / 5, y + chemostatLength / 5 + chemostatLength / 2 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x, y + chemostatLength / 5 + chemostatLength / 2 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom hori
        topLeft = new paper.Point(x - chemostatLength / 5 - flowChannelWidth / 2, y + chemostatLength + chemostatChannelWidth + chemostatLength / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5,
            y + chemostatLength + chemostatChannelWidth + chemostatLength / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom left vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength / 4 - flowChannelWidth / 2, y + chemostatLength + chemostatChannelWidth / 2);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth / 2 + chemostatLength / 4 + flowChannelWidth / 2,
            y + chemostatLength + chemostatChannelWidth + chemostatLength / 5
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom middle vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 - flowChannelWidth / 2, y + chemostatLength + chemostatChannelWidth / 2);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 + flowChannelWidth / 2,
            y + chemostatLength + chemostatChannelWidth + (2 * chemostatLength) / 5
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom right hori
        topLeft = new paper.Point(
            x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 5 - flowChannelWidth / 2,
            y + chemostatLength + chemostatChannelWidth + (2 * chemostatLength) / 5 - flowChannelWidth / 2
        );
        bottomRight = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + (2 * chemostatLength) / 5,
            y + chemostatLength + chemostatChannelWidth + (2 * chemostatLength) / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right bottom vert
        topLeft = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + (2 * chemostatLength) / 5 - flowChannelWidth / 2,
            y + chemostatChannelWidth / 2 + (7 * chemostatLength) / 11
        );
        bottomRight = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + (2 * chemostatLength) / 5 + flowChannelWidth / 2,
            y + chemostatLength + chemostatChannelWidth + (2 * chemostatLength) / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        center = new paper.Point(x + chemostatChannelWidth + chemostatLength + (2 * chemostatLength) / 5, y + chemostatChannelWidth / 2 + (7 * chemostatLength) / 11 - radius);
        serp.addChild(new paper.Path.Circle(center, radius));

        // right bottom hori
        topLeft = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + chemostatLength / 5,
            y + chemostatLength + chemostatChannelWidth + chemostatLength / 5 - flowChannelWidth / 2
        );
        bottomRight = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + (2 * chemostatLength) / 5,
            y + chemostatLength + chemostatChannelWidth + chemostatLength / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right vert that goes to top
        topLeft = new paper.Point(x + chemostatChannelWidth + chemostatLength + chemostatLength / 5 - flowChannelWidth / 2, y - chemostatLength / 5);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + chemostatLength / 5 + flowChannelWidth / 2,
            y + chemostatLength + chemostatChannelWidth + chemostatLength / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right middle hori
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength, y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + chemostatLength / 5,
            y + chemostatChannelWidth / 2 + (4 * chemostatLength) / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right top hori
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + chemostatLength, y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(
            x + chemostatChannelWidth + chemostatLength + chemostatLength / 5,
            y + chemostatChannelWidth / 2 + (2 * chemostatLength) / 5 + flowChannelWidth / 2
        );
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top hori
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 7, y - chemostatLength / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth + chemostatLength + chemostatLength / 5 + flowChannelWidth / 2, y - chemostatLength / 5 + flowChannelWidth / 2);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top left vert
        topLeft = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 7 - flowChannelWidth / 2, y - chemostatLength / 5 - flowChannelWidth / 2);
        bottomRight = new paper.Point(x + chemostatChannelWidth / 2 + (3 * chemostatLength) / 7 + flowChannelWidth / 2, y);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top right vert
        topLeft = new paper.Point(x + (5 * chemostatLength) / 6 - flowChannelWidth / 2, y - chemostatLength / 5);
        bottomRight = new paper.Point(x + (5 * chemostatLength) / 6 + flowChannelWidth / 2, y);
        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.rotate(rotation, new paper.Point(x, y));
        serp.fillColor = color;
        return serp;
    }

    __drawControl(params) {
        let x = params["position"][0];
        let y = params["position"][1];
        let flowChannelWidth = params["flowChannelWidth"];
        let controlChannelWidth = params["controlChannelWidth"];
        let chemostatChannelWidth = params["chemostatChannelWidth"];
        let volume = params["volume"];
        let height = params["height"];
        let radius = params["radius"];
        let rotation = params["rotation"];
        let color = params["color"];

        let area = volume / height;
        let chemostatLength = area / (4 * chemostatChannelWidth);

        let control = new paper.CompoundPath();

        let valvelength = 1.5 * chemostatChannelWidth;
        let valvewidth = 2 * controlChannelWidth;
        let controlSpacing = chemostatLength / 10;

        let controlendpoint = (-7 * chemostatLength) / 8;
        let bendDist = chemostatLength / 15;

        // 1
        let topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - controlChannelWidth / 2 - controlSpacing - radius, y + controlendpoint);
        let bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + controlChannelWidth / 2 - controlSpacing - radius, y - chemostatLength / 3 - bendDist);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(
            x - chemostatLength / 3 - chemostatLength / 5 - controlChannelWidth / 2 - controlSpacing - radius,
            y - chemostatLength / 3 - bendDist - controlChannelWidth / 2
        );
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - controlSpacing, y - chemostatLength / 3 - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(
            x - chemostatLength / 3 - chemostatLength / 5 - controlSpacing - controlChannelWidth / 2,
            y - chemostatLength / 3 - bendDist - controlChannelWidth / 2
        );
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - controlSpacing + controlChannelWidth / 2, y - chemostatLength / 3);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - controlSpacing - valvewidth / 2, y - chemostatLength / 3 - valvelength / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - controlSpacing + valvewidth / 2, y - chemostatLength / 3 + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 2
        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 - valvelength / 2, y - chemostatLength / 3 - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + valvelength / 2, y - chemostatLength / 3 - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5, y - chemostatLength / 3 - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + 1.3 * radius, y - chemostatLength / 3 - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + 1.3 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(
            x - chemostatLength / 3 - chemostatLength / 5 + 1.3 * radius + controlChannelWidth / 2,
            y - chemostatLength / 3 - controlSpacing + controlChannelWidth / 2
        );
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 3
        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + controlSpacing - valvewidth / 2, y - chemostatLength / 3 - valvelength / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + controlSpacing + valvewidth / 2, y - chemostatLength / 3 + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + controlSpacing - controlChannelWidth / 2, y - chemostatLength / 3 - bendDist);
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + controlSpacing + controlChannelWidth / 2, y - chemostatLength / 3);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(
            x - chemostatLength / 3 - chemostatLength / 5 + controlSpacing - controlChannelWidth / 2,
            y - chemostatLength / 3 - bendDist - controlChannelWidth / 2
        );
        bottomRight = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + 1.7 * radius, y - chemostatLength / 3 - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 - chemostatLength / 5 + 1.7 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(
            x - chemostatLength / 3 - chemostatLength / 5 + 1.7 * radius + controlChannelWidth / 2,
            y - chemostatLength / 3 - bendDist + controlChannelWidth / 2
        );
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 4
        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - controlChannelWidth / 2 - controlSpacing - radius, y + controlendpoint);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + controlChannelWidth / 2 - controlSpacing - radius, y - chemostatLength / 3 - bendDist);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(
            x - chemostatLength / 3 + chemostatLength / 5 - controlChannelWidth / 2 - controlSpacing - radius,
            y - chemostatLength / 3 - bendDist - controlChannelWidth / 2
        );
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - controlSpacing, y - chemostatLength / 3 - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(
            x - chemostatLength / 3 + chemostatLength / 5 - controlSpacing - controlChannelWidth / 2,
            y - chemostatLength / 3 - bendDist - controlChannelWidth / 2
        );
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - controlSpacing + controlChannelWidth / 2, y - chemostatLength / 3);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - controlSpacing - valvewidth / 2, y - chemostatLength / 3 - valvelength / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - controlSpacing + valvewidth / 2, y - chemostatLength / 3 + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 5
        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 - valvelength / 2, y - chemostatLength / 3 - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + valvelength / 2, y - chemostatLength / 3 - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5, y - chemostatLength / 3 - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + 1.3 * radius, y - chemostatLength / 3 - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + 1.3 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(
            x - chemostatLength / 3 + chemostatLength / 5 + 1.3 * radius + controlChannelWidth / 2,
            y - chemostatLength / 3 - controlSpacing + controlChannelWidth / 2
        );
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 6
        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + controlSpacing - valvewidth / 2, y - chemostatLength / 3 - valvelength / 2);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + controlSpacing + valvewidth / 2, y - chemostatLength / 3 + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + controlSpacing - controlChannelWidth / 2, y - chemostatLength / 3 - bendDist);
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + controlSpacing + controlChannelWidth / 2, y - chemostatLength / 3);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(
            x - chemostatLength / 3 + chemostatLength / 5 + controlSpacing - controlChannelWidth / 2,
            y - chemostatLength / 3 - bendDist - controlChannelWidth / 2
        );
        bottomRight = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + 1.7 * radius, y - chemostatLength / 3 - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x - chemostatLength / 3 + chemostatLength / 5 + 1.7 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(
            x - chemostatLength / 3 + chemostatLength / 5 + 1.7 * radius + controlChannelWidth / 2,
            y - chemostatLength / 3 - bendDist + controlChannelWidth / 2
        );
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top left vert
        let originx = chemostatChannelWidth / 2 + (3 * chemostatLength) / 7;
        let originy = chemostatChannelWidth / 2;
        // 7
        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - controlSpacing - 0.5 * radius, y + controlendpoint);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 - controlSpacing - 0.5 * radius, y + originy - bendDist);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - controlSpacing - 0.5 * radius, y + originy - bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing, y + originy - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlSpacing - controlChannelWidth / 2, y + originy - bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + controlChannelWidth / 2, y + originy);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 8
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 1.3 * radius, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 1.3 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(x + originx + 1.3 * radius + controlChannelWidth / 2, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 9
        topLeft = new paper.Point(x + originx + controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy - bendDist);
        bottomRight = new paper.Point(x + originx + controlSpacing + controlChannelWidth / 2, y + originy);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy - bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 1.7 * radius, y + originy - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 1.7 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(x + originx + 1.7 * radius + controlChannelWidth / 2, y + originy - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // top right vert
        originx = (5 * chemostatLength) / 6;
        originy = chemostatChannelWidth / 2;
        // 10
        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - controlSpacing - 0.5 * radius, y + controlendpoint);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 - controlSpacing - 0.5 * radius, y + originy - bendDist);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - controlSpacing - 0.5 * radius, y + originy - bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing, y + originy - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlSpacing - controlChannelWidth / 2, y + originy - bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + controlChannelWidth / 2, y + originy);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 11
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 1.3 * radius, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 1.3 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(x + originx + 1.3 * radius + controlChannelWidth / 2, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 12
        topLeft = new paper.Point(x + originx + controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy - bendDist);
        bottomRight = new paper.Point(x + originx + controlSpacing + controlChannelWidth / 2, y + originy);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy - bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 1.7 * radius, y + originy - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 1.7 * radius - controlChannelWidth / 2, y + controlendpoint);
        bottomRight = new paper.Point(x + originx + 1.7 * radius + controlChannelWidth / 2, y + originy - bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left top
        originx = chemostatChannelWidth / 2;
        originy = chemostatLength / 5;

        // 13
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist - controlChannelWidth / 2, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist - controlChannelWidth / 2, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx - bendDist + controlChannelWidth / 2, y + originy - controlSpacing);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + controlendpoint, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx - bendDist, y + originy + controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 14
        topLeft = new paper.Point(x + originx - controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx - controlSpacing + controlChannelWidth / 2, y + originy + 1.3 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + controlendpoint, y + originy + 1.3 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + controlChannelWidth / 2, y + originy + 1.3 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 15
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy + controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy + controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy + controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist - controlChannelWidth / 2, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - bendDist + controlChannelWidth / 2, y + originy + 1.7 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + controlendpoint, y + originy + 1.7 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - bendDist + controlChannelWidth / 2, y + originy + 1.7 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left bottom
        originx = chemostatChannelWidth / 2;
        originy = chemostatLength / 5 + chemostatLength / 2;

        // 16
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist - controlChannelWidth / 2, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist - controlChannelWidth / 2, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx - bendDist + controlChannelWidth / 2, y + originy - controlSpacing);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + controlendpoint, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx - bendDist, y + originy + controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 17
        topLeft = new paper.Point(x + originx - controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx - controlSpacing + controlChannelWidth / 2, y + originy + 1.3 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + controlendpoint, y + originy + 1.3 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - controlSpacing + controlChannelWidth / 2, y + originy + 1.3 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 18
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy + controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy + controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy + controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - bendDist - controlChannelWidth / 2, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - bendDist + controlChannelWidth / 2, y + originy + 1.7 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + controlendpoint, y + originy + 1.7 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - bendDist + controlChannelWidth / 2, y + originy + 1.7 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right top
        originx = chemostatChannelWidth / 2 + chemostatLength;
        originy = chemostatChannelWidth / 2 + (2 * chemostatLength) / 5;

        // 19
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx + bendDist + controlChannelWidth / 2, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * chemostatLength, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx + bendDist, y + originy + controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 20
        topLeft = new paper.Point(x + originx + controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + controlSpacing + controlChannelWidth / 2, y + originy + 1.3 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * chemostatLength, y + originy + 1.3 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy + 1.3 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 21
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy + controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy + controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy + controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + bendDist + controlChannelWidth / 2, y + originy + 1.7 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * chemostatLength, y + originy + 1.7 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy + 1.7 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // right bottom
        originx = chemostatChannelWidth / 2 + chemostatLength;
        originy = chemostatChannelWidth / 2 + (4 * chemostatLength) / 5;

        // 22
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx + bendDist + controlChannelWidth / 2, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * chemostatLength, y + originy - controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        bottomRight = new paper.Point(x + originx + bendDist, y + originy + controlChannelWidth / 2 - controlSpacing - 0.5 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 23
        topLeft = new paper.Point(x + originx + controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + controlSpacing + controlChannelWidth / 2, y + originy + 1.3 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * chemostatLength, y + originy + 1.3 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + controlSpacing - controlChannelWidth / 2, y + originy + 1.3 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 24
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy + controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy + controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx, y + originy + controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + bendDist + controlChannelWidth / 2, y + originy + 1.7 * radius);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + 2 * chemostatLength, y + originy + 1.7 * radius - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + bendDist - controlChannelWidth / 2, y + originy + 1.7 * radius + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom left
        originx = chemostatChannelWidth / 2 + chemostatLength / 4;
        originy = chemostatLength + chemostatChannelWidth / 2;

        // 25
        topLeft = new paper.Point(x + originx - 0.3 * controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - 0.3 * controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - 0.3 * controlSpacing, y + originy);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 - 0.3 * controlSpacing, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 26
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy + controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy + controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 0.5 * controlSpacing, y + originy + controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.5 * controlSpacing - controlChannelWidth / 2, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 0.5 * controlSpacing + controlChannelWidth / 2, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 27
        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + controlChannelWidth / 2, y + originy + bendDist);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - controlChannelWidth / 2, y + originy + bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + 0.4 * controlSpacing, y + originy + bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 + 0.4 * controlSpacing + 0.3 * controlSpacing, y + originy - controlChannelWidth / 2 + bendDist);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 + 0.4 * controlSpacing + 0.3 * controlSpacing, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom middle
        originx = chemostatChannelWidth / 2 + (3 * chemostatLength) / 7;
        originy = chemostatLength + chemostatChannelWidth / 2;

        // 28
        topLeft = new paper.Point(x + originx - 0.3 * controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - 0.3 * controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - 0.3 * controlSpacing, y + originy);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 - 0.3 * controlSpacing, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 29
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy - controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy - controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - 0.5 * controlSpacing, y + originy - controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - 0.5 * controlSpacing - controlChannelWidth / 2, y + originy - controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx - 0.5 * controlSpacing + controlChannelWidth / 2, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 30
        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 + 0.3 * controlSpacing, y + originy);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 + 0.3 * controlSpacing, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 31
        topLeft = new paper.Point(x + originx + 0.55 * controlSpacing - valvewidth / 2, y + originy - valvelength);
        bottomRight = new paper.Point(x + originx + 0.55 * controlSpacing + valvewidth / 2, y + originy + valvelength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.55 * controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + 0.55 * controlSpacing + controlChannelWidth / 2, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 32
        topLeft = new paper.Point(x + originx + 0.85 * controlSpacing - valvewidth / 2, y + originy - valvelength);
        bottomRight = new paper.Point(x + originx + 0.85 * controlSpacing + valvewidth / 2, y + originy + valvelength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.85 * controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + 0.85 * controlSpacing + controlChannelWidth / 2, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 33
        topLeft = new paper.Point(x + originx + 1.15 * controlSpacing - valvewidth / 2, y + originy - valvelength);
        bottomRight = new paper.Point(x + originx + 1.15 * controlSpacing + valvewidth / 2, y + originy + valvelength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 1.15 * controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + 1.15 * controlSpacing + controlChannelWidth / 2, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom right
        originx = chemostatChannelWidth / 2 + (3 * chemostatLength) / 5;
        originy = chemostatLength + chemostatChannelWidth / 2;

        // 34
        topLeft = new paper.Point(x + originx - 0.3 * controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx - 0.3 * controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 - 0.3 * controlSpacing, y + originy);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 - 0.3 * controlSpacing, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 35
        topLeft = new paper.Point(x + originx - valvelength / 2, y + originy + controlSpacing - valvewidth / 2);
        bottomRight = new paper.Point(x + originx + valvelength / 2, y + originy + controlSpacing + valvewidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 0.5 * controlSpacing, y + originy + controlSpacing + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.5 * controlSpacing - controlChannelWidth / 2, y + originy + controlSpacing - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 0.5 * controlSpacing + controlChannelWidth / 2, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // 36
        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - valvewidth / 2, y + originy - valvelength / 2);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + valvewidth / 2, y + originy + valvelength / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - controlChannelWidth / 2, y + originy);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + controlChannelWidth / 2, y + originy + bendDist);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx + 0.3 * controlSpacing - controlChannelWidth / 2, y + originy + bendDist - controlChannelWidth / 2);
        bottomRight = new paper.Point(x + originx + 0.3 * controlSpacing + 0.4 * controlSpacing, y + originy + bendDist + controlChannelWidth / 2);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        topLeft = new paper.Point(x + originx - controlChannelWidth / 2 + 0.4 * controlSpacing + 0.3 * controlSpacing, y + originy - controlChannelWidth / 2 + bendDist);
        bottomRight = new paper.Point(x + originx + controlChannelWidth / 2 + 0.4 * controlSpacing + 0.3 * controlSpacing, y + 2 * chemostatLength);
        control.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        control.rotate(rotation, new paper.Point(x, y));
        control.fillColor = color;
        return control;
    }

    render2DTarget(key, params) {
        let serp = this.__drawFlow(params);
        serp.addChild(this.__drawControl(params));

        serp.fillColor.alpha = 0.5;
        return serp;
    }
}
