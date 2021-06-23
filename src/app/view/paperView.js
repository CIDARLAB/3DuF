import EdgeFeature from "../core/edgeFeature";
import paper from "paper";

import * as Registry from "../core/registry";
import * as FeatureRenderer2D from "./render2D/featureRenderer2D";
import GridRenderer from "./render2D/gridRenderer";
import DeviceRenderer from "./render2D/deviceRenderer2D";
//const DeviceRenderer = require("./render2D/deviceRenderer2D");
// var AlignmentRenderer = require("./render2D/alignmentRenderer2D");
import PanAndZoom from "./panAndZoom";
import * as Colors from "./colors";
import TextFeature from "../core/textFeature";
import ManufacturingLayer from "../manufacturing/manufacturingLayer";
import RatsNestRenderer2D from "./render2D/ratsNestRenderer2D";
import ComponentPortRenderer2D from "./render2D/componentPortRenderer2D";
import PaperComponentPortView from "./render2D/paperComponentPortView";
import * as DXFObjectRenderer2D from "./render2D/dxfObjectRenderer2D";
import * as DXFSolidObjectRenderer from "./render2D/dxfSolidObjectRenderer2D";
import Layer from "../core/layer";
import Device from "../core/device";
import Feature from "../core/feature";

/**
 * Paper View class
 */
export default class PaperView {
    /**
     * Requires the canvas ID to setup the entire application.
     * @param {string} canvasID
     * @param {} viewmanager
     */
    constructor(canvasID, viewmanager) {
        //Setup the Canvas
        paper.setup(canvasID);

        //Get the Canvas Object
        let canvas = document.getElementById(canvasID);

        this.panAndZoom = new PanAndZoom(this);
        this.center = paper.view.center;
        this.zoom = paper.view.zoom;
        this.canvas = canvas;
        this.paperFeatures = {};
        this.paperLayers = [];
        this.paperGrid = null;
        this.paperDevice = null;
        this.activeLayer = null;
        this.gridLayer = new paper.Group();
        this.deviceLayer = new paper.Group();
        this.gridLayer.insertAbove(this.deviceLayer);
        this.featureLayer = new paper.Group();
        this.featureLayer.insertAbove(this.gridLayer);
        this.textFeatureLayer = new paper.Group();
        this.textFeatureLayer.insertAbove(this.featureLayer);
        this.alignmentMarksLayer = new paper.Group();
        this.alignmentMarksLayer.insertAbove(this.textFeatureLayer);
        this.uiLayer = new paper.Group(); //This is the layer which we use to render targets
        this.uiLayer.insertAbove(this.featureLayer);
        this.ratsNestLayer = new paper.Group();
        this.ratsNestLayer.insertAbove(this.featureLayer);
        this.componentPortsLayer = new paper.Group();
        this.componentPortsLayer.insertAbove(this.featureLayer);
        this.currentTarget = null;
        this.lastTargetType = null;
        this.lastTargetPosition = null;
        this.selectedComponents = [];
        this.selectedConnections = [];
        this.inactiveAlpha = 0.5;
        this.__viewManagerDelegate = viewmanager;

        this._paperComponentPortView = new PaperComponentPortView(this.componentPortsLayer, viewmanager);

        this.disableContextMenu();
    }

    /**
     * Returns a list of selected items on the canvas
     * @return {Array}
     * @memberof PaperView
     */
    getSelectedFeatures() {
        let output = [];
        let items = paper.project.selectedItems;
        for (let i = 0; i < items.length; i++) {
            output.push(this.__viewManagerDelegate.currentDevice.getFeatureByID(items[i].featureID));
        }
        return output;
    }
    /**
     * Deselects the items from the canvas
     * @returns {void}
     * @memberof PaperView
     */
    clearSelectedItems() {
        paper.project.deselectAll();
        this.selectedConnections = [];
        this.selectedComponents = [];
    }

    /**
     * Deletes the selected features and selected components from the canvas
     * TODO: Rename the method
     * @returns {void}
     * @memberof PaperView
     */
    deleteSelectedFeatures() {
        //TODO: Refine how this works with the selection object code later on
        let items = paper.project.selectedItems;
        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                this.__viewManagerDelegate.currentDevice.removeFeatureByID(items[i].featureID);
            }

            //Delete the selected Components !!!!
            for (let i in this.selectedComponents) {
                this.__viewManagerDelegate.currentDevice.removeComponent(this.selectedComponents[i]);
            }

            //Delete the selected Connecitons
            for (let i in this.selectedConnections) {
                this.__viewManagerDelegate.currentDevice.removeConnection(this.selectedConnections[i]);
            }
        }
    }
    /**
     * Selects all active layers in the canvas
     * @returns {void}
     * @memberof PaperView
     */
    selectAllActive() {
        let layer = this.paperLayers[this.activeLayer];
        for (var i in layer.children) {
            layer.children[i].selected = true;
        }
    }

    /**
     * Converts the layers to SVG format
     * @memberof PaperView
     * @returns {}
     */
    layersToSVGStrings() {
        let output = [];
        for (let i = 0; i < this.featureLayer.children.length; i++) {
            let layer = this.featureLayer.children[i];
            let svg = this.postProcessLayerToSVG(layer);
            output.push(svg);
        }
        return output;
    }
    /**
     * Process layers to SVG
     * @param {Layer} layer Layer object
     * @returns Returns an SVG format
     * @memberof PaperView
     */
    postProcessLayerToSVG(layer) {
        //var flip = layer.params["flip"];
        let layerCopy = layer.clone();
        //if (flip == true) {
        //    layerCopy.scale(-1,1);
        //}
        layerCopy.bounds.topLeft = new paper.Point(0, 0);
        let deviceWidth = this.__viewManagerDelegate.currentDevice.getXSpan();
        let deviceHeight = this.__viewManagerDelegate.currentDevice.getYSpan();
        layerCopy.bounds.topLeft = new paper.Point(0, 0);
        layerCopy.bounds.bottomRight = new paper.Point(deviceWidth, deviceHeight);
        let svg = layer.exportSVG({
            asString: true
        });

        let width = deviceWidth;
        let height = deviceHeight;
        let widthInMillimeters = width / 1000;
        let heightInMilliMeters = height / 1000;
        let prepend = ManufacturingLayer.generateSVGTextPrepend(widthInMillimeters, heightInMilliMeters);
        let append = ManufacturingLayer.generateSVGTextAppend();
        let newSVG = prepend + svg + append;
        layerCopy.remove();
        return newSVG;
    }
    /**
     * Gets the width of the canvas
     * @returns {number} Returns the width of the canvas
     * @memberof PaperView
     */
    getCanvasWidth() {
        return this.canvas.clientWidth;
    }
    /**
     * Gets the height of the canvas
     * @returns {number} Returns the height of the canvas
     * @memberof PaperView
     */
    getCanvasHeight() {
        return this.canvas.clientHeight;
    }
    /**
     * Gets the view of the center in mm
     * @returns {number}
     * @memberof PaperView
     */
    getViewCenterInMillimeters() {
        return [paper.view.center.x / 1000, paper.view.center.y / 1000];
    }
    /**
     * Gets the device height in pixels
     * @returns {number}
     * @memberof PaperView
     */
    getDeviceHeightInPixels() {
        return this.__viewManagerDelegate.currentDevice.params.getValue("height") * paper.view.zoom;
    }

    /**
     * Clears the all the paper group collections stored in the paperview object. Used when everything has to be
     * redrawn
     * @returns {void}
     * @memberof PaperView
     */
    clear() {
        this.activeLayer = null;
        this.featureLayer.removeChildren();
        this.featureLayer.clear();
        this.deviceLayer.clear();
        this.gridLayer.clear();
        this.alignmentMarksLayer.clear();
    }
    /**
     * Gets the center of the paper
     * @returns {Array<number>}
     * @memberof PaperView
     */
    getCenter() {
        return this.center;
    }
    /**
     * Sets the center at a specific point of the canvas
     * @param {Array<number>} point X and Y coordinates
     * @returns {void}
     * @memberof PaperView
     */
    setCenter(point) {
        this.center = point;
        this.updateCenter();
    }
    /**
     * Updates the paper center to the new value
     * @returns {void}
     * @memberof PaperView
     */
    updateCenter() {
        paper.view.center = this.center;
    }
    /**
     * Gets the zoom at the paper
     * @returns {number} Returns zoom value
     * @memberof PaperView
     */
    getZoom() {
        return this.zoom;
    }
    /**
     * Sets a specific zoom at the paper view
     * @param {number} zoom Zoom value
     * @returns {void}
     * @memberof PaperView
     */
    setZoom(zoom) {
        this.zoom = zoom;
        this.updateZoom();

        //Check if the zoom toolbar exists before trying to run it
        if (this.__viewManagerDelegate.zoomToolBar) {
            this.__viewManagerDelegate.zoomToolBar.setZoom(zoom);
        }
    }
    /**
     * Updates zoom of the canvas
     * @returns {void}
     * @memberof PaperView
     */
    updateZoom() {
        paper.view.zoom = this.zoom;
    }
    /**
     * Returns the coordinates of the project
     * @param {number} x X coordinate of the canvas
     * @param {number} y Y coordinate of the canvas
     * @returns {}
     * @memberof PaperView
     */
    canvasToProject(x, y) {
        let rect = this.canvas.getBoundingClientRect();
        let projX = x - rect.left;
        let projY = y - rect.top;
        return paper.view.viewToProject(new paper.Point(projX, projY));
    }
    /**
     * Converts from canvas to project position
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @returns {}
     * @memberof PaperView
     */
    getProjectPosition(x, y) {
        return this.canvasToProject(x, y);
    }
    /**
     * Adds an event listener to the mouse wheel key
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseWheelFunction(func) {
        this.canvas.addEventListener("wheel", func);
    }
    /**
     * Adds an event listener when the mouse goes down
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseDownFunction(func) {
        this.canvas.onmousedown = func;
    }
    /**
     * Adds an event listener to the mouse up key
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseUpFunction(func) {
        this.canvas.onmouseup = func;
    }
    /**
     * Adds an event listener when the mouse moves
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseMoveFunction(func) {
        this.canvas.onmousemove = func;
    }
    /**
     * Adds an event listener when a key is press
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setKeyPressFunction(func) {
        this.canvas.onkeypress = func;
    }
    /**
     * Adds an event listener when a key is down
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setKeyDownFunction(func) {
        this.canvas.onkeydown = func;
    }
    /**
     * Sets the resize function
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setResizeFunction(func) {
        paper.view.onResize = func;
    }
    /**
     * Disables the contex menu
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    disableContextMenu(func) {
        this.canvas.oncontextmenu = function(event) {
            event.preventDefault();
        };
    }
    /**
     * Refreshes the view of the paper
     * @returns {void}
     * @memberof PaperView
     */
    refresh() {
        paper.view.update();
    }

    /* Rendering Devices */
    /**
     * Renders device
     * @param {Device} device Device object
     * @returns {void}
     * @memberof PaperView
     */
    addDevice(device) {
        this.updateDevice(device);
    }
    /**
     * Updates a device
     * @param {Device} device Device object
     * @returns {void}
     * @memberof PaperView
     */
    updateDevice(device) {
        this.removeDevice(device);
        let newPaperDevice = DeviceRenderer.renderDevice(device);
        this.paperDevice = newPaperDevice;
        this.deviceLayer.addChild(newPaperDevice);
    }
    /**
     * Removes the device from the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeDevice() {
        if (this.paperDevice) this.paperDevice.remove();
        this.paperDevice = null;
    }

    /* Rendering Layers */
    /**
     * Renders the layers
     * @param {Layer} layer Layer object
     * @param {number} index Index of layer to render (Int)
     * @returns {void}
     * @memberof PaperView
     */
    addLayer(layer, index) {
        this.paperLayers[index] = new paper.Group();
        this.featureLayer.addChild(this.paperLayers[index]);
        // this.setActiveLayer(index);
    }
    /**
     * Updates the layers
     * @param {Layer} layer Layer object
     * @param {number} index Index of layer to update (Int)
     * @returns {void}
     * @memberof PaperView
     */
    updateLayer(layer, index) {
        // do nothing, for now
    }

    /**
     * Delete the layer from the paperview at the given index.
     * @param {number} index Index of the layer to be removed (Int)
     * @returns {void}
     * @memberof PaperView
     */
    removeLayer(index) {
        if (index !== -1) {
            this.paperLayers.splice(index, 1);
        }
    }

    /* Rendering Features */
    /**
     * Renders a feature
     * @param {Feature} feature Feature to be render
     * @returns {void}
     * @memberof PaperView
     */
    addFeature(feature) {
        this.updateFeature(feature);
    }
    /**
     * Sets a new active layer
     * @param {number} index Index of layer to be active (Int)
     * @returns {void}
     * @memberof PaperView
     */
    setActiveLayer(index) {
        this.activeLayer = index;
        if (this.activeLayer !== null && this.activeLayer >= 0) this.showActiveLayer();
    }
    /**
     * Show the current active layer
     * @returns {void}
     * @memberof PaperView
     */
    showActiveLayer() {
        this.featureLayer.remove();
        this.featureLayer = new paper.Group();
        for (let i = 0; i < this.paperLayers.length; i++) {
            this.featureLayer.addChild(this.paperLayers[i]);
        }
        if (this.layerMask) this.layerMask.remove();
        this.layerMask = DeviceRenderer.renderLayerMask(this.__viewManagerDelegate.currentDevice);
        this.featureLayer.addChild(this.layerMask);
        let activeLayer = this.paperLayers[this.activeLayer];
        activeLayer.bringToFront();
    }
    /**
     * Compares feature heights of the paper
     * @param {number} a
     * @param {number} b
     * @returns {number}
     * @memberof PaperView
     */
    comparePaperFeatureHeights(a, b) {
        let bHeight;
        let aHeight;
        let aFeature = this.__viewManagerDelegate.currentDevice.getFeatureByID(a.featureID);
        let bFeature = this.__viewManagerDelegate.currentDevice.getFeatureByID(b.featureID);

        //TODO: So this needs to be eliminated form the entire sequence
        try {
            aHeight = aFeature.getValue("height");
        } catch (e) {
            aHeight = 9999;
        }

        try {
            bHeight = bFeature.getValue("height");
        } catch (e) {
            bHeight = 9999;
        }
        return aHeight - bHeight;
    }
    /**
     * Insert a child component by height order
     * @param {*} group
     * @param {*} newChild
     * @returns {void}
     * @memberof PaperView
     */
    insertChildByHeight(group, newChild) {
        let index;
        if (group.children.length > 0) {
            index = this.getIndexByHeight(group.children, newChild);
        } else {
            index = 0;
        }
        group.insertChild(index, newChild);
    }

    // TODO: Could be done faster with a binary search. Probably not needed!
    /**
     * Gets the index of a children component depending on it's height
     * @param {*} children
     * @param {*} newChild
     * @returns {number} Returns the index of the component
     * @memberof PaperView
     */
    getIndexByHeight(children, newChild) {
        for (let i = 0; i < children.length; i++) {
            let test = this.comparePaperFeatureHeights(children[i], newChild);
            if (test >= 0) {
                return i;
            }
        }
        return children.length;
    }
    /**
     * Updates the selected featured
     * @param {Feature} feature Feature object
     * @returns {void}
     * @memberof PaperView
     */
    updateFeature(feature) {
        let existingFeature = this.paperFeatures[feature.getID()];
        let selected;
        if (existingFeature) selected = existingFeature.selected;
        else selected = false;
        this.removeFeature(feature);
        let newPaperFeature;
        if (feature instanceof TextFeature) {
            //TODO:Create render textfeature method that doesnt take other params
            newPaperFeature = FeatureRenderer2D.renderText(feature);
        } else if (feature instanceof EdgeFeature) {
            newPaperFeature = DXFObjectRenderer2D.renderEdgeFeature(feature);
            newPaperFeature.selected = selected;
            this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
            this.insertEdgeFeatures(newPaperFeature);
            return;
        } else {
            newPaperFeature = FeatureRenderer2D.renderFeature(feature);
        }
        newPaperFeature.selected = selected;
        this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
        let index = this.__viewManagerDelegate.currentDevice.layers.indexOf(feature.layer);
        let layer = this.paperLayers[index];
        this.insertChildByHeight(layer, newPaperFeature);
    }

    /**
     * Removes the target that is being rendered
     * @returns {void}
     * @memberof PaperView
     */
    removeTarget() {
        if (this.currentTarget) this.currentTarget.remove();
        this.currentTarget = null;
    }

    /**
     * Add information about the target that has to be rendered
     * @param {string} featureType   String that identifies what kind of a feature this is
     * @param {Feature} set           Feature set the feature belongs to
     * @param {Array<number>} position      x,y position of the feature
     * @returns {void}
     * @memberof PaperView
     */
    addTarget(featureType, set, position) {
        this.removeTarget();
        this.lastTargetType = featureType;
        this.lastTargetPosition = position;
        this.lastTargetSet = set;
        this.updateTarget();
    }

    /**
     * Updates the target that being rendered. This entails removing the current target and
     * then creates a new target at the new position.
     * @returns {void}
     * @memberof PaperView
     */
    updateTarget() {
        this.removeTarget();
        if (this.lastTargetType && this.lastTargetPosition) {
            //Checks if the target is a text type target
            if (this.lastTargetType === "TEXT") {
                this.currentTarget = FeatureRenderer2D.renderTextTarget(this.lastTargetType, this.lastTargetSet, this.lastTargetPosition);
                this.uiLayer.addChild(this.currentTarget);
            } else if (this.lastTargetSet === "Custom") {
                let customcomponent = this.__viewManagerDelegate.customComponentManager.getCustomComponent(this.lastTargetType);
                let params = Registry.featureDefaults[this.lastTargetSet][this.lastTargetType];
                params["position"] = this.lastTargetPosition;
                params["color"] = Colors.getDefaultFeatureColor(this.lastTargetType, this.lastTargetSet, Registry.currentLayer);
                this.currentTarget = DXFSolidObjectRenderer.renderCustomComponentTarget(customcomponent, params);
                this.uiLayer.addChild(this.currentTarget);
            } else {
                this.currentTarget = FeatureRenderer2D.renderTarget(this.lastTargetType, this.lastTargetSet, this.lastTargetPosition);
                this.uiLayer.addChild(this.currentTarget);
            }
        }
    }
    /**
     * Removes a feature
     * @param {Feature} feature  Feature to be removed
     * @returns {void}
     * @memberof PaperView
     */
    removeFeature(feature) {
        let paperFeature = this.paperFeatures[feature.getID()];
        if (paperFeature) paperFeature.remove();
        this.paperFeatures[feature.getID()] = null;
    }
    /**
     * Removes grid of the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeGrid() {
        if (this.paperGrid) this.paperGrid.remove();
        this.paperGrid = null;
    }
    /**
     * Updates the grid of the paper
     * @param {*} grid Grid to update
     * @returns {void}
     * @memberof PaperView
     */
    updateGrid(grid) {
        this.removeGrid();
        let newPaperGrid = GridRenderer.renderGrid(grid);
        this.paperGrid = newPaperGrid;
        this.gridLayer.addChild(newPaperGrid);
    }
    /**
     * Updates alignment marks of the paper
     */
    updateAlignmentMarks() {
        //TODO: Update this for the new visualizations
        //Remove current Alignment Marks:
        // this.removeAlignmentMarks();
        // let newAlignmentMarks = AlignmentRenderer.renderAlignmentMarks(this.lastTargetPosition, 20000, this.paperFeatures);
        // this.alignmentMarks = newAlignmentMarks;
        // this.alignmentMarksLayer.addChild(newAlignmentMarks);
    }
    /**
     * Removes alignment marks of the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeAlignmentMarks() {
        //Does nothing right now
        if (this.alignmentMarks) this.alignmentMarks.remove();
        this.alignmentMarks = null;
    }
    /**
     * Updates unrouted connections of the paper
     * @returns {void}
     * @memberof PaperView
     */
    updateRatsNest() {
        this.removeRatsNest();
        let unrouted = this.__viewManagerDelegate.currentDevice.getUnroutedConnections();

        let rendergroup = RatsNestRenderer2D.renderRatsNest(unrouted, this.__viewManagerDelegate.currentDevice);

        this.__ratsNestRender = rendergroup;
        this.ratsNestLayer.addChild(this.__ratsNestRender);
    }
    /**
     * Removes unrouted connections of the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeRatsNest() {
        //First clear out the render objects
        if (this.__ratsNestRender) {
            this.__ratsNestRender.remove();
        }
        //Next set it to null
        this.__ratsNestRender = null;
    }
    /**
     * Moves the center by a specific value
     * @param {number} delta
     * @returns {void}
     * @memberof PaperView
     */
    moveCenter(delta) {
        this.panAndZoom.moveCenter(delta);
    }
    /**
     * Adjust the zoom bu a specific value to a certain point on the paper
     * @param {number} delta
     * @param {Array<number>} point
     * @returns {void}
     * @memberof PaperView
     */
    adjustZoom(delta, point) {
        this.panAndZoom.adjustZoom(delta, point);
    }
    /**
     * Gets the paper features
     * @param {Array<Feature>} paperFeatures
     * @returns {Array} Returns an array with the features
     * @memberof PaperView
     */
    getFeaturesByViewElements(paperFeatures) {
        let output = [];
        for (let i = 0; i < paperFeatures.length; i++) {
            output.push(this.__viewManagerDelegate.currentDevice.getFeatureByID(paperFeatures[i].featureID));
        }
        return output;
    }
    /**
     * Initialize the view on the paper
     * @returns {void}
     * @memberof PaperView
     */
    initializeView() {
        let center = this.getDeviceCenter();
        let zoom = this.computeOptimalZoom();
        this.setCenter(center);
        this.setZoom(zoom);
    }
    /**
     * Centers the device on the paper
     * @returns {Array<number>} Returns an array with the X and Y coordinates of the center
     * @memberof PaperView
     */
    getDeviceCenter() {
        let width = this.__viewManagerDelegate.currentDevice.getXSpan();
        let height = this.__viewManagerDelegate.currentDevice.getYSpan();
        return new paper.Point(width / 2, height / 2);
    }
    /**
     * Calculates the optimal zoom of the paper
     * @returns {number} Returns the value of the optima zoom
     * @memberof PaperView
     */
    computeOptimalZoom() {
        let borderMargin = 200; // pixels
        let deviceWidth = this.__viewManagerDelegate.currentDevice.getXSpan();
        let deviceHeight = this.__viewManagerDelegate.currentDevice.getYSpan();
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
        if (widthRatio > heightRatio) {
            return 1 / widthRatio;
        } else {
            return 1 / heightRatio;
        }
    }

    /**
     * Checks to see if the point intersects with any feature that is rendered on the canvas
     * @param {Array<number>} point X and Y coordinates of the point
     * @param {boolean} onlyHitActiveLayer Default to true
     * @return {boolean} Rendered Feature
     * @memberof PaperView
     */
    hitFeature(point, onlyHitActiveLayer = true) {
        let hitOptions = {
            fill: true,
            tolerance: 5,
            guides: false
        };

        let target;

        if (onlyHitActiveLayer && this.activeLayer !== null) {
            target = this.paperLayers[this.activeLayer];

            let result = target.hitTest(point, hitOptions);
            if (result) {
                return result.item;
            }
        } else {
            for (let i = this.paperLayers.length - 1; i >= 0; i--) {
                target = this.paperLayers[i];
                let result = target.hitTest(point, hitOptions);
                if (result) {
                    return result.item;
                }
            }
        }
        return false;
    }
    /**
     * Checks if the feature hit an element ?
     * @param {*} paperElement
     * @param {*} onlyHitActiveLayer
     * @returns {Array} Returns an Array with all the child components which intersects the paper element
     * @memberof PaperView
     */
    hitFeaturesWithViewElement(paperElement, onlyHitActiveLayer = true) {
        let output = [];
        if (onlyHitActiveLayer && this.activeLayer !== null) {
            let layer = this.paperLayers[this.activeLayer];
            for (let i = 0; i < layer.children.length; i++) {
                let child = layer.children[i];
                if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                    output.push(child);
                }
            }
        } else {
            for (let i = 0; i < this.paperLayers.length; i++) {
                let layer = this.paperLayers[i];
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
    /**
     * Inserts new feature to the edge
     * @param {Feature} newPaperFeature Feature to be inserted
     * @returns {void}
     * @memberof PaperView
     */
    insertEdgeFeatures(newPaperFeature) {
        let layer = this.paperLayers[0];
        layer.insertChild(0, newPaperFeature);
    }

    /**
     * Returns the rendered feature object that is being displayed for the particular feature
     * @param {string} featureID ID of the feature
     * @return {Object} Returns an object containing the rendered features
     * @memberof PaperView
     */
    getRenderedFeature(featureID) {
        return this.paperFeatures[featureID];
    }
    /**
     * Updates the component after it was rendered
     * @returns {void}
     * @memberof PaperView
     */
    updateComponentPortsRender() {
        this._paperComponentPortView.updateRenders();
    }
    /**
     * Enable snap render
     * @returns {void}
     * @memberof PaperView
     */
    enableSnapRender() {
        this._paperComponentPortView.enable();
    }
    /**
     * Disable snap render
     * @returns {void}
     * @memberof PaperView
     */
    disableSnapRender() {
        this._paperComponentPortView.disable();
    }
}
