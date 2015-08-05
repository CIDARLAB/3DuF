var Registry = require("../core/registry");
var FeatureRenderers = require("./featureRenderers");
var GridRenderer = require("./grid/GridRenderer");
var DeviceRenderer = require("./deviceRenderer");
var PanAndZoom = require("./PanAndZoom");

class PaperView {
    constructor(canvas){
        this.canvas = canvas;
        this.paperFeatures = {};
        this.paperGrid = null;
        this.paperDevice = null;
        this.gridLayer = new paper.Layer();
        this.deviceLayer = new paper.Layer();
        this.deviceLayer.insertAbove(this.gridLayer);
        this.featureLayer = new paper.Layer();
        this.featureLayer.insertAbove(this.deviceLayer);
        this.uiLayer = new paper.Layer();
        this.uiLayer.insertAbove(this.featureLayer);
    }

    canvasToProject(x,y){
        let rect = this.canvas.getBoundingClientRect();
        let projX = x - rect.left;
        let projY = y - rect.top;
        return (paper.view.viewToProject(new paper.Point(projX, projY)));
    }

    getProjectPosition(x,y){
        return this.canvasToProject(x, y);
    }

    setMouseWheelFunction(func){
        this.canvas.addEventListener("wheel", func);
    }

    setMouseDownFunction(func){
        this.canvas.onmousedown = func;
    }

    setMouseUpFunction(func){
        this.canvas.onmouseup = func;
    }

    setMouseMoveFunction(func){
        this.canvas.onmousemove = func;
    }

    setResizeFunction(func){
        paper.view.onResize = func;
    }

    refresh(){
        paper.view.update();
    }

    removeDevice(){
        if (this.paperDevice) this.paperDevice.remove();
    }

    updateDevice(device){
        this.removeDevice(device);
        let newPaperDevice = DeviceRenderer.renderDevice(device);
        this.paperDevice = newPaperDevice;
        this.deviceLayer.addChild(newPaperDevice);
    }   

    removeFeature(feature){
        let paperFeature = this.paperFeatures[feature.id];
        if (paperFeature) paperFeature.remove();
    }

    updateFeature(feature){
        this.removeFeature(feature);
        let newPaperFeature = FeatureRenderers[feature.type](feature);
        this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
        this.featureLayer.addChild(newPaperFeature);
    }

    removeGrid(){
        if (this.paperGrid) this.paperGrid.remove();
    }

    updateGrid(grid){
        this.removeGrid();
        let newPaperGrid = GridRenderer.renderGrid(grid);
        this.paperGrid = newPaperGrid;
        this.gridLayer.addChild(newPaperGrid);
    }

    moveCenter(delta){
        PanAndZoom.moveCenter(delta);
    }

    adjustZoom(delta, point){
        PanAndZoom.adjustZoom(delta, point);
    }

    setZoom(zoom){
        paper.view.zoom = zoom;
    }

    setCenter(center){
        paper.view.center = center;
    }
}

module.exports = PaperView;
