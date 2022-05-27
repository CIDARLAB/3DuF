import ManufacturingLayer from "./manufacturingLayer";
import DepthFeatureMap from "./depthFeatureMap";
import Device from "../core/device";
import { ComponentAPI } from "@/componentAPI";
import Layer from "../core/layer";
import Feature from "../core/feature";
import { LogicalLayerType } from "../core/init";
import paper from "paper"
import { ViewManager } from "..";

/**
 * Lasser Cutting Generator object
 */
export default class LaserCuttingGenerator {
    private __device: Device;
    private __viewManagerDelegate: ViewManager;

    private __svgData: Map<any, any>;

    /**
     * Default Constructor for the laser cutting generator object
     * @param {Device} device Device object
     * @param {*} viewManagerDelegate
     */
    constructor(device: Device, viewManagerDelegate: ViewManager) {
        this.__device = device;
        this.__viewManagerDelegate = viewManagerDelegate;

        this.__svgData = new Map();
    }

    /**
     * Gets the SVG data
     * @returns Returns the SVG data
     * @memberof LaserCuttingGenerator
     */
    getSVGOutputs(): Map<String, string> {
        return this.__svgData;
    }

    /**
     * Generate the port layers
     * @memberof LaserCuttingGenerator
     * @returns {void}
     */
    generatePortLayers(): void {

        console.log("Port layers called and not executed, functionality moved to generateDepthLayers");
    }

    /**
     * Generates separate mfglayers and svgs for each of the depth layers
     * @memberof LaserCuttingGenerator
     * @returns {void}
     */
    generateDepthLayers(): void {
        // Generate a manufacturing layer for each logical layer,
        // substrate, depth combination in device
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
     * @memberof LaserCuttingGenerator
     * @returns {void}
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
     * @memberof LaserCuttingGenerator
     * @returns {void}
     */
    setDevice(currentDevice: Device) {
        this.__device = currentDevice;
        console.log("Currentdevice:", currentDevice);
    }

    /**
     * Flush all the data
     * @memberof LaserCuttingGenerator
     * @returns {void}
     */
    flushData(): void {
        this.__svgData.clear();
    }

    /**
     * Generates all the glue burn off layers necessary for the valves
     * @memberof LaserCuttingGenerator
     * @returns {void}
     */
    generateInverseControlLayers(): void {
        console.log("Generating inverse layers");
        const layers: Array<Layer> = this.__device.layers;

        const mfglayers: Array<ManufacturingLayer> = [];

        let isControl: boolean = false;
        const manufacturingLayerMap: Map<string, ManufacturingLayer> = new Map();
        for (const i in layers) {
            const layer: Layer = layers[i];

            const features: { [index: string]: Feature } = layer.features;

            if (layer.type == LogicalLayerType.CONTROL) {
                isControl = true;
            }

            // Add logic to generate the here to check if its control...
            if (isControl) {
                // Do the actual feature generation part here
                for (const key in features) {
                    const feature: Feature = features[key];
                    // TODO: Include fabtype check also
                    const type: string = feature.getType();

                    /*
                    Check if type has an inverse layer
                     */

                    // Skip the EDGE features
                    if (type === "EDGE") {
                        continue;
                    }

                    if (ComponentAPI.hasInverseRenderLayer(type)) {
                        let manufacturingLayerName: string;
                        console.log("TYPE: ",feature.type);
                        console.log("MANINFO: ", feature.manufacturingInfo);
                        if (feature.manufacturingInfo.substrate != null) {
                            manufacturingLayerName =
                                "INVERSE" +
                                "_" +
                                feature.manufacturingInfo.layertype +
                                "_" +
                                feature.manufacturingInfo.substrate.toString() +
                                "_" +
                                feature.manufacturingInfo.depth;
                        } else {
                            throw new Error("Manufacturing layer name failed to be generated");
                        }
                        console.log(manufacturingLayerName);
                        if (manufacturingLayerMap.has(manufacturingLayerName)) {
                            const manufacturingLayer: ManufacturingLayer | undefined = manufacturingLayerMap.get(manufacturingLayerName);
                            let issuccessful: boolean;
                            if (manufacturingLayer != undefined) {
                                issuccessful = manufacturingLayer.generateFeatureRender(feature, "INVERSE");
                                if (!issuccessful) console.error("Could not find the feature for the corresponding id: " + feature.ID);
                                manufacturingLayerMap.set(manufacturingLayerName, manufacturingLayer);
                            } else {
                                throw new Error("manufacturingLayer undefined");
                            }
                        } else {
                            const manufacturingLayer = new ManufacturingLayer(manufacturingLayerName);
                            const issuccessful: boolean = manufacturingLayer.generateFeatureRender(feature, "INVERSE");
                            if (!issuccessful) console.error("Could not find the feature for the corresponding id: " + feature.ID);
                            manufacturingLayerMap.set(manufacturingLayerName, manufacturingLayer);
                        }
                        /*
                        If the type has an inverse layer, then generate the inverse feature render
                         and throw it into the manufacturing layer.
                         */
                    }
                }
                isControl = false;
            }
        }

        manufacturingLayerMap.forEach((manufacturingLayer, manufacturingLayerName) => {
            mfglayers.push(manufacturingLayer);
        });

        console.log("Inverse Control Manufacturing Layers:", mfglayers);

        const ref = this;
        mfglayers.forEach(function(mfglayer: ManufacturingLayer, index: number) {
            ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
            mfglayer.flushData();
        });
    }
}
