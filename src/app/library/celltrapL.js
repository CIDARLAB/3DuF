import Template from "./template";
import paper from "paper";

export  default class CellTrapL extends Template{
    constructor(){
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            "position": "Point"
        };

        this.__heritable = {
            "chamberLength": "Float",
            "feedingChannelWidth": "Float",
            "orientation": "String",
            "chamberWidth": "Float",
            "numberOfChambers": "Float",
            "chamberSpacing": "Float",
            "height": "Float"
        };

        this.__defaults = {
            "chamberLength": 1.2 * 1000,
            "feedingChannelWidth": .41 * 1000,
            "orientation": "H",
            "chamberWidth": 1.23 * 1000,
            "numberOfChambers": 6,
            "chamberSpacing": 2.46 * 1000,
            "height": 250
        };


        this.__units = {
            "chamberLength": "&mu;m",
            "feedingChannelWidth": "&mu;m",
            "orientation": "",
            "chamberWidth": "&mu;m",
            "numberOfChambers": "",
            "chamberSpacing": "&mu;m",
            "height": "&mu;m"
        };

        this.__minimum = {
            "chamberLength": 30,
            "feedingChannelWidth": 10,
            "chamberWidth": 30,
            "numberOfChambers": 1,
            "chamberSpacing": 60,
            "height": 10
        };

        this.__maximum = {
            "chamberLength": 6000,
            "feedingChannelWidth": 2000,
            "chamberWidth": 6000,
            "numberOfChambers": 10,
            "chamberSpacing": 12 * 1000,
            "height": 1200
        };

        this.__placementTool = "CellPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__mint = "LONG CELL TRAP";

    }

    render2D(params, key) {
        if(key == "FLOW"){
            this.__drawFlow(params);
        }else if(key == "CELL"){
            this.__drawCell(params);
        }
    }

    render2DTarget(key, params){
        let orientation = params["orientation"];
        let position = params["position"];
        let chamberLength = params["chamberLength"];
        let numChambers = params["numberOfChambers"];
        let chamberWidth = params["chamberWidth"];
        let feedingChannelWidth = params["feedingChannelWidth"];
        let chamberSpacing = params["chamberSpacing"];
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
                    size: [2 * chamberLength + feedingChannelWidth, chamberWidth],
                    point: [x, y + i * (chamberWidth + chamberSpacing) + chamberSpacing],
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.push(rec);
            }
            channels = paper.Path.Rectangle({
                point: [x + chamberLength, y],
                size: [feedingChannelWidth, numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.push(channels);
        }
        else {
            for (let i = 0; i < numChambers / 2; i++) {
                rec = paper.Path.Rectangle({
                    size: [chamberWidth, 2 * chamberLength + feedingChannelWidth],
                    point: [x + i * (chamberWidth + chamberSpacing) + chamberSpacing, y],
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.push(rec);
            }
            channels = paper.Path.Rectangle({
                point: [x, y + chamberLength],
                size: [numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing, feedingChannelWidth],
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

    __drawFlow(params){
        let orientation = params["orientation"];
        let position = params["position"];
        let chamberLength = params["chamberLength"];
        let numChambers = params["numberOfChambers"];
        let chamberWidth = params["chamberWidth"];
        let feedingChannelWidth = params["feedingChannelWidth"];
        let chamberSpacing = params["chamberSpacing"];
        let color = params["color"];
        let x = position[0];
        let y = position[1];
        let chamberList = new paper.CompoundPath();
        chamberList.fillColor = color;
        let rec;
        let traps;
        let channels;
        if (orientation == "V") {
            let startPoint = new paper.Point(x + chamberLength, y);
            channels = new paper.Path.Rectangle({
                point: startPoint,
                size: [feedingChannelWidth, numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(channels);
        }
        else {
            let startPoint = new paper.Point(x, y + chamberLength);
            channels = new paper.Path.Rectangle({
                point: startPoint,
                size: [numChambers / 2 * (chamberWidth + chamberSpacing) + chamberSpacing, feedingChannelWidth],
                fillColor: color,
                strokeWidth: 0
            });
            chamberList.addChild(channels);
        }
        traps = new paper.CompoundPath(chamberList);
        traps.fillColor = color;
        let center = new paper.Point(position[0], position[1]);
        return channels;
    }

    __drawCell(params) {
        let orientation = params["orientation"];
        let position = params["position"];
        let chamberLength = params["chamberLength"];
        let numChambers = params["numberOfChambers"];
        let chamberWidth = params["chamberWidth"];
        let feedingChannelWidth = params["feedingChannelWidth"];
        let chamberSpacing = params["chamberSpacing"];
        let color = params["color"];
        let x = position[0];
        let y = position[1];
        let chamberList = new paper.CompoundPath();
        let rec;
        if (orientation == "V") {
            for (let i = 0; i < numChambers / 2; i++) {
                let startPoint = new paper.Point(x, y + i * (chamberWidth + chamberSpacing) + chamberSpacing);
                rec = new paper.Path.Rectangle({
                    size: [2 * chamberLength + feedingChannelWidth, chamberWidth],
                    point: startPoint,
                    fillColor: color,
                    strokeWidth: 0
                });
                chamberList.addChild(rec);
            }
        }
        else {
            for (let i = 0; i < numChambers / 2; i++) {
                let startPoint = new paper.Point(x + i * (chamberWidth + chamberSpacing) + chamberSpacing, y);
                rec = paper.Path.Rectangle({
                    size: [chamberWidth, 2 * chamberLength + feedingChannelWidth],
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