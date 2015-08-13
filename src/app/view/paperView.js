var Registry = require("../core/registry");
var FeatureRenderer2D = require("./render2D/featureRenderer2D");
var GridRenderer = require("./render2D/GridRenderer");
var DeviceRenderer = require("./render2D/deviceRenderer2D");
var PanAndZoom = require("./PanAndZoom");
var SimpleQueue = require("../utils/simpleQueue");
var Colors = require("./colors");

class PaperView {
    constructor(canvas) {
        this.panAndZoom = new PanAndZoom(this);
        this.center = paper.view.center;
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
        this.disableContextMenu();
    }

    deleteSelectedFeatures() {
        let items = paper.project.selectedItems;
        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                Registry.currentDevice.removeFeatureByID(items[i].featureID);
            }
        }
    }

    layersToSVGStrings() {
        let output = [];
        for (let i = 0; i < this.featureLayer.children.length; i++) {
            let layer = this.featureLayer.children[i];
            let svg = this.postProcessLayerToSVG(layer);
            output.push(svg);
        }
        return output;
    }

    postProcessLayerToSVG(layer) {
        let layerCopy = layer.clone();
        layerCopy.bounds.topLeft = new paper.Point(0, 0);
        let deviceWidth = Registry.currentDevice.params.getValue("width");
        let deviceHeight = Registry.currentDevice.params.getValue("height");
        layerCopy.bounds.bottomRight = new paper.Point(deviceWidth, deviceHeight);
        let svg = layer.exportSVG({
            asString: true
        });
        let width = layerCopy.bounds.width;
        let height = layerCopy.bounds.height;
        let widthInMillimeters = width / 1000;
        let heightInMilliMeters = height / 1000;
        let insertString = 'width="' + widthInMillimeters + 'mm" ' +
            'height="' + heightInMilliMeters + 'mm" ' +
            'viewBox="0 0 ' + width + ' ' + height + '" ';
        let newSVG = svg.slice(0, 5) + insertString + svg.slice(5);
        layerCopy.remove();
        return newSVG;
    }

    getCanvasWidth() {
        return this.canvas.clientWidth;
    }

    getCanvasHeight() {
        return this.canvas.clientHeight;
    }

    getViewCenterInMillimeters() {
        return [paper.view.center.x / 1000, paper.view.center.y / 1000];
    }

    getDeviceHeightInPixels() {
        return Registry.currentDevice.params.getValue("height") * paper.view.zoom;
    }

    clear() {
        this.activeLayer = null;
        this.featureLayer.removeChildren();
        this.featureLayer.clear();
        this.deviceLayer.clear();
        this.gridLayer.clear();
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

    disableContextMenu(func) {
        this.canvas.oncontextmenu = function(event) {
            event.preventDefault();
        }
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
        //this.showActiveLayer();
    }

    showActiveLayer() {
        let layers = this.featureLayer.children;

        for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            let targetAlpha;
            if (i != this.activeLayer) {
                targetAlpha = this.inactiveAlpha;
            } else {
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
        let aHeight = aFeature.getValue("height");
        let bHeight = bFeature.getValue("height");
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
        let newPaperFeature = FeatureRenderer2D.renderFeature(feature);
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

    addTarget(featureType, set, position) {
        this.removeTarget();
        this.lastTargetType = featureType;
        this.lastTargetPosition = position;
        this.lastTargetSet = set;
        this.updateTarget();
    }

    updateTarget() {
        this.removeTarget();
        if (this.lastTargetType && this.lastTargetPosition) {
            this.currentTarget = FeatureRenderer2D.renderTarget(this.lastTargetType, this.lastTargetSet, this.lastTargetPosition);
            this.uiLayer.addChild(this.currentTarget);
        }
    }

    removeFeature(feature) {
        let paperFeature = this.paperFeatures[feature.getID()];
        if (paperFeature) paperFeature.remove();
        this.paperFeatures[feature.getID()] = null;
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

    initializeView() {
        let center = this.getDeviceCenter();
        let zoom = this.computeOptimalZoom();
        this.setCenter(center);
        this.setZoom(zoom);
    }

    getDeviceCenter() {
        let dev = Registry.currentDevice;
        let width = dev.params.getValue("width");
        let height = dev.params.getValue("height");
        return new paper.Point(width / 2, height / 2);
    }

    computeOptimalZoom() {
        let borderMargin = 200; // pixels
        let dev = Registry.currentDevice;
        let deviceWidth = dev.params.getValue("width");
        let deviceHeight = dev.params.getValue("height");
        let canvasWidth = this.getCanvasWidth();
        let canvasHeight = this.getCanvasHeight();
        let maxWidth;
        let maxHeight;
        if (canvasWidth - borderMargin <= 0) maxWidth = canvasWidth;
        else maxWidth = canvasWidth - borderMargin;
        if (canvasHeight - borderMargin <= 0) maxHeight = canvasHeight;
        else maxHeight = canvasHeight - borderMargin;
        let widthRatio = deviceWidth / maxWidth;
        let heightRatio = deviceHeight / maxHeight;
        if (widthRatio > heightRatio) return 1 / widthRatio;
        else return 1 / heightRatio;
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
        } else target = this.featureLayer;

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