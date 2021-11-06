import Template from "./template";
import paper from "paper";
import ComponentPort from "../core/componentPort";
import { LogicalLayerType } from "../core/init";

export default class ThreeDMixer extends Template {
  constructor() {
    super();
  }

  __setupDefinitions() {
    this.__unique = {
      position: "Point",
    };

    this.__heritable = {
      componentSpacing: "Float",
      bendSpacing: "Float",
      numberOfBends: "Float",
      channelWidth: "Float",
      bendLength: "Float",
      rotation: "Float",
      height: "Float",
    };

    this.__defaults = {
      componentSpacing: 1000,
      channelWidth: 0.8 * 1000,
      bendSpacing: 1.23 * 1000,
      numberOfBends: 1,
      rotation: 0,
      bendLength: 2.46 * 1000,
      height: 250,
    };

    this.__units = {
      componentSpacing: "μm",
      bendSpacing: "μm",
      numberOfBends: "",
      channelWidth: "μm",
      bendLength: "μm",

      height: "μm",
    };

    this.__minimum = {
      componentSpacing: 0,
      channelWidth: 10,
      bendSpacing: 10,
      numberOfBends: 1,
      rotation: 0,
      bendLength: 10,
      height: 10,
    };

    this.__maximum = {
      componentSpacing: 10000,
      channelWidth: 2000,
      bendSpacing: 6000,
      numberOfBends: 20,
      rotation: 360,
      bendLength: 12 * 1000,
      height: 1200,
    };

    this.__placementTool = "multilayerPositionTool";

    this.__toolParams = {
      cursorPosition: "position",
    };

    this.__featureParams = {
      componentSpacing: "componentSpacing",
      position: "position",
      channelWidth: "channelWidth",
      bendSpacing: "bendSpacing",
      numberOfBends: "numberOfBends",
      rotation: "rotation",
      bendLength: "bendLength",
    };

    this.__targetParams = {
      componentSpacing: "componentSpacing",
      channelWidth: "channelWidth",
      bendSpacing: "bendSpacing",
      numberOfBends: "numberOfBends",
      rotation: "rotation",
      bendLength: "bendLength",
    };

    this.__renderKeys = ["FLOW", "CONTROL"];

    this.__mint = "MIXER3D";

    this.__zOffsetKeys = {
      FLOW: "height",
      CONTROL: "height",
    };

    this.__substrateOffset = {
      FLOW: "0",
      CONTROL: "+1",
    };
  }

  getPorts(params: { [k: string]: any }) {
    const channelWidth = params.channelWidth;
    const bendLength = params.bendLength;
    const bendSpacing = params.bendSpacing;
    const rotation = params.rotation;
    const numberOfBends = params.numberOfBends;

    const ports = [];

    ports.push(
      new ComponentPort(
        bendLength / 2 + channelWidth,
        0,
        "1",
        LogicalLayerType.FLOW
      )
    );

    ports.push(
      new ComponentPort(
        bendLength / 2 + channelWidth,
        (2 * numberOfBends + 1) * channelWidth +
          2 * numberOfBends * bendSpacing,
        "2",
        LogicalLayerType.FLOW
      )
    );

    return ports;
  }

  render2D(params: { [k: string]: any }, key: string) {
    const channelWidth = params.channelWidth;
    const bendLength = params.bendLength;
    const bendSpacing = params.bendSpacing;
    const rotation = params.rotation;
    const numBends = params.numberOfBends;
    const x = params.position[0];
    const y = params.position[1];
    const color = params.color;
    const segHalf = bendLength / 2 + channelWidth;
    const segLength = bendLength + 2 * channelWidth;
    const segBend = bendSpacing + 2 * channelWidth;
    const vRepeat = 2 * bendSpacing + 2 * channelWidth;
    const vOffset = bendSpacing + channelWidth;
    const hOffset = bendLength / 2 + channelWidth / 2;
    const serp = new paper.CompoundPath("");

    if (key === "FLOW") {
      // draw first segment
      serp.addChild(
        new paper.Path.Rectangle(
          new paper.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth)
        )
      );
      for (let i = 0; i < numBends; i++) {
        serp.addChild(
          new paper.Path.Rectangle(
            new paper.Rectangle(x, y + vRepeat * i, channelWidth, segBend)
          )
        );
        // serp.addChild(new paper.Path.Rectangle(x, y + vOffset + vRepeat * i, segLength, channelWidth));
        serp.addChild(
          new paper.Path.Rectangle(
            new paper.Rectangle(
              x + channelWidth + bendLength,
              y + vOffset + vRepeat * i,
              channelWidth,
              segBend
            )
          )
        );
        if (i === numBends - 1) {
          // draw half segment to close
          serp.addChild(
            new paper.Path.Rectangle(
              new paper.Rectangle(
                x + hOffset,
                y + vRepeat * (i + 1),
                segHalf,
                channelWidth
              )
            )
          );
        } else {
          // draw full segment
          serp.addChild(
            new paper.Path.Rectangle(
              new paper.Rectangle(
                x,
                y + vRepeat * (i + 1),
                segLength,
                channelWidth
              )
            )
          );
        }
      }
    } else {
      // draw first segment
      // serp.addChild(new paper.Path.Rectangle(x, y, segHalf + channelWidth / 2, channelWidth));
      for (let i = 0; i < numBends; i++) {
        // serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * i, channelWidth, segBend));
        serp.addChild(
          new paper.Path.Rectangle(
            new paper.Rectangle(
              x,
              y + vOffset + vRepeat * i,
              segLength,
              channelWidth
            )
          )
        );
        // serp.addChild(new paper.Path.Rectangle(x + channelWidth + bendLength, y + vOffset + vRepeat * i, channelWidth, segBend));
        // if (i === numBends - 1) {//draw half segment to close
        //     serp.addChild(new paper.Path.Rectangle(x + hOffset, y + vRepeat * (i + 1), segHalf, channelWidth));
        // } else {//draw full segment
        //     serp.addChild(new paper.Path.Rectangle(x, y + vRepeat * (i + 1), segLength, channelWidth));
        // }
      }
    }

    serp.fillColor = color;
    serp.rotate(rotation, new paper.Point(x, y));
    return serp;
  }

  render2DTarget(key: string, params: { [k: string]: any }) {
    const serp = this.render2D(params, key);

    serp.fillColor!.alpha = 0.5;
    return serp;
  }
}
