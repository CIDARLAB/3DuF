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
        this.activeLayer = null;
        this.gridLayer = new paper.Group();
        this.deviceLayer = new paper.Group();
        this.gridLayer.insertAbove(this.deviceLayer);
        this.featureLayer = new paper.Group();
        this.featureLayer.insertAbove(this.gridLayer);
        this.uiLayer = new paper.Group();
        this.uiLayer.insertAbove(this.featureLayer);
        this.currentTarget = null;
        this.lastTargetType = null;
        this.lastTargetPosition = null;
        this.inactiveAlpha = .5;
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
        this.canvas.onmouseup = func;
    }

    setMouseMoveFunction(func) {
        this.canvas.onmousemove = func;
    }

    setKeyPressFunction(func) {
        this.canvas.onkeypress = func;
    }

    setKeyDownFunction(func) {
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

    setActiveLayer(index) {
        this.activeLayer = index;
        this.showActiveLayer();
    }

    showActiveLayer() {
        let layers = this.featureLayer.children;

        for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            let targetAlpha;
            if (i != this.activeLayer) {
                targetAlpha = this.inactiveAlpha;
            } 
            else {
                targetAlpha = 1;
            }
            for (let j = 0; j < layer.children.length; j++) {
                layer.children[j].fillColor.alpha = targetAlpha;
            }
        }

    }

    comparePaperFeatureHeights(a, b) {
        let aFeature = Registry.currentDevice.getFeatureByID(a.featureID);
        let bFeature = Registry.currentDevice.getFeatureByID(b.featureID);
        let aHeight;
        let bHeight;
        try {
            aHeight = aFeature.params.getValue("height");
        } catch (err) {
            aHeight = Registry.registeredFeatures[aFeature.type].getDefaultValues()["height"];
        }

        try {
            bHeight = bFeature.params.getValue("height");
        } catch (err) {
            bHeight = Registry.registeredFeatures[bFeature.type].getDefaultValues()["height"];
        }
        return aHeight - bHeight;
    }

    insertChildByHeight(group, newChild) {
        this.getIndexByHeight(group.children, newChild);
        let index = this.getIndexByHeight(group.children, newChild);
        group.insertChild(index, newChild);
    }

    // TODO: Could be done faster with a binary search. Probably not needed!
    getIndexByHeight(children, newChild) {
        for (let i = 0; i < children.length; i++) {
            let test = this.comparePaperFeatureHeights(children[i], newChild);
            if (test >= 0) {
                return i;
            }
        }
        return children.length;
    }

    updateFeature(feature) {
        this.removeFeature(feature);
        let newPaperFeature = FeatureRenderers[feature.type].renderFeature(feature);
        this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
        //TODO: This is terrible. Fix it. Fix it now.
        let index = feature.layer.device.layers.indexOf(feature.layer);
        let layer = this.featureLayer.children[index];
        this.insertChildByHeight(layer, newPaperFeature);
        if (index != this.activeLayer && this.activeLayer != null) newPaperFeature.fillColor.alpha = this.inactiveAlpha;
    }

    removeTarget() {
        if (this.currentTarget) this.currentTarget.remove();
        this.currentTarget = null;
    }

    addTarget(featureType, position) {
        this.removeTarget();
        this.lastTargetType = featureType;
        this.lastTargetPosition = position;
        this.updateTarget();
    }

    updateTarget() {
        this.removeTarget();
        if (this.lastTargetType && this.lastTargetPosition) {
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

    getFeaturesByViewElements(paperFeatures) {
        let output = [];
        for (let i = 0; i < paperFeatures.length; i++) {
            output.push(Registry.currentDevice.getFeatureByID(paperFeatures[i].featureID));
        }
        return output;
    }

    hitFeature(point, onlyHitActiveLayer = true) {
        let hitOptions = {
            fill: true,
            tolerance: 5,
            guides: false
        }

        let target;

        if (onlyHitActiveLayer && this.activeLayer != null) {
            target = this.featureLayer.children[this.activeLayer];
        }
        else target = this.featureLayer.hitTest(point, hitOptions);

        let result = target.hitTest(point, hitOptions);
        if (result) {
            return result.item;
        }
    }

    hitFeaturesWithViewElement(paperElement, onlyHitActiveLayer = true) {
        let output = [];
        if (onlyHitActiveLayer && this.activeLayer != null) {
            let layer = this.featureLayer.children[this.activeLayer];
            for (let i = 0; i < layer.children.length; i++) {
                let child = layer.children[i];
                if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                    output.push(child);
                }
            }
        } else {
            for (let i = 0; i < this.featureLayer.children.length; i++) {
                let layer = this.featureLayer.children[i];
                for (let j = 0; j < layer.children.length; j++) {
                    let child = layer.children[j];
                    if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                        output.push(child);
                    }
                }
            }
        }

        return output;
    }
}

module.exports = PaperView;