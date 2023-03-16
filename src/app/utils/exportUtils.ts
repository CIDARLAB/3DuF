import ViewManager from "@/app/view/viewManager";

import {
    ConnectionTargetInterchangeV1,
    GeometryElementInterchangeV1_2,
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
import GeometryElement from "../core/geometryElement";

export class SerializationError {
    /**
     * Error message for the user.
     *
     * @type {string}
     * @memberof SerializationError
     */
    public message: string;

    /**
     * The element that caused the error.
     * TBD on how ot use this in the future.
     * @type {*}
     * @memberof SerializationError
     */
    public element: string;

    /**
     * The JSON data that was being processed when the error occurred.
     *
     * @type {string}
     * @memberof SerializationError
     */
    public jsonData: string;

    /**
     * Creates an instance of SerializationError.
     * @param {string} message
     * @param {string} element
     * @param {string} jsonData
     * @memberof SerializationError
     */
    constructor(message: string, element: string, jsonData: string) {
        this.message = message;
        this.element = element;
        this.jsonData = jsonData;
    }

    /**
     * Converts the error to a string.
     * suitable for display to the user. or in a log file.
     *
     * @returns {string}
     * @memberof SerializationError
     */
    toText(): string {
        let ret = `Error: ${this.message}\n`;
        ret += `Element: ${this.element}\n`;
        ret += "JSON Data:\n";
        ret += "\`\`\`\n";
        ret += this.jsonData;
        ret += "\n\`\`\`\n";

        return ret;
    }
}


export default class ExportUtils {

    /**
     * Converts a device to interchange format.
     *
     * @static
     * @param {ViewManager} viewManagerDelegate
     * @returns {InterchangeV1_2}
     * @memberof ExportUtils
     */
    static toInterchangeV1_2(viewManagerDelegate: ViewManager, errorList:SerializationError[]): InterchangeV1_2 {
        if(viewManagerDelegate.currentDevice === null) {
            throw new Error("No device selected");
        }
        let renderLayers = [];
        if (viewManagerDelegate === null) throw new Error("Registry or viewManager not initialized");
        for (let i = 0; i < viewManagerDelegate.renderLayers.length; i++) {
            renderLayers.push(viewManagerDelegate.renderLayers[i].toInterchangeV1());
        }
        const device = viewManagerDelegate.currentDevice.toInterchangeV1(errorList);
        
        const valvemap = {};
        const valvetypemap = {};


        const newScratch: InterchangeV1_2 = {
            name: device.name,
            params: device.params,
            renderLayers: renderLayers,
            layers: device.layers,
            groups: device.groups,
            components: device.components,
            connections: device.connections,
            valves: device.valves,
            features: ExportUtils.featuresToInterchangeV1_2(viewManagerDelegate.currentDevice.parchmintFeatures) ,
            version: "1.2"
        };

        return newScratch;
    }

    /**
     * Converts a list of features to interchange format.
     * @static
     * @param {Array<GeometryElement>} featuresGeometries
     * @returns {Array<GeometryElementInterchangeV1_2>}
     * @memberof ExportUtils
     */
    static featuresToInterchangeV1_2(featuresGeometries: Array<GeometryElement>): Array<GeometryElementInterchangeV1_2> {
        let features: Array<GeometryElementInterchangeV1_2> = [];
        featuresGeometries.forEach(feature => {
            features.push(feature.toInterchageV1_2());
        });
        return features;
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
        };
        return ret;
    }
}

