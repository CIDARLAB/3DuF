var Registry = require("../core/registry");
var FeatureRenderers = require("./featureRenderers");
var GridRenderer = require("./grid/GridRenderer");
var DeviceRenderer = require("./deviceRenderer");
var PanAndZoom = require("./PanAndZoom");
var SimpleQueue = require("../utils/simpleQueue");

class PaperView {
    constructor(canvas) {
        this.panAndZoom = new PanAndZoom(this);
        this.center = paper.view.center;
        let ref = this;
        this.zoom = paper.view.zoom;
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
        this.currentTarget = null;
        this.lastTargetType = null;
        this.lastTargetPosition = null;
    }

    getCenter() {
        return this.center;
    }

    setCenter(point) {
        this.center = point;
        this.updateCenter();
    }

    updateCenter() {
        paper.view.center = this.center;
    }

    getZoom() {
        return this.zoom;
    }

    setZoom(zoom) {
        this.zoom = zoom;
        this.updateZoom();
    }

    updateZoom() {
        paper.view.zoom = this.zoom;
    }

    canvasToProject(x, y) {
        let rect = this.canvas.getBoundingClientRect();
        let projX = x - rect.left;
        let projY = y - rect.top;
        return (paper.view.viewToProject(new paper.Point(projX, projY)));
    }

    getProjectPosition(x, y) {
        return this.canvasToProject(x, y);
    }

    setMouseWheelFunction(func) {
        this.canvas.addEventListener("wheel", func);
    }

    setMouseDownFunction(func) {
        this.canvas.onmousedown = func;
    }

    setMouseUpFunction(func) {
        this.canvas.onmouseup =func;
    }

    setMouseMoveFunction(func) {
        this.canvas.onmousemove = func;
    }

    setKeyPressFunction(func) {
        this.canvas.onkeypress = func;
    }

    setKeyDownFunction(func){
        this.canvas.onkeydown = func;
    }

    setResizeFunction(func) {
        paper.view.onResize = func;
    }

    refresh() {
        paper.view.update();
    }

    /* Rendering Devices */
    addDevice(device) {
        this.updateDevice(device);
    }

    updateDevice(device) {
        this.removeDevice(device);
        let newPaperDevice = DeviceRenderer.renderDevice(device);
        this.paperDevice = newPaperDevice;
        this.deviceLayer.addChild(newPaperDevice);
    }

    removeDevice() {
        if (this.paperDevice) this.paperDevice.remove();
        this.paperDevice = null;
    }

    /* Rendering Layers */

    addLayer(layer, index) {
        this.featureLayer.insertChild(index, new paper.Group());
    }

    updateLayer(layer, index) {
        // do nothing, for now
    }

    removeLayer(layer, index) {
        // do nothing, for now
    }

    /* Rendering Features */

    addFeature(feature) {
        this.updateFeature(feature);
    }

    updateFeature(feature) {
        this.removeFeature(feature);
        let newPaperFeature = FeatureRenderers[feature.type].renderFeature(feature);
        this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
        //TODO: This is terrible. Fix it. Fix it now.
        let index = feature.layer.device.layers.indexOf(feature.layer);
        this.featureLayer.children[index].addChild(newPaperFeature);
    }

    removeTarget(){
        if (this.currentTarget) this.currentTarget.remove();
        this.currentTarget = null;
    }

    addTarget(featureType, position){
        this.removeTarget();
        this.lastTargetType = featureType;
        this.lastTargetPosition = position;
        this.updateTarget();
    }

    updateTarget(){
        this.removeTarget();
        if (this.lastTargetType && this.lastTargetPosition){
            let renderer = FeatureRenderers[this.lastTargetType];
            //console.log(renderer.renderTarget.toSource());
            this.currentTarget = FeatureRenderers[this.lastTargetType].renderTarget(this.lastTargetPosition);
            this.uiLayer.addChild(this.currentTarget);
        }
    }

    removeFeature(feature) {
        let paperFeature = this.paperFeatures[feature.id];
        if (paperFeature) paperFeature.remove();
        this.paperFeatures[feature.id] = null;
    }

    removeGrid() {
        if (this.paperGrid) this.paperGrid.remove();
        this.paperGrid = null;
    }

    updateGrid(grid) {
        this.removeGrid();
        let newPaperGrid = GridRenderer.renderGrid(grid);
        this.paperGrid = newPaperGrid;
        this.gridLayer.addChild(newPaperGrid);
    }

    moveCenter(delta) {
        this.panAndZoom.moveCenter(delta);
    }

    adjustZoom(delta, point) {
        this.panAndZoom.adjustZoom(delta, point);
    }

    getFeaturesByViewElements(paperFeatures){
        let output = [];
        for (let i = 0; i < paperFeatures.length; i ++){
            output.push(Registry.currentDevice.getFeatureByID(paperFeatures[i].featureID));
        }
        return output;
    }

    hitFeature(point) {
        let hitOptions = {
            fill: true,
            tolerance: 5,
            guides: false
        }

        let result = this.featureLayer.hitTest(point, hitOptions);
        if (result) {
            console.log(result);
            return result.item;
        }
    }

    hitFeaturesWithViewElement(paperElement) {
        let output = [];
        for (let i = 0; i < this.featureLayer.children.length; i++) {
            let layer = this.featureLayer.children[i];
            for (let j = 0; j < layer.children.length; j++) {
                let child = layer.children[j];
                if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                    output.push(child);
                }
            }
        }
        return output;
    }
}

module.exports = PaperView;