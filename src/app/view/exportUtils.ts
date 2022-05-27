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

export default class ExportUtils {
    constructor() {}

    static toScratch(viewManagerDelegate: ViewManager): ScratchInterchangeV1 {
        if(viewManagerDelegate.currentDevice === null) {
            throw new Error("No device selected");
        }
        let renderLayers = [];
        if (viewManagerDelegate === null) throw new Error("Registry or viewManager not initialized");
        for (let i = 0; i < viewManagerDelegate.renderLayers.length; i++) {
            renderLayers.push(viewManagerDelegate.renderLayers[i].toInterchangeV1());
        }
        const device = viewManagerDelegate.currentDevice.toInterchangeV1();

        const newScratch: ScratchInterchangeV1 = {
            name: device.name,
            params: device.params,
            renderLayers: renderLayers,
            layers: device.layers,
            groups: device.groups,
            components: device.components,
            connections: device.connections,
            valves: device.valves,
            version: device.version
        };

        return newScratch;
    }
}
