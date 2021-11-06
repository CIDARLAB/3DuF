import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class Cahode extends Template {
  constructor() {
    super();
  }

  __setupDefinitions() {
    this.__unique = {
      position: "Point",
    };

    this.__heritable = {
      componentSpacing: "Float",
      cathodeRadius: "Float",
      pegRadius: "Float",
      pegThickness: "Float",
      height: "Float",
      rotation: "Float",
    };

    this.__defaults = {
      componentSpacing: 1000,
      cathodeRadius: 0.9 * 1000,
      pegRadius: 0.7 * 1000,
      pegThickness: 0.3 * 1000,
      height: 1.1 * 1000,
      rotation: 0,
    };

    this.__units = {
      componentSpacing: "μm",
      cathodeRadius: "μm",
      pegRadius: "μm",
      pegThickness: "μm",
      height: "μm",
      rotation: "°",
    };

    this.__minimum = {
      componentSpacing: 0,
      cathodeRadius: 0.4 * 10,
      pegRadius: 0.1 * 1000,
      pegThickness: 0.1 * 1000,
      height: 10,
      rotation: 0,
    };

    this.__maximum = {
      componentSpacing: 10000,
      cathodeRadius: 2000,
      pegRadius: 2 * 1000,
      pegThickness: 2 * 1000,
      height: 1200,
      rotation: 90,
    };

    this.__placementTool = "componentPositionTool";

    this.__toolParams = {
      position: "position",
    };

    this.__featureParams = {
      componentSpacing: "componentSpacing",
      position: "position",
      cathodeRadius: "cathodeRadius",
      pegRadius: "pegRadius",
      pegThickness: "pegThickness",
      rotation: "rotation",
    };

    this.__targetParams = {
      componentSpacing: "componentSpacing",
      cathodeRadius: "cathodeRadius",
      pegRadius: "pegRadius",
      pegThickness: "pegThickness",
      rotation: "rotation",
    };

    this.__renderKeys = ["FLOW"];

    this.__mint = "CATHODE";
  }

  render2D(params: { [k: string]: any }, key: string) {
    // Regardless of the key...
    const position = params.position;
    const radius = params.cathodeRadius;
    const pegradius = params.pegRadius;
    const pegthickness = params.pegThickness;
    const rotation = params.rotation;
    const color1 = params.color;
    const pos = new paper.Point(position[0], position[1]);
    const outerCircle = new paper.Path.Circle(pos, radius);
    outerCircle.fillColor = color1;

    const peg1 = new paper.Path.Rectangle(
      new paper.Rectangle(
        position[0] - pegradius / 2,
        position[1] - pegthickness / 2,
        pegradius,
        pegthickness
      )
    );
    const peg2 = new paper.Path.Rectangle(
      new paper.Rectangle(
        position[0] - pegthickness / 2,
        position[1] - pegradius / 2,
        pegthickness,
        pegradius
      )
    );
    const finalCircle = outerCircle.subtract(peg1.unite(peg2));
    finalCircle.fillColor = color1;
    outerCircle.remove();
    peg1.remove();
    peg2.remove();
    return finalCircle.rotate(rotation, pos) as unknown as paper.PathItem;
  }

  render2DTarget(key: string, params: { [k: string]: any }) {
    const render = this.render2D(params, key);
    render.fillColor!.alpha = 0.5;
    return render;
  }

  getPorts(params: { [k: string]: any }) {
    const ports = [];

    ports.push(new ComponentPort(0, 0, "1", LogicalLayerType.FLOW));

    return ports;
  }
}
