import Template from "./template";
import paper from "paper";

export default class Gelchannel extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            sideWidth: "Float",
            mainWidth: "Float",
            orientation: "String",
            length: "Float",
            height: "Float",
            sideheight: "Float"
        };

        this.__defaults = {
            sideWidth: 200,
            mainWidth: 500,
            orientation: "H",
            length: 3000,
            height: 250,
            sideheight: 50
        };

        this.__units = {
            sideWidth: "&mu;m",
            mainWidth: "&mu;m",
            orientation: "",
            length: "&mu;m",
            height: "&mu;m",
            sideheight: "&mu;m"
        };

        this.__minimum = {
            sideWidth: 20,
            mainWidth: 10,
            length: 1000,
            height: 10,
            sideheight: 10
        };

        this.__maximum = {
            sideWidth: 500,
            mainWidth: 500,
            length: 100*1000,
            height: 1200,
            sideheight: 1200
        };

        this.__featureParams = {
            position: "position",
            orientation: "orientation",
            length: "length",
            sideWidth: "sideWidth",
            mainWidth: "mainWidth",
            height: "height",
            sideheight: "sideheight"
        };

        this.__targetParams = {
            orientation: "orientation",
            length: "length",
            sideWidth: "sideWidth",
            mainWidth: "mainWidth",
            height: "height",
            sideheight: "sideheight"
        };

        this.__placementTool = "CellPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW", "CELL"];

        this.__mint = "LONG CELL TRAP";
    }

    render2D(params, key) {
        if (key == "FLOW") {
            return this.__drawFlow(params);
        } else if (key == "CELL") {
            return this.__drawCell(params);
        }
    }

    render2DTarget(key, params) {
        let orientation = params["orientation"];
        let position = params["position"];
        let sideWidth = params["sideWidth"];
        let numChambers = 2;
        let length = params["length"];
        let mainWidth = params["mainWidth"];
        let color = params["color"];
        let x = position[0];
        let y = position[1];

        let chamberList = [];
        let rec;
        let traps;
        let channels;

        if (orientation == "V") {
            for (let i = 0; i < numChambers / 2; i++) {
                rec = paper.Path.Rectangle({
                    size: [2 * sideWidth + mainWidth, length],
                    point: [x, y + i * (length + 60) + 60],
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.push(rec);
            }
            channels = paper.Path.Rectangle({
                point: [x + sideWidth, y],
                size: [mainWidth, (numChambers / 2) * (length + 60) + 60],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.push(channels);
        } else {
            for (let i = 0; i < numChambers / 2; i++) {
                rec = paper.Path.Rectangle({
                    size: [length, 2 * sideWidth + mainWidth],
                    point: [x + i * (length + 60) + 60, y],
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.push(rec);
            }
            channels = paper.Path.Rectangle({
                point: [x, y + sideWidth],
                size: [(numChambers / 2) * (length + 60) + 60, mainWidth],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.push(channels);
        }
        traps = new paper.CompoundPath(chamberList);
        traps.fillColor = color;
        traps.fillColor.alpha = 0.5;
        return traps;
    }

    __drawFlow(params) {
        let orientation = params["orientation"];
        let position = params["position"];
        let sideWidth = params["sideWidth"];
        let numChambers = 2;
        let length = params["length"];
        let mainWidth = params["mainWidth"];

        console.log(orientation, position, sideWidth, numChambers, length, mainWidth, 60);
        let color = params["color"];
        let x = position[0];
        let y = position[1];
        let chamberList = new paper.CompoundPath();
        chamberList.fillColor = color;
        let rec;
        let traps;
        let channels;
        if (orientation == "V") {
            let startPoint = new paper.Point(x + sideWidth, y);
            channels = new paper.Path.Rectangle({
                point: startPoint,
                size: [mainWidth, (numChambers / 2) * (length + 60) + 60],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(channels);
        } else {
            let startPoint = new paper.Point(x, y + sideWidth);
            channels = new paper.Path.Rectangle({
                point: startPoint,
                size: [(numChambers / 2) * (length + 60) + 60, mainWidth],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(channels);
        }
        traps = new paper.CompoundPath(chamberList);
        traps.fillColor = color;
        let center = new paper.Point(position[0], position[1]);
        return traps;
    }

    __drawCell(params) {
        let orientation = params["orientation"];
        let position = params["position"];
        let sideWidth = params["sideWidth"];
        let numChambers = 2;
        let length = params["length"];
        let mainWidth = params["mainWidth"];
        let color = params["color"];
        let x = position[0];
        let y = position[1];
        let chamberList = new paper.CompoundPath();
        let rec;
        if (orientation == "V") {
            for (let i = 0; i < numChambers / 2; i++) {
                let startPoint = new paper.Point(x, y + i * (length + 60) + 60);
                rec = new paper.Path.Rectangle({
                    size: [2 * sideWidth + mainWidth, length],
                    point: startPoint,
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.addChild(rec);
            }
        } else {
            for (let i = 0; i < numChambers / 2; i++) {
                let startPoint = new paper.Point(x + i * (length + 60) + 60, y);
                rec = paper.Path.Rectangle({
                    size: [length, 2 * sideWidth + mainWidth],
                    point: startPoint,
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.addChild(rec);
            }
        }
        chamberList.fillColor = color;
        let center = new paper.Point(x, y);
        return chamberList;
    }
}
