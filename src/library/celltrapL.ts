import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class CellTrapL extends Template {
  constructor() {
    super();
  }

  __setupDefinitions() {
    this.__unique = {
      position: "Point",
    };

    this.__heritable = {
      componentSpacing: "Float",
      chamberLength: "Float",
      feedingChannelWidth: "Float",
      rotation: "Float",
      chamberWidth: "Float",
      numberOfChambers: "Float",
      chamberSpacing: "Float",
      height: "Float",
    };

    this.__defaults = {
      componentSpacing: 1000,
      chamberLength: 1.2 * 1000,
      feedingChannelWidth: 0.41 * 1000,
      rotation: 270,
      chamberWidth: 1.23 * 1000,
      numberOfChambers: 6,
      chamberSpacing: 2.46 * 1000,
      height: 250,
    };

    this.__units = {
      componentSpacing: "μm",
      chamberLength: "μm",
      feedingChannelWidth: "μm",
      rotation: "°",
      chamberWidth: "μm",
      numberOfChambers: "",
      chamberSpacing: "μm",
      height: "μm",
    };

    this.__minimum = {
      componentSpacing: 0,
      chamberLength: 30,
      feedingChannelWidth: 10,
      chamberWidth: 30,
      numberOfChambers: 1,
      chamberSpacing: 60,
      height: 10,
      rotation: 0,
    };

    this.__maximum = {
      componentSpacing: 10000,
      chamberLength: 6000,
      feedingChannelWidth: 2000,
      chamberWidth: 6000,
      numberOfChambers: 10,
      chamberSpacing: 12 * 1000,
      height: 1200,
      rotation: 360,
    };

    this.__featureParams = {
      componentSpacing: "componentSpacing",
      position: "position",
      rotation: "rotation",
      chamberWidth: "chamberWidth",
      chamberLength: "chamberLength",
      numberOfChambers: "numberOfChambers",
      chamberSpacing: "chamberSpacing",
      feedingChannelWidth: "feedingChannelWidth",
      height: "height",
    };

    this.__targetParams = {
      componentSpacing: "componentSpacing",
      rotation: "rotation",
      chamberWidth: "chamberWidth",
      chamberLength: "chamberLength",
      numberOfChambers: "numberOfChambers",
      chamberSpacing: "chamberSpacing",
      feedingChannelWidth: "feedingChannelWidth",
      height: "height",
    };

    this.__placementTool = "CellPositionTool";

    this.__toolParams = {
      position: "position",
    };

    this.__renderKeys = ["FLOW", "CELL"];

    this.__mint = "LONG CELL TRAP";

    this.__zOffsetKeys = {
      FLOW: "height",
      CELL: "height",
    };

    this.__substrateOffset = {
      FLOW: "0",
      CELL: "0",
    };
  }

  getPorts(params: { [k: string]: any }) {
    const chamberLength = params.chamberLength;
    const numChambers = params.numberOfChambers;
    const chamberWidth = params.chamberWidth;
    const feedingChannelWidth = params.feedingChannelWidth;
    const chamberSpacing = params.chamberSpacing;

    const ports = [];

    ports.push(
      new ComponentPort(
        0,
        chamberLength + feedingChannelWidth / 2,
        "1",
        LogicalLayerType.FLOW
      )
    );

    ports.push(
      new ComponentPort(
        (numChambers / 2) * (chamberWidth + chamberSpacing) + chamberSpacing,
        chamberLength + feedingChannelWidth / 2,
        "2",
        LogicalLayerType.FLOW
      )
    );

    return ports;
  }

  render2D(params: { [k: string]: any }, key = "FLOW") {
    if (key === "FLOW") {
      return this.__drawFlow(params);
    } else if (key === "CELL") {
      return this.__drawCell(params);
    } else {
      const flow = this.__drawFlow(params);
      const control = this.__drawCell(params);
      const ret = new paper.CompoundPath("");
      ret.addChild(flow);
      ret.addChild(control);
      return ret;
    }

    throw new Error("Unknown key: " + key);
  }

  render2DTarget(key: string, params: { [k: string]: any }) {
    const traps = this.__drawFlow(params);
    traps.addChild(this.__drawCell(params));
    traps.fillColor!.alpha = 0.5;
    return traps;
  }

  __drawFlow(params: { [k: string]: any }) {
    const rotation = params.rotation;
    const position = params.position;
    const chamberLength = params.chamberLength;
    const numChambers = params.numberOfChambers;
    const chamberWidth = params.chamberWidth;
    const feedingChannelWidth = params.feedingChannelWidth;
    const chamberSpacing = params.chamberSpacing;

    const color = params.color;
    const x = position[0];
    const y = position[1];
    const chamberList = new paper.CompoundPath("");
    chamberList.fillColor = color;
    let rec;
    let traps;
    let channels;

    const startPoint = new paper.Point(x, y + chamberLength);
    channels = new paper.Path.Rectangle({
      point: startPoint,
      size: [
        (numChambers / 2) * (chamberWidth + chamberSpacing) + chamberSpacing,
        feedingChannelWidth,
      ],
      fillColor: color,
      strokeWidth: 0,
    });
    chamberList.addChild(channels);

    traps = new paper.CompoundPath(chamberList);
    traps.fillColor = color;
    traps.rotate(rotation, new paper.Point(x, y));
    return traps;
  }

  __drawCell(params: { [k: string]: any }) {
    const rotation = params.rotation;
    const position = params.position;
    const chamberLength = params.chamberLength;
    const numChambers = params.numberOfChambers;
    const chamberWidth = params.chamberWidth;
    const feedingChannelWidth = params.feedingChannelWidth;
    const chamberSpacing = params.chamberSpacing;
    const color = params.color;
    const x = position[0];
    const y = position[1];
    const chamberList = new paper.CompoundPath("");
    let rec;

    for (let i = 0; i < numChambers / 2; i++) {
      const startPoint = new paper.Point(
        x + i * (chamberWidth + chamberSpacing) + chamberSpacing,
        y
      );
      rec = new paper.Path.Rectangle({
        size: [chamberWidth, 2 * chamberLength + feedingChannelWidth],
        point: startPoint,
        fillColor: color,
        strokeWidth: 0,
      });
      chamberList.addChild(rec);
    }

    chamberList.fillColor = color;
    chamberList.rotate(rotation, new paper.Point(x, y));
    return chamberList;
  }
}
