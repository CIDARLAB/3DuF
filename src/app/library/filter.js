import Template from "./template";
import paper, { Path } from "paper";
import ComponentPort from "../core/componentPort";

export default class Filter extends Template {
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
            pillarDiameter: "Float",
            filterWidth: "Float",
            barrierWidth: "Float",
            filterLength: "Float",
            filterNumber: "Float",
            levelNumber: "Float",
            inletWidth: "Float",
            inletLength: "Float",
            outletWidth: "Float",
            outletLength: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            pillarDiameter: 2 * 1000,
            filterWidth: 1 * 1000,
            barrierWidth: 1 * 1000,
            filterLength: 3 * 1000,
            filterNumber: 5,
            levelNumber: 2,
            inletWidth: 1 * 1000,
            inletLength: 3 * 1000,
            outletWidth: 1 * 1000,
            outletLength: 3 * 1000,
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            pillarDiameter: "&mu;m",
            filterWidth: "&mu;m",
            barrierWidth: "&mu;m",
            filterLength: "&mu;m",
            filterNumber: "",
            levelNumber: "",
            inletWidth: "&mu;m",
            inletLength: "&mu;m",
            outletWidth: "&mu;m",
            outletLength: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            pillarDiameter: 1 * 1000,
            filterWidth: 0.5 * 1000,
            barrierWidth: 0.5 * 1000,
            filterLength: 2 * 1000,
            filterNumber: 2,
            levelNumber: 1,
            inletWidth: 0.5 * 1000,
            inletLength: 1 * 1000,
            outletWidth: 0.5 * 1000,
            outletLength: 1 * 1000,
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            pillarDiameter: 4 * 1000,
            filterWidth: 4 * 1000,
            barrierWidth: 6 * 1000,
            filterLength: 9 * 1000,
            filterNumber: 5,
            levelNumber: 10,
            inletWidth: 4 * 1000,
            inletLength: 8 * 1000,
            outletWidth: 4 * 1000,
            outletLength: 8 * 1000,
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            pillarDiameter: "pillarDiameter",
            filterWidth: "filterWidth",
            barrierWidth: "barrierWidth",
            filterLength: "filterLength",
            filterNumber: "filterNumber",
            levelNumber: "levelNumber",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            outletWidth: "outletWidth",
            outletLength: "outletLength"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            pillarDiameter: "pillarDiameter",
            filterWidth: "filterWidth",
            barrierWidth: "barrierWidth",
            filterLength: "filterLength",
            filterNumber: "filterNumber",
            levelNumber: "levelNumber",
            inletWidth: "inletWidth",
            inletLength: "inletLength",
            outletWidth: "outletWidth",
            outletLength: "outletLength"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "FILTER";
    }

    getPorts(params) {
        let inletLength = params["inletLength"];
        let filterLength = params["filterLength"];
        let outletLength = params["outletLength"];
        let levelNumber = params["levelNumber"];
        let pillarDiameter = params["pillarDiameter"];

        let ports = [];

        ports.push(new ComponentPort(0, 0, "1", "FLOW"));

        ports.push(new ComponentPort(inletLength + 5 * pillarDiameter + 1.3 * levelNumber * filterLength + outletLength, 0, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let rotation = params["rotation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let pillarDiameter = params["pillarDiameter"];
        let filterWidth = params["filterWidth"];
        let barrierWidth = params["barrierWidth"];
        let filterLength = params["filterLength"];
        let filterNumber = params["filterNumber"];
        let levelNumber = params["levelNumber"];
        let inletWidth = params["inletWidth"];
        let inletLength = params["inletLength"];
        let outletWidth = params["outletWidth"];
        let outletLength = params["outletLength"];

        let serp = new paper.CompoundPath();
        
        let bodyWidth = filterNumber * filterWidth + (filterNumber - 1) * barrierWidth;

        // inlet
        let topLeft = new paper.Point(x, y - inletWidth/2);
        let bottomRight = new paper.Point(x + inletLength, y + inletWidth/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left pillar
        topLeft = new paper.Point(x + inletLength, y - inletWidth/2);
        let topRight = new paper.Point(x + inletLength + 2.5 * pillarDiameter, y - bodyWidth/2);
        let bottomLeft = new paper.Point(x + inletLength, y + inletWidth/2);
        bottomRight = new paper.Point(x + inletLength + 2.5 * pillarDiameter, y + bodyWidth/2);

        let pillarPath = new paper.Path();
        pillarPath.add(topLeft);
        pillarPath.add(topRight);
        pillarPath.add(bottomRight);
        pillarPath.add(bottomLeft);

        let circ = new paper.Path.Circle(new paper.Point(x + inletLength + 1.5 * pillarDiameter, y), pillarDiameter/2);
        
        pillarPath = pillarPath.subtract(circ);

        serp.addChild(pillarPath);

        // body tube
        let startBody = inletLength + 2.5 * pillarDiameter;
        let extraSpace = 0.3 * filterLength;

        for (let i = 0; i < levelNumber; i++){
            topLeft = new paper.Point(x + startBody, y - bodyWidth/2);
            bottomRight = new paper.Point(x + startBody + filterLength + extraSpace, y + bodyWidth/2);

            let rec = new paper.Path.Rectangle(topLeft, bottomRight);

            if (i % 2 === 0){
                let division = (bodyWidth - (filterNumber - 1) * barrierWidth) / filterNumber;
                let heightAccum = division;

                for (let j = 0; j < filterNumber - 1; j++){
                    topLeft = new paper.Point(x + startBody + extraSpace/2, y - bodyWidth/2 + heightAccum);
                    heightAccum += barrierWidth;
                    bottomRight = new paper.Point(x + startBody + filterLength, y - bodyWidth/2 + heightAccum);

                    let cutrec = new paper.Path.Rectangle(topLeft, bottomRight);

                    rec = rec.subtract(cutrec);
                    
                    heightAccum += division;
                }
            }

            else {
                let division = (bodyWidth - (filterNumber - 2) * barrierWidth) / (filterNumber - 1);
                let heightAccum = division;

                for (let j = 0; j < filterNumber - 2; j++){
                    topLeft = new paper.Point(x + startBody + extraSpace/2, y - bodyWidth/2 + heightAccum);
                    heightAccum += barrierWidth;
                    bottomRight = new paper.Point(x + startBody + filterLength, y - bodyWidth/2 + heightAccum);

                    let cutrec = new paper.Path.Rectangle(topLeft, bottomRight);

                    rec = rec.subtract(cutrec);
                    
                    heightAccum += division;
                }
            }

            serp.addChild(rec);

            startBody += filterLength + extraSpace;
        }

        // right pillar
        topLeft = new paper.Point(x + startBody, y - bodyWidth/2);
        topRight = new paper.Point(x + startBody + 2.5 * pillarDiameter, y - outletWidth/2);
        bottomRight = new paper.Point(x + startBody + 2.5 * pillarDiameter, y + outletWidth/2);
        bottomLeft = new paper.Point(x + startBody, y + bodyWidth/2);

        pillarPath = new paper.Path();

        pillarPath.add(topLeft);
        pillarPath.add(topRight);
        pillarPath.add(bottomRight);
        pillarPath.add(bottomLeft);

        startBody += 2.5 * pillarDiameter;

        circ = new paper.Path.Circle(new paper.Point(x + startBody - 1.5 * pillarDiameter, y), pillarDiameter/2);

        pillarPath = pillarPath.subtract(circ);

        serp.addChild(pillarPath);

        // outlet
        topLeft = new paper.Point(x + startBody, y - outletWidth/2);
        bottomRight = new paper.Point(x + startBody + outletLength, y + outletWidth/2);

        serp.addChild((new paper.Path.Rectangle(topLeft, bottomRight)));
        
       
        serp.rotate(rotation, new paper.Point(x, y));
        
        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key, params) {
        let serp = this.render2D(params, key);

        serp.fillColor.alpha = 0.5;
        return serp;
    }
}
