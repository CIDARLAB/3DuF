var Registry = require("../core/registry");

class PanAndZoom {
	static stableZoom(zoom, position) {
		let newZoom = zoom;
		let p = position;
		let c = paper.view.center;
		let beta = paper.view.zoom / newZoom;
		let pc = p.subtract(c);
		let a = p.subtract(pc.multiply(beta)).subtract(c);
		let newCenter = this.calcCenter(a.x, a.y);
		Registry.canvasManager.setCenter(newCenter.x, newCenter.y);
		Registry.canvasManager.setZoom(newZoom);
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

	static calcCenter(deltaX, deltaY, factor) {
		let offset = new paper.Point(deltaX, deltaY);
		//offset = offset.multiply(factor);
		return paper.view.center.add(offset);
	}
}

module.exports = PanAndZoom;