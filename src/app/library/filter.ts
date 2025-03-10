import Template from "./template";
import paper, { Path } from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Filter extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
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
            outletLength: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
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
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            height: "μm",
            pillarDiameter: "μm",
            filterWidth: "μm",
            barrierWidth: "μm",
            filterLength: "μm",
            filterNumber: "",
            levelNumber: "",
            inletWidth: "μm",
            inletLength: "μm",
            outletWidth: "μm",
            outletLength: "μm"
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
            mirrorByX: 0,
            mirrorByY: 0
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
            mirrorByX: 1,
            mirrorByY: 1
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
            outletLength: "outletLength",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
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
            outletLength: "outletLength",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "FILTER";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const inletLength = params.inletLength;
        const filterLength = params.filterLength;
        const outletLength = params.outletLength;
        const levelNumber = params.levelNumber;
        const pillarDiameter = params.pillarDiameter;

        const ports = [];

        ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(inletLength + 5 * pillarDiameter + 1.3 * levelNumber * filterLength + outletLength, 0, "2", LogicalLayerType.FLOW));

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string) {
        const rotation = params.rotation;
        const x = params.position[0];
        const y = params.position[1];
        const color = params.color;
        const pillarDiameter = params.pillarDiameter;
        const filterWidth = params.filterWidth;
        const barrierWidth = params.barrierWidth;
        const filterLength = params.filterLength;
        const filterNumber = params.filterNumber;
        const levelNumber = params.levelNumber;
        const inletWidth = params.inletWidth;
        const inletLength = params.inletLength;
        const outletWidth = params.outletWidth;
        const outletLength = params.outletLength;

        const serp = new paper.CompoundPath("");

        const bodyWidth = filterNumber * filterWidth + (filterNumber - 1) * barrierWidth;

        // inlet
        let topLeft = new paper.Point(x, y - inletWidth / 2);
        let bottomRight = new paper.Point(x + inletLength, y + inletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        // left pillar
        topLeft = new paper.Point(x + inletLength, y - inletWidth / 2);
        let topRight = new paper.Point(x + inletLength + 2.5 * pillarDiameter, y - bodyWidth / 2);
        let bottomLeft = new paper.Point(x + inletLength, y + inletWidth / 2);
        bottomRight = new paper.Point(x + inletLength + 2.5 * pillarDiameter, y + bodyWidth / 2);

        let pillarPath: paper.Path | paper.PathItem = new paper.Path();
        (pillarPath as paper.Path).add(topLeft);
        (pillarPath as paper.Path).add(topRight);
        (pillarPath as paper.Path).add(bottomRight);
        (pillarPath as paper.Path).add(bottomLeft);

        let circ = new paper.Path.Circle(new paper.Point(x + inletLength + 1.5 * pillarDiameter, y), pillarDiameter / 2);

        pillarPath = pillarPath.subtract(circ);

        serp.addChild(pillarPath);

        // body tube
        let startBody = inletLength + 2.5 * pillarDiameter;
        const extraSpace = 0.3 * filterLength;

        for (let i = 0; i < levelNumber; i++) {
            topLeft = new paper.Point(x + startBody, y - bodyWidth / 2);
            bottomRight = new paper.Point(x + startBody + filterLength + extraSpace, y + bodyWidth / 2);

            let rec: paper.PathItem | paper.Rectangle = new paper.Path.Rectangle(topLeft, bottomRight);

            if (i % 2 === 0) {
                const division = (bodyWidth - (filterNumber - 1) * barrierWidth) / filterNumber;
                let heightAccum = division;

                for (let j = 0; j < filterNumber - 1; j++) {
                    topLeft = new paper.Point(x + startBody + extraSpace / 2, y - bodyWidth / 2 + heightAccum);
                    heightAccum += barrierWidth;
                    bottomRight = new paper.Point(x + startBody + filterLength, y - bodyWidth / 2 + heightAccum);

                    const cutrec = new paper.Path.Rectangle(topLeft, bottomRight);

                    rec = rec.subtract(cutrec);

                    heightAccum += division;
                }
            } else {
                const division = (bodyWidth - (filterNumber - 2) * barrierWidth) / (filterNumber - 1);
                let heightAccum = division;

                for (let j = 0; j < filterNumber - 2; j++) {
                    topLeft = new paper.Point(x + startBody + extraSpace / 2, y - bodyWidth / 2 + heightAccum);
                    heightAccum += barrierWidth;
                    bottomRight = new paper.Point(x + startBody + filterLength, y - bodyWidth / 2 + heightAccum);

                    const cutrec = new paper.Path.Rectangle(topLeft, bottomRight);

                    rec = rec.subtract(cutrec);

                    heightAccum += division;
                }
            }

            serp.addChild(rec);

            startBody += filterLength + extraSpace;
        }

        // right pillar
        topLeft = new paper.Point(x + startBody, y - bodyWidth / 2);
        topRight = new paper.Point(x + startBody + 2.5 * pillarDiameter, y - outletWidth / 2);
        bottomRight = new paper.Point(x + startBody + 2.5 * pillarDiameter, y + outletWidth / 2);
        bottomLeft = new paper.Point(x + startBody, y + bodyWidth / 2);

        pillarPath = new paper.Path();

        (pillarPath as paper.Path).add(topLeft);
        (pillarPath as paper.Path).add(topRight);
        (pillarPath as paper.Path).add(bottomRight);
        (pillarPath as paper.Path).add(bottomLeft);

        startBody += 2.5 * pillarDiameter;

        circ = new paper.Path.Circle(new paper.Point(x + startBody - 1.5 * pillarDiameter, y), pillarDiameter / 2);

        pillarPath = pillarPath.subtract(circ);

        serp.addChild(pillarPath);

        // outlet
        topLeft = new paper.Point(x + startBody, y - outletWidth / 2);
        bottomRight = new paper.Point(x + startBody + outletLength, y + outletWidth / 2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));

        this.transformRender(params,serp);

        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const serp = this.render2D(params, key);
        serp.fillColor!.alpha = 0.5;
        return serp;
    }
}
