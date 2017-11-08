var Registry = require("../../core/registry");
var Colors = require("../colors");

class AdaptiveGrid {
    constructor(minSpacing = 5, maxSpacing = 100, thickCount = 10, origin = [0, 0], thinWidth = 1, thickWidth = 3, color = Colors.BLUE_100) {
        this.origin = new paper.Point(origin[0], origin[1]);
        this.thinWidth = thinWidth; //pixel
        this.thickWidth = thickWidth; // pixels
        this.minSpacing = minSpacing; //pixels
        this.maxSpacing = maxSpacing; //pixels
        this.thickCount = thickCount;
        this.spacing = 500;
        this.color = color;

        if (Registry.currentGrid) throw new Error("Cannot instantiate more than one AdaptiveGrid!");
        Registry.currentGrid = this;
    }

    getClosestGridPoint(point) {
        let x = Math.round((point.x - this.origin.x) / this.spacing) * this.spacing + this.origin.x;
        let y = Math.round((point.y - this.origin.y) / this.spacing) * this.spacing + this.origin.y;
        return new paper.Point(x, y);
    }

    setOrigin(origin) {
        this.origin = new paper.Point(origin[0], origin[1]);
        this.updateView();
    }

    setThinWidth(width) {
        this.thinWidth = width;
        this.updateView();
    }

    setThickWidth(width) {
        this.thickWidth = width;
        this.updateView();
    }

    setMinSpacing(pixels) {
        this.spacing = pixels;
        this.updateView();
    }

    setMaxSpacing(pixels) {
        this.maxSpacing = pixels;
        this.updateView();
    }

    setColor(color){
        this.color = color;
        this.updateView();
    }

    getSpacing() {
        let zoomlevel = paper.view.zoom;
        if (zoomlevel <= 0.02) {
            this.spacing = 1000;
        }else if(zoomlevel <= 0.05){
            this.spacing = 500;
        }else if(zoomlevel <= 0.1){
            this.spacing = 100;
        }else if(zoomlevel <= 0.6){
            this.spacing = 50;
        }else{
            this.spacing = 5;
        }
        console.log("Zoom: " + paper.view.zoom + " Spacing: " + this.spacing);
        return this.spacing;
    }

    getThinWidth() {
        return this.thinWidth / paper.view.zoom;
    }

    getThickWidth() {
        return this.thickWidth / paper.view.zoom;
    }

    updateView() {
        if (Registry.viewManager) Registry.viewManager.updateGrid();
    }
}

module.exports = AdaptiveGrid;