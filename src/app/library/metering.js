import Template from "./template";
import paper, { Path } from "paper";
import ComponentPort from "../core/componentPort";

export default class Metering extends Template {
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
            valveRadius: "Float",
            valveGap: "Float",
            flowChannelWidth: "Float",
            length: "Float",
            width: "Float"
        };

        this.__defaults = {
            componentSpacing: 1000,
            rotation: 0,
            height: 250,
            valveRadius: 1*1000,
            valveGap: 0.5*1000,
            flowChannelWidth: 0.5*1000,
            length: 18*1000,
            width: 18*1000
        };

        this.__units = {
            componentSpacing: "&mu;m",
            rotation: "&deg;",
            height: "&mu;m",
            valveRadius: "&mu;m",
            valveGap: "&mu;u",
            flowChannelWidth: "&mu;m",
            length: "&mu;m",
            width: "&mu;m"
        };

        this.__minimum = {
            componentSpacing: 0,
            rotation: 0,
            height: 10,
            valveRadius: 0.5*1000,
            valveGap: 0.5*10,
            flowChannelWidth: 1,
            length: 2*1000,
            width: 1*1000
        };

        this.__maximum = {
            componentSpacing: 10000,
            rotation: 360,
            height: 1200,
            valveRadius: 2*1000,
            valveGap: 1*1000,
            flowChannelWidth: 10*1000,
            length: 30*1000,
            width: 30*1000,
        };

        this.__placementTool = "componentPositionTool";

        this.__toolParams = {
            cursorPosition: "position"
        };

        this.__featureParams = {
            componentSpacing: "componentSpacing",
            position: "position",
            rotation: "rotation",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            flowChannelWidth: "flowChannelWidth",
            length: "length",
            width: "width"
        };

        this.__targetParams = {
            componentSpacing: "componentSpacing",
            rotation: "rotation",
            valveRadius: "valveRadius",
            valveGap: "valveGap",
            flowChannelWidth: "flowChannelWidth",
            length: "length",
            width: "width"
        };

        this.__renderKeys = ["FLOW"];

        this.__mint = "METERING";
    }

    getPorts(params) {
        let inletLength = params["inletLength"];
        let filterLength = params["filterLength"];
        let outletLength = params["outletLength"];
        let levelNumber = params["levelNumber"];
        let pillarDiameter = params["pillarDiameter"];

        let length = params["length"];
        let width = params["width"];
        let valveGap = params["valveGap"];

        let ports = [];

        ports.push(new ComponentPort(0, -length/2, "1", "FLOW"));
        ports.push(new ComponentPort(0, length/2, "2", "FLOW"));
        ports.push(new ComponentPort(- width/2, -length/4, "3", "FLOW"));
        ports.push(new ComponentPort(width/2, -length/5, "4", "FLOW"));
        ports.push(new ComponentPort(-width/2, length/5, "5", "FLOW"));
        ports.push(new ComponentPort(width/2, length/4, "6", "FLOW"));

        // ports.push(new ComponentPort(inletLength + 5 * pillarDiameter + 1.3 * levelNumber * filterLength + outletLength, 0, "2", "FLOW"));

        return ports;
    }

    render2D(params, key) {
        let rotation = params["rotation"];
        let x = params["position"][0];
        let y = params["position"][1];
        let color = params["color"];
        let valveRadius = params["valveRadius"];
        let valveGap = params["valveGap"];
        let flowChannelWidth = params["flowChannelWidth"];
        let length = params["length"];
        let width = params["width"];

        let serp = new paper.CompoundPath();

        let topLeft = new paper.Point(x - flowChannelWidth/2, y - length/2);
        let bottomRight = new paper.Point(x + flowChannelWidth/2, y + length/2);

        let rec = new paper.Path.Rectangle(topLeft, bottomRight);

        // top valve space
        topLeft = new paper.Point(x - flowChannelWidth/2, y - length/6 - valveGap/2);
        bottomRight = new paper.Point(x + flowChannelWidth/2, y - length/6 + valveGap/2);

        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        // bottom valve space
        topLeft = new paper.Point(x - flowChannelWidth/2, y + length/6 - valveGap/2);
        bottomRight = new paper.Point(x + flowChannelWidth/2, y + length/6 + valveGap/2);

        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.addChild(rec);


        // top valve
        let circ = new paper.Path.Circle(new paper.Point(x, y - length/6), valveRadius);

        rec = new paper.Path.Rectangle({
            point: new paper.Point(x - valveGap / 2, y - valveRadius),
            size: [valveGap, valveRadius],
            stokeWidth: 0
        });

        // circ = circ.unite(rec);


        let cutout = paper.Path.Rectangle({
            from: new paper.Point(x - valveRadius, y - length/6 - valveGap / 2),
            to: new paper.Point(x + valveRadius, y - length/6 + valveGap/2)
        });

        let valve = circ.subtract(cutout);

        serp.addChild(valve)

        // bottom valve
        circ = new paper.Path.Circle(new paper.Point(x, y + length/6), valveRadius);

        rec = new paper.Path.Rectangle({
            point: new paper.Point(x - valveGap / 2, y - valveRadius),
            size: [valveGap, valveRadius],
            stokeWidth: 0
        });

        circ = circ.unite(rec);

        cutout = paper.Path.Rectangle({
            from: new paper.Point(x - valveRadius, y + length/6 - valveGap / 2),
            to: new paper.Point(x + valveRadius, y + length/6 + valveGap/2)
        });

        valve = circ.subtract(cutout);

        serp.addChild(valve)


        // top left branch
        let halfWidth = width/2;
        topLeft = new paper.Point(x - halfWidth * 2/5, y - length/6 - valveGap/2 - flowChannelWidth);
        bottomRight = new paper.Point(x, y - length/6 - valveGap/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));
       
        topLeft = new paper.Point(x - halfWidth, y - length/4 - flowChannelWidth/2);
        bottomRight = new paper.Point(x - halfWidth * 3/5, y - length/4 + flowChannelWidth/2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        // space
        topLeft = new paper.Point(x - halfWidth*4/5 - valveGap/2, y - length/4 - flowChannelWidth/2);
        bottomRight = new paper.Point(x - halfWidth*4/5 + valveGap/2, y - length/4 + flowChannelWidth/2);

        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.addChild(rec);


        // bridge
        let bridge = new paper.Path({
            segments: [[x - halfWidth*3/5, y - length/4 - flowChannelWidth/2], [x - halfWidth*3/5, y - length/4 + flowChannelWidth/2], [x - halfWidth*2/5, y - length/6 - valveGap/2], [x - halfWidth*2/5, y - length/6 - valveGap/2 - flowChannelWidth]],
        });

        serp.addChild(bridge);


        // add valve
        circ = new paper.Path.Circle(new paper.Point(x - halfWidth*4/5, y - length/4), valveRadius);

        cutout = paper.Path.Rectangle({
            from: new paper.Point(x - halfWidth*4/5 - valveGap / 2, y - length/4 - valveRadius),
            to: new paper.Point(x - halfWidth*4/5 + valveGap/2, y - length/4 + valveRadius)
        });

        valve = circ.subtract(cutout);

        serp.addChild(valve)

        // top right branch
        topLeft = new paper.Point(x, y - length/6 + valveGap/2);
        bottomRight = new paper.Point(x + halfWidth*2/5, y - length/6 + valveGap/2 + flowChannelWidth);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));
       
        topLeft = new paper.Point(x + halfWidth*3/5 , y - length/5 - flowChannelWidth/2);
        bottomRight = new paper.Point(x + halfWidth, y - length/5 + flowChannelWidth/2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        // space
        topLeft = new paper.Point(x + halfWidth*4/5 - valveGap/2, y - length/5 - flowChannelWidth/2);
        bottomRight = new paper.Point(x + halfWidth*4/5 + valveGap/2, y - length/5 + flowChannelWidth/2);

        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.addChild(rec);

        // bridge
        bridge = new paper.Path({
            segments: [[x + halfWidth*3/5, y - length/5 - flowChannelWidth/2], [x + halfWidth*3/5, y - length/5 + flowChannelWidth/2], [x + halfWidth*2/5, y - length/6 + valveGap/2 + flowChannelWidth], [x + halfWidth*2/5, y - length/6 + valveGap/2]],
        });

        serp.addChild(bridge);

        // add valve
        circ = new paper.Path.Circle(new paper.Point(x + halfWidth*4/5, y - length/5), valveRadius);

        cutout = paper.Path.Rectangle({
            from: new paper.Point(x + halfWidth*4/5 - valveGap / 2, y - length/5 - valveRadius),
            to: new paper.Point(x + halfWidth*4/5 + valveGap/2, y - length/5 + valveRadius)
        });

        valve = circ.subtract(cutout);

        serp.addChild(valve);


        // bottom left
        topLeft = new paper.Point(x - halfWidth * 2/5, y + length/6 - valveGap/2 - flowChannelWidth);
        bottomRight = new paper.Point(x, y + length/6 - valveGap/2);

        serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));
       
        topLeft = new paper.Point(x - halfWidth, y + length/5 - flowChannelWidth/2);
        bottomRight = new paper.Point(x - halfWidth * 3/5, y + length/5 + flowChannelWidth/2);

        rec = new paper.Path.Rectangle(topLeft, bottomRight);

        // space
        topLeft = new paper.Point(x - halfWidth*4/5 - valveGap/2, y + length/5 - flowChannelWidth/2);
        bottomRight = new paper.Point(x - halfWidth*4/5 + valveGap/2, y + length/5 + flowChannelWidth/2);

        rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));

        serp.addChild(rec);


        // bridge
        bridge = new paper.Path({
            segments: [[x - halfWidth*3/5, y + length/5 - flowChannelWidth/2], [x - halfWidth*3/5, y + length/5 + flowChannelWidth/2], [x - halfWidth*2/5, y + length/6 - valveGap/2], [x - halfWidth*2/5, y + length/6 - valveGap/2 - flowChannelWidth]],
        });

        serp.addChild(bridge);


        // add valve
        circ = new paper.Path.Circle(new paper.Point(x - halfWidth*4/5, y + length/5), valveRadius);

        cutout = paper.Path.Rectangle({
            from: new paper.Point(x - halfWidth*4/5 - valveGap / 2, y + length/5 - valveRadius),
            to: new paper.Point(x - halfWidth*4/5 + valveGap/2, y + length/5 + valveRadius)
        });

        valve = circ.subtract(cutout);

        serp.addChild(valve)


         // bottom right
         topLeft = new paper.Point(x, y + length/6 + valveGap/2);
         bottomRight = new paper.Point(x + halfWidth*2/5, y + length/6 + valveGap/2 + flowChannelWidth);
 
         serp.addChild(new paper.Path.Rectangle(topLeft, bottomRight));
        
         topLeft = new paper.Point(x + halfWidth*3/5 , y + length/4 - flowChannelWidth/2);
         bottomRight = new paper.Point(x + halfWidth, y + length/4 + flowChannelWidth/2);
 
         rec = new paper.Path.Rectangle(topLeft, bottomRight);
 
         // space
         topLeft = new paper.Point(x + halfWidth*4/5 - valveGap/2, y + length/4 - flowChannelWidth/2);
         bottomRight = new paper.Point(x + halfWidth*4/5 + valveGap/2, y + length/4 + flowChannelWidth/2);
 
         rec = rec.subtract(new paper.Path.Rectangle(topLeft, bottomRight));
 
         serp.addChild(rec);
 
         // bridge
         bridge = new paper.Path({
             segments: [[x + halfWidth*3/5, y + length/4 - flowChannelWidth/2], [x + halfWidth*3/5, y + length/4 + flowChannelWidth/2], [x + halfWidth*2/5, y + length/6 + valveGap/2 + flowChannelWidth], [x + halfWidth*2/5, y + length/6 + valveGap/2]],
         });
 
         serp.addChild(bridge);
 
         // add valve
         circ = new paper.Path.Circle(new paper.Point(x + halfWidth*4/5, y + length/4), valveRadius);
 
         cutout = paper.Path.Rectangle({
             from: new paper.Point(x + halfWidth*4/5 - valveGap / 2, y + length/4 - valveRadius),
             to: new paper.Point(x + halfWidth*4/5 + valveGap/2, y + length/4 + valveRadius)
         });
 
         valve = circ.subtract(cutout);
 
         serp.addChild(valve);
 

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
