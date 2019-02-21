import ZoomToolBar from "./ui/zoomToolBar";
import BorderSettingsDialog from './ui/borderSettingDialog';
import paper from 'paper';

const Registry = require("../core/registry");
const Colors = require("./colors");

import Device from '../core/device';
import ChannelTool from "./tools/channelTool"; //= require("./tools/channelTool");

import SelectTool from "./tools/selectTool"; //= require("./tools/selectTool");
import InsertTextTool from "./tools/insertTextTool"; //= require("./tools/insertTextTool");
import SimpleQueue from "../utils/simpleQueue"; //= require("../utils/SimpleQueue");
import MouseSelectTool from "./tools/mouseSelectTool"; //= require('./tools/mouseSelectTool');

import ResolutionToolBar from './ui/resolutionToolBar';
import RightPanel from './ui/rightPanel';
import DXFObject from '../core/dxfObject';
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
import {setButtonColor} from "../utils/htmlUtils";
import ExportPanel from "./ui/exportPanel";
import HelpDialog from "./ui/helpDialog";
import PaperView from "./paperView";
import AdaptiveGrid from "./grid/adaptiveGrid";
import Feature from "../core/feature";
import TaguchiDesigner from "./ui/taguchiDesigner";
import RightClickMenu from "./ui/rightClickMenu";

export default class ViewManager {

    /**
     *
     * @param view
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
        this.messageBox = document.querySelector('.mdl-js-snackbar');
        this.editDeviceDialog = new EditDeviceDialog(this);
        this.helpDialog = new HelpDialog();
        this.taguchiDesigner = new TaguchiDesigner(this);
        this.rightClickMenu = new RightClickMenu();
        this.__currentDevice = null;

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
        this.minZoom = .0001;
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
     * Returns the current device the ViewManager is displaying. right now I'm using this to replace the
     * Registry.currentDevice dependency, however this might change as the modularity requirements change.
     *
     * @return {Device}
     */
    get currentDevice(){
        return this.__currentDevice;
    }


    /**
     * Initiates the copy operation on the selected feature
     */
    initiateCopy() {
        let selectedFeatures = this.view.getSelectedFeatures();
        if (selectedFeatures.length > 0) {
            this.pasteboard[0] = selectedFeatures[0];
        }
    }

    setupToolBars(){
        //Initiating the zoom toolbar
        this.zoomToolBar = new ZoomToolBar(.0001, 5);
        this.componentToolBar = new ComponentToolBar(this);
        this.resetToDefaultTool();
    }

    addDevice(device, refresh = true) {
        this.view.addDevice(device);
        this.__addAllDeviceLayers(device, false);
        this.refresh(refresh);
    }

    /**
     * Adds all the layers in the device
     * @param device
     * @param refresh
     * @private
     */
    __addAllDeviceLayers(device, refresh = true) {
        for (let i = 0; i < device.layers.length; i++) {
            let layer = device.layers[i];
            this.addLayer(layer, i, false);
        }
    }

    __removeAllDeviceLayers(device, refresh = true) {
        for (let i = 0; i < device.layers.length; i++) {
            let layer = device.layers[i];
            this.removeLayer(layer, i, false);
        }
    }

    removeDevice(device, refresh = true) {
        this.view.removeDevice(device);
        this.__removeAllDeviceLayers(device, false);
        this.refresh(refresh);
    }

    updateDevice(device, refresh = true) {
        this.view.updateDevice(device);
        this.refresh(refresh);
    }

    addFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.addFeature(feature);
            this.refresh(refresh);
        }
    }

    updateFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.updateFeature(feature);
            this.refresh(refresh);
        }
    }

    removeFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.removeFeature(feature);
            this.refresh(refresh);
        }
    }

    addLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.addLayer(layer, index, false);
            this.__addAllLayerFeatures(layer, false);
            this.refresh(refresh);
        }
    }

    /**
     * Create a new set of layers (flow, control and cell) for the upcoming level.
     */
    createNewLayerBlock(){
        let newlayers = Registry.currentDevice.createNewLayerBlock();

        //Find all the edge features
        let edgefeatures = [];
        let devicefeatures = (Registry.currentDevice.layers[0]).features;
        let feature;

        for (let i in devicefeatures) {
            feature = devicefeatures[i];
            if(feature.fabType == "EDGE"){
                edgefeatures.push(feature);
            }
        }

        //Add the Edge Features from layer '0'
        // to all other layers
        for(let i in newlayers){
            for(let j in edgefeatures){
                newlayers[i].addFeature(edgefeatures[j], false);
            }
        }

        //Added the new layers
        for(let i in newlayers){
            let layertoadd = newlayers[i];
            let index = this.view.paperLayers.length;
            this.addLayer(layertoadd, index, true);
        }
    }

    /**
     * Deletes the layers at the level index, we have 3-set of layers so it deletes everything at
     * that level
     * @param levelindex integer only
     */
    deleteLayerBlock(levelindex){
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

    removeLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.removeLayer(layer, index);
            this.__removeAllLayerFeatures(layer);
            this.refresh(refresh);
        }
    }

    layersToSVGStrings() {
        return this.view.layersToSVGStrings();
    }

    /**
     * Adds a feature to all the layers ??????
     * @param layer
     * @param refresh
     * @private
     */
    __addAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.addFeature(feature, false);
            this.refresh(refresh)
        }
    }

    __updateAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.updateFeature(feature, false);
            this.refresh(refresh);
        }
    }

    __removeAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.removeFeature(feature, false);
            this.refresh(refresh);
        }
    }

    updateLayer(layer, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.updateLayer(layer);
            this.refresh(refresh);
        }
    }

    updateActiveLayer(refresh = true) {
        this.view.setActiveLayer(Registry.currentDevice.layers.indexOf(Registry.currentLayer));
        this.refresh(refresh);
    }

    removeGrid(refresh = true) {
        if (this.__hasCurrentGrid()) {
            this.view.removeGrid();
            this.refresh(refresh);
        }
    }

    updateGrid(refresh = true) {
        if (this.__hasCurrentGrid()) {
            this.view.updateGrid(Registry.currentGrid);
            this.refresh(refresh);
        }
    }

    updateAlignmentMarks(){
        this.view.updateAlignmentMarks();
    }

    clear() {
        this.view.clear();
    }

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
     */
    generateBorder(){
        let borderfeature = new EdgeFeature(null, null);

        //Get the bounds for the border feature and then update the device dimensions
        let xspan = Registry.currentDevice.getXSpan();
        let yspan = Registry.currentDevice.getYSpan();
        borderfeature.generateRectEdge(xspan, yspan);

        //Adding the feature to all the layers
        for(let i in Registry.currentDevice.layers){
            let layer = Registry.currentDevice.layers[i];
            layer.addFeature(borderfeature);
        }
    }

    /**
     * Accepts a DXF object and then converts it into a feature, an edgeFeature in particular
     * @param dxfobject
     */
    importBorder(dxfobject){
        let customborderfeature = new EdgeFeature(null, null);
        for(let i in dxfobject.entities){
            let foo = new DXFObject(dxfobject.entities[i]);
           customborderfeature.addDXFObject(foo);
        }

        //Adding the feature to all the layers
        for(let i in Registry.currentDevice.layers){
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
     */
    deleteBorder(){
        /*
        1. Find all the features that are EDGE type
        2. Delete all these features
         */

        console.log("Deleting border...");

        let features = Registry.currentDevice.getAllFeaturesFromDevice();
        console.log("All features", features);

        let edgefeatures = [];

        for(let i in features){
            //Check if the feature is EDGE or not
            if('EDGE' == features[i].fabType){
                edgefeatures.push(features[i]);
            }
        }

        //Delete all the features
        for(let i in edgefeatures){
            Registry.currentDevice.removeFeatureByID(edgefeatures[i].getID());
        }

        console.log("Edgefeatures", edgefeatures);

    }
    
    removeTarget() {
        this.view.removeTarget();
    }

    updateTarget(featureType, featureSet, position, refresh = true) {
        this.view.addTarget(featureType, featureSet, position);
        this.view.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
        this.refresh(refresh);
    }

    __updateViewTarget(refresh = true) {
        this.view.updateTarget();
        this.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
        this.refresh(refresh);
    }

    adjustZoom(delta, point, refresh = true) {
        let belowMin = (this.view.getZoom() >= this.maxZoom && delta < 0);
        let aboveMax = (this.view.getZoom() <= this.minZoom && delta > 0);
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

    setCenter(center, refresh = true) {
        this.view.setCenter(center);
        this.updateGrid(false);
        //this.updateAlighmentMarks();

        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }

    moveCenter(delta, refresh = true) {
        this.view.moveCenter(delta);
        this.updateGrid(false);
        // this.updateAlignmentMarks();
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }

    saveToStorage() {
        if (Registry.currentDevice) {
            try {
                localStorage.setItem('currentDevice', JSON.stringify(Registry.currentDevice.toJSON()));
            } catch (err) {
                // can't save, so.. don't?
            }
        }
    }

    refresh(refresh = true) {
        this.updateQueue.run();
        //Update the toolbar
        let spacing = Registry.currentGrid.getSpacing();
        this.resolutionToolBar.updateResolutionLabelAndSlider(spacing);
    }

    getEventPosition(event) {
        return this.view.getProjectPosition(event.clientX, event.clientY);
    }

    __hasCurrentGrid() {
        if (Registry.currentGrid) return true;
        else return false;
    }

    __isLayerInCurrentDevice(layer) {
        if (Registry.currentDevice && layer.device == Registry.currentDevice) return true;
        else return false;
    }

    __isFeatureInCurrentDevice(feature) {
        if (Registry.currentDevice && this.__isLayerInCurrentDevice(feature.layer)) return true;
        else return false;
    }


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
        }else{
            console.log("Version Number: " + version);
            switch (version){
                case 1:
                    this.loadCustomComponents(json);
                    device = Device.fromInterchangeV1(json);
                    Registry.currentDevice = device;
                    this.__currentDevice = device;
                    break;
                default:
                    alert("Version \'" + version + "\' is not supported by 3DuF !");
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

    removeFeaturesByPaperElements(paperElements) {
        if (paperElements.length > 0) {
            for (let i = 0; i < paperElements.length; i++) {
                let paperFeature = paperElements[i];
                Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
            }
            this.currentSelection = [];
        }
    }



    snapToGrid(point) {
        if (Registry.currentGrid) return Registry.currentGrid.getClosestGridPoint(point);
        else return point;
    }

    getFeaturesOfType(typeString, setString, features){
        let output = [];
        for (let i =0; i < features.length; i++){
            let feature = features[i];
            if (feature.getType() == typeString && feature.getSet() == setString){
                output.push(feature);
            }
        }
        return output;
    }

    adjustAllFeatureParams(valueString, value, features){
        for (let i = 0 ; i < features.length; i++){
            let feature = features[i];
            feature.updateParameter(valueString, value);
        }
    }

    adjustParams(typeString, setString, valueString, value){
        let selectedFeatures = this.view.getSelectedFeatures();
        if (selectedFeatures.length > 0){
            let correctType = this.getFeaturesOfType(typeString, setString, selectedFeatures);
            if (correctType.length >0 ){
                this.adjustAllFeatureParams(valueString, value, correctType);
            }

            //Check if any components are selected
            //TODO: modify parameters window to not have chain of updates
            //Cycle through all components and connections and change the parameters
            for(let i in this.view.selectedComponents){
                this.view.selectedComponents[i].updateParameter(valueString, value);
            }
            for(let i in this.view.selectedConnections){
                this.view.selectedConnections[i].updateParameter(valueString, value);
            }
        }else{
            this.updateDefault(typeString, setString, valueString, value);
        }
    }

    /**
     * Updates the default feature parameter
     * @param typeString
     * @param setString
     * @param valueString
     * @param value
     */
    updateDefault(typeString, setString, valueString, value){
        Registry.featureDefaults[setString][typeString][valueString] = value;
    }

    /**
     * Updates the defaults in the feature
     * @param feature
     */
    updateDefaultsFromFeature(feature){
        let heritable = feature.getHeritableParams();
        for (let key in heritable){
            this.updateDefault(feature.getType(), feature.getSet(), key, feature.getValue(key));
        }
    }

    /**
     * Reverts the feature to default
     * @param valueString
     * @param feature
     */
    revertFieldToDefault(valueString, feature) {
        feature.updateParameter(valueString, Registry.featureDefaults[feature.getSet()][feature.getType()][valueString]);
    }

    /**
     * Reverts the feature to params to defaults
     * @param feature
     */
    revertFeatureToDefaults(feature) {
        let heritable = feature.getHeritableParams();
        for (let key in heritable) {
            this.revertFieldToDefault(key, feature);
        }
    }
    revertFeaturesToDefaults(features) {
        for (let feature in features) {
            this.revertFeatureToDefaults(feature);
        }
    }

    /**
     * Checks if the point intersects with any other feature
     * @param point
     * @return PaperJS rendered Feature
     */
    hitFeature(point) {
        return this.view.hitFeature(point);
    }

    /**
     * Checks if the element intersects with any other feature
     * @param element
     * @return {*|Array}
     */
    hitFeaturesWithViewElement(element) {
        return this.view.hitFeaturesWithViewElement(element);
    }

    /**
     * Activates the given tool
     * @param toolString
     * @param rightClickToolString
     */
    activateTool(toolString , rightClickToolString = "SelectTool") {
        if(this.tools[toolString] == null){
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
     */
    switchTo2D() {
        if (this.threeD) {
            this.threeD = false;
            let center = this.renderer.getCameraCenterInMicrometers();
            let zoom = this.renderer.getZoom();
            let newCenterX = center[0];
            if (newCenterX < 0) {
                newCenterX = 0
            } else if (newCenterX > Registry.currentDevice.params.getValue("width")) {
                newCenterX = Registry.currentDevice.params.getValue("width");
            }
            let newCenterY = paper.view.center.y - center[1];
            if (newCenterY < 0) {
                newCenterY = 0;
            } else if (newCenterY > Registry.currentDevice.params.getValue("height")) {
                newCenterY = Registry.currentDevice.params.getValue("height")
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
     *
     * @param selector
     */
    setupDragAndDropLoad(selector) {
        let dnd = new HTMLUtils.DnDFileController(selector, function(files) {
            let f = files[0];

            let reader = new FileReader();
            reader.onloadend = function(e) {
                let result = JSON.parse(this.result);
                Registry.viewManager.loadDeviceFromJSON(result);
                Registry.viewManager.switchTo2D();
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
     */
    killParamsWindow() {
        let paramsWindow = document.getElementById("parameter_menu");
        if (paramsWindow) paramsWindow.parentElement.removeChild(paramsWindow);
    }

    /**
     * This method saves the current device to the design history
     */
    saveDeviceState(){
        console.log("Saving to statck");

        let save = JSON.stringify(Registry.currentDevice.toInterchangeV1());

        this.undoStack.pushDesign(save);
    }

    /**
     * Undoes the recent update
     */
    undo(){
        let previousdesign = this.undoStack.popDesign();
        console.log(previousdesign);
        if(previousdesign){
            let result = JSON.parse(previousdesign);
            this.loadDeviceFromJSON(result);
        }

    }

    /**
     * Resets the tool to the default tool
     */
    resetToDefaultTool(){
        this.cleanupActiveTools();
        this.activateTool("MouseSelectTool");
        this.componentToolBar.setActiveButton("SelectButton");
    }

    /**
     * Runs cleanup method on the activated tools
     */
    cleanupActiveTools() {
        if(this.mouseAndKeyboardHandler.leftMouseTool){
            this.mouseAndKeyboardHandler.leftMouseTool.cleanup();
        }
        if (this.mouseAndKeyboardHandler.rightMouseTool){
            this.mouseAndKeyboardHandler.rightMouseTool.cleanup();
        }
    }

    /**
     * Updates the renders for all the connection in the blah
     */
    updatesConnectionRender(connection){
        //First Redraw all the segements without valves or insertions
        connection.regenerateSegments();

        //Get all the valves for a connection
        let valves = Registry.currentDevice.getValvesForConnection(connection);

        //Cycle through each of the valves
        for(let j in valves){
            let valve = valves[j];
            let boundingbox = valve.getBoundingRectangle();
            connection.insertFeatureGap(boundingbox);
        }

    }


    showUIMessage(message){
        this.messageBox.MaterialSnackbar.showSnackbar(
            {
                message: message
            }
        );
    }

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
        this.tools["Via"] = new PositionTool("Via", "Basic");
        this.tools["DiamondReactionChamber"] = new ComponentPositionTool("DiamondReactionChamber", "Basic");
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
        this.tools["DropletGen"] = new ComponentPositionTool("DropletGen", "Basic");
        this.tools["Transition"] = new PositionTool("Transition", "Basic");
        this.tools["AlignmentMarks"] = new MultilayerPositionTool("AlignmentMarks", "Basic");
        this.tools["Pump"] = new MultilayerPositionTool("Pump", "Basic");
        this.tools["Pump3D"] = new MultilayerPositionTool("Pump3D", "Basic");

        //All the new tools
        this.tools["MoveTool"] = new MoveTool();
        this.tools["GenerateArrayTool"] = new GenerateArrayTool();

    }

    addCustomComponentTool(identifier){
        let customcomponent = this.customComponentManager.getCustomComponent(identifier);
        this.tools[identifier] = new CustomComponentPositionTool(customcomponent, "Custom");
        Registry.featureDefaults["Custom"][identifier] = CustomComponent.defaultParameterDefinitions().defaults;
    }

    __initializeRatsNest() {
        //Step 1 generate features for all the components with some basic layout
        let components = this.currentDevice.getComponents();
        let xpos = 10000;
        let ypos = 10000;
        for(let i in components){
            let component = components[i];
            if(!component.placed){
                this.__generateDefaultPlacementForComponent(
                    component,
                    xpos * (parseInt(i) + 1),
                    ypos * (Math.floor(parseInt(i)/5) +1)
                );
            }
        }

        //TODO: Step 2 generate rats nest renders for all the components
        
        this.view.updateRatsNest();
        this.view.updateComponentPortsRender();
    }

    __generateDefaultPlacementForComponent(component, xpos, ypos) {

        let params_to_copy = component.getParams().toJSON();

        params_to_copy["position"]  = [xpos, ypos];

        //Get default params and overwrite them with json params, this can account for inconsistencies
        let nonminttype = Registry.featureSet.getTypeForMINT(component.getType());
        let newFeature = Feature.makeFeature(nonminttype, "Basic", params_to_copy);

        component.addFeatureID(newFeature.getID());

        Registry.currentLayer.addFeature(newFeature);

        //Set the component position
        component.updateComponetPosition([xpos, ypos]);

    }

    generateExportJSON(){
        let json = this.currentDevice.toInterchangeV1();
        json.customComponents = this.customComponentManager.toJSON();
        return json;
    }

    /**
     * This method attempts to load any custom components that are stored in the custom components property
     * @param json
     */
    loadCustomComponents(json) {
        if(json.hasOwnProperty("customComponents")){
            this.customComponentManager.loadFromJSON(json["customComponents"]);

        }
    }
}