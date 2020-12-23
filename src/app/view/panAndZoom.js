/**
 * Pan and Zoom class
 */
export default class PanAndZoom {
    /**
     * Default Constructor for the PanAndZoom object
     * @param {*} paperView 
     */
    constructor(paperView) {
        this.view = paperView;
    }
    /**
     * Sets a zoom value to a certain position
     * @param {number} zoom Zoom value
     * @param {Array<number>} position X and Y coordinates
     * @returns {void}
     * @memberof PanAndZoom
     */
    stableZoom(zoom, position) {
        let newZoom = zoom;
        let p = position;
        let c = this.view.getCenter();
        let beta = this.view.getZoom() / newZoom;
        let pc = p.subtract(c);
        let a = p.subtract(pc.multiply(beta)).subtract(c);
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
    adjustZoom(delta, position) {
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
    calcZoom(delta, multiplier = 1.177827941003) {
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
    moveCenter(delta) {
        this.view.setCenter(this.calcCenter(delta));
    }
    /**
     * Calculates the new center position
     * @param {number} delta Value of adjustment of the zoom value
     * @returns {Array<number>} Returns and array with X and Y coordinates
     * @memberof PanAndZoom
     */
    calcCenter(delta) {
        return this.view.getCenter().subtract(delta);
    }
}
