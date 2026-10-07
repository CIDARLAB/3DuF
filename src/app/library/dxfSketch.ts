import Template from "./template";
import paper from "paper";

/**
 * Placeholder library entry for DXF-imported channel geometry.
 * Actual rendering is handled in featureRenderer2D (DxfSketch branch).
 */
export default class DxfSketch extends Template {
    constructor() {
        super();
    }

    __setupDefinitions(): void {
        this.__unique = {};
        this.__heritable = {
            channelFloorZ: "Float",
            channelTopZ: "Float",
            channelWidth: "Float",
            crossSection: "Float",
            depth: "Float"
        };
        this.__defaults = {
            channelFloorZ: 0,
            channelTopZ: 2,
            channelWidth: 1000,
            crossSection: 1,
            depth: 250
        };
        this.__units = {
            channelFloorZ: "mm",
            channelTopZ: "mm",
            channelWidth: "μm",
            crossSection: "",
            depth: "μm"
        };
        this.__minimum = {
            channelFloorZ: 0,
            channelTopZ: 0.1,
            channelWidth: 3,
            crossSection: 0,
            depth: 10
        };
        this.__maximum = {
            channelFloorZ: 1000,
            channelTopZ: 1000,
            channelWidth: 12000,
            crossSection: 1,
            depth: 1200
        };
        this.__toolParams = {};
        this.__featureParams = {
            channelFloorZ: "channelFloorZ",
            channelTopZ: "channelTopZ",
            channelWidth: "channelWidth",
            crossSection: "crossSection",
            depth: "depth"
        };
        this.__targetParams = {};
        this.__placementTool = "PositionTool";
        this.__renderKeys = ["FLOW"];
        this.__mint = "DXF_SKETCH";
        this.__zOffsetKeys = {
            FLOW: "channelTopZ"
        };
        this.__substrateOffset = {
            FLOW: "0"
        };
    }

    render2D(_params: { [k: string]: any }, _key: string) {
        return new paper.CompoundPath("");
    }

    render2DTarget(_key: string | null, _params: { [k: string]: any }) {
        return new paper.CompoundPath("");
    }
}
