import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class CellTrapS extends Template{
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
            height: "Float",
            channelWidth: "Float",
            channelLength: "Float",
            chamberWidth: "Float",
            chamberLength: "Float",
            chamberHeight: "Float",
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            channelWidth: 1 * 1000,
            channelLength: 4 * 1000,
            chamberWidth: 2.5 * 1000,
            chamberLength: 2.5 * 1000,
            chamberHeight: 250
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            channelWidth: "&mu;m",
            channelLength: "&mu;m",
            chamberWidth: "&mu;m",
            chamberLength: "&mu;m",
            chamberHeight: "&mu;m",
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            channelWidth: 0.5 * 1000,
            channelLength: 2.5 * 1000,
            chamberWidth: 1.5 * 1000,
            chamberLength: 1.5 * 1000,
            chamberHeight: 10
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            channelWidth: 2 * 1000,
            channelLength: 6 * 1000,
            chamberWidth: 4 * 1000,
            chamberLength: 4 * 1000,
            chamberHeight: 1200
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            height: "height",
            channelWidth: "channelWidth",
            channelLength: "channelLength",
            chamberWidth: "chamberWidth",
            chamberLength: "chamberLength",
            chamberHeight: "chamberHeight",
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            height: "height",
            channelWidth: "channelWidth",
            channelLength: "channelLength",
            chamberWidth: "chamberWidth",
            chamberLength: "chamberLength",
            chamberHeight: "chamberHeight",
        };

        this.__placementTool = "CellPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CELL"];

        this.__mint = "SQUARE CELL TRAP";
    }

    getPorts(params) {
        let channelLength = params["channelLength"];

        let ports = [];

        ports.push(new ComponentPort(- channelLength/2, 0, "1", "FLOW"));

        ports.push(new ComponentPort(channelLength/2, 0, "2", "FLOW"));

        ports.push(new ComponentPort(0, - channelLength/2, "3", "FLOW"));

        ports.push(new ComponentPort(0, channelLength/2, "4", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        if (key == "FLOW") {
            return this.__drawFlow(params);
        } else if (key == "CELL") {
            return this.__drawCell(params);
        }
    }

    render2DTarget(key, params) {
        let traps = this.__drawFlow(params);
        traps.addChild(this.__drawCell(params));

        traps.fillColor.alpha = 0.5;

        return traps;
    }

    __drawFlow(params) {
        let rotation = params["rotation"];
        let position = params["position"];
        let color = params["color"];
        let x = position[0];
        let y = position[1];
        let channelWidth = params["channelWidth"];
        let channelLength = params["channelLength"];

        let traps = new paper.CompoundPath();

        // horizontal channel
        let topLeft = new paper.Point(x - channelLength/2, y - channelWidth/2);
        let bottomRight = new paper.Point(x + channelLength/2, y + channelWidth/2);

        traps.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // vertical channel
        topLeft = new paper.Point(x - channelWidth/2, y - channelLength/2);
        bottomRight = new paper.Point(x + channelWidth/2, y + channelLength/2);

        traps.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        traps.fillColor = color;

        traps.rotate(rotation, new paper.Point(x, y));

        return traps;
    }

    __drawCell(params) {
        let rotation = params["rotation"];
        let color = params["color"];
        let position = params["position"];
        let x = position[0];
        let y = position[1];
        let chamberWidth = params["chamberWidth"];
        let chamberLength = params["chamberLength"];

        let chamberList = new paper.CompoundPath();

        // chamber
        let topLeft = new paper.Point(x - chamberWidth/2, y - chamberLength/2);
        let bottomRight = new paper.Point(x + chamberWidth/2, y + chamberLength/2);

        chamberList.addChild(new paper.Path.Rectangle(topLeft, bottomRight));
        
        chamberList.fillColor = color;
        chamberList.rotate(rotation, new paper.Point(x, y));

        return chamberList;
    }
}