import ZoomToolBar from "./ui/zoomToolBar";
import BorderSettingsDialog from './ui/borderSettingDialog';

var Registry = require("../core/registry");
// var Device = require("../core/device");
import Device from '../core/device';
var ChannelTool = require("./tools/channelTool");
var ConnectionTool = require("./tools/connectionTool");
var MouseTool = require("./tools/mouseTool");
var PanTool = require("./tools/panTool");
var PanAndZoom = require("./PanAndZoom");
var SelectTool = require("./tools/selectTool");
var InsertTextTool = require("./tools/insertTextTool");
var SimpleQueue = require("../utils/SimpleQueue");
var PositionTool = require("./tools/positionTool");
var ComponentPositionTool = require("./tools/ComponentPositionTool");
var MultilayerPositionTool = require('./tools/multilayerPositionTool');
var CellPositionTool = require('./tools/cellPositionTool');
var MouseSelectTool = require('./tools/mouseSelectTool');

import ResolutionToolBar from './ui/resolutionToolBar';
import RightPanel from './ui/rightPanel';
import Feature from '../core/feature';
import DXFObject from '../core/dxfObject';
import EdgeFeature from "../core/edgeFeature";
import ChangeAllDialog from "./ui/changeAllDialog";
import LayerToolBar from "./ui/layerToolBar";
import * as HTMLUtils from "../utils/htmlUtils";
import MouseAndKeyboardHandler from "./mouseAndKeyboardHandler";
import ComponentToolBar from "./ui/componentToolBar";
import DesignHistory from "./designHistory";
import MoveTool from "./tools/moveTool";

export default class ViewManager {
    constructor(view) {
        this.threeD;
        this.view = view;
        this.tools = {};
        this.middleMouseTool = new PanTool();
        this.rightMouseTool = new SelectTool();
        this.rightPanel = new RightPanel();
        this.changeAllDialog = new ChangeAllDialog();
        this.resolutionToolBar = new ResolutionToolBar();
        this.borderDialog = new BorderSettingsDialog();
        this.layerToolBar = new LayerToolBar();
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

            reference.updateDevice(Registry.currentDevice);
        });

        let func = function(event) {
            reference.adjustZoom(event.deltaY, reference.getEventPosition(event));
        };
        this.view.setMouseWheelFunction(func);
        this.minZoom = .0001;
        this.maxZoom = 5;
        this.setupTools();
        this.activateTool("Channel");
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
        this.refresh(refresh);
    }

    __updateViewTarget(refresh = true) {
        this.view.updateTarget();
        this.updateAlignmentMarks();
        this.refresh(refresh);
    }

    adjustZoom(delta, point, refresh = true) {
        let belowMin = (this.view.getZoom() >= this.maxZoom && delta < 0);
        let aboveMax = (this.view.getZoom() <= this.minZoom && delta > 0);
        if (!aboveMax && !belowMin) {
            this.view.adjustZoom(delta, point);
            this.updateGrid(false);
            //this.updateAlignmentMarks();

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
        Registry.viewManager.clear();
        //Check and see the version number if its 0 or none is present,
        // its going the be the legacy format, else it'll be a new format
        var version = json.version;
        if(null == version || undefined == version){
            console.log("Loading Legacy Format...");
            Registry.currentDevice = Device.fromJSON(json);
        }else{
            console.log("Version Number: " + version);
            switch (version){
                case 1:
                    Registry.currentDevice = Device.fromInterchangeV1(json);
                    break;
                default:
                    alert("Version \'" + version + "\' is not supported by 3DuF !");
            }
        }
        //Common Code for rendering stuff
        Registry.currentLayer = Registry.currentDevice.layers[0];
        Registry.currentTextLayer = Registry.currentDevice.textLa;
        Registry.viewManager.addDevice(Registry.currentDevice);
        this.view.initializeView();
        this.updateGrid();
        this.updateDevice(Registry.currentDevice);
        this.refresh(true);
        console.log(Registry.currentDevice.layers);
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
        }else{
            this.updateDefault(typeString, setString, valueString, value);
        }
    }

    updateDefault(typeString, setString, valueString, value){
        Registry.featureDefaults[setString][typeString][valueString] = value;
    }

    updateDefaultsFromFeature(feature){
        let heritable = feature.getHeritableParams();
        for (let key in heritable){
            this.updateDefault(feature.getType(), feature.getSet(), key, feature.getValue(key));
        }
    }
    revertFieldToDefault(valueString, feature) {
        feature.updateParameter(valueString, Registry.featureDefaults[feature.getSet()][feature.getType()][valueString]);
    }
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
    hitFeature(point) {
        return this.view.hitFeature(point);
    }

    hitFeaturesWithViewElement(element) {
        return this.view.hitFeaturesWithViewElement(element);
    }


    activateTool(toolString , rightClickToolString = "SelectTool") {
        this.mouseAndKeyboardHandler.leftMouseTool = this.tools[toolString];
        this.mouseAndKeyboardHandler.rightMouseTool = this.tools[rightClickToolString];
        this.mouseAndKeyboardHandler.updateViewMouseEvents();
    }

    switchTo2D() {
        if (this.threeD) {
            this.threeD = false;
            let center = renderer.getCameraCenterInMicrometers();
            let zoom = renderer.getZoom();
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
            HTMLUtils.setButtonColor(button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
            HTMLUtils.setButtonColor(button3D, inactiveBackground, inactiveText);
            Registry.viewManager.setCenter(new paper.Point(newCenterX, newCenterY));
            Registry.viewManager.setZoom(zoom);
            HTMLUtils.addClass(renderBlock, "hidden-block");
            HTMLUtils.removeClass(canvasBlock, "hidden-block");
            HTMLUtils.removeClass(renderBlock, "shown-block");
            HTMLUtils.addClass(canvasBlock, "shown-block");
        }
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


    undo(){
        let previousdesign = this.undoStack.popDesign();
        console.log(previousdesign);
        if(previousdesign){
            console.log("Test");
            let result = JSON.parse(previousdesign);
            this.loadDeviceFromJSON(result);
        }

    }

    resetToDefaultTool(){
        this.activateTool("MouseSelectTool");
        this.componentToolBar.setActiveButton("SelectButton");
    }

    setupTools() {
        this.tools["SelectTool"] = new SelectTool();
        this.tools["MouseSelectTool"] = new MouseSelectTool();
        this.tools["InsertTextTool"] = new InsertTextTool();
        this.tools["Chamber"] = new ComponentPositionTool("Chamber", "Basic");
        this.tools["Valve"] = new ComponentPositionTool("Valve", "Basic");
        this.tools["Channel"] = new ChannelTool("Channel", "Basic");
        this.tools["Connection"] = new ConnectionTool("Connection", "Basic");
        this.tools["RoundedChannel"] = new ChannelTool("RoundedChannel", "Basic");
        this.tools["Node"] = new ComponentPositionTool("Node", "Basic");
        this.tools["CircleValve"] = new ComponentPositionTool("CircleValve", "Basic");
        this.tools["RectValve"] = new ComponentPositionTool("RectValve", "Basic");
        this.tools["Valve3D"] = new MultilayerPositionTool("Valve3D", "Basic");
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

        this.tools["MoveTool"] = new MoveTool();
    }
}