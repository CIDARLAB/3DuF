import Template from "./template";
import paper from "paper";

export default class NewComponent extends Template{
  constructor(){
    super();
  }

  __setupDefinitions() {
    this.__unique = {
      position : "Rec"
    }
    this.__heritable = {
      orientation : "String",
      width : "Float",
      length : "Float",
      height : "Float",
      temperature : "Float"
    }
    this.__defaults = {
      orientation : "V",
      width : 20 * 1000,
      length : 40 * 1000,
      height : 5 * 1000,
      temperature : 0.03 * 1000

    }
    this.__units = {
      orentiation : "",
      width : "&mu;m",
      length : "&mu;m",
      height : "&mu;m",
      temperature : "°C"
    }
    this.__minimum = {
      orientation : "H",
      width : 10 * 1000,
      length : 10 * 1000,
      height : 1.25 * 1000,
      temperature : 0 * 1000
    }
    this.__maximum = {
      orientation : "H",
      width : 60 * 1000,
      length : 60 * 1000,
      height : 10 * 1000,
      temperature : 0.1 * 1000
    }
    this.__placementTool = "componentPositionTool";
    this.__toolParams = {
      position : "position"
    }

    this.__featureParams = {
      position : "position",
      orientation : "orientation",
      temperature : "temperature"
    }

    this.__targetParams = {
      orientation : "orientation",
      temperature : "temperature"
    }

    this.__renderKeys = ["FLOW"];

    this.__mint = "THERMO CYCLER";
  }

  render2D(params, key) {
    let position : params["position"];
    let orientation : params["orientation"];
    let width : params["width"];
    let length : params["length"];
    let height : params["height"];
    let temperature : params["temperature"];
    let color : params["color"];
    let x = params["position"][0];
    let y = params["position"][1];   
    let rect = paper.Path.Rectangle({
      size: [vec.length, width],
      point: start,
      fillColor: color,
      strokeWidth: 2
    }); 
    return rect;
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

    ports.push(new ComponentPort(0, -l / 2, "1", "FLOW"));

    ports.push(new ComponentPort(w / 2, 0, "2", "FLOW"));

    ports.push(new ComponentPort(0, l / 2, "3", "FLOW"));

    ports.push(new ComponentPort(-w / 2, 0, "4", "FLOW"));

    return ports;
  }
}