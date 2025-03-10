import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class DogboneInsert extends Template {
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
            length: "Float",
            innerRadius: "Float",
            outerRadius: "Float",
            height: "Float",
            mirrorByX: "Float",
            mirrorByY: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            innerRadius: 400,
            outerRadius: 800,
            length: 7200,
            height: 250,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__units = {
            componentSpacing: "μm",
            rotation: "°",
            length: "μm",
            innerRadius: "μm",
            outerRadius: "μm",
            height: "μm"
        };

        this.__minimum = {
            componentSpacing: 0,
            innerRadius: 1,
            outerRadius: 1,
            length: 120,
            height: 10,
            rotation: 0,
            mirrorByX: 0,
            mirrorByY: 0
        };

        this.__maximum = {
            componentSpacing: 10000,
            innerRadius: 1000,
            outerRadius: 1000,
            length: 24 * 1000,
            height: 1200,
            rotation: 360,
            mirrorByX: 1,
            mirrorByY: 1
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            length: "length",
            innerRadius: "innerRadius",
            outerRadius: "outerRadius",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            length: "length",
            innerRadius: "innerRadius",
            outerRadius: "outerRadius",
            rotation: "rotation",
            mirrorByX: "mirrorByX",
            mirrorByY: "mirrorByY"
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "DOGBONE INSERT";

        this.__zOffsetKeys = {
            FLOW: "height"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    getPorts(params: { [k: string]: any }) {
        const l = params.length;

        const ports = [];

        ports.push(new ComponentPort(-l / 2, 0, "1", LogicalLayerType.FLOW));

        ports.push(new ComponentPort(l / 2, 0, "2", LogicalLayerType.FLOW));

        return ports;
    }

    render2D(params: { [k: string]: any }, key: string): paper.CompoundPath  {
        const position = params.position;
        const px = position[0];
        const py = position[1];
        const length = params.length;
        const innerRadius = params.innerRadius;
        const outerRadius = params.outerRadius;
        const rotation = params.rotation;
        const color = params.color;

        const fulllength = length + innerRadius * 2 + outerRadius * 2;
        const width = innerRadius * 2 + outerRadius * 4;

        const serp: paper.CompoundPath = new paper.CompoundPath([]);

        let insert = new paper.PathItem;

        // Produce rectangle
        const rect2 = new paper.Path.Rectangle(new paper.Point(px - fulllength / 2 + outerRadius, py - width / 2), new paper.Size(fulllength - 2 * outerRadius, width));
        
        // Add half circles to ends
        // Left side
        let curve: paper.Path.Arc | paper.PathItem = new paper.Path.Arc({
            from: [px - fulllength / 2 + outerRadius, py + width / 2],
            through: [px - fulllength / 2, py + width / 2 - outerRadius],
            to: [px - fulllength / 2 + outerRadius, py + innerRadius]
        });
        (curve as any).closed = true;
        insert = rect2.unite(curve);
        curve = new paper.Path.Arc({
            from: [px - fulllength / 2 + outerRadius, py - width / 2],
            through: [px - fulllength / 2, py - width / 2 + outerRadius],
            to: [px - fulllength / 2 + outerRadius, py - innerRadius]
        });
        (curve as any).closed = true;
        insert = insert.unite(curve);
        //Right side
        curve = new paper.Path.Arc({
            from: [px + fulllength / 2 - outerRadius, py + width / 2],
            through: [px + fulllength / 2, py + width / 2 - outerRadius],
            to: [px + fulllength / 2 - outerRadius, py + innerRadius]
        });
        (curve as any).closed = true;
        insert = insert.unite(curve);
        curve = new paper.Path.Arc({
            from: [px + fulllength / 2 - outerRadius, py - width / 2],
            through: [px + fulllength / 2, py - width / 2 + outerRadius],
            to: [px + fulllength / 2 - outerRadius, py - innerRadius]
        });
        (curve as any).closed = true;
        insert = insert.unite(curve);
        
        // Subtract half circles
        curve = new paper.Path.Arc({
            from: [px - fulllength / 2 + outerRadius, py + innerRadius],
            through: [px - fulllength / 2 + innerRadius + outerRadius, py],
            to: [px - fulllength / 2 + outerRadius, py - innerRadius]
        });
        (curve as any).closed = true;
        insert = insert.subtract(curve);
        curve = new paper.Path.Arc({
            from: [px + fulllength / 2 - outerRadius, py + innerRadius],
            through: [px + fulllength / 2 - innerRadius - outerRadius, py],
            to: [px + fulllength / 2 - outerRadius, py - innerRadius]
        });
        (curve as any).closed = true;
        insert = insert.subtract(curve);

        serp.addChild(insert);
        serp.fillColor = color;
        this.transformRender(params,serp);
        return serp;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }): paper.CompoundPath  {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
