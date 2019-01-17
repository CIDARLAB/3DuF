import paper from 'paper';

const Colors = require("../colors");

export default class AdaptiveGrid {
    constructor(viewmanager, minSpacing = 5, maxSpacing = 100, thickCount = 10, origin = [0, 0], thinWidth = 1, thickWidth = 3, color = Colors.BLUE_100) {

        this.__viewManagerDelegate = viewmanager;

        this.origin = new paper.Point(origin[0], origin[1]);
        this.thinWidth = thinWidth; //pixel
        this.thickWidth = thickWidth; // pixels
        this.minSpacing = minSpacing; //pixels
        this.maxSpacing = maxSpacing; //pixels
        this.thickCount = thickCount;
        this.__spacing = 500;
        this.__isAutomaticEnabled = true;
        this.color = color;

    }

    enableAdaptiveGrid(){
        this.__isAutomaticEnabled = true;
    }

    disableAdaptiveGrid(){
        this.__isAutomaticEnabled = false;
    }

    getClosestGridPoint(point) {
        let x = Math.round((point.x - this.origin.x) / this.__spacing) * this.__spacing + this.origin.x;
        let y = Math.round((point.y - this.origin.y) / this.__spacing) * this.__spacing + this.origin.y;
        return new paper.Point(x, y);
    }

    setOrigin(origin) {
        this.origin = new paper.Point(origin[0], origin[1]);
        this.notifyViewManagerToUpdateView();
    }

    setThinWidth(width) {
        this.thinWidth = width;
        this.notifyViewManagerToUpdateView();
    }

    setThickWidth(width) {
        this.thickWidth = width;
        this.notifyViewManagerToUpdateView();
    }

    setMinSpacing(pixels) {
        this.__spacing = pixels;
        this.notifyViewManagerToUpdateView();
    }

    setMaxSpacing(pixels) {
        this.maxSpacing = pixels;
        this.notifyViewManagerToUpdateView();
    }

    setColor(color){
        this.color = color;
        this.notifyViewManagerToUpdateView();
    }

    getSpacing() {
        if(this.__isAutomaticEnabled){
            let zoomlevel = paper.view.zoom;
            if (zoomlevel <= 0.02) {
                this.__spacing = 1000;
            }else if(zoomlevel <= 0.05){
                this.__spacing = 500;
            }else if(zoomlevel <= 0.1){
                this.__spacing = 100;
            }else if(zoomlevel <= 0.6){
                this.__spacing = 50;
            }else{
                this.__spacing = 5;
            }
            return this.__spacing;
        }else{
            return this.__spacing;
        }
        // console.log("Zoom: " + paper.view.zoom + " Spacing: " + this.__spacing);
    }

    updateGridSpacing(value){
        if(AdaptiveGrid.isValidZoom(value)){
            console.log("New spacing value:", value);
            this.__spacing = value;
            return true;
        }else{
            console.error("Inavlid Grid Spacing");
            return false;
        }
    }

    getThinWidth() {
        return this.thinWidth / paper.view.zoom;
    }

    getThickWidth() {
        return this.thickWidth / paper.view.zoom;
    }

    notifyViewManagerToUpdateView() {
        if(this.__viewManagerDelegate){
            this.__viewManagerDelegate.updateGrid();
        }else{
            console.error("Could not find view manager to send update grid signal");
        }
    }

    static isValidZoom(value){
        //First check if its a valid number

        //TODO: figure out if we want to round it off

        //Then check if its in bounds


        //TODO: change this to be actually functional
        return true;
    }
}