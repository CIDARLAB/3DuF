import { PaperView } from "..";

/**
 * Pan and Zoom class
 */
export default class PanAndZoom {
    view: PaperView;

    /**
     * Default Constructor for the PanAndZoom object
     * @param {*} paperView
     */
    constructor(paperView: PaperView) {
        this.view = paperView;
    }

    /**
     * Sets a zoom value to a certain position
     * @param {number} zoom Zoom value
     * @param {Array<number>} position X and Y coordinates
     * @returns {void}
     * @memberof PanAndZoom
     */
    stableZoom(zoom: number, position: paper.Point) {
        const newZoom = zoom;
        const p = position;
        const c = this.view.getCenter();
        const beta = this.view.getZoom() / newZoom;
        const pc = p.subtract(c);
        const a = p.subtract(pc.multiply(beta)).subtract(c);
        this.view.setCenter(this.view.getCenter().add(a));
        this.view.setZoom(newZoom);
    }

    /**
     * Adjust the zoom and the position
     * @param {number} delta Value of adjustment of the zoom value
     * @param {Array<number>} position X and Y coordinates
     * @returns {void}
     * @memberof PanAndZoom
     */
    adjustZoom(delta: number, position: paper.Point) {
        this.stableZoom(this.calcZoom(delta), position);
    }

    // Stable pan and zoom modified from: http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/
    /**
     * Calculates the zoom
     * @param {number} delta Value of adjustment of the zoom value
     * @param {number} multiplier Default = 1.177827941003
     * @returns {number}
     * @memberof PanAndZoom
     */
    calcZoom(delta: number, multiplier = 1.177827941003): number {
        if (delta < 0) return this.view.getZoom() * multiplier;
        else if (delta > 0) return this.view.getZoom() / multiplier;
        else return this.view.getZoom();
    }

    /**
     * Updates the center coordinates
     * @param {number} delta Value of adjustment of the zoom value
     * @returns {void}
     * @memberof PanAndZoom
     */
    moveCenter(delta: paper.Point) {
        this.view.setCenter(this.calcCenter(delta));
    }

    /**
     * Calculates the new center position
     * @param {number} delta Value of adjustment of the zoom value
     * @returns {Array<number>} Returns and array with X and Y coordinates
     * @memberof PanAndZoom
     */
    calcCenter(delta: paper.Point): paper.Point {
        return this.view.getCenter().subtract(delta);
    }
}
