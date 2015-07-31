var Registry = require("../core/registry");
var GridGenerator = require("./gridGenerator");
var PanAndZoom = require("./panAndZoom");
var Features = require("../core/features");
var Tools = require("./tools");

class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.paperDevice = undefined;
        this.grid = undefined;
        this.gridSpacing = 20;
        this.minZoom = .00001;
        this.maxZoom = 10;
        this.valveTool = new Tools.ValveTool(Features.CircleValve);
        this.panTool = new Tools.PanTool();
        this.panTool.activate();
        this.valveTool.activate();
        this.channelTool = new Tools.ChannelTool(Features.Channel);
        this.channelTool.activate();

        if (!Registry.canvasManager) Registry.canvasManager = this;
        else throw new Error("Cannot register more than one CanvasManager");

        this.setupZoomEvent();
    }

    snapToGrid(point){
        return GridGenerator.snapToGrid(point, this.gridSpacing);
    }

    setupZoomEvent() {
        this.canvas.onmousewheel = function(event) {
            let x = event.layerX;
            let y = event.layerY;
            if (paper.view.zoom >= this.maxZoom && event.deltaY < 0) console.log("Whoa! Zoom is way too big.");
            else if (paper.view.zoom <= this.minZoom && event.deltaY > 0) console.log("Whoa! Zoom is way too small.");
            else PanAndZoom.adjustZoom(event.deltaY, paper.view.viewToProject(new paper.Point(x, y)));
        };
    }

    renderFeature(feature, forceUpdate = true){
        feature.render2D();
        paper.view.update(forceUpdate);
    }

    render(forceUpdate = true) {
        this.renderDevice();
        this.renderGrid();
        paper.view.update(forceUpdate);
    }

    renderGrid(forceUpdate = true) {
        if (this.grid) {
            this.grid.remove();
        }
        this.grid = GridGenerator.makeGrid(this.gridSpacing);
        if (this.paperDevice) this.grid.insertBelow(this.paperDevice);
        paper.view.update(forceUpdate);
    }

    setGridSize(size, forceUpdate = true) {
        this.gridSpacing = size;
        this.renderGrid(forceUpdate);
    }

    renderDevice(forceUpdate = true) {
        if (this.paperDevice) {
            this.paperDevice.remove();
        }
        this.paperDevice = Registry.currentDevice.render2D(this.paper);
        if (this.grid) this.paperDevice.insertAbove(this.grid);
        paper.view.update(forceUpdate);
    }

    updateGridSpacing() {
        let width = paper.view.bounds.width;
        let height = paper.view.bounds.height;
        let cutoffHigh = 75;
        let cutoffLow = 15;
        while (width / this.gridSpacing > cutoffHigh || height / this.gridSpacing > cutoffHigh) {
            this.gridSpacing = this.gridSpacing * 5;
        }
        while (width / this.gridSpacing <= cutoffLow || height / this.gridSpacing <= cutoffLow) {
            this.gridSpacing = this.gridSpacing / 5;
        }
        this.render();
    }

    adjustZoom(delta, position) {
        PanAndZoom.adjustZoom(delta, position);
    }

    setZoom(zoom) {
        paper.view.zoom = zoom;
        this.updateGridSpacing();
        this.render();
    }

    moveCenter(delta){
        let newCenter = paper.view.center.subtract(delta);
        this.setCenter(newCenter);
    }

    setCenter(x, y) {
        paper.view.center = new paper.Point(x, y);
        this.render();
    }
}

module.exports = CanvasManager;