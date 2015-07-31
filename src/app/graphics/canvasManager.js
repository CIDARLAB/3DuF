var Registry = require("../core/registry");
var GridGenerator = require("./gridGenerator");

class CanvasManager {
    constructor(){
        this.paperDevice = undefined;
        this.grid = undefined;
        this.gridSpacing = 20;
        if (!Registry.canvasManager) Registry.canvasManager = this;
        else throw new Error("Cannot register more than one CanvasManager");
    }

    render(forceUpdate = true){
        this.renderDevice();
        this.renderGrid();
        paper.view.update(forceUpdate);
    }

    renderGrid(forceUpdate = true){
        if (this.grid){
            this.grid.remove();
        } 
        this.grid = GridGenerator.makeGrid(this.gridSpacing);
        if (this.paperDevice) this.grid.insertBelow(this.paperDevice);
        paper.view.update(forceUpdate);
    }

    setGridSize(size, forceUpdate = true){
        this.gridSpacing = size;
        this.renderGrid(forceUpdate);
    }

    renderDevice(forceUpdate = true){
        if (this.paperDevice) {
            this.paperDevice.remove();
        }
        this.paperDevice = Registry.currentDevice.render2D(this.paper);
        if (this.grid) this.paperDevice.insertAbove(this.grid);
        paper.view.update(forceUpdate);
    }

    // Stable pan and zoom modified from: http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/

    calcZoom(delta, multiplier = 1.1){
        if (delta < 0) return paper.view.zoom * multiplier;
        else if (delta > 0) return paper.view.zoom / multiplier;
        else return paper.view.zoom;
    }

    calcCenter(deltaX, deltaY, factor){
        let offset = new paper.Point(deltaX, deltaY);
        //offset = offset.multiply(factor);
        return paper.view.center.add(offset);
    }

    setCenter(x,y){
        paper.view.center = new paper.Point(x, y);
        this.render();
    }

    adjustZoom(delta, position){
        this.stableZoom(this.calcZoom(delta), position);
    }

    stableZoom(zoom, position){
        let newZoom = zoom;
        let p = position;
        let c = paper.view.center;
        let beta = paper.view.zoom / newZoom;
        let pc = p.subtract(c);
        let a = p.subtract(pc.multiply(beta)).subtract(c);
        let newCenter = this.calcCenter(a.x, a.y);
        this.setCenter(newCenter.x, newCenter.y, 1/beta);
        this.setZoom(newZoom);
    }

    updateGridSpacing(){
        let width = paper.view.bounds.width;
        let height = paper.view.bounds.height;
        let cutoffHigh = 75;
        let cutoffLow = 15;
        while (width / this.gridSpacing > cutoffHigh || height / this.gridSpacing > cutoffHigh){
            this.gridSpacing = this.gridSpacing * 5;
        } 
        while (width / this.gridSpacing <= cutoffLow || height / this.gridSpacing <= cutoffLow){
            this.gridSpacing = this.gridSpacing / 5;
        } 
        this.render();
    }

    setZoom(zoom){
        paper.view.zoom = zoom;
        this.updateGridSpacing();
        this.render();
    }
}

module.exports = CanvasManager;