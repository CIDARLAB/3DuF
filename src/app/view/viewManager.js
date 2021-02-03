import ZoomToolBar from "./ui/zoomToolBar";
import BorderSettingsDialog from "./ui/borderSettingDialog";
import paper from "paper";

import * as Registry from "../core/registry";
import * as Colors from "./colors";

import Device from "../core/device";
import ChannelTool from "./tools/channelTool";
import SelectTool from "./tools/selectTool";
import InsertTextTool from "./tools/insertTextTool";
import SimpleQueue from "../utils/simpleQueue";
import MouseSelectTool from "./tools/mouseSelectTool";

import ResolutionToolBar from "./ui/resolutionToolBar";
import RightPanel from "./ui/rightPanel";
import DXFObject from "../core/dxfObject";
import EdgeFeature from "../core/edgeFeature";
import ChangeAllDialog from "./ui/changeAllDialog";
import LayerToolBar from "./ui/layerToolBar";
import * as HTMLUtils from "../utils/htmlUtils";
import MouseAndKeyboardHandler from "./mouseAndKeyboardHandler";
import ComponentToolBar from "./ui/componentToolBar";
import DesignHistory from "./designHistory";
import MoveTool from "./tools/moveTool";
import ComponentPositionTool from "./tools/componentPositionTool";
import MultilayerPositionTool from "./tools/multilayerPositionTool";
import CellPositionTool from "./tools/cellPositionTool";
import ValveInsertionTool from "./tools/valveInsertionTool";
import PositionTool from "./tools/positionTool";
import ConnectionTool from "./tools/connectionTool";
import GenerateArrayTool from "./tools/generateArrayTool";
import CustomComponentManager from "./customComponentManager";
import EditDeviceDialog from "./ui/editDeviceDialog";
import ManufacturingPanel from "./ui/manufacturingPanel";
import CustomComponentPositionTool from "./tools/customComponentPositionTool";
import CustomComponent from "../core/customComponent";
import { setButtonColor } from "../utils/htmlUtils";
import ExportPanel from "./ui/exportPanel";
import HelpDialog from "./ui/helpDialog";
import PaperView from "./paperView";
import AdaptiveGrid from "./grid/adaptiveGrid";
import TaguchiDesigner from "./ui/taguchiDesigner";
import RightClickMenu from "./ui/rightClickMenu";
import IntroDialog from "./ui/introDialog";
import DAFDPlugin from "../plugin/dafdPlugin";
import { Examples } from "../index";
import Feature from "../core/feature";
import Layer from "../core/layer";
import Component from "../core/component";

import ControlCellPositionTool from "./tools/controlCellPositionTool";
import * as FeatureSets from "../featureSets";

/**
 * View manager class
 */
export default class ViewManager {
    /**
     * Default ViewManger Constructor
     */
    constructor() {
        this.threeD;
        this.view = new PaperView("c", this);

        this.__grid = new AdaptiveGrid(this);
        Registry.currentGrid = this.__grid;

        this.tools = {};
        this.rightMouseTool = new SelectTool();
        this.customComponentManager = new CustomComponentManager(this);
        this.rightPanel = new RightPanel(this);
        this.changeAllDialog = new ChangeAllDialog();
        this.resolutionToolBar = new ResolutionToolBar();
        this.borderDialog = new BorderSettingsDialog();
        this.layerToolBar = new LayerToolBar();
        this.messageBox = document.querySelector(".mdl-js-snackbar");
        this.editDeviceDialog = new EditDeviceDialog(this);
        this.helpDialog = new HelpDialog();
        this.taguchiDesigner = new TaguchiDesigner(this);
        this.rightClickMenu = new RightClickMenu();
        this.__currentDevice = null;
        this._introDialog = new IntroDialog();
        let reference = this;
        this.updateQueue = new SimpleQueue(function() {
            reference.view.refresh();
        }, 20);

        this.saveQueue = new SimpleQueue(function() {
            reference.saveToStorage();
        });

        this.undoStack = new DesignHistory();
        this.pasteboard = [];

        this.mouseAndKeyboardHandler = new MouseAndKeyboardHandler(this);

        this.view.setResizeFunction(function() {
            reference.updateGrid();
            reference.updateAlignmentMarks();

            reference.view.updateRatsNest();
            reference.view.updateComponentPortsRender();
            reference.updateDevice(Registry.currentDevice);
        });

        let func = function(event) {
            reference.adjustZoom(event.deltaY, reference.getEventPosition(event));
        };

        this.manufacturingPanel = new ManufacturingPanel(this);

        this.exportPanel = new ExportPanel(this);

        this.view.setMouseWheelFunction(func);
        this.minZoom = 0.0001;
        this.maxZoom = 5;
        this.setupTools();

        //TODO: Figure out how remove UpdateQueue as dependency mechanism
        this.__grid.setColor(Colors.BLUE_500);

        //Removed from Page Setup
        this.threeD = false;
        this.renderer = Registry.threeRenderer;
        this.__button2D = document.getElementById("button_2D");
        this.__canvasBlock = document.getElementById("canvas_block");
        this.__renderBlock = document.getElementById("renderContainer");
        this.setupDragAndDropLoad("#c");
        this.setupDragAndDropLoad("#renderContainer");
        this.switchTo2D();
    }

    /**
     * Returns the current device the ViewManager is displaying. Right now I'm using this to replace the
     * Registry.currentDevice dependency, however this might change as the modularity requirements change.
     *
     * @return {Device}
     * @memberof ViewManager
     */
    get currentDevice() {
        return this.__currentDevice;
    }

    /**
     * Initiates the copy operation on the selected feature
     * @returns {void}
     * @memberof ViewManager
     */
    initiateCopy() {
        let selectedFeatures = this.view.getSelectedFeatures();
        if (selectedFeatures.length > 0) {
            this.pasteboard[0] = selectedFeatures[0];
        }
    }
    /**
     * Initiating the zoom toolbar
     * @memberof ViewManager
     * @returns {void}
     */
    setupToolBars() {
        //Initiating the zoom toolbar
        this.zoomToolBar = new ZoomToolBar(0.0001, 5);
        this.componentToolBar = new ComponentToolBar(this);
        this.resetToDefaultTool();
    }
    /**
     * Adds a device to the view manager
     * @param {Device} device Device to be added
     * @param {Boolean} refresh Default true
     * @memberof ViewManager
     * @returns {void}
     */
    addDevice(device, refresh = true) {
        this.view.addDevice(device);
        this.__addAllDeviceLayers(device, false);
        this.refresh(refresh);
    }

    /**
     * Adds all the layers in the device
     * @param {Device} device Selected device
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof ViewManager
     * @returns {void}
     * @private
     */
    __addAllDeviceLayers(device, refresh = true) {
        for (let i = 0; i < device.layers.length; i++) {
            let layer = device.layers[i];
            this.addLayer(layer, i, false);
        }
    }
    /**
     * Removes all layers in the device
     * @param {Device} device Selected device
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof ViewManager
     * @returns {void}
     */
    __removeAllDeviceLayers(device, refresh = true) {
        for (let i = 0; i < device.layers.length; i++) {
            let layer = device.layers[i];
            this.removeLayer(layer, i, false);
        }
    }
    /**
     * Removes the device from the view
     * @param {Device} device Selected device to remove
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    removeDevice(device, refresh = true) {
        this.view.removeDevice(device);
        this.__removeAllDeviceLayers(device, false);
        this.refresh(refresh);
    }
    /**
     * Updates the device in the view
     * @param {Device} device Selected device to update
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    updateDevice(device, refresh = true) {
        this.view.updateDevice(device);
        this.refresh(refresh);
    }
    /**
     * Adds a feature to the view
     * @param {Feature} feature Feature to add
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    addFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.addFeature(feature);
            this.refresh(refresh);
        }
    }
    /**
     * Updates a feature from the view
     * @param {Feature} feature Feature to update
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    updateFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.updateFeature(feature);
            this.refresh(refresh);
        }
    }
    /**
     * Removes feature from the view
     * @param {Feature} feature Feature to remove
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    removeFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.removeFeature(feature);
            this.refresh(refresh);
        }
    }
    /**
     * Adds layer to the view
     * @param {Layer} layer Layer to add
     * @param {Number} index Index of the layer
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    addLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.addLayer(layer, index, false);
            this.__addAllLayerFeatures(layer, false);
            this.refresh(refresh);
        }
    }

    /**
     * Create a new set of layers (flow, control and cell) for the upcoming level.
     * @returns {void}
     * @memberof ViewManager
     */
    createNewLayerBlock() {
        let newlayers = Registry.currentDevice.createNewLayerBlock();

        //Find all the edge features
        let edgefeatures = [];
        let devicefeatures = Registry.currentDevice.layers[0].features;
        let feature;

        for (let i in devicefeatures) {
            feature = devicefeatures[i];
            if (feature.fabType == "EDGE") {
                edgefeatures.push(feature);
            }
        }

        //Add the Edge Features from layer '0'
        // to all other layers
        for (let i in newlayers) {
            for (let j in edgefeatures) {
                newlayers[i].addFeature(edgefeatures[j], false);
            }
        }

        //Added the new layers
        for (let i in newlayers) {
            let layertoadd = newlayers[i];
            let index = this.view.paperLayers.length;
            this.addLayer(layertoadd, index, true);
        }
    }

    /**
     * Deletes the layers at the level index, we have 3-set of layers so it deletes everything at
     * that level
     * @param {number} levelindex Integer only
     * @returns {void}
     * @memberof ViewManager
     */
    deleteLayerBlock(levelindex) {
        //Delete the levels in the device model
        Registry.currentDevice.deleteLayer(levelindex * 3);
        Registry.currentDevice.deleteLayer(levelindex * 3 + 1);
        Registry.currentDevice.deleteLayer(levelindex * 3 + 2);

        //Delete the levels in the render model
        this.view.removeLayer(levelindex * 3);
        this.view.removeLayer(levelindex * 3 + 1);
        this.view.removeLayer(levelindex * 3 + 2);
        this.updateActiveLayer();
        this.refresh();
    }
    /**
     * Removes layer from the view
     * @param {Layer} layer Layer to be removed from the view
     * @param {Number} index Index of the layer to remove
     * @param {Boolean} refresh Default to true
     * @returns {view}
     * @memberof ViewManager
     */
    removeLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.removeLayer(layer, index);
            this.__removeAllLayerFeatures(layer);
            this.refresh(refresh);
        }
    }
    /**
     * Converts the layers to SVG format
     * @returns {}
     * @memberof ViewManager
     */
    layersToSVGStrings() {
        return this.view.layersToSVGStrings();
    }

    /**
     * Adds all the features of the layer
     * @param {Layer} layer Selected layer
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     * @private
     */
    __addAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.addFeature(feature, false);
            this.refresh(refresh);
        }
    }
    /**
     * Updates all the feature of the layer
     * @param {Layer} layer Selected layer
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    __updateAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.updateFeature(feature, false);
            this.refresh(refresh);
        }
    }
    /**
     * Removes all feature of the layer
     * @param {Layer} layer Selected layer
     * @param {Boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    __removeAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.removeFeature(feature, false);
            this.refresh(refresh);
        }
    }
    /**
     * Updates layer
     * @param {Layer} layer Selected layer to be updated
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    updateLayer(layer, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.updateLayer(layer);
            this.refresh(refresh);
        }
    }
    /**
     * Updates the active layer
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
    updateActiveLayer(refresh = true) {
        this.view.setActiveLayer(Registry.currentDevice.layers.indexOf(Registry.currentLayer));
        this.refresh(refresh);
    }
    /**
     * Removes the grid
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
    removeGrid(refresh = true) {
        if (this.__hasCurrentGrid()) {
            this.view.removeGrid();
            this.refresh(refresh);
        }
    }
    /**
     * Update grid
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
    updateGrid(refresh = true) {
        if (this.__hasCurrentGrid()) {
            this.view.updateGrid(Registry.currentGrid);
            this.refresh(refresh);
        }
    }
    /**
     * Update the alignment marks of the view
     * @returns {void}
     * @memberof ViewManager
     */
    updateAlignmentMarks() {
        this.view.updateAlignmentMarks();
    }
    /**
     * Clear the view
     * @returns {void}
     * @memberof ViewManager
     */
    clear() {
        this.view.clear();
    }
    /**
     * Sets a specific value of zoom
     * @param {Number} zoom Zoom value
     * @param {boolean} refresh Whether it will refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    setZoom(zoom, refresh = true) {
        if (zoom > this.maxZoom) zoom = this.maxZoom;
        else if (zoom < this.minZoom) zoom = this.minZoom;
        this.view.setZoom(zoom);
        this.updateGrid(false);
        this.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();

        this.updateDevice(Registry.currentDevice, false);
        this.__updateViewTarget(false);
        this.zoomToolBar.setZoom(zoom);
        this.refresh(refresh);
    }

    /**
     * Automatically generates a rectangular border for the device
     * @returns {void}
     * @memberof ViewManager
     */
    generateBorder() {
        let borderfeature = new EdgeFeature(null, null);

        //Get the bounds for the border feature and then update the device dimensions
        let xspan = Registry.currentDevice.getXSpan();
        let yspan = Registry.currentDevice.getYSpan();
        borderfeature.generateRectEdge(xspan, yspan);

        //Adding the feature to all the layers
        for (let i in Registry.currentDevice.layers) {
            let layer = Registry.currentDevice.layers[i];
            layer.addFeature(borderfeature);
        }
    }

    /**
     * Accepts a DXF object and then converts it into a feature, an edgeFeature in particular
     * @param dxfobject
     * @returns {void}
     * @memberof ViewManager
     */
    importBorder(dxfobject) {
        let customborderfeature = new EdgeFeature(null, null);
        for (let i in dxfobject.entities) {
            let foo = new DXFObject(dxfobject.entities[i]);
            customborderfeature.addDXFObject(foo);
        }

        //Adding the feature to all the layers
        for (let i in Registry.currentDevice.layers) {
            let layer = Registry.currentDevice.layers[i];
            layer.addFeature(customborderfeature);
        }

        //Get the bounds for the border feature and then update the device dimensions
        let bounds = this.view.getRenderedFeature(customborderfeature.getID()).bounds;

        Registry.currentDevice.setXSpan(bounds.width);
        Registry.currentDevice.setYSpan(bounds.height);
        //Refresh the view
        Registry.viewManager.view.initializeView();
        Registry.viewManager.view.refresh();
    }

    /**
     * Deletes the border
     * @returns {void}
     * @memberof ViewManager
     */
    deleteBorder() {
        /*
        1. Find all the features that are EDGE type
        2. Delete all these features
         */

        console.log("Deleting border...");

        let features = Registry.currentDevice.getAllFeaturesFromDevice();
        console.log("All features", features);

        let edgefeatures = [];

        for (let i in features) {
            //Check if the feature is EDGE or not
            if ("EDGE" == features[i].fabType) {
                edgefeatures.push(features[i]);
            }
        }

        //Delete all the features
        for (let i in edgefeatures) {
            Registry.currentDevice.removeFeatureByID(edgefeatures[i].getID());
        }

        console.log("Edgefeatures", edgefeatures);
    }
    /**
     * Removes the target view
     * @memberof ViewManager
     * @returns {void}
     */
    removeTarget() {
        this.view.removeTarget();
    }
    /**
     * Update the target view
     * @param {string} featureType
     * @param {string} featureSet
     * @param {Array<number>} position Array with X and Y coordinates
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    updateTarget(featureType, featureSet, position, refresh = true) {
        this.view.addTarget(featureType, featureSet, position);
        this.view.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
        this.refresh(refresh);
    }
    /**
     * Update the view target
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
    __updateViewTarget(refresh = true) {
        this.view.updateTarget();
        this.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
        this.refresh(refresh);
    }
    /**
     * Adjust the zoom value in a certain point
     * @param {Number} delta Value of zoom
     * @param {Array<number>} point Coordinates to zoom in
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
    adjustZoom(delta, point, refresh = true) {
        let belowMin = this.view.getZoom() >= this.maxZoom && delta < 0;
        let aboveMax = this.view.getZoom() <= this.minZoom && delta > 0;
        if (!aboveMax && !belowMin) {
            this.view.adjustZoom(delta, point);
            this.updateGrid(false);
            //this.updateAlignmentMarks();
            this.view.updateRatsNest();
            this.view.updateComponentPortsRender();
            this.updateDevice(Registry.currentDevice, false);
            this.__updateViewTarget(false);
        } else {
            //console.log("Too big or too small!");
        }
        this.refresh(refresh);
    }
    /**
     * Sets the center value
     * @param {Array<number>} center Center coordinates
     * @param {Boolean} refresh Default to true
     * @returns {void}
     * @memberof ViewManager
     */
    setCenter(center, refresh = true) {
        this.view.setCenter(center);
        this.updateGrid(false);
        //this.updateAlighmentMarks();

        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }
    /**
     * Moves center by a certain value
     * @param {number} delta
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    moveCenter(delta, refresh = true) {
        this.view.moveCenter(delta);
        this.updateGrid(false);
        // this.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }
    /**
     * Save the device to JSON format
     * @returns {void}
     * @memberof ViewManager
     */
    saveToStorage() {
        if (Registry.currentDevice) {
            try {
                localStorage.setItem("currentDevice", JSON.stringify(Registry.currentDevice.toJSON()));
            } catch (err) {
                // can't save, so.. don't?
            }
        }
    }
    /**
     * Refresh the view
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof ViewManager
     */
    refresh(refresh = true) {
        this.updateQueue.run();
        //Update the toolbar
        let spacing = Registry.currentGrid.getSpacing();
        this.resolutionToolBar.updateResolutionLabelAndSlider(spacing);
    }
    /**
     * Gets the coordinates of the project
     * @param {*} event
     * @returns {Array<number>} Returns the X and Y coordinates
     * @memberof ViewManager
     */
    getEventPosition(event) {
        return this.view.getProjectPosition(event.clientX, event.clientY);
    }
    /**
     * Checks if it has current grid
     * @returns {Boolean}
     * @memberof ViewManager
     */
    __hasCurrentGrid() {
        if (Registry.currentGrid) return true;
        else return false;
    }
    /**
     * Checks if layer is in the current device
     * @param {Layer} layer Layer to check if it's on the current device
     * @returns {Boolean}
     * @memberof ViewManager
     */
    __isLayerInCurrentDevice(layer) {
        if (Registry.currentDevice && layer.device == Registry.currentDevice) return true;
        else return false;
    }
    /**
     * Checks if feature is in the current device
     * @param {Object} feature Feature to check if it's on the current device
     * @returns {Boolean}
     * @memberof ViewManager
     */
    __isFeatureInCurrentDevice(feature) {
        if (Registry.currentDevice && this.__isLayerInCurrentDevice(feature.layer)) return true;
        else return false;
    }
    /**
     * Loads a device from a JSON format
     * @param {JSON} json
     * @returns {void}
     * @memberof ViewManager
     */
    loadDeviceFromJSON(json) {
        let device;
        Registry.viewManager.clear();
        //Check and see the version number if its 0 or none is present,
        // its going the be the legacy format, else it'll be a new format
        let version = json.version;
        if (null == version || undefined == version) {
            console.log("Loading Legacy Format...");
            device = Device.fromJSON(json);
            Registry.currentDevice = device;
            this.__currentDevice = device;
        } else {
            console.log("Version Number: " + version);
            switch (version) {
                case 1:
                    this.loadCustomComponents(json);
                    device = Device.fromInterchangeV1_1(json);
                    Registry.currentDevice = device;
                    this.__currentDevice = device;
                    break;
                case 1.1:
                    this.loadCustomComponents(json);
                    device = Device.fromInterchangeV1_1(json);
                    Registry.currentDevice = device;
                    this.__currentDevice = device;
                    break;
                default:
                    alert("Version '" + version + "' is not supported by 3DuF !");
            }
        }
        //Common Code for rendering stuff
        // console.log("Feature Layers", Registry.currentDevice.layers);
        Registry.currentLayer = Registry.currentDevice.layers[0];
        Registry.currentTextLayer = Registry.currentDevice.textLayers[0];

        //TODO: Need to replace the need for this function, right now without this, the active layer system gets broken
        Registry.viewManager.addDevice(Registry.currentDevice);

        //In case of MINT exported json, generate layouts for rats nests
        this.__initializeRatsNest();

        this.view.initializeView();
        this.updateGrid();
        this.updateDevice(Registry.currentDevice);
        this.refresh(true);
        Registry.currentLayer = Registry.currentDevice.layers[0];
        this.layerToolBar.setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();
    }
    /**
     * Removes the features of the current device by searching on it's ID
     * @param {*} paperElements
     * @returns {void}
     * @memberof ViewManager
     */
    removeFeaturesByPaperElements(paperElements) {
        if (paperElements.length > 0) {
            for (let i = 0; i < paperElements.length; i++) {
                let paperFeature = paperElements[i];
                Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
            }
            this.currentSelection = [];
        }
    }

    /**
     * Updates the component parameters of a specific component
     * @param {string} componentname
     * @param {Array} params
     * @returns {void}
     * @memberof ViewManager
     */
    updateComponentParameters(componentname, params) {
        let component = this.__currentDevice.getComponentByName(componentname);
        for (let key in params) {
            component.updateParameter(key, params[key]);
        }
    }

    /**
     * Returns a Point, coordinate list that is the closes grid coordinate
     * @param {Array<number>} point Array with the X and Y coordinates
     * @return {void|Array<number>}
     * @memberof ViewManager
     */
    snapToGrid(point) {
        if (Registry.currentGrid) return Registry.currentGrid.getClosestGridPoint(point);
        else return point;
    }
    /**
     * Gets the features of a specific type ?
     * @param {string} typeString
     * @param {string} setString
     * @param {Array} features Array with features
     * @returns {Array} Returns array with the features of a specific type
     * @memberof ViewManager
     */
    getFeaturesOfType(typeString, setString, features) {
        let output = [];
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            if (feature.getType() == typeString && feature.getSet() == setString) {
                output.push(feature);
            }
        }
        return output;
    }
    /**
     * Updates all feature parameters
     * @param {string} valueString
     * @param {*} value
     * @param {Array} features Array of features
     * @returns {void}
     * @memberof ViewManager
     */
    adjustAllFeatureParams(valueString, value, features) {
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            feature.updateParameter(valueString, value);
        }
    }
    /**
     * Adjust all parameters of the same type
     * @param {string} typeString
     * @param {string} setString
     * @param {string} valueString
     * @param {*} value
     * @returns {void}
     * @memberof ViewManager
     */
    adjustParams(typeString, setString, valueString, value) {
        let selectedFeatures = this.view.getSelectedFeatures();
        if (selectedFeatures.length > 0) {
            let correctType = this.getFeaturesOfType(typeString, setString, selectedFeatures);
            if (correctType.length > 0) {
                this.adjustAllFeatureParams(valueString, value, correctType);
            }

            //Check if any components are selected
            //TODO: modify parameters window to not have chain of updates
            //Cycle through all components and connections and change the parameters
            for (let i in this.view.selectedComponents) {
                this.view.selectedComponents[i].updateParameter(valueString, value);
            }
            for (let i in this.view.selectedConnections) {
                this.view.selectedConnections[i].updateParameter(valueString, value);
            }
        } else {
            this.updateDefault(typeString, setString, valueString, value);
        }
    }

    /**
     * Updates the default feature parameter
     * @param {string} typeString
     * @param {string} setString
     * @param {string} valueString
     * @param value
     * @returns {void}
     * @memberof ViewManager
     */
    updateDefault(typeString, setString, valueString, value) {
        Registry.featureDefaults[setString][typeString][valueString] = value;
    }

    /**
     * Updates the defaults in the feature
     * @param {Feature} feature Feature object
     * @returns {void}
     * @memberof ViewManager
     */
    updateDefaultsFromFeature(feature) {
        let heritable = feature.getHeritableParams();
        for (let key in heritable) {
            this.updateDefault(feature.getType(), feature.getSet(), key, feature.getValue(key));
        }
    }

    /**
     * Reverts the feature to default
     * @param {string} valueString
     * @param {Feature} feature
     * @returns {void}
     * @memberof ViewManager
     */
    revertFieldToDefault(valueString, feature) {
        feature.updateParameter(valueString, Registry.featureDefaults[feature.getSet()][feature.getType()][valueString]);
    }

    /**
     * Reverts the feature to params to defaults
     * @param {Feature} feature
     * @returns {void}
     * @memberof ViewManager
     */
    revertFeatureToDefaults(feature) {
        let heritable = feature.getHeritableParams();
        for (let key in heritable) {
            this.revertFieldToDefault(key, feature);
        }
    }
    /**
     * Reverts features to defaults
     * @param {Array} features Features to revert to default
     * @returns {void}
     * @memberof ViewManager
     */
    revertFeaturesToDefaults(features) {
        for (let feature in features) {
            this.revertFeatureToDefaults(feature);
        }
    }

    /**
     * Checks if the point intersects with any other feature
     * @param {Array<number>} point Array with the X and Y coordinates
     * @return PaperJS rendered Feature
     * @memberof ViewManager
     */
    hitFeature(point) {
        return this.view.hitFeature(point);
    }

    /**
     * Checks if the element intersects with any other feature
     * @param element
     * @return {*|Array}
     * @memberof ViewManager
     */
    hitFeaturesWithViewElement(element) {
        return this.view.hitFeaturesWithViewElement(element);
    }

    /**
     * Activates the given tool
     * @param {string} toolString
     * @param rightClickToolString
     * @returns {void}
     * @memberof ViewManager
     */
    activateTool(toolString, rightClickToolString = "SelectTool") {
        if (this.tools[toolString] == null) {
            throw new Error("Could not find tool with the matching string");
        }

        //Cleanup job when activating new tool
        this.view.clearSelectedItems();

        this.mouseAndKeyboardHandler.leftMouseTool = this.tools[toolString];
        this.mouseAndKeyboardHandler.rightMouseTool = this.tools[rightClickToolString];
        this.mouseAndKeyboardHandler.updateViewMouseEvents();
    }

    /**
     * Switches to 2D
     * @returns {void}
     * @memberof ViewManager
     */
    switchTo2D() {
        if (this.threeD) {
            this.threeD = false;
            let center = this.renderer.getCameraCenterInMicrometers();
            let zoom = this.renderer.getZoom();
            let newCenterX = center[0];
            if (newCenterX < 0) {
                newCenterX = 0;
            } else if (newCenterX > Registry.currentDevice.params.getValue("width")) {
                newCenterX = Registry.currentDevice.params.getValue("width");
            }
            let newCenterY = paper.view.center.y - center[1];
            if (newCenterY < 0) {
                newCenterY = 0;
            } else if (newCenterY > Registry.currentDevice.params.getValue("height")) {
                newCenterY = Registry.currentDevice.params.getValue("height");
            }
            HTMLUtils.setButtonColor(this.__button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
            HTMLUtils.setButtonColor(this.__button3D, inactiveBackground, inactiveText);
            Registry.viewManager.setCenter(new paper.Point(newCenterX, newCenterY));
            Registry.viewManager.setZoom(zoom);
            HTMLUtils.addClass(this.__renderBlock, "hidden-block");
            HTMLUtils.removeClass(this.__canvasBlock, "hidden-block");
            HTMLUtils.removeClass(this.__renderBlock, "shown-block");
            HTMLUtils.addClass(this.__canvasBlock, "shown-block");
        }
    }
    /**
     * Switches to 3D
     * @returns {void}
     * @memberof ViewManager
     */
    switchTo3D() {
        if (!this.threeD) {
            this.threeD = true;
            setButtonColor(this.__button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
            setButtonColor(this.__button2D, inactiveBackground, inactiveText);
            this.renderer.loadJSON(Registry.currentDevice.toJSON());
            let cameraCenter = this.view.getViewCenterInMillimeters();
            let height = Registry.currentDevice.params.getValue("height") / 1000;
            let pixels = this.view.getDeviceHeightInPixels();
            this.renderer.setupCamera(cameraCenter[0], cameraCenter[1], height, pixels, paper.view.zoom);
            this.renderer.showMockup();
            HTMLUtils.removeClass(this.__renderBlock, "hidden-block");
            HTMLUtils.addClass(this.__canvasBlock, "hidden-block");
            HTMLUtils.addClass(this.__renderBlock, "shown-block");
            HTMLUtils.removeClass(this.__canvasBlock, "shown-block");
        }
    }

    /**
     * Loads a device from a JSON format when the user drags and drops it on the grid
     * @param selector
     * @returns {void}
     * @memberof ViewManager
     */
    setupDragAndDropLoad(selector) {
        let dnd = new HTMLUtils.DnDFileController(selector, function(files) {
            let f = files[0];

            let reader = new FileReader();
            reader.onloadend = function(e) {
                let result = this.result;
                // try {
                result = JSON.parse(result);
                Registry.viewManager.loadDeviceFromJSON(result);
                Registry.viewManager.switchTo2D();
                // } catch (error) {
                //     console.error(error.message);
                //     console.trace(error.stack);
                //     alert("Unable to parse the design file, please ensure that the file is not corrupted:\n" + error.message);
                // }
            };
            try {
                reader.readAsText(f);
            } catch (err) {
                console.log("unable to load JSON: " + f);
            }
        });
    }

    /**
     * Closes the params window
     * @returns {void}
     * @memberof ViewManager
     */
    killParamsWindow() {
        let paramsWindow = document.getElementById("parameter_menu");
        if (paramsWindow) paramsWindow.parentElement.removeChild(paramsWindow);
    }

    /**
     * This method saves the current device to the design history
     * @memberof ViewManager
     * @returns {void}
     */
    saveDeviceState() {
        console.log("Saving to statck");

        let save = JSON.stringify(Registry.currentDevice.toInterchangeV1());

        this.undoStack.pushDesign(save);
    }

    /**
     * Undoes the recent update
     * @returns {void}
     * @memberof ViewManager
     */
    undo() {
        let previousdesign = this.undoStack.popDesign();
        console.log(previousdesign);
        if (previousdesign) {
            let result = JSON.parse(previousdesign);
            this.loadDeviceFromJSON(result);
        }
    }

    /**
     * Resets the tool to the default tool
     * @returns {void}
     * @memberof ViewManager
     */
    resetToDefaultTool() {
        this.cleanupActiveTools();
        this.activateTool("MouseSelectTool");
        this.componentToolBar.setActiveButton("SelectButton");
    }

    /**
     * Runs cleanup method on the activated tools
     * @returns {void}
     * @memberof ViewManager
     */
    cleanupActiveTools() {
        if (this.mouseAndKeyboardHandler.leftMouseTool) {
            this.mouseAndKeyboardHandler.leftMouseTool.cleanup();
        }
        if (this.mouseAndKeyboardHandler.rightMouseTool) {
            this.mouseAndKeyboardHandler.rightMouseTool.cleanup();
        }
    }

    /**
     * Updates the renders for all the connection in the blah
     * @returns {void}
     * @memberof ViewManager
     */
    updatesConnectionRender(connection) {
        //First Redraw all the segements without valves or insertions
        connection.regenerateSegments();

        //Get all the valves for a connection
        let valves = Registry.currentDevice.getValvesForConnection(connection);

        //Cycle through each of the valves
        for (let j in valves) {
            let valve = valves[j];
            let is3D = Registry.currentDevice.getIsValve3D(valve);
            if (is3D) {
                let boundingbox = valve.getBoundingRectangle();
                connection.insertFeatureGap(boundingbox);
            }
        }
    }
    /**
     * Shows in the UI a message
     * @param {string} message Messsage to display
     * @returns {void}
     * @memberof ViewManager
     */
    showUIMessage(message) {
        this.messageBox.MaterialSnackbar.showSnackbar({
            message: message
        });
    }
    /**
     * Sets up all the tools to be used by the user
     * @returns {void}
     * @memberof ViewManager
     */
    setupTools() {
        this.tools["MouseSelectTool"] = new MouseSelectTool(this.view);
        this.tools["InsertTextTool"] = new InsertTextTool();
        this.tools["Chamber"] = new ComponentPositionTool("Chamber", "Basic");
        this.tools["Valve"] = new ValveInsertionTool("Valve", "Basic");
        this.tools["Channel"] = new ChannelTool("Channel", "Basic");
        this.tools["Connection"] = new ConnectionTool("Connection", "Basic");
        this.tools["RoundedChannel"] = new ChannelTool("RoundedChannel", "Basic");
        this.tools["Node"] = new ComponentPositionTool("Node", "Basic");
        this.tools["CircleValve"] = new ValveInsertionTool("CircleValve", "Basic");
        this.tools["RectValve"] = new ComponentPositionTool("RectValve", "Basic");
        this.tools["Valve3D"] = new ValveInsertionTool("Valve3D", "Basic", true);
        this.tools["Port"] = new ComponentPositionTool("Port", "Basic");
        this.tools["Anode"] = new ComponentPositionTool("Anode", "Basic"); //Ck
        this.tools["Cathode"] = new ComponentPositionTool("Cathode", "Basic"); //Ck
        this.tools["Via"] = new PositionTool("Via", "Basic");
        this.tools["DiamondReactionChamber"] = new ComponentPositionTool("DiamondReactionChamber", "Basic");
        this.tools["thermoCycler"] = new ComponentPositionTool("thermoCycler", "Basic");
        this.tools["BetterMixer"] = new ComponentPositionTool("BetterMixer", "Basic");
        this.tools["CurvedMixer"] = new ComponentPositionTool("CurvedMixer", "Basic");
        this.tools["Mixer"] = new ComponentPositionTool("Mixer", "Basic");
        this.tools["GradientGenerator"] = new ComponentPositionTool("GradientGenerator", "Basic");
        this.tools["Tree"] = new ComponentPositionTool("Tree", "Basic");
        this.tools["YTree"] = new ComponentPositionTool("YTree", "Basic");
        this.tools["Mux"] = new MultilayerPositionTool("Mux", "Basic");
        this.tools["Transposer"] = new MultilayerPositionTool("Transposer", "Basic");
        this.tools["RotaryMixer"] = new MultilayerPositionTool("RotaryMixer", "Basic");
        this.tools["CellTrapL"] = new CellPositionTool("CellTrapL", "Basic");
        this.tools["Gelchannel"] = new CellPositionTool("Gelchannel", "Basic"); //ck
        this.tools["DropletGen"] = new ComponentPositionTool("DropletGen", "Basic");
        this.tools["Transition"] = new PositionTool("Transition", "Basic");
        this.tools["AlignmentMarks"] = new MultilayerPositionTool("AlignmentMarks", "Basic");
        this.tools["Pump"] = new MultilayerPositionTool("Pump", "Basic");
        this.tools["Pump3D"] = new MultilayerPositionTool("Pump3D", "Basic");
        this.tools["LLChamber"] = new MultilayerPositionTool("LLChamber", "Basic");
        this.tools["3DMixer"] = new MultilayerPositionTool("3DMixer", "Basic");

        //All the new tools
        this.tools["MoveTool"] = new MoveTool();
        this.tools["GenerateArrayTool"] = new GenerateArrayTool();

        //new
        this.tools["Filter"] = new ComponentPositionTool("Filter", "Basic");
        this.tools["CellTrapS"] = new CellPositionTool("CellTrapS", "Basic");
        this.tools["3DMux"] = new MultilayerPositionTool("3DMux", "Basic");
        // this.tools["ChemostatRing"] = new ComponentPositionTool("ChemostatRing", "Basic");
        this.tools["Incubation"] = new ComponentPositionTool("Incubation", "Basic");
        this.tools["Merger"] = new ComponentPositionTool("Merger", "Basic");
        this.tools["PicoInjection"] = new ComponentPositionTool("PicoInjection", "Basic");
        this.tools["Sorter"] = new ComponentPositionTool("Sorter", "Basic");
        this.tools["Splitter"] = new ComponentPositionTool("Splitter", "Basic");
        this.tools["CapacitanceSensor"] = new ComponentPositionTool("CapacitanceSensor", "Basic");
        this.tools["DropletGenT"] = new ComponentPositionTool("DropletGenT", "Basic");
        this.tools["DropletGenFlow"] = new ComponentPositionTool("DropletGenFlow", "Basic");
        this.tools["LogicArray"] = new ControlCellPositionTool("LogicArray", "Basic");
    }

    /**
     * Adds a custom component tool
     * @param {string} identifier
     * @returns {void}
     * @memberof ViewManager
     */
    addCustomComponentTool(identifier) {
        let customcomponent = this.customComponentManager.getCustomComponent(identifier);
        this.tools[identifier] = new CustomComponentPositionTool(customcomponent, "Custom");
        Registry.featureDefaults["Custom"][identifier] = CustomComponent.defaultParameterDefinitions().defaults;
    }
    /**
     * Initialize the default placement for components
     * @returns {void}
     * @memberof ViewManager
     */
    __initializeRatsNest() {
        //Step 1 generate features for all the components with some basic layout
        let components = this.currentDevice.getComponents();
        let xpos = 10000;
        let ypos = 10000;
        for (let i in components) {
            let component = components[i];
            let currentposition = component.getPosition();
            //TODO: Refine this logic, it sucks
            if (currentposition[0] <= 0 && currentposition <= 0) {
                if (!component.placed) {
                    this.__generateDefaultPlacementForComponent(component, xpos * (parseInt(i) + 1), ypos * (Math.floor(parseInt(i) / 5) + 1));
                }
            } else {
                if (!component.placed) {
                    this.__generateDefaultPlacementForComponent(component, currentposition[0], currentposition[1]);
                }
            }
        }

        // Generate the connection render for all the connections that are routed
        let connections = this.currentDevice.getConnections();
        for (let i in connections) {
            let connection = connections[i];
            if (connection.routed) {
                //Since the connection is routed, put in the values here
                this.__generateDefaultConnectionRenders(connection);
            }
        }

        //TStep 2 generate rats nest renders for all the components

        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
    }
    /**
     * Generates the default placement for components
     * @param {Component} component
     * @param {number} xpos Default X coordinate
     * @param {number} ypos Default Y coordinate
     * @returns {void}
     * @memberof ViewManager
     */
    __generateDefaultPlacementForComponent(component, xpos, ypos) {
        let params_to_copy = component.getParams().toJSON();

        params_to_copy["position"] = [xpos, ypos];

        let technology = FeatureSets.getTechnologyDefinition(component.getType(), "Basic");
        let offset = technology.getDrawOffset(params_to_copy);
        console.log("Offsets:", component.name, offset);
        // params_to_copy["position"] = [xpos + offset[0], ypos + offset[1]];
        //Get default params and overwrite them with json params, this can account for inconsistencies
        let newFeature = Device.makeFeature(component.getType(), "Basic", params_to_copy);

        component.addFeatureID(newFeature.getID());

        Registry.currentLayer.addFeature(newFeature);

        //Set the component position
        // component.updateComponetPosition([xpos + offset[0], ypos+ offset[1]]);
        component.updateComponetPosition([xpos, ypos]);
    }

    __generateDefaultConnectionRenders(connection) {
        // component.updateComponetPosition([xpos + offset[0], ypos+ offset[1]]);
        component.updateComponetPosition([xpos, ypos]);

        let params_to_copy = connection.getParams().toJSON();

        // throw new Error("Implement this, copy from connection tool")
        // let definition = Registry.featureSet.getDefinition("Connection");
        let feature = Device.makeFeature("Connection", "Basic", params_to_copy);

        connection.addFeatureID(feature.getID());

        Registry.currentLayer.addFeature(feature);
    }

    /**
     * Generates a JSON format file to export it
     * @returns {void}
     * @memberof ViewManager
     */
    generateExportJSON() {
        let json = this.currentDevice.toInterchangeV1_1();
        json.customComponents = this.customComponentManager.toJSON();
        return json;
    }

    /**
     * This method attempts to load any custom components that are stored in the custom components property
     * @param json
     */
    loadCustomComponents(json) {
        if (json.hasOwnProperty("customComponents")) {
            this.customComponentManager.loadFromJSON(json["customComponents"]);
        }
    }
    /**
     * Activates DAFD plugin
     * @param {*} params
     * @returns {void}
     * @memberof ViewManager
     */
    activateDAFDPlugin(params = null) {
        this.loadDeviceFromJSON(JSON.parse(Examples.dafdtemplate));

        if (null == params) {
            params = {
                orificeSize: 750,
                orificeLength: 200,
                oilInputWidth: 800,
                waterInputWidth: 900,
                outputWidth: 900,
                outputLength: 500,
                height: 100
            };
        }

        DAFDPlugin.fixLayout(params);
    }

    /**
     * This is the method we need to call to fix the valvemaps
     * @memberof ViewManager
     */
    createValveMapFromSelection() {
        //TODO: Run through the current selection and generate the valve map for every
        //vavle that is in the Selection
        let selection = this.tools["MouseSelectTool"].currentSelection;
        let valves = [];
        let connection = null;
        //TODO: run though the items
        for (let render_element of selection) {
            //Check if render_element is associated with a VALVE/VALVE3D
            let component = this.currentDevice.getComponentForFeatureID(render_element.featureID);
            if (component != null) {
                console.log("Component Type:", component.getType());
                let type = component.getType();
                if (type == "Valve3D" || type == "Valve") {
                    valves.push(component);
                }
            }

            connection = this.currentDevice.getConnectionForFeatureID(render_element.featureID);
        }

        //Add to the valvemap
        for (let valve of valves) {
            let valve_type = false;
            if (valve.getType() == "Valve3D") {
                valve_type = true;
            }
            console.log("Adding Valve: ", valve);
            this.currentDevice.insertValve(valve, connection, valve_type);
        }
    }
}
