import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class Gelchannel extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            componentSpacing: "Float",
            sideWidth: "Float",
            mainWidth: "Float",
            rotation: "Float",
            length: "Float",
            height: "Float",
            sideheight: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            sideWidth: 200,
            mainWidth: 500,
            rotation: 0,
            length: 3000,
            height: 250,
            sideheight: 50
        };

        this.__units = {
            componentSpacing: "μm",
            sideWidth: "μm",
            mainWidth: "μm",
            rotation: "°",
            length: "μm",
            height: "μm",
            sideheight: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            sideWidth: 20,
            mainWidth: 10,
            length: 1000,
            height: 10,
            sideheight: 10,
            rotation: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            sideWidth: 500,
            mainWidth: 500,
            length: 100 * 1000,
            height: 1200,
            sideheight: 1200,
            rotation: 360
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            length: "length",
            sideWidth: "sideWidth",
            mainWidth: "mainWidth",
            height: "height",
            sideheight: "sideheight"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
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

        this.__mint = "GEL CHANNEL";

        this.__zOffsetKeys = {
            FLOW: "height",
            CELL: "sideHeight"
        };

        this.__substrateOffset = {
            FLOW: "0",
            CELL: "0"
        };
    }

    getPorts(params) {
        const ports = [];
        const sideWidth = params.sideWidth;
        const numChambers = 2;
        const length = params.length;
        const mainWidth = params.mainWidth;

        ports.push(new ComponentPort(0, sideWidth + mainWidth / 2, "1", "FLOW"));
        ports.push(new ComponentPort((numChambers / 2) * (length + 60) + 60, sideWidth + mainWidth / 2, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        if (key === "FLOW") {
            return this.__drawFlow(params);
        } else if (key === "CELL") {
            return this.__drawCell(params);
        }
    }

    render2DTarget(key, params) {
        const traps = this.__drawFlow(params);
        traps.addChild(this.__drawCell(params));
        traps.fillColor.alpha = 0.5;
        return traps;
    }

    __drawFlow(params) {
        const rotation = params.rotation;
        const position = params.position;
        const sideWidth = params.sideWidth;
        const numChambers = 2;
        const length = params.length;
        const mainWidth = params.mainWidth;

        console.log(rotation, position, sideWidth, numChambers, length, mainWidth, 60);
        const color = params.color;
        const x = position[0];
        const y = position[1];
        const chamberList = new paper.CompoundPath();
        chamberList.fillColor = color;
        let traps;
        let channels;

        const startPoint = new paper.Point(x, y + sideWidth);
        channels = new paper.Path.Rectangle({
            point: startPoint,
            size: [(numChambers / 2) * (length + 60) + 60, mainWidth],
            fillColor: color,
            strokeWidth: 0
        });
        chamberList.addChild(channels);

        traps = new paper.CompoundPath(chamberList);
        traps.fillColor = color;
        const center = new paper.Point(position[0], position[1]);
        traps.rotate(rotation, center);
        return traps;
    }

    __drawCell(params) {
        const rotation = params.rotation;
        const position = params.position;
        const sideWidth = params.sideWidth;
        const numChambers = 2;
        const length = params.length;
        const mainWidth = params.mainWidth;
        const color = params.color;
        const x = position[0];
        const y = position[1];
        const chamberList = new paper.CompoundPath();
        let rec;

        for (let i = 0; i < numChambers / 2; i++) {
            const startPoint = new paper.Point(x + i * (length + 60) + 60, y);
            rec = paper.Path.Rectangle({
                size: [length, 2 * sideWidth + mainWidth],
                point: startPoint,
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(rec);
        }

        chamberList.fillColor = color;
        const center = new paper.Point(x, y);
        chamberList.rotate(rotation, center);
        return chamberList;
    }
}
