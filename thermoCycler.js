import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";

export default class thermoCycler extends Template{
  constructor(){
    super();
  }

  __setupDefinitions() {
    this.__unique = {
      position : "Point"
    };
    this.__heritable = {
      rotation : "Float",
      width : "Float",
      length : "Float",
      height : "Float",
      temperature : "Float"
    };
    this.__defaults = {
      rotation : 0,
      width : 20 * 1000,
      length : 40 * 1000,
      height : 5 * 1000,
      temperature : 0.03 * 1000
    };
    this.__units = {
      rotation : "&deg",
      width : "&mu;m",
      length : "&mu;m",
      height : "&mu;m",
      temperature : "°C"
    };
    this.__minimum = {
      rotation : 0,
      width : 10 * 1000,
      length : 10 * 1000,
      height : 1.25 * 1000,
      temperature : 0 * 1000
    };
    this.__maximum = {
      rotation : 90,
      width : 60 * 1000,
      length : 60 * 1000,
      height : 10 * 1000,
      temperature : 0.1 * 1000
    };
    this.__placementTool = "multilayerPositionTool";
    this.__toolParams = {
      position : "position"
    };

    this.__featureParams = {
      position : "position",
      rotation : "rotation",
      length: "length",
      width: "width",
      temperature : "temperature"
    };

    this.__targetParams = {
      rotation : "rotation",
      length: "length",
      width: "width",
      temperature : "temperature"
    };

    this.__renderKeys = ["FLOW"];

    this.__mint = "THERMO CYCLER";
  }

  render2D(params, key) {
    let position = params["position"];
    let rotation = params["rotation"];
    let px = position[0];
    let py = position[1];
    let l = params["length"];
    let w = params["width"];
    let color = params["color"];
    let startX = px - w / 2;
    let startY = py - l / 2;
    let endX = px + w / 2;
    let endY = py + l / 2;
    let startPoint = new paper.Point(startX, startY);
    let endPoint = new paper.Point(endX, endY);
    let rendered = new paper.CompoundPath();
    let cirrad = l / 4;
    let centerr = new paper.Point(px - w,py - l);

    let rec = paper.Path.Rectangle({
        from: startPoint,
        to: endPoint,
        radius: 0,
        fillColor: color,
        strokeWidth: 0
    });
    rendered.addChild(rec);

//    let cir = new paper.Path.Circle({
//      center: centerr,
//      radius: cirrad,
//      fillColor: 'black'
//    })
//    rendered.addChild(cir);

    rendered.fillColor = color;
//    cir.fillColor = 'black';
//    rec.addChild(cir)
    return rendered.rotate(rotation,px,py);
  }

  render2DTarget(key, params){
    let render = this.render2D(params, key);
    render.fillColor.alpha = 0.5;
    return render;    
  }
  getPorts(params) {
    let l = params["length"];
    let w = params["width"];

    let ports = [];

    ports.push(new ComponentPort(-w / 2, -l / 6, "1", "CONTROL"));
    ports.push(new ComponentPort(-w / 2, l / 6, "2", "CONTROL"));
    
    return ports;
  }
}