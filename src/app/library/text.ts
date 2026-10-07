import Template from "./template";
import paper from "paper";

export default class Text extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void  {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            text: "String",
            depth: "Float",
            fontSize: "Float"
        };

        this.__defaults = {
            fontSize: 10000 / 3,
            depth: 250
        };

        this.__units = {
            fontSize: "μm",
            depth: "μm"
        };

        this.__minimum = {
            fontSize: 10000 / 3,
            depth: 1
        };

        this.__maximum = {
            fontSize: 10000 / 3,
            depth: 10000
        };

        this.__toolParams = {
            position: "position"
        };

        this.__featureParams = {
            position: "position",
            text: "text",
            fontSize: "fontSize",
            depth: "depth"
        };

        this.__targetParams = {
            text: "text",
            fontSize: "fontSize",
            depth: "depth"
        };

        this.__placementTool = "PositionTool";

        this.__renderKeys = ["FLOW"];

        this.__mint = "TEXT";

        this.__zOffsetKeys = {
            FLOW: "depth"
        };

        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(params: { [k: string]: any }, key: string) {
        // Regardless of the key...
        const position = params.position;
        const text = params.text;
        const color = params.color;
        const rendered = new paper.PointText(new paper.Point(position[0], position[1]));
        rendered.justification = "center";
        rendered.fillColor = color;
        /// rendered.content = feature.getText();
        rendered.content = text;
        rendered.fontSize = 10000 / 3;
        return rendered;
    }

    render2DTarget(key: string | null, params: { [k: string]: any }) {
        if (key === null) {
            key = this.__renderKeys[0];
        }
        const render = this.render2D(params, key);
        render.fillColor!.alpha = 0.5;
        return render;
    }
}
