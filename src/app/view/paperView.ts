import uuid from "node-uuid";
import EdgeFeature from "../core/edgeFeature";
import paper from "paper";
import { ComponentAPI } from "@/componentAPI";

import Registry from "../core/registry";
import * as FeatureRenderer2D from "./render2D/featureRenderer2D";
import GridRenderer from "./render2D/gridRenderer";
import DeviceRenderer from "./render2D/deviceRenderer2D";
// const DeviceRenderer = require("./render2D/deviceRenderer2D");
// var AlignmentRenderer = require("./render2D/alignmentRenderer2D");
import PanAndZoom from "./panAndZoom";
import * as Colors from "./colors";
import ManufacturingLayer from "../manufacturing/manufacturingLayer";
import RatsNestRenderer2D from "./render2D/ratsNestRenderer2D";
import ComponentPortRenderer2D from "./render2D/componentPortRenderer2D";
import PaperComponentPortView from "./render2D/paperComponentPortView";
import * as DXFObjectRenderer2D from "./render2D/dxfObjectRenderer2D";
import * as DXFSolidObjectRenderer from "./render2D/dxfSolidObjectRenderer2D";
import Layer from "../core/layer";
import Device from "../core/device";
import Feature from "../core/feature";
import Params from "../core/params";
import Component from "../core/component";
import UIElement from "./uiElement";
import TextElement from "./textElement";
import MapUtils from "../utils/mapUtils";
import { ToolPaperObject } from "../core/init";
import Connection from "../core/connection";
import { ViewManager } from "..";
import Parameter from "../core/parameter";
import EventBus from "@/events/events";
/**
 * Paper View class
 */
export default class PaperView {
    panAndZoom: PanAndZoom;
    center: paper.Point;
    zoom: number;
    canvas: HTMLElement | null;
    paperFeatures: any;
    paperLayers: any;
    paperGrid: paper.Group | null;
    paperDevice: paper.Group | null;
    activeLayer: any;
    gridLayer: paper.Group;
    deviceLayer: paper.Group;
    featureLayer: paper.Group;
    textFeatureLayer: paper.Group;
    alignmentMarksLayer: paper.Group;
    uiLayer: paper.Group;
    ratsNestLayer: paper.Group;
    componentPortsLayer: paper.Group;
    currentTarget: any;
    lastTargetType: string | null;
    lastTargetPosition: number[] | null;
    lastTargetParameters: any;
    selectedComponents: Array<Component>;
    selectedConnections: Array<Connection>;
    inactiveAlpha: number;
    private __viewManagerDelegate: any;
    featureRegistry: Map<string, any>;
    lastTargetSet: string | null = null;
    protected _paperComponentPortView: PaperComponentPortView;
    private __ratsNestRender: paper.Group | null = null;
    layerMask: any;
    alignmentMarks: paper.Group | null = null;

    /**
     * Requires the canvas ID to setup the entire application.
     * @param {string} canvasID
     * @param {} viewmanager
     */
    constructor(canvasID: string, viewmanager: ViewManager) {
        // Setup the Canvas
        paper.setup(canvasID);

        // Get the Canvas Object
        const canvas = document.getElementById(canvasID);

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
        this.uiLayer = new paper.Group(); // This is the layer which we use to render targets
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
        this.featureRegistry = new Map();

        this._paperComponentPortView = new PaperComponentPortView(this.componentPortsLayer, viewmanager);

        this.disableContextMenu();
    }

    /**
     * Returns a list of selected items on the canvas
     * @return {Array}
     * @memberof PaperView
     */
    getSelectedFeatures() {
        const output = [];
        const items = paper.project.selectedItems;
        for (let i = 0; i < items.length; i++) {
            // @ts-ignore
            output.push(this.__viewManagerDelegate.getFeatureByID(items[i].featureID));
        }
        return output;
    }

    /**
     * Deselects the items from the canvas
     * @returns {void}
     * @memberof PaperView
     */
    clearSelectedItems(): void {
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
    deleteSelectedFeatures(): void {
        // TODO: Refine how this works with the selection object code later on
        const items = paper.project.selectedItems;
        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                // @ts-ignore
                this.__viewManagerDelegate.removeFeatureByID(items[i].featureID);
            }

            // Delete the selected Components !!!
            let connection;
            for (const i in this.selectedComponents) {
                connection = this.__viewManagerDelegate.currentDevice.removeComponent(this.selectedComponents[i]);
                if (connection) {
                    this.__viewManagerDelegate.updatesConnectionRender(connection);
                }
            }

            // Delete the selected Connecitons
            for (const i in this.selectedConnections) {
                this.__viewManagerDelegate.currentDevice.removeConnection(this.selectedConnections[i]);
            }
        }
    }

    /**
     * Selects all active layers in the canvas
     * @returns {void}
     * @memberof PaperView
     */
    selectAllActive(): void {
        const layer = this.paperLayers[this.activeLayer];
        for (const i in layer.children) {
            layer.children[i].selected = true;
        }
    }

    /**
     * Converts the layers to SVG format
     * @memberof PaperView
     * @returns {}
     */
    layersToSVGStrings() {
        const output = [];
        for (let i = 0; i < this.featureLayer.children.length; i++) {
            const layer = this.featureLayer.children[i];
            const svg = this.postProcessLayerToSVG(layer);
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
    postProcessLayerToSVG(layer: paper.Item): string {
        // var flip = layer.params["flip"];
        const layerCopy = layer.clone();
        // if (flip === true) {
        //    layerCopy.scale(-1,1);
        // }
        layerCopy.bounds.topLeft = new paper.Point(0, 0);
        const deviceWidth = this.__viewManagerDelegate.currentDevice.getXSpan();
        const deviceHeight = this.__viewManagerDelegate.currentDevice.getYSpan();
        layerCopy.bounds.topLeft = new paper.Point(0, 0);
        layerCopy.bounds.bottomRight = new paper.Point(deviceWidth, deviceHeight);
        const svg = layer.exportSVG({
            asString: true
        });

        const width = deviceWidth;
        const height = deviceHeight;
        const widthInMillimeters = width / 1000;
        const heightInMilliMeters = height / 1000;
        const prepend = ManufacturingLayer.generateSVGTextPrepend(widthInMillimeters, heightInMilliMeters);
        const append = ManufacturingLayer.generateSVGTextAppend();
        const newSVG = prepend + svg + append;
        layerCopy.remove();
        return newSVG;
    }

    /**
     * Gets the width of the canvas
     * @returns {number} Returns the width of the canvas
     * @memberof PaperView
     */
    getCanvasWidth(): number {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        return this.canvas.clientWidth;
    }

    /**
     * Gets the height of the canvas
     * @returns {number} Returns the height of the canvas
     * @memberof PaperView
     */
    getCanvasHeight(): number {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
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
    getDeviceHeightInPixels(): number {
        return this.__viewManagerDelegate.currentDevice.getYSpan() * paper.view.zoom;
    }

    /**
     * Clears the all the paper group collections stored in the paperview object. Used when everything has to be
     * redrawn
     * @returns {void}
     * @memberof PaperView
     */
    clear(): void {
        this.activeLayer = null;
        this.featureLayer.removeChildren();
        this.deviceLayer.removeChildren();
        this.gridLayer.removeChildren();
        this.alignmentMarksLayer.removeChildren();
    }

    /**
     * Gets the center of the paper
     * @returns {Array<number>}
     * @memberof PaperView
     */
    getCenter(): Point  {
        return this.center;
    }

    /**
     * Sets the center at a specific point of the canvas
     * @param {Array<number>} point X and Y coordinates
     * @returns {void}
     * @memberof PaperView
     */
    setCenter(point: paper.Point): void {
        this.center = point;
        this.updateCenter();
    }

    /**
     * Updates the paper center to the new value
     * @returns {void}
     * @memberof PaperView
     */
    updateCenter(): void {
        paper.view.center = this.center;
    }

    /**
     * Gets the zoom at the paper
     * @returns {number} Returns zoom value
     * @memberof PaperView
     */
    getZoom(): number {
        return this.zoom;
    }

    /**
     * Sets a specific zoom at the paper view
     * @param {number} zoom Zoom value
     * @returns {void}
     * @memberof PaperView
     */
    setZoom(zoom: number): void {
        this.zoom = zoom;
        this.updateZoom();

        //sends out the update zoom event
        EventBus.get().emit(EventBus.UPDATE_ZOOM);
    }

    /**
     * Updates zoom of the canvas
     * @returns {void}
     * @memberof PaperView
     */
    updateZoom(): void {
        paper.view.zoom = this.zoom;
    }

    /**
     * Returns the coordinates of the project
     * @param {number} x X coordinate of the canvas
     * @param {number} y Y coordinate of the canvas
     * @returns {}
     * @memberof PaperView
     */
    canvasToProject(x: number, y: number) {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        const rect = this.canvas.getBoundingClientRect();
        const projX = x - rect.left;
        const projY = y - rect.top;
        return paper.view.viewToProject(new paper.Point(projX, projY));
    }

    /**
     * Converts from canvas to project position
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @returns {}
     * @memberof PaperView
     */
    getProjectPosition(x: number, y: number) {
        return this.canvasToProject(x, y);
    }

    /**
     * Adds an event listener to the mouse wheel key
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseWheelFunction(func: { (event: any): void; (event: any): void; (this: HTMLElement, ev: WheelEvent): any }): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.addEventListener("wheel", func);
    }

    /**
     * Adds an event listener when the mouse goes down
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseDownFunction(func: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.onmousedown = func;
    }

    /**
     * Adds an event listener to the mouse up key
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseUpFunction(func: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.onmouseup = func;
    }

    /**
     * Adds an event listener when the mouse moves
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setMouseMoveFunction(func: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.onmousemove = func;
    }

    /**
     * Adds an event listener when a key is press
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setKeyPressFunction(func: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.onkeypress = func;
    }

    /**
     * Adds an event listener when a key is down
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setKeyDownFunction(func: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.onkeydown = func;
    }

    /**
     * Sets the resize function
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    setResizeFunction(func: Function | null): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        paper.view.onResize = func;
    }

    /**
     * Disables the contex menu
     * @param {Function} func Event to execute
     * @returns {void}
     * @memberof PaperView
     */
    disableContextMenu(): void {
        if (this.canvas === null) {
            throw new Error("Canvas is null");
        }
        this.canvas.oncontextmenu = function(event) {
            event.preventDefault();
        };
    }

    /**
     * Refreshes the view of the paper
     * @returns {void}
     * @memberof PaperView
     */
    refresh(): void {
        paper.view.update();
    }

    /* Rendering Devices */
    /**
     * Renders device
     * @param {Device} device Device object
     * @returns {void}
     * @memberof PaperView
     */
    addDevice(device: Device): void {
        this.updateDevice(device);
    }

    /**
     * Updates a device
     * @param {Device} device Device object
     * @returns {void}
     * @memberof PaperView
     */
    updateDevice(device: Device): void {
        this.removeDevice();
        const newPaperDevice = DeviceRenderer.renderDevice(device);
        this.paperDevice = newPaperDevice;
        this.deviceLayer.addChild(newPaperDevice);
    }

    /**
     * Removes the device from the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeDevice(): void {
        if (this.paperDevice) this.paperDevice.remove();
        this.paperDevice = null;
        //TODO: Figure out how to handle featureRegistry
        //this.featureRegistry = new Map();
    }

    /* Rendering Layers */
    /**
     * Renders the layers
     * @param {Layer} layer Layer object
     * @param {number} index Index of layer to render (Int)
     * @returns {void}
     * @memberof PaperView
     */
    addLayer(layer: Layer, index: number): void {
        this.paperLayers[index] = new paper.Group();
        this.featureLayer.addChild(this.paperLayers[index]);
        // this.setActiveLayer(index);
    }


    /**
     * Delete the layer from the paperview at the given index.
     * @param {number} index Index of the layer to be removed (Int)
     * @returns {void}
     * @memberof PaperView
     */
    removeLayer(index: number): void {
        if (index !== -1) {
            for (let i = 0; i < this.paperLayers[index].children.length; i++) {
                this.featureRegistry.delete(this.paperLayers[index].children[i].featureID);
            }
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
    addFeature(feature: Feature): void {
        this.updateFeature(feature);
    }

    /**
     * Sets a new active layer
     * @param {number} index Index of layer to be active (Int)
     * @returns {void}
     * @memberof PaperView
     */
    setActiveLayer(index: number): void {
        this.activeLayer = index;
        if (this.activeLayer !== null && this.activeLayer >= 0) this.showActiveLayer();
    }

    /**
     * Show the current active layer
     * @returns {void}
     * @memberof PaperView
     */
    showActiveLayer(): void {
        this.featureLayer.remove();
        this.featureLayer = new paper.Group();
        for (let i = 0; i < this.paperLayers.length; i++) {
            this.featureLayer.addChild(this.paperLayers[i]);
        }
        if (this.layerMask) this.layerMask.remove();
        this.layerMask = DeviceRenderer.renderLayerMask(this.__viewManagerDelegate.currentDevice);
        this.featureLayer.addChild(this.layerMask);
        const activeLayer = this.paperLayers[this.activeLayer];
        activeLayer.bringToFront();
    }

    /**
     * Show only the desired features
     * Chosen features appear
     * Built for use in uF Guide Tool
     * @param {Array<ToolPaperObject>} features Array of features to be displayed
     * @returns {void}
     * @memberof PaperView
     */
    showChosenFeatures(features: Array<ToolPaperObject>): void {
        this.resetFeatureLayers();
        this.featureLayer.remove();
        this.featureLayer = new paper.Group();
        for (let i = 0; i < this.paperLayers.length; i++) {
            this.featureLayer.addChild(this.paperLayers[i]);
        }
        if (this.layerMask) this.layerMask.remove();
        this.layerMask = DeviceRenderer.renderLayerMask(this.__viewManagerDelegate.currentDevice);
        this.featureLayer.addChild(this.layerMask);
        const activeLayer = new paper.Group();
        for (let i = 0; i < features.length; i++) {
            activeLayer.addChild(features[i]);
        }
        activeLayer.bringToFront();

        const textLayer = this.getNonphysText();
        textLayer.bringToFront();
    }

    /**
     * Show all but the desired features
     * Chosen features behind mask
     * Built for use in uF Guide Tool
     * @param {Array<ToolPaperObject>} features Array of features to be displayed
     * @returns {void}
     * @memberof PaperView
     */
    hideChosenFeatures(features: Array<ToolPaperObject>): void  {
        this.resetFeatureLayers();
        this.featureLayer.remove();
        this.featureLayer = new paper.Group();
        if (this.layerMask) this.layerMask.remove();
        this.layerMask = DeviceRenderer.renderLayerMask(this.__viewManagerDelegate.currentDevice);
        this.featureLayer.addChild(this.layerMask);
        for (let i = 0; i < this.paperLayers.length; i++) {
            this.featureLayer.addChild(this.paperLayers[i]);
        }
        const activeLayer = new paper.Group();
        for (let i = 0; i < features.length; i++) {
            activeLayer.addChild(features[i]);
        }
        activeLayer.insertAbove(this.gridLayer);

        const textLayer = this.getNonphysText();
        textLayer.bringToFront();
    }

    /**
     * Display all features in the device
     * Built for use in uF Guide Tool
     * @returns {void}
     * @memberof PaperView
     */
    showAllFeatures(): void {
        this.resetFeatureLayers();
        this.featureLayer.remove();
        this.featureLayer = new paper.Group();
        if (this.layerMask) this.layerMask.remove();
        this.layerMask = DeviceRenderer.renderLayerMask(this.__viewManagerDelegate.currentDevice);
        this.featureLayer.addChild(this.layerMask);
        for (let i = 0; i < this.paperLayers.length; i++) {
            this.featureLayer.addChild(this.paperLayers[i]);
        }

        const textLayer = this.getNonphysText();
        textLayer.bringToFront();
    }

    /**
     * Return all features to the paper layers defined in featureRegistry
     * Built for use in uF Guide Tool
     * @returns {void}
     * @memberof PaperView
     */
    resetFeatureLayers(): void {
        for (let i = 0; i < this.paperLayers.length; i++) {
            this.featureRegistry.forEach((value, key) => {
                if (this.paperLayers[i].id == value) {
                    this.paperLayers[i].addChild(this.paperFeatures[key]);
                }
            });
        }
    }

    /**
     * Brings nonphysical text features to the front
     * Ensures nonphysical text is on top of device features
     * Built for use in uF Guide Tool
     * @returns {void}
     * @memberof PaperView
     */
    getNonphysText() {
        if (Registry.viewManager === undefined || Registry.viewManager === null) {
            throw new Error("Registry.viewManager is undefined");
        }
        const textLayer = new paper.Group();
        const nonphysElements = Registry.viewManager.nonphysElements;
        for (let i = 0; i < nonphysElements.length; i++) {
            for (const j in this.paperFeatures) {
                if (nonphysElements[i].type == "Text" && nonphysElements[i].featureIDs.includes(this.paperFeatures[j].featureID)) {
                    textLayer.addChild(this.paperFeatures[j]);
                }
            }
        }
        return textLayer;
    }

    /**
     * Generate nonphysical text
     * Text color can be set to black, white, red, or blue
     * Built for use in uF Guide Tool
     * @param {string} text Text to be displayed
     * @param {[number,number]} position Coordinates on the canvas grid
     * @param {number} size Font size
     * @param {string} color The color of the text
     * @param {number} layer The layer on which
     * @returns {void}
     * @memberof PaperView
     */
    generateNonphysText(text: string, position: paper.Point, size: number, color: any, layer = this.activeLayer): void {
        const newFeature = Device.makeFeature(
            "Text",
            {
                position: position,
                height: 20,
                text: text,
                fontSize: size,
                color: color
            },
            "TEXT_" + text,
            uuid.v1(),
            "XY",
            null
        );
        this.__viewManagerDelegate.addFeature(newFeature, layer, false);
        // this.addComponent("Text", newFeature.getParams(), [newFeature.ID], false);
        const element = this.addUIElement("Text", newFeature.getParams(), [newFeature.ID]);
        newFeature.referenceID = element.id;
        this.__viewManagerDelegate.saveDeviceState();
    }

    /**
     * Creates a new UIElement and adds it to viewManager's nonphysicalElements array
     * Note: Takes the feature ids as an array
     * TODO: Modify this to take the MINT String as another parameter
     * Built for use in uF Guide Tool
     * @param typeString Type of the Feature
     * @param params Map of all the paramters
     * @param featureIDs [String] Feature id's of all the features that will be a part of this component
     */
    addUIElement(typeString: string, paramdata: { [index: string]: Parameter }, featureIDs: Array<string>) {
        if (Registry.viewManager === undefined || Registry.viewManager === null) {
            console.log("ViewManager is not defined");
            throw new Error("ViewManager is not defined");
        }
        let newElement;
        if (typeString == "Text") {
            newElement = new TextElement(typeString, paramdata, featureIDs);
        } else {
            newElement = new UIElement();
            // TODO: implement parameter handling for base UIElement
        }
        Registry.viewManager.nonphysElements.push(newElement);
        return newElement;
    }

    /**
     * Inserts paper feature into the UILayer
     * Built for use in uF Guide Tool
     * @param newPaperFeature Paper feature to be added to the UI layer
     */
    insertUIFeature(newPaperFeature: paper.Item): void {
        this.uiLayer.insertChild(0, newPaperFeature);
    }

    /**
     * Creates a new component and adds it to viewManager's nonphysicalComponents or the currentDevice's __components
     * Note: Takes the feature ids as an array
     * TODO: Modify this to take the MINT String as another parameter
     * Built for use in uF Guide Tool
     * @param typeString Type of the Feature
     * @param params Map of all the paramters
     * @param featureIDs [String] Feature id's of all the features that will be a part of this component
     * @param physical Boolean stating whether feature physical or not
     */
    addComponent(typeString: string, paramdata: { [index: string]: Parameter }, featureIDs: Array<string>, physical: boolean) {
        if (Registry.viewManager === undefined || Registry.viewManager === null) {
            console.error("ViewManager is not defined");
            throw new Error("ViewManager is not defined");
        }
        if (Registry.currentDevice === undefined || Registry.currentDevice === null) {
            console.error("Current Device is not defined");
            throw new Error("Current Device is not defined");
        }
        const definition = ComponentAPI.getDefinition(typeString);
        if (definition === undefined || definition === null) {
            throw new Error("Component definition not found");
        }
        // Clean Param Data
        const cleanparamdata: { [key: string]: any } = {};
        for (const key in paramdata) {
            cleanparamdata[key] = paramdata[key].value;
        }
        const params = new Params(cleanparamdata, MapUtils.toMap(definition.unique), MapUtils.toMap(definition.heritable));
        const componentid = ComponentAPI.generateID();
        const name = Registry.currentDevice.generateNewName(typeString);
        const newComponent = new Component(params, name, definition.mint, componentid);
        let feature;

        for (const i in featureIDs) {
            newComponent.addFeatureID(featureIDs[i]);

            // Update the component reference
            feature = this.__viewManagerDelegate.getFeatureByID(featureIDs[i]);
            feature.referenceID = componentid;
        }

        Registry.currentDevice.addComponent(newComponent);
        return newComponent;
    }

    /**
     * Compares feature heights of the paper
     * @param {number} a
     * @param {number} b
     * @returns {number}
     * @memberof PaperView
     */
    comparePaperFeatureHeights(a: { featureID: any }, b: { featureID: any }): number {
        let bHeight;
        let aHeight;
        const aFeature = this.__viewManagerDelegate.getFeatureByID(a.featureID);
        const bFeature = this.__viewManagerDelegate.getFeatureByID(b.featureID);

        // TODO: So this needs to be eliminated form the entire sequence
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
    insertChildByHeight(group: { children: string | any[]; insertChild: (arg0: any, arg1: any) => void }, newChild: any): void {
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
    getIndexByHeight(children: string | any[], newChild: any): number {
        for (let i = 0; i < children.length; i++) {
            const test = this.comparePaperFeatureHeights(children[i], newChild);
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
    updateFeature(feature: Feature): void {
        const existingFeature = this.paperFeatures[feature.ID];
        let selected;
        if (existingFeature) selected = existingFeature.selected;
        else selected = false;
        this.removeFeature(feature);
        let newPaperFeature;
        // if (!Registry.currentDevice.containsFeatureID(feature.ID)) {
        //     newPaperFeature = FeatureRenderer2D.renderFeature(feature);
        //     this.insertUIFeature(newPaperFeature);
        // } else {
        if (feature instanceof EdgeFeature) {
            newPaperFeature = DXFObjectRenderer2D.renderEdgeFeature(feature);
            newPaperFeature.selected = selected;
            // @ts-ignore
            this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
            this.insertEdgeFeatures(newPaperFeature);
            return;
        } else {
            newPaperFeature = FeatureRenderer2D.renderFeature(feature, null);
        }
        newPaperFeature.selected = selected;
        this.paperFeatures[newPaperFeature.featureID] = newPaperFeature;
        const index = this.__viewManagerDelegate.renderLayers.indexOf(this.__viewManagerDelegate.getRenderLayerByID(feature.ID));
        const layer = this.paperLayers[index];
        this.insertChildByHeight(layer, newPaperFeature);
        this.featureRegistry.set(newPaperFeature.featureID, layer.id);
        // }
    }

    /**
     * Removes the target that is being rendered
     * @returns {void}
     * @memberof PaperView
     */
    removeTarget(): void {
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
    addTarget(featureType: string | null, set: string, position: number[] | null, currentParameters: any): void {
        this.removeTarget();
        this.lastTargetParameters = currentParameters;
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
    updateTarget(): void {
        this.removeTarget();
        if (this.lastTargetType && this.lastTargetPosition) {
            // Checks if the target is a text type target
            if (this.lastTargetType === "TEXT") {
                this.currentTarget = FeatureRenderer2D.renderTextTarget(this.lastTargetType, this.lastTargetSet, this.lastTargetPosition);
                this.uiLayer.addChild(this.currentTarget);
            } else if (this.lastTargetSet === "Custom") {
                const customcomponent = this.__viewManagerDelegate.customComponentManager.getCustomComponent(this.lastTargetType);
                // @ts-ignore
                const params = Registry.featureDefaults[this.lastTargetSet][this.lastTargetType];
                params.position = this.lastTargetPosition;
                params.color = Colors.getDefaultFeatureColor(this.lastTargetType, this.lastTargetSet, (Registry.currentLayer as unknown) as Layer);
                this.currentTarget = DXFSolidObjectRenderer.renderCustomComponentTarget(customcomponent, params);
                this.uiLayer.addChild(this.currentTarget);
            } else {
                this.currentTarget = FeatureRenderer2D.renderTarget(this.lastTargetType, this.lastTargetSet, this.lastTargetPosition, this.lastTargetParameters);
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
    removeFeature(feature: Feature): void {
        const paperFeature = this.paperFeatures[feature.ID];
        if (paperFeature) {
            paperFeature.remove();
        }
        this.paperFeatures[feature.ID] = null;
        this.featureRegistry.delete(feature.ID);
    }

    /**
     * Removes grid of the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeGrid(): void {
        if (this.paperGrid) this.paperGrid.remove();
        this.paperGrid = null;
    }

    /**
     * Updates the grid of the paper
     * @param {*} grid Grid to update
     * @returns {void}
     * @memberof PaperView
     */
    updateGrid(grid: any): void {
        this.removeGrid();
        const newPaperGrid = GridRenderer.renderGrid(grid);
        this.paperGrid = newPaperGrid;
        this.gridLayer.addChild(newPaperGrid);
    }

    /**
     * Updates alignment marks of the paper
     */
    updateAlignmentMarks(): void {
        // TODO: Update this for the new visualizations
        // Remove current Alignment Marks:
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
    removeAlignmentMarks(): void {
        // Does nothing right now
        if (this.alignmentMarks) this.alignmentMarks.removeChildren();
        this.alignmentMarks = null;
    }

    /**
     * Updates unrouted connections of the paper
     * @returns {void}
     * @memberof PaperView
     */
    updateRatsNest(): void {
        this.removeRatsNest();
        const unrouted = this.__viewManagerDelegate.currentDevice.getUnroutedConnections();

        const rendergroup = RatsNestRenderer2D.renderRatsNest(unrouted, this.__viewManagerDelegate.currentDevice);

        this.__ratsNestRender = rendergroup;
        this.ratsNestLayer.addChild(this.__ratsNestRender);
    }

    /**
     * Removes unrouted connections of the paper
     * @returns {void}
     * @memberof PaperView
     */
    removeRatsNest(): void {
        // First clear out the render objects
        if (this.__ratsNestRender) {
            this.__ratsNestRender.remove();
        }
        // Next set it to null
        this.__ratsNestRender = null;
    }

    /**
     * Moves the center by a specific value
     * @param {number} delta
     * @returns {void}
     * @memberof PaperView
     */
    moveCenter(delta: paper.Point): void {
        this.panAndZoom.moveCenter(delta);
    }

    /**
     * Adjust the zoom bu a specific value to a certain point on the paper
     * @param {number} delta
     * @param {Array<number>} point
     * @returns {void}
     * @memberof PaperView
     */
    adjustZoom(delta: number, point: paper.Point): void {
        this.panAndZoom.adjustZoom(delta, point);
    }

    /**
     * Gets the paper features
     * @param {Array<Feature>} paperFeatures
     * @returns {Array} Returns an array with the features
     * @memberof PaperView
     */
    getFeaturesByViewElements(paperFeatures: string | any[]) {
        const output = [];
        for (let i = 0; i < paperFeatures.length; i++) {
            output.push(this.__viewManagerDelegate.getFeatureByID(paperFeatures[i].featureID));
        }
        return output;
    }

    /**
     * Initialize the view on the paper
     * @returns {void}
     * @memberof PaperView
     */
    initializeView(): void {
        const center = this.getDeviceCenter();
        const zoom = this.computeOptimalZoom();
        this.setCenter(center);
        this.setZoom(zoom);
    }

    /**
     * Centers the device on the paper
     * @returns {Array<number>} Returns an array with the X and Y coordinates of the center
     * @memberof PaperView
     */
    getDeviceCenter() {
        const width = this.__viewManagerDelegate.currentDevice.getXSpan();
        const height = this.__viewManagerDelegate.currentDevice.getYSpan();
        return new paper.Point(width / 2, height / 2);
    }

    /**
     * Calculates the optimal zoom of the paper
     * @returns {number} Returns the value of the optima zoom
     * @memberof PaperView
     */
    computeOptimalZoom(): number {
        const borderMargin = 200; // pixels
        const deviceWidth = this.__viewManagerDelegate.currentDevice.getXSpan();
        const deviceHeight = this.__viewManagerDelegate.currentDevice.getYSpan();
        const canvasWidth = this.getCanvasWidth();
        const canvasHeight = this.getCanvasHeight();
        let maxWidth;
        let maxHeight;
        if (canvasWidth - borderMargin <= 0) maxWidth = canvasWidth;
        else maxWidth = canvasWidth - borderMargin;
        if (canvasHeight - borderMargin <= 0) maxHeight = canvasHeight;
        else maxHeight = canvasHeight - borderMargin;
        const widthRatio = deviceWidth / maxWidth;
        const heightRatio = deviceHeight / maxHeight;
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
    hitFeature(point: paper.Point, onlyHitActiveLayer = true, nonphysActiveLayer = false) {
        const hitOptions = {
            fill: true,
            tolerance: 5,
            guides: false
        };

        let target;

        if (onlyHitActiveLayer && this.activeLayer !== null && !nonphysActiveLayer) {
            target = this.paperLayers[this.activeLayer];

            const result = target.hitTest(point, hitOptions);
            if (result) {
                return result.item;
            }
        } else if (onlyHitActiveLayer && nonphysActiveLayer) {
            target = this.getNonphysText();

            const result = target.hitTest(point, hitOptions);
            if (result) {
                return result.item;
            }
        } else {
            for (let i = this.paperLayers.length - 1; i >= 0; i--) {
                target = this.paperLayers[i];
                const result = target.hitTest(point, hitOptions);
                if (result) {
                    return result.item;
                }
            }
        }
        return null;
    }

    /**
     * Checks if the feature hit an element ?
     * @param {*} paperElement
     * @param {*} onlyHitActiveLayer
     * @returns {Array} Returns an Array with all the child components which intersects the paper element
     * @memberof PaperView
     */
    hitFeaturesWithViewElement(paperElement: any, onlyHitActiveLayer = true) {
        const output = [];
        if (onlyHitActiveLayer && this.activeLayer !== null) {
            const layer = this.paperLayers[this.activeLayer];
            for (let i = 0; i < layer.children.length; i++) {
                const child = layer.children[i];
                if (paperElement.intersects(child) || child.isInside(paperElement.bounds)) {
                    output.push(child);
                }
            }
        } else {
            for (let i = 0; i < this.paperLayers.length; i++) {
                const layer = this.paperLayers[i];
                for (let j = 0; j < layer.children.length; j++) {
                    const child = layer.children[j];
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
    insertEdgeFeatures(newPaperFeature: paper.CompoundPath): void {
        const layer = this.paperLayers[0];
        layer.insertChild(0, newPaperFeature);
    }

    /**
     * Returns the rendered feature object that is being displayed for the particular feature
     * @param {string} featureID ID of the feature
     * @return {ToolPaperObject} Returns an object containing the rendered features
     * @memberof PaperView
     */
    getRenderedFeature(featureID: string) {
        return this.paperFeatures[featureID];
    }

    /**
     * Updates the component after it was rendered
     * @returns {void}
     * @memberof PaperView
     */
    updateComponentPortsRender(): void {
        this._paperComponentPortView.updateRenders();
    }

    /**
     * Enable snap render
     * @returns {void}
     * @memberof PaperView
     */
    enableSnapRender(): void {
        this._paperComponentPortView.enable();
    }

    /**
     * Disable snap render
     * @returns {void}
     * @memberof PaperView
     */
    disableSnapRender(): void {
        this._paperComponentPortView.disable();
    }

    /**
     * Returns the paperjs object that is rendering the feature
     * @param {string} featureID
     * @returns
     */
    getRender(featureID: string) {
        return this.paperFeatures[featureID];
    }
}
