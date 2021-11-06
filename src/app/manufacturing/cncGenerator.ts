import ManufacturingLayer from "./manufacturingLayer";
import DepthFeatureMap from "./depthFeatureMap";
import SubstrateFeatureMap from "./substrateFeatureMap";
import { LogicalLayerType } from "../core/init";

import Device from "../core/device";
import Layer from "../core/layer";
import Feature from "../core/feature";
import viewManager from "../view/viewManager";
import paper from "paper";
import { DFMType } from "./ManufacturingInfo";

/**
 * GNCGenerator class
 */
export default class CNCGenerator {
    __device: Device;
    __viewManagerDelegate: viewManager;
    __svgData: Map<String, string>;

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
    getSVGOutputs(): Map<String, string> {
        return this.__svgData;
    }

    /**
     * Generate the port layers
     * @memberof CNCGenerator
     * @returns {void}
     */
    generatePortLayers(): void {
        /*
        Step 1 - Get all the layers
        Step 2 - Get all the ports in each of the layers
        Step 3 - Create a manufacturing layer
                -  Populate with the ports
         */
        // let components = this.__device.components;

        console.log("Port layers called and not executed");
        // const layers: Array<Layer> = this.__device.layers;
        // console.log("LAYERS ", layers);

        // const mfglayers: Array<ManufacturingLayer> = [];
        // console.log("MFGLAYERS: ", mfglayers);
        // let isControl: boolean = false;

        // for (const i in layers) {
        //     const layer: Layer = layers[i];
        //     const ports: Array<string> = [];

        //     const features: { [index: string]: Feature } = layer.features;

        //     if (layer.type === LogicalLayerType.CONTROL) {
        //         isControl = true;
        //     }

        //     for (const key in features) {
        //         const feature: Feature = features[key];
        //         // TODO: Include fabtype check also
        //         if (feature.getType() === "Port") {
        //             ports.push(key);
        //         }
        //     }

        //     if (ports.length === 0) {
        //         continue;
        //     }

        //     const manufacturinglayer: ManufacturingLayer = new ManufacturingLayer("PORTS_" + layer.name);
        //     // console.log("manufacturing layer :", manufacturinglayer);

        //     for (const fi in ports) {
        //         const featurekey: string = ports[fi];
        //         // console.log("Key:", featurekey);
        //         // console.log("rendered:feature", this.__viewManagerDelegate.view.getRenderedFeature(featurekey));
        //         const issuccess: boolean = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(featurekey));
        //         if (!issuccess) {
        //             console.error("Could not find the feature for the corresponding id: " + featurekey);
        //         }
        //     }

        //     if (isControl) {
        //         manufacturinglayer.flipX();
        //         isControl = false;
        //     }

        //     mfglayers.push(manufacturinglayer);
        // }

        // console.log("mfglayers:", mfglayers);

        // const ref = this;
        // mfglayers.forEach(function(mfglayer: ManufacturingLayer, index: number) {
        //     ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
        //     mfglayer.flushData();
        // });

        // console.log("SVG Outputs:", this.__svgData);
    }

    /**
     * Generates separate mfglayers and svgs for each of the depth layers
     * @returns {void}
     * @memberof CNCGenerator
     */
    generateDepthLayers(): void {
        /*
        Step 1 - Go through each of the layers
        Step 2 - At each layer:
                   Step 2.1 - Sort each of the features based on their depths
                   Step 2.2 - Generate manufacturing layers for each of the depths

         */
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
                if (feature.manufacturingInfo.substrate != null) {
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
                    const manufacturingLayer: ManufacturingLayer = manufacturingLayerMap.get(manufacturingLayerName);
                    const issuccessful: boolean = manufacturingLayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(feature.ID));
                    if (!issuccessful) console.error("Could not find the feature for the corresponding id: " + feature.ID);
                    manufacturingLayerMap.set(manufacturingLayerName, manufacturingLayer);
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
        /*
        Step 1 - Go through each of the layers
        Step 2 - Get all the EDGE features in the drawing
        Step 3 - Generate separate SVGs
         */

        const topleft = new paper.Point(0, 0);
        const bottomright = new paper.Point(this.__device.getXSpan(), this.__device.getYSpan());
        const edge = new paper.Path.Rectangle(topleft, bottomright);
        const mfglayer = new ManufacturingLayer("UniversalEdge");
        mfglayer.addFeature(edge);
        const ref = this;
        ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
        mfglayer.flushData();

        // const layers: Array<Layer> = this.__device.layers;

        // const mfglayers: Array<ManufacturingLayer> = [];

        // let manufacturinglayer: ManufacturingLayer;

        // let isControl: boolean = false;

        // for (const i in layers) {
        //     const layer: Layer = layers[i];
        //     manufacturinglayer = new ManufacturingLayer("EDGE_" + layer.name);

        //     if (layer.type === LogicalLayerType.CONTROL) {
        //         isControl = true;
        //     }

        //     const features: { [index: string]: Feature } = layer.features;

        //     for (const key in features) {
        //         const feature: Feature = features[key];
        //         // TODO: Modify the port check
        //         if (feature.fabType === DFMType.EDGE) {
        //             console.log("EDGE Feature: ", key);
        //             const issuccess: boolean = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(key));
        //             if (!issuccess) {
        //                 console.error("Could not find the feature for the corresponding id: " + key);
        //             }
        //         }
        //     }

        //     if (isControl) {
        //         manufacturinglayer.flipX();
        //         isControl = false;
        //     }

        //     mfglayers.push(manufacturinglayer);
        // }

        // console.log("EDGE Manufacturing Layers:", mfglayers);

        // const ref = this;
        // mfglayers.forEach(function(mfglayer: ManufacturingLayer, index: number) {
        //     ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
        //     mfglayer.flushData();
        // });
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
