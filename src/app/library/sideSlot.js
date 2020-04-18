import Template from "./template";
import paper from "paper";

export default class SideSlot extends Template{
  constructor(){
    super();
  }

  __setupDefinitions(){
    this.__unique = {
        position: "Point"
    };

    this.__heritable = {
        width: "Float",
        length: "Float",
        height: "Float",
        rotation: "Float"
    };

    this.__defaults = {
        width: 5000,
        length: 15000,
        height: 250,
        rotation: 0
    };

    this.__units = {
        width: "&mu;m",
        length: "&mu;m",
        height: "&mu;m",
        rotation: "&deg;"
    };

    this.__minimum = {
        width: 0,
        length: 0,
        height: 0,
        rotation: 0
    };

    this.__maximum = {
        width: 99999,
        length: 99999,
        height: 99999,
        rotation: 360
    };

    this.__featureParams = {
        position: "position",
        width: "width",
        length: "length",
        height: "height",
        rotation: "rotation"
    };

    this.__targetParams = {
        position: "position",
        width: "width",
        length: "length",
        height: "height",
        rotation: "rotation"
    };

    this.__placementTool = "componentPositionTool";

    this.__toolParams = {
        position: "position"
    };

    this.__renderKeys = ["FLOW"];
  }

  render2D(params, key){
    let position = params["position"];
    let px = position[0];
    let py = position[1];
    let l = params["length"];
    let w = params["width"];
    let rotation = params["rotation"];
    let color = params["color"];

    let rendered = new paper.CompoundPath();

    let rec = new paper.Path.Rectangle({
        point: new paper.Point(px - w / 2, py - l / 2),
        size: [w, l]
    });

    rendered.addChild(rec);

    rendered.fillColor = color;
    return rendered.rotate(rotation, px, py);
  }

  render2DTarget(key, params){
    let render = this.render2D(params, key);
    render.fillColor.alpha = 0.5;
    return render;
  }

  getPorts(params) {
      let ports = [];

      ports.push(new ComponentPort(0, -l / 2, "1", "FLOW"));

      return ports;
  }
}
