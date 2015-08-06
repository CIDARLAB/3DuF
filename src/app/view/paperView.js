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
        this.gridLayer = new paper.Group();
        this.deviceLayer = new paper.Group();
        this.deviceLayer.insertAbove(this.gridLayer);
        this.featureLayer = new paper.Group();
        this.featureLayer.insertAbove(this.deviceLayer);
        this.uiLayer = new paper.Group();
        this.uiLayer.insertAbove(this.featureLayer);
        this.setMouseDragFunction();
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
        this.canvas.addEventListener("mousedown", func);
    }

    setMouseUpFunction(func){
        this.canvas.addEventListener("mouseup", func);
    }

    setMouseMoveFunction(func){
        this.canvas.addEventListener("mousemove", func);
    }

    setMouseDragFunction(){
        this.canvas.addEventListener("drag", function(){
            console.log("dragging");
        }, false);
    }

    setResizeFunction(func){
        paper.view.onResize = func;
    }

    refresh(){
        paper.view.update();
    }

    /* Rendering Devices */
    addDevice(device){
        this.updateDevice(device);
    }

    updateDevice(device){
        this.removeDevice(device);
        let newPaperDevice = DeviceRenderer.renderDevice(device);
        this.paperDevice = newPaperDevice;
        this.deviceLayer.addChild(newPaperDevice);
    }   

    removeDevice(){
        if (this.paperDevice) this.paperDevice.remove();
    }

    /* Rendering Layers */

    addLayer(layer, index){
        this.featureLayer.insertChild(index, new paper.Group());
    }

    updateLayer(layer, index){
        // do nothing, for now
    }

    removeLayer(layer, index){
        // do nothing, for now
    }

    /* Rendering Features */

    addFeature(feature){
        this.updateFeature(feature);
    }

    updateFeature(feature){
        this.removeFeature(feature);
        let newPaperFeature = FeatureRenderers[feature.type](feature);
        this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
        //TODO: This is terrible. Fix it. Fix it now.
        let index = feature.layer.device.layers.indexOf(feature.layer);
        this.featureLayer.children[index].addChild(newPaperFeature);
    }

    removeFeature(feature){
        let paperFeature = this.paperFeatures[feature.id];
        if (paperFeature) paperFeature.remove();
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
