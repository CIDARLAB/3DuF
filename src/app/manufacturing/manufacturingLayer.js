import paper from "paper";
import * as FeatureRenderer2D from "../view/render2D/featureRenderer2D";
import * as Registry from "../core/registry";
import Feature from "../core/feature";
/**
 * Manufacturing Layer class
 */
export default class ManufacturingLayer {
    /**
     * Default Constructor for the Manufacturing Layer
     * @param {String} name Name of the field
     */
    constructor(name) {
        this.__features = [];
        this.__name = name;
        this.__paperGroup = new paper.Group();
    }

    /**
     * Returns the name field
     * @return {String} Returns the name of the field
     * @memberof ManufacturingLayer
     */
    get name() {
        return this.__name;
    }

    /**
     * Adds a feature to the manufacturing layer
     * @param {Feature} feature Feature to add to the layer
     * @memberof ManufacturingLayer
     * @returns {boolean} 
     */
    addFeature(feature) {
        if (null === feature || undefined == feature) {
            return false;
        }
        let copy = feature.clone();
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
    generateFeatureRender(feature, renderkey) {
        console.log("Generating Render for invisible feature", feature);

        let render = FeatureRenderer2D.renderFeature(feature, renderkey);
        this.__features.push(render);

        this.__paperGroup.addChild(render);
        return true;
    }

    /**
     * Flips the manufacturing layer in X-Axis
     * @memberof ManufacturingLayer
     * @returns {void}
     */
    flipX() {
        // console.warn("Implement method to flip the the group");
        /*
        Step 2 - Flip the whole godamn thing
         */
        let yspan = Registry.currentDevice.getYSpan();
        let xspan = Registry.currentDevice.getXSpan();

        console.log("Flipping stuff:", xspan, yspan);

        let center = new paper.Point(xspan / 2, yspan / 2);

        this.__paperGroup.scale(-1, 1, center);
    }

    /**
     * Returns the SVG text
     * @return {*}
     * @memberof ManufacturingLayer
     */
    exportToSVG() {
        let xspan = Registry.currentDevice.getXSpan();
        let yspan = Registry.currentDevice.getYSpan();
        let svgtext = this.__paperGroup.exportSVG({ asString: true });
        svgtext = ManufacturingLayer.generateSVGTextPrepend(xspan, yspan) + svgtext + ManufacturingLayer.generateSVGTextAppend();
        return svgtext;
    }
    /**
     * @memberof ManufacturingLayer
     * @returns {void}
     */
    flushData() {
        this.__paperGroup.removeChildren();
    }

    /**
     * Generates the SVG Prepend
     * @param {number} xspan
     * @param {number} yspan
     * @return {string}
     * @memberof ManufacturingLayer
     */
    static generateSVGTextPrepend(xspan, yspan) {
        let text = `<svg width=\"${xspan / 1000}mm\" height=\"${yspan / 1000}mm\" viewBox=\"0 0 ${xspan} ${yspan}\">`;
        return text;
    }

    /**
     * Generates the SVG Append
     * @return {string}
     * @memberof ManufacturingLayer
     */
    static generateSVGTextAppend() {
        return "</svg>";
    }
}
