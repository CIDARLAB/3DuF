import paper from "paper";
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";
import Registry from "../core/registry";
import Feature from "../core/feature";
import Device from "../core/device";
import { PaperView } from "..";
import { ToolPaperObject } from "../core/init";

/**
 * Manufacturing Layer class
 */
export default class ManufacturingLayer {
    __features: Array<ToolPaperObject>;
    __name: String;
    __paperGroup: paper.Group;
    __flip: boolean;

    /**
     * Default Constructor for the Manufacturing Layer
     * @param {String} name Name of the field
     */
    constructor(name: String, flip = false) {
        this.__features = [];
        this.__name = name;
        this.__paperGroup = new paper.Group();
        this.__flip = flip;
    }

    /**
     * Returns the name field
     * @return {String} Returns the name of the field
     * @memberof ManufacturingLayer
     */
    get name(): String {
        return this.__name;
    }

    /**
     * Returns the flip property
     * @return {boolean} Returns a boolean representing whether the manufacturing layer should be flipped
     * @memberof ManufacturingLayer
     */
    get flip(): boolean {
        return this.__flip;
    }

    /**
     * Adds a feature to the manufacturing layer
     * @param {Feature} feature Feature to add to the layer
     * @memberof ManufacturingLayer
     * @returns {boolean}
     */
    addFeature(feature: ToolPaperObject) {
        if (feature === null || undefined === feature) {
            return false;
        }
        const copy: ToolPaperObject = feature.clone();
        console.log("Copied feature", copy);
        this.__features.push(copy);

        this.__paperGroup.addChild(copy);
        return true;
    }

    /**
     * Generates the paperjs render for a feature that has no render displayed on the canvas
     * and hence cannot get the render out of display set.
     * @param feature
     * @param renderkey
     * @returns {boolean}
     * @memberof ManufacturingLayer
     */
    generateFeatureRender(feature: Feature, renderkey: string | null): boolean {
        console.log("Generating Render for invisible feature", feature);

        const render: ToolPaperObject = FeatureRenderer2D.renderFeature(feature, renderkey);
        this.__features.push(render);

        this.__paperGroup.addChild(render);
        return true;
    }

    /**
     * Flips the manufacturing layer in X-Axis
     * @memberof ManufacturingLayer
     * @returns {void}
     */
    flipX(): void {
        // console.warn("Implement method to flip the the group");
        /*
        Step 2 - Flip the whole godamn thing
         */
        const currentDevice: Device | null = Registry.currentDevice;
        if (currentDevice != null) {
            const yspan = currentDevice.getYSpan();
            const xspan = currentDevice.getXSpan();

            console.log("Flipping stuff:", xspan, yspan);

            const center = new paper.Point(xspan / 2, yspan / 2);

            this.__paperGroup.scale(-1, 1, center);
        }
    }

    /**
     * Returns the SVG text
     * @return {string}
     * @memberof ManufacturingLayer
     */
    exportToSVG(): string {
        const currentDevice: Device | null = Registry.currentDevice;
        if (currentDevice != null) {
            const yspan = currentDevice.getYSpan();
            const xspan = currentDevice.getXSpan();
            let svgtext = this.__paperGroup.exportSVG({ asString: true });
            svgtext = ManufacturingLayer.generateSVGTextPrepend(xspan, yspan) + svgtext + ManufacturingLayer.generateSVGTextAppend();
            return svgtext;
        } else {
            throw new Error("Registry.currentDevice is null");
        }
    }

    /**
     * @memberof ManufacturingLayer
     * @returns {void}
     */
    flushData(): void {
        this.__paperGroup.removeChildren();
    }

    /**
     * Generates the SVG Prepend
     * @param {number} xspan
     * @param {number} yspan
     * @return {string}
     * @memberof ManufacturingLayer
     */
    static generateSVGTextPrepend(xspan: number, yspan: number): string {
        const text = `<svg width=\"${xspan / 1000}mm\" height=\"${yspan / 1000}mm\" viewBox=\"0 0 ${xspan} ${yspan}\">`;
        return text;
    }

    /**
     * Generates the SVG Append
     * @return {string}
     * @memberof ManufacturingLayer
     */
    static generateSVGTextAppend(): string {
        return "</svg>";
    }
}
