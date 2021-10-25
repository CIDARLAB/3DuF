import ViewManager from "@/app/view/viewManager";

import {
    ScratchInterchangeV1
    // DeviceInterchangeV1,
    // LayerInterchangeV1,
    // RenderLayerInterchangeV1,
    // FeatureInterchangeV0,
    // ComponentInterchangeV1,
    // ConnectionInterchangeV1,
    // ComponentPortInterchangeV1,
    // LogicalLayerType
} from "@/app/core/init";
import { Device } from "..";
import RenderLayer from "../view/renderLayer";

export default class ExportUtils {
    constructor() {}

    static toScratch(device: Device, renderLayers: Array<RenderLayer>): ScratchInterchangeV1 {
        let renderLayersInterchange = [];
        for (let i = 0; i < renderLayers.length; i++) {
            renderLayersInterchange.push(renderLayers[i].toInterchangeV1());
        }
        const deviceInterchange = device.toInterchangeV1();

        const newScratch: ScratchInterchangeV1 = {
            renderLayers: renderLayersInterchange,
            name: deviceInterchange.name,
            params: deviceInterchange.params,
            layers: deviceInterchange.layers,
            groups: deviceInterchange.groups,
            components: deviceInterchange.components,
            connections: deviceInterchange.connections,
            version: deviceInterchange.version
        };

        return newScratch;
    }
}
