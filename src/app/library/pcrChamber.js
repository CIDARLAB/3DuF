import Template from "./template";
import paper from "paper";

export default class PCRChamber extends Template {
    constructor() {
        super();
    }

    __setupDefinitions() {
        this.__unique = {
            position: "Point"
        };

        this.__heritable = {
            bendSpacing: "Float",
            numberOfBends: "Float",
            channelWidth: "Float",
            bendLength: "Float",
            orientation: "String",
            height: "Float",
            // new params 
            narrowPartLength: "Float",
            curvature: "Float",
        };

        this.__defaults = {
            channelWidth: 0.4255 * 1000,
            bendSpacing: 2 * 1000,
            numberOfBends: 10,
            orientation: "H",
            bendLength: 7 * 1000,
            height: 250,
            // new params
            narrowPartLength: 2.5 * 1000,
            curvature: 100
        };

        this.__units = {
            bendSpacing: "&mu;m",
            numberOfBends: "",
            channelWidth: "&mu;m",
            bendLength: "&mu;m",
            orientation: "",
            height: "&mu;m",
            // new params
            narrowPartLength: "&mu;m",
            curvature: "&mu;m"
        };

        this.__minimum = {
            channelWidth: 10,
            bendSpacing: 10,
            numberOfBends: 1,
            orientation: "V",
            bendLength: 10,
            height: 10,
            // new params
            narrowPartLength: 5,
            curvature: 50
        };

        this.__maximum = {
            channelWidth: 2000,
            bendSpacing: 6000,
            numberOfBends: 20,
            orientation: "V",
            bendLength: 12 * 1000,
            height: 1200,
            // new params
            narrowPartLength: 4 * 1000,
            curvature: 300
        };

        this.__featureParams = {
            position: "position",
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            // new params
            narrowPartLength: "narrowPartLength",
            curvature: "curvature"
        };

        this.__targetParams = {
            channelWidth: "channelWidth",
            bendSpacing: "bendSpacing",
            numberOfBends: "numberOfBends",
            orientation: "orientation",
            bendLength: "bendLength",
            // new params
            narrowPartLength: "narrowPartLength",
            curvature: "curvature"
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
        let pl = params["narrowPartLength"];
        let orientation = params["orientation"];
        let numBends = params["numberOfBends"];
        let smallChannelLength = params["smallChannelLength"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let curve = params["curvature"];

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
        let toprect = new paper.Path.Rectangle(x + cw - 1 + (bl - pl)/2, y + 3*cw/4, (bl - pl)/2, cw/2);
        toprect.closed = true;

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

        if (orientation == "V") {
            serp.rotate(0, x + cw, y);
        } else {
            serp.rotate(90, x + cw, y);
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
