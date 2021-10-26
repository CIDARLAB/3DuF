import ManufacturingLayer from "./manufacturingLayer";
import DepthFeatureMap from "./depthFeatureMap";
import Device from "../core/device";
import { ComponentAPI } from "@/componentAPI";
import { ViewManager } from "..";
import SubstrateFeatureMap from "./substrateFeatureMap";
import { LogicalLayerType } from "../core/init";

import Layer from "../core/layer";
import Feature from "../core/feature";
import { DFMType } from "./ManufacturingInfo";

/**
 * Lasser Cutting Generator object
 */
export default class LaserCuttingGenerator {
    /**
     * Default Constructor for the laser cutting generator object
     * @param {Device} device Device object
     * @param {*} viewManagerDelegate
     */

    private __device: Device;
    private __viewManagerDelegate: ViewManager;
    private __svgData: Map<String, string>;
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
        /*
        Step 1 - Get all the layers
        Step 2 - Get all the ports in each of the layers
        Step 3 - Create a manufacturing layer
                -  Populate with the ports
         */
        // let components = this.__device.components;
        const layers: Array<Layer> = this.__device.layers;

        const mfglayers: Array<ManufacturingLayer> = [];

        for (const i in layers) {
            const layer: Layer = layers[i];
            const ports: Array<string> = [];

            const features = layer.features;

            for (const key in features) {
                const feature: Feature = features[key];
                // TODO: Include fabtype check also
                if (feature.getType() === "Port") {
                    ports.push(key);
                }
            }

            if (ports.length === 0) {
                continue;
            }

            const manufacturinglayer = new ManufacturingLayer("ports_" + layer.name + "_" + i);
            // console.log("manufacturing layer :", manufacturinglayer);

            for (const fi in ports) {
                const featurekey: string = ports[fi];
                // console.log("Key:", featurekey);
                // console.log("rendered:feature", this.__viewManagerDelegate.view.getRenderedFeature(featurekey));
                const issuccess: boolean = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(featurekey));
                if (!issuccess) {
                    console.error("Could not find the feature for the corresponding id: " + featurekey);
                }
            }

            // We flip all the ports for this system
            // TODO: Future manufacturing user interface will require us to have options for each of the UI elements
            manufacturinglayer.flipX();

            mfglayers.push(manufacturinglayer);
        }

        console.log("mfglayers:", mfglayers);

        const ref = this;
        mfglayers.forEach(function(mfglayer, index) {
            ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
            mfglayer.flushData();
        });

        console.log("SVG Outputs:", this.__svgData);
    }

    /**
     * Generates separate mfglayers and svgs for each of the depth layers
     * @memberof LaserCuttingGenerator
     * @returns {void}
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

        for (const i in layers) {
            const layer: Layer = layers[i];

            const features: { [index: string]: Feature } = layer.features;

            if (layer.type === LogicalLayerType.CONTROL) {
                isControl = true;
            }

            const featuresubstratemap: SubstrateFeatureMap = new SubstrateFeatureMap(layer.name);

            //Generate map of features on each substrate
            for (const key in features) {
                const feature: Feature = features[key];
                // TODO: Modify the port check
                if (feature.manufacturingInfo.fabtype === DFMType.XY && feature.getType() !== "Port") {
                    let substrate: string = feature.manufacturingInfo["substrate-offset"];
                    //let substrate: number = feature.getValue(feature.manufacturingInfo["substrate-offset"]);
                    console.log("Substrate of feature: ", key, substrate, features[key]);
                    featuresubstratemap.addFeature(substrate, features[key]);
                }
            }

            // For each substrate offset, produce the depth-based layers
            const offsets: IterableIterator<string> | undefined = featuresubstratemap.getOffsets();
            if (offsets == undefined) throw new Error("Offsets not captured for layer " + i);
            for (const substrate of offsets) {
                const relevantFeatures: Array<Feature> | undefined = featuresubstratemap.getFeaturesOfOffset(substrate);
                // Create the depthmap for this
                const featuredepthmap: DepthFeatureMap = new DepthFeatureMap(layer.name);

                for (const key in relevantFeatures) {
                    const feature: Feature = relevantFeatures[key];
                    // TODO: Modify the port check
                    if (feature.manufacturingInfo.fabtype === DFMType.XY && feature.getType() !== "Port") {
                        let depth: number = feature.getValue(feature.manufacturingInfo["z-offset-key"]);
                        console.log("Depth of feature: ", feature.ID, depth);
                        featuredepthmap.addFeature(depth, feature.ID);
                    }
                }

                // Generate Manufacturing Layers for each depth
                let manufacturinglayer: ManufacturingLayer;
                for (const depth of featuredepthmap.getDepths()) {
                    manufacturinglayer = new ManufacturingLayer(layer.name + "_" + i + "_" + depth + "_" + substrate);
                    const depthfeatures: Array<string> | undefined = featuredepthmap.getFeaturesAtDepth(depth);
                    for (const j in depthfeatures) {
                        const featurekey: string = depthfeatures[j];

                        const issuccess: boolean = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(featurekey));
                        if (!issuccess) {
                            console.error("Could not find the feature for the corresponding id: " + featurekey);
                        }
                    }

                    if (substrate != "0" || isControl) {
                        manufacturinglayer.flipX();
                    }

                    mfglayers.push(manufacturinglayer);
                }
            }
        }

        console.log("XY Manufacturing Layers:", mfglayers);
        const ref = this;
        mfglayers.forEach(function(mfglayer, index) {
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
        /*
        Step 1 - Go through each of the layers
        Step 2 - Get all the EDGE features in the drawing
        Step 3 - Generate separate SVGs
         */
        const layers: Array<Layer> = this.__device.layers;

        const mfglayers: Array<ManufacturingLayer> = [];

        let manufacturinglayer: ManufacturingLayer;

        let isControl: boolean = false;

        for (const i in layers) {
            const layer: Layer = layers[i];
            manufacturinglayer = new ManufacturingLayer(layer.name + "_" + i + "_EDGE");

            if (layer.name === "control") {
                isControl = true;
            }

            const features: { [index: string]: Feature } = layer.features;

            for (const key in features) {
                const feature: Feature = features[key];
                // TODO: Modify the port check
                if (feature.fabType === "EDGE") {
                    console.log("EDGE Feature: ", key);
                    const issuccess: boolean = manufacturinglayer.addFeature(this.__viewManagerDelegate.view.getRenderedFeature(key));
                    if (!issuccess) {
                        console.error("Could not find the feature for the corresponding id: " + key);
                    }
                }
            }

            if (isControl) {
                manufacturinglayer.flipX();
                isControl = false;
            }

            mfglayers.push(manufacturinglayer);
        }

        console.log("EDGE Manufacturing Layers:", mfglayers);

        const ref = this;
        mfglayers.forEach(function(mfglayer, index) {
            ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
            mfglayer.flushData();
        });
    }

    /**
     * Sets the device the CNCGenerator needs to work of
     * @param {Device} currentDevice
     * @memberof LaserCuttingGenerator
     * @returns {void}
     */
    setDevice(currentDevice: Device): void {
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

        for (const i in layers) {
            const layer: Layer = layers[i];
            const negatives = [];

            const features: { [index: string]: Feature } = layer.features;

            if (layer.name === "control") {
                isControl = true;
            }

            // Add logic to generate the here to check if its control...
            if (isControl) {
                const manufacturinglayer = new ManufacturingLayer("control_negative_" + layer.name + "_" + i);

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
                        /*
                        If the type has an inverse layer, then generate the inverse feature render
                         and throw it into the manufacturing layer.
                         */
                        manufacturinglayer.generateFeatureRender(feature, "INVERSE");
                    }
                }

                mfglayers.push(manufacturinglayer);
                isControl = false;
            }
        }

        console.log("Inverse Control Manufacturing Layers:", mfglayers);

        const ref = this;
        mfglayers.forEach(function(mfglayer, index) {
            ref.__svgData.set(mfglayer.name, mfglayer.exportToSVG());
            mfglayer.flushData();
        });
    }
}
