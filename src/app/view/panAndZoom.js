var Registry = require("../core/registry");

class PanAndZoom {
    static stableZoom(zoom, position) {
        let newZoom = zoom;
        let p = position;
        let c = paper.view.center;
        let beta = paper.view.zoom / newZoom;
        let pc = p.subtract(c);
        let a = p.subtract(pc.multiply(beta)).subtract(c);
        paper.view.center = paper.view.center.add(a);
        paper.view.zoom = newZoom;
    }

    static adjustZoom(delta, position) {
        this.stableZoom(this.calcZoom(delta), position);
    }

    // Stable pan and zoom modified from: http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/

    static calcZoom(delta, multiplier = 1.177827941003) {
        if (delta < 0) return paper.view.zoom * multiplier;
        else if (delta > 0) return paper.view.zoom / multiplier;
        else return paper.view.zoom;
    }

    static moveCenter(delta){
        paper.view.center = PanAndZoom.calcCenter(delta);
    }

    static calcCenter(delta){
        return paper.view.center.subtract(delta);
    }
}

module.exports = PanAndZoom;