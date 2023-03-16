import ManufacturingLayer from "./manufacturingLayer";
import DepthFeatureMap from "./depthFeatureMap";
import { LogicalLayerType } from "../core/init";

import Device from "../core/device";
import Layer from "../core/layer";
import Feature from "../core/feature";
import viewManager from "../view/viewManager";
import paper from "paper";
import { DFMType } from "./manufacturingInfo";

/**
 * GNCGenerator class
 */
export default class CNCGenerator {
    __device: Device;
    __viewManagerDelegate: viewManager;
    __svgData: Map<string, string>;

    /**
     * Default Constructor of GNCGenerator object.
     * @param {Device} device Device object
     * @param {*} viewManagerDelegate
     */
    constructor(device: Device, viewManagerDelegate: viewManager) {
        this.__device = device;
        this.__viewManagerDelegate = viewManagerDelegate;

        this.__svgData = new Map();
    }

    /**
     * Gets the SVG output
     * @returns {}
     * @memberof CNCGenerator
     */
    getSVGOutputs(): Map<string, string> {
        return this.__svgData;
    }

    /**
     * Generate the port layers
     * @memberof CNCGenerator
     * @returns {void}
     */
    generatePortLayers(): void {

        console.log("Port layers called and not executed, functionality moved to generateDepthLayers");
    }

    /**
     * Generates separate mfglayers and svgs for each of the depth layers
     * @returns {void}
     * @memberof CNCGenerator
     */
    generateDepthLayers(): void {
        // Generate a manufacturing layer for each logical layer,
        // substrate, dpeth combination in device
        // and output to svg

        const layers: Array<Layer> = this.__device.layers;

        const mfglayers: Array<ManufacturingLayer> = [];
        let isControl: boolean = false;

        const manufacturingLayerMap: Map<string, ManufacturingLayer> = new Map();
        for (const i in layers) {
            const layer: Layer = layers[i];

            const features: { [index: string]: Feature } = layer.features;

            if (layer.type === LogicalLayerType.CONTROL) {
                isControl = true;
            }

            for (const key in features) {
                const feature: Feature = features[key];

                let manufacturingLayerName: string;
                if (feature.manufacturingInfo.substrate !== null) {
                    manufacturingLayerName =
                        feature.manufacturingInfo.modifier +
                        "_" +
                        feature.manufacturingInfo.layertype +
                        "_" +
                        feature.manufacturingInfo.substrate.toString() +
                        "_" +
                        feature.manufacturingInfo.depth;
                } else {
                    throw new Error("Manufacturing layer name failed to be generated");
                }

                if (manufacturingLayerMap.has(manufacturingLayerName)) {
                    const manufacturingLayer: ManufacturingLayer | undefined = manufacturingLayerMap.get(manufacturingLayerName);
                    let issuccessful: boolean;
                    if (manufacturingLayer != undefined) {
                        issuccessful = manufacturingLayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(feature.ID));
                        if (!issuccessful) console.error("Could not find the feature for the corresponding id: " + feature.ID);
                        manufacturingLayerMap.set(manufacturingLayerName, manufacturingLayer);
                    } else {
                        throw new Error("manufacturingLayer undefined");
                    }
                } else {
                    const odd: number = feature.manufacturingInfo.substrate % 2;
                    let flip: boolean = false;
                    if (odd == 1) flip = true;
                    const manufacturingLayer = new ManufacturingLayer(manufacturingLayerName, flip);
                    const issuccessful: boolean = manufacturingLayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(feature.ID));
                    if (!issuccessful) console.error("Could not find the feature for the corresponding id: " + feature.ID);
                    manufacturingLayerMap.set(manufacturingLayerName, manufacturingLayer);
                }
            }
        }

        manufacturingLayerMap.forEach((manufacturingLayer, manufacturingLayerName) => {
            if (manufacturingLayer.flip) {
                manufacturingLayer.flipX();
            }
            mfglayers.push(manufacturingLayer);
        });

        console.log("XY Manufacturing Layers:", mfglayers);
        const ref = this;
        mfglayers.forEach(function(mfglayer: ManufacturingLayer, index: number) {
            ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
            mfglayer.flushData();
        });
    }

    /**
     * Generates all the edge cuts
     * @returns {void}
     * @memberof CNCGenerator
     */
    generateEdgeLayers(): void {
        // TODO: Replace with something that does not
        // simply generate a rectangle the dimensions of the device

        const topleft = new paper.Point(0, 0);
        const bottomright = new paper.Point(this.__device.getXSpan(), this.__device.getYSpan());
        const edge = new paper.Path.Rectangle(topleft, bottomright);
        const mfglayer = new ManufacturingLayer("UniversalEdge");
        mfglayer.addFeature(edge);
        const ref = this;
        ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
        mfglayer.flushData();
    }

    /**
     * Sets the device the CNCGenerator needs to work of
     * @param {Device} currentDevice
     * @returns {void}
     * @memberof CNCGenerator
     */
    setDevice(currentDevice: Device): void {
        this.__device = currentDevice;
        console.log("Currentdevice:", currentDevice);
    }

    /**
     * Flush all the data
     * @returns {void}
     * @memberof CNCGenerator
     */
    flushData(): void {
        this.__svgData.clear();
    }
}
