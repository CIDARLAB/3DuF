import Template from "./template";
import paper from "paper";

export default class NewComponent extends Template{
  constructor() {
    super();
  }

  __setupDefinitions() {
    this.__unique: {
      "position": "Point",
    };

    this.__heritable: {
      "length": "Float",
      "width": "Float",
      "height": "Float",
    }

    this.__defaults = {
      "length": 41,
      "width": 12,
      "height": 3,
    };

    this.__units = {
      "length": "mm",
      "width": "mm",
      "height": "mm",
    };

    this.__minimum = {
      "length": 20,
      "width": 5,
      "height": 1,
    };

    this.__maximum = {
      "length": 60,
      "width": 20,
      "height": 5,
    };

    this.__placementTool = "componentPositionTool";

    this.__toolParams = {
      cursorPosition: "position",
    }

    this.__featureParmas = {
      position: "position",
      length: "length",
      width: "width",
      height: "height",
    }

    this.__targetParmas = {
      length: "length",
      width: "width",
      height: "height",
    }
  }

  render2D(params, key) {
    let length = params["length"];
    let width = params["width"];
    let height = params["height"];
    let x = params["position"][0];
    let y = params["position"][1];
    let color = params["color"];
    
    let hex = new paper.Path();
    let p0, p1, p2, p3;
    p0 = [x, y];
    p1 = [x+width, y];
    p2 = [x, y+height];
    p3 = [x+width, y+height];
    hex.add(new paper.Point(p0));
    hex.add(new paper.Point(p1));
    hex.add(new paper.Point(p2));
    hex.add(new paper.Point(p3));
    hex.closed = true;
    hex.fillColor = color;
    return hex;
  }

  render2DTarget(key, params) {
    let render  = this.render2D(params, key);
    render.fillColor.alpha = 0.5;
    return render;
  }
}

