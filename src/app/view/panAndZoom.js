export default class PanAndZoom {
    constructor(paperView) {
        this.view = paperView;
    }
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

    adjustZoom(delta, position) {
        this.stableZoom(this.calcZoom(delta), position);
    }

    // Stable pan and zoom modified from: http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/

    calcZoom(delta, multiplier = 1.177827941003) {
        if (delta < 0) return this.view.getZoom() * multiplier;
        else if (delta > 0) return this.view.getZoom() / multiplier;
        else return this.view.getZoom();
    }

    moveCenter(delta) {
        this.view.setCenter(this.calcCenter(delta));
    }

    calcCenter(delta) {
        return this.view.getCenter().subtract(delta);
    }
}
