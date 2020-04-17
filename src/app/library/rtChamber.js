import Template from "./template";
import paper from "paper";

export default class RTChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            bendSpacing: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float",
            partLength: "Float",
            verticalPart: "Float",
        };

        this.__defaults = {
            bendSpacing: 5.8 * 1000,
            channelWidth: 0.7 * 1000,
            bendLength: 61.3 * 1000,
            orientation: "H",
            height: 250,
            partLength: 44 * 1000,
            verticalPart: 5.3 * 1000,
        };

        this.__units = {
            bendSpacing: "&mu;m",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m",
            partLength: "&mu;m",
            verticalPart: "&mu;m",
        };

        this.__minimum = {
            bendSpacing: 10,
            channelWidth: 10,
            orientation: "V",
            bendLength: 10 * 1000,
            height: 10,
            partLength: 5 * 1000,
            verticalPart: 2 * 1000,
        };

        this.__maximum = {
            channelWidth: 2000,
            bendSpacing: 6000,
            orientation: "V",
            bendLength: 62 * 1000,
            height: 1200,
            // new params
            partLength: 4 * 1000,
            verticalPart: 6 * 1000,
        };

        this.__featureParams = {
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            orientation: "orientation",
            bendLength: "bendLength",
            partLength: "partLength",
            verticalPart: "verticalPart",
        };

        this.__targetParams = {
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            orientation: "orientation",
            bendLength: "bendLength",
            partLength: "partLength",
            verticalPart: "verticalPart",
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            position: "position"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "PCR";
    }

    render2D(params, key) {
        let cw = params["channelWidth"];
        let bl= params["bendLength"];
        let bs = params["bendSpacing"];
        let pl = params["partLength"];
        let orientation = params["orientation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let verticalPart = params["verticalPart"];

        let radius = bs / 2 + cw;
        let diameter = bs + 2 * cw;

        let vRepeat = 2 * bs + 2 * cw;
        let vOffset = bs + cw;
        //let hOffset = bendLength / 2 + channelWidth / 2;

        let serp = new paper.CompoundPath();

        let npl = (bl - pl) /2;
        let radius2 = bs/2 + cw/2;
        let diameter2 = 2 * radius2; 

        let radius3 = bs/2;
        let diameter3 = 2 * radius3; 

        //draw first segment
        let toprect = new paper.Path.Rectangle(x, y, pl, cw);
        toprect.closed = true;

        x = x + pl
        let rightCurve = new paper.Path.Arc({
            from: [x, y - bs - cw],
            through: [x + bs/2 + cw, y - bs - cw + bs/2 + cw],
            to: [x, y + cw]
        });
        rightCurve.closed = true;
        
        let rightCurveSmall = new paper.Path.Arc({
            from: [x, y - bs],
            through: [x + bs/2, y - bs + bs/2],
            to: [x, y]
        });
        rightCurveSmall.closed = true;
        rightCurve = rightCurve.subtract(rightCurveSmall);

        toprect = toprect.unite(rightCurve);

        y = y - bs - cw
        x = x - bl
        let part = new paper.Path.Rectangle(x, y, bl, cw);
        toprect = toprect.unite(part);

        let p2l = 4.5 * 1000
        part = new paper.Path.Rectangle(x - cw, y - p2l, cw, p2l + cw)

        toprect = toprect.unite(part);

        serp.addChild(toprect);
/*
        let remaining = bl - pl - npl;
        let narrowWidth = cw / 2

        let leftCurve;
        let leftCurveSmall;
        let rightCurve;
        let rightCurveSmall;

        let hseg;
        let i = 0;
        for (i = 0; i < numBends + 1; i++) {
            if (i == 0) {
                leftCurve = new paper.Path.Arc({
                    from: [x + cw + npl, y + vRepeat * i + 3*cw/4],
                    through: [x + cw + npl - radius2, y + vRepeat * i + 3*cw/4 + radius2],
                    to: [x + cw + npl, y + vRepeat * i + 3*cw/4 + diameter2]
                });
                leftCurve.closed = true;
                
                leftCurveSmall = new paper.Path.Arc({
                    from: [x + cw + npl, y + vRepeat * i + 5*cw/4],
                    through: [x + cw + npl - radius3, y + vRepeat * i + 5*cw/4 + radius3],
                    to: [x + cw + npl, y + vRepeat * i + 5*cw/4 + diameter3]
                });
                leftCurveSmall.closed = true;
                
                leftCurve = leftCurve.subtract(leftCurveSmall);
                toprect = toprect.unite(leftCurve);

                hseg = new paper.Path.Rectangle(x + cw + npl, y + vOffset + vRepeat * i, pl, cw, curve);
                toprect = toprect.unite(hseg);
                hseg = new paper.Path.Rectangle(x + cw + npl + pl, y + vOffset + vRepeat * i + narrowWidth/2, remaining, narrowWidth);
                toprect = toprect.unite(hseg);
            } else {
                leftCurve = new paper.Path.Arc({
                    from: [x + cw, y + vRepeat * i],
                    through: [x + cw - radius, y + vRepeat * i + radius],
                    to: [x + cw, y + vRepeat * i + diameter]
                });
                leftCurve.closed = true;
                
                leftCurveSmall = new paper.Path.Arc({
                    from: [x + cw, y + vRepeat * i + bs + cw],
                    through: [x + cw - bs / 2, y + vRepeat * i + bs / 2 + cw],
                    to: [x + cw, y + vRepeat * i + cw]
                });
                leftCurveSmall.closed = true;
                
                leftCurve = leftCurve.subtract(leftCurveSmall);
                toprect = toprect.unite(leftCurve);
                
                //draw horizontal segment
                hseg = new paper.Path.Rectangle(x + cw - 1, y + vOffset + vRepeat * i + cw/4, npl, cw/2);
                toprect = toprect.unite(hseg);
                hseg = new paper.Path.Rectangle(x + cw - 1 + npl, y + vOffset + vRepeat * i, pl, cw, curve);
                toprect = toprect.unite(hseg);
                hseg = new paper.Path.Rectangle(x + cw - 1 + npl + pl, y + vOffset + vRepeat * i + cw/4, remaining, cw/2);
                toprect = toprect.unite(hseg);
            }

            //draw right curved segment
            rightCurve = new paper.Path.Arc({
                from: [x + cw + bl, y + vOffset + vRepeat * i],
                through: [x + cw + bl + radius, y + vOffset + vRepeat * i + radius],
                to: [x + cw + bl, y + vOffset + vRepeat * i + diameter]
            });
            rightCurve.closed = true;

            rightCurveSmall = new paper.Path.Arc({
                from: [x + cw + bl, y + vOffset + vRepeat * i + bs + cw],
                through: [x + cw + bl + bs / 2, y + vOffset + vRepeat * i + radius],
                to: [x + cw + bl, y + vOffset + vRepeat * i + cw]
            });
            rightCurveSmall.closed = true;
            rightCurve = rightCurve.subtract(rightCurveSmall);
            toprect = toprect.unite(rightCurve);

            hseg = new paper.Path.Rectangle(x + cw - 1, y + vRepeat * (i + 1) + cw/4, bl + 2, cw/2);
            toprect = toprect.unite(hseg);
        }
        hseg = new paper.Path.Rectangle(x + cw - 1, y + vRepeat * i + cw/4, bl, cw/2);
        toprect = toprect.unite(hseg);
        let j = i;
        leftCurve = new paper.Path.Arc({
            from: [x + cw, y + vRepeat * j],
            through: [x + cw - radius, y + vRepeat * j + radius],
            to: [x + cw, y + vRepeat * j + diameter]
        });
        leftCurve.closed = true;
        
        leftCurveSmall = new paper.Path.Arc({
            from: [x + cw, y + vRepeat * j + bs + cw],
            through: [x + cw - bs / 2, y + vRepeat * j + bs / 2 + cw],
            to: [x + cw, y + vRepeat * j + cw]
        });
        leftCurveSmall.closed = true;
        
        leftCurve = leftCurve.subtract(leftCurveSmall);
        toprect = toprect.unite(leftCurve);

        let custom1 = new paper.Path.Rectangle(x + cw - 1, y + vOffset + vRepeat * j, bl + radius, cw);
        toprect = toprect.unite(custom1);
        serp.addChild(toprect);
*/
        if (orientation == "V") {
            serp.rotate(90, x + cw, y);
        } else {
            serp.rotate(0, x + cw, y);
        }


        serp.fillColor = color;
        return serp;
    }

    render2DTarget(key, params) {
        let render = this.render2D(params, key);
        render.fillColor.alpha = 0.5;
        return render;
    }
}
