import ViewManager from "@/app/view/viewManager";

import {
    ConnectionTargetInterchangeV1,
    InterchangeV1_2
    // DeviceInterchangeV1,
    // LayerInterchangeV1,
    // RenderLayerInterchangeV1,
    // FeatureInterchangeV0,
    // ComponentInterchangeV1,
    // ConnectionInterchangeV1,
    // ComponentPortInterchangeV1,
    // LogicalLayerType
} from "@/app/core/init";
import ConnectionTarget from "../core/connectionTarget";

export default class ExportUtils {


    static toInterchangeV1_2(viewManagerDelegate: ViewManager): InterchangeV1_2 {
        if(viewManagerDelegate.currentDevice === null) {
            throw new Error("No device selected");
        }
        let renderLayers = [];
        if (viewManagerDelegate === null) throw new Error("Registry or viewManager not initialized");
        for (let i = 0; i < viewManagerDelegate.renderLayers.length; i++) {
            renderLayers.push(viewManagerDelegate.renderLayers[i].toInterchangeV1());
        }
        const device = viewManagerDelegate.currentDevice.toInterchangeV1();
        
        const valvemap = {}
        const valvetypemap = {}


        const newScratch: InterchangeV1_2 = {
            name: device.name,
            params: device.params,
            renderLayers: renderLayers,
            layers: device.layers,
            groups: device.groups,
            components: device.components,
            connections: device.connections,
            valves: device.valves,
            version: "1.2"
        };

        return newScratch;
    }

    /**
     * Converts a device to interchange format.
     *
     * @static
     * @param {ConnectionTarget} target
     * @returns {ConnectionTargetInterchangeV1}
     * @memberof ExportUtils
     */
     static toConnectionTargetInterchangeV1(target: ConnectionTarget): ConnectionTargetInterchangeV1{
        const ret: ConnectionTargetInterchangeV1 = {
            component: target.component.id,
            port: target.portLabel
        }
        return ret;
    }
}

