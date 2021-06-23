import ZoomToolBar from "./ui/zoomToolBar";
import paper from "paper";

import * as Registry from "../core/registry";
import * as Colors from "./colors";

import Device from "../core/device";
import SimpleQueue from "../utils/simpleQueue";
import * as HTMLUtils from "../utils/htmlUtils";
import MouseAndKeyboardHandler from "./mouseAndKeyboardHandler";
import PaperView from "./paperView";
import AdaptiveGrid from "./grid/adaptiveGrid";
import Feature from "../core/feature";
import Layer from "../core/layer";

/**
 * Bare view manager class
 */
export default class BareViewManager {
    /**
     * Default Constructor for BareViewManager object
     */
    constructor() {
        this.threeD;
        this.view = new PaperView("c", this);

        this.__grid = new AdaptiveGrid(this);
        Registry.currentGrid = this.__grid;

        // this.tools = {};
        // this.rightMouseTool = new SelectTool();
        // this.customComponentManager = new CustomComponentManager(this);
        // this.rightPanel = new RightPanel(this);
        // this.changeAllDialog = new ChangeAllDialog();
        // this.resolutionToolBar = new ResolutionToolBar();
        // this.borderDialog = new BorderSettingsDialog();
        // this.layerToolBar = new LayerToolBar();
        // this.messageBox = document.querySelector('.mdl-js-snackbar');
        // this.editDeviceDialog = new EditDeviceDialog(this);
        // this.helpDialog = new HelpDialog();

        this.__currentDevice = null;

        let reference = this;
        this.updateQueue = new SimpleQueue(function() {
            reference.view.refresh();
        }, 20);

        this.saveQueue = new SimpleQueue(function() {
            reference.saveToStorage();
        });

        // this.undoStack = new DesignHistory();
        // this.pasteboard = [];

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
        this.minZoom = 0.0001;
        this.maxZoom = 5;
        // this.setupTools();
        // this.activateTool("Channel");

        //TODO: Figure out how remove UpdateQueue as dependency mechanism
        this.__grid.setColor(Colors.BLUE_500);

        //Removed from Page Setup
        this.threeD = false;
        this.renderer = Registry.threeRenderer;
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
     * @memberof BareViewManager
     */
    get currentDevice() {
        return this.__currentDevice;
    }
    /**
     * Initialize the zoom toolbar
     * @memberof BareViewManager
     * @returns {void}
     */
    setupToolBars() {
        //Initiating the zoom toolbar
        this.zoomToolBar = new ZoomToolBar(0.0001, 5);
        // this.componentToolBar = new ComponentToolBar(this);
    }
    /**
     * Adds device to the view manager
     * @param {Device} device Device to add to the view manager
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    addDevice(device, refresh = true) {
        this.view.addDevice(device);
        this.__addAllDeviceLayers(device, false);
        this.refresh(refresh);
    }

    /**
     * Adds all the layers in the device
     * @param {Device} device Selected device to add all of it's layers
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
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
     * Removes all the layers in the device
     * @param {Device} device Selected device to removes all of it's layers
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    __removeAllDeviceLayers(device, refresh = true) {
        for (let i = 0; i < device.layers.length; i++) {
            let layer = device.layers[i];
            this.removeLayer(layer, i, false);
        }
    }
    /**
     * Removes device from the view
     * @param {Device} device Device to remove from the view
     * @param {*} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    removeDevice(device, refresh = true) {
        this.view.removeDevice(device);
        this.__removeAllDeviceLayers(device, false);
        this.refresh(refresh);
    }
    /**
     * Updates the device in the view
     * @param {Device} device Device to update
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    updateDevice(device, refresh = true) {
        this.view.updateDevice(device);
        this.refresh(refresh);
    }
    /**
     * Adds feature in the view
     * @param {Feature} feature Feature to be addede to the view
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    addFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.addFeature(feature);
            this.refresh(refresh);
        }
    }
    /**
     * Updates specific feature of the view
     * @param {Feature} feature Selected feature to update 
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    updateFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.updateFeature(feature);
            this.refresh(refresh);
        }
    }
    /**
     * Removes specific feature of the view
     * @param {Feature} feature Feature to remove from the view
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    removeFeature(feature, refresh = true) {
        if (this.__isFeatureInCurrentDevice(feature)) {
            this.view.removeFeature(feature);
            this.refresh(refresh);
        }
    }
    /**
     * Adds a layer in the view
     * @param {Layer} layer Layer to add to the view manager
     * @param {number} index Position of the layer
     * @param {BigInt} refresh Whether to refresh or not. true bu default
     * @returns {void}
     * @memberof BareViewManager
     */
    addLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.addLayer(layer, index, false);
            this.__addAllLayerFeatures(layer, false);
            this.refresh(refresh);
        }
    }

    /**
     * Create a new set of layers (flow, control and cell) for the upcoming level
     * @returns {void}
     * @memberof BareViewManager
     */
    createNewLayerBlock() {
        let newlayers = Registry.currentDevice.createNewLayerBlock();

        //Find all the edge features
        let edgefeatures = [];
        let devicefeatures = Registry.currentDevice.layers[0].features;
        let feature;

        for (let i in devicefeatures) {
            feature = devicefeatures[i];
            if (feature.fabType === "EDGE") {
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
     * @memberof BareViewManager
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
     * Removes a specific layer of the view
     * @param {Layer} layer Layer object 
     * @param {number} index Index of the layer to be removed
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    removeLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.removeLayer(layer, index);
            this.__removeAllLayerFeatures(layer);
            this.refresh(refresh);
        }
    }
    /**
     * Convers layers to SVG String format
     * @returns {}
     * @memberof BareViewManager
     */
    layersToSVGStrings() {
        return this.view.layersToSVGStrings();
    }

    /**
     * Adds all features of the layers to the view manager
     * @param {Layer} layer Layer object 
     * @param {boolean} refresh Whether to refresh or not
     * @returns {void}
     * @memberof BareViewManager
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
     * Updates all features of the layers in the view manager
     * @param {Layer} layer Layer object
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    __updateAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.updateFeature(feature, false);
            this.refresh(refresh);
        }
    }
    /**
     * Removes all features of the layers of the view manager
     * @param {Layer} layer Layer object
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    __removeAllLayerFeatures(layer, refresh = true) {
        for (let key in layer.features) {
            let feature = layer.features[key];
            this.removeFeature(feature, false);
            this.refresh(refresh);
        }
    }
    /**
     * Updates a specific layer in the view manager
     * @param {Layer} layer Layer object
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    updateLayer(layer, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.updateLayer(layer);
            this.refresh(refresh);
        }
    }
    /**
     * Updates the active layer in the view manager
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    updateActiveLayer(refresh = true) {
        this.view.setActiveLayer(Registry.currentDevice.layers.indexOf(Registry.currentLayer));
        this.refresh(refresh);
    }
    /**
     * Removes grid from the view manager
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    removeGrid(refresh = true) {
        if (this.__hasCurrentGrid()) {
            this.view.removeGrid();
            this.refresh(refresh);
        }
    }
    /**
     * Updates the grid of the view manager
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    updateGrid(refresh = true) {
        if (this.__hasCurrentGrid()) {
            this.view.updateGrid(Registry.currentGrid);
            this.refresh(refresh);
        }
    }
    /**
     * Updates alignments marks of the view manager
     * @returns {void}
     * @memberof BareViewManager
     */
    updateAlignmentMarks() {
        this.view.updateAlignmentMarks();
    }
    /**
     * Clears the view manager
     * @returns {void}
     * @memberof BareViewManager
     */
    clear() {
        this.view.clear();
    }
    /**
     * Sets the zoom 
     * @param {number} zoom Value of zoom
     * @param {boolean} refresh Whether to resfresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    setZoom(zoom, refresh = true) {
        if (zoom > this.maxZoom) zoom = this.maxZoom;
        else if (zoom < this.minZoom) zoom = this.minZoom;
        this.view.setZoom(zoom);
        this.updateGrid(false);
        this.updateDevice(Registry.currentDevice, false);
        this.zoomToolBar.setZoom(zoom);
        this.refresh(refresh);
    }

    // removeTarget() {
    //     this.view.removeTarget();
    // }
    //
    // updateTarget(featureType, featureSet, position, refresh = true) {
    //     this.view.addTarget(featureType, featureSet, position);
    //     this.view.updateAlignmentMarks();
    //     this.refresh(refresh);
    // }
    //
    // __updateViewTarget(refresh = true) {
    //     this.view.updateTarget();
    //     this.updateAlignmentMarks();
    //     this.refresh(refresh);
    // }
    /**
     * Adjust the zoom
     * @param {number} delta 
     * @param {Array<number>} point Coordinates of the point where the zoom will be
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    adjustZoom(delta, point, refresh = true) {
        let belowMin = this.view.getZoom() >= this.maxZoom && delta < 0;
        let aboveMax = this.view.getZoom() <= this.minZoom && delta > 0;
        if (!aboveMax && !belowMin) {
            this.view.adjustZoom(delta, point);
            this.updateGrid(false);
            //this.updateAlignmentMarks();

            this.updateDevice(Registry.currentDevice, false);
            // this.__updateViewTarget(false);
        } else {
            //console.log("Too big or too small!");
        }
        this.refresh(refresh);
    }
    /**
     * Sets the center of the view manager
     * @param {Array<number>} center X and Y coordinates of the center
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @memberof BareViewManager
     * @returns {void}
     */
    setCenter(center, refresh = true) {
        this.view.setCenter(center);
        this.updateGrid(false);
        //this.updateAlighmentMarks();

        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }
    /**
     * Moves the center
     * @param {*} delta 
     * @param {boolean} refresh Whether to refresh or not. true by default
     * @returns {void}
     * @memberof BareViewManager
     */
    moveCenter(delta, refresh = true) {
        this.view.moveCenter(delta);
        this.updateGrid(false);
        // this.updateAlignmentMarks();

        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }
    /**
     * Refresh?
     * @param {boolean} refresh Whether to refresh or not 
     * @returns {void}
     * @memberof BareViewManager
     */
    refresh(refresh = true) {
        this.updateQueue.run();
        //Update the toolbar
        let spacing = Registry.currentGrid.getSpacing();
        // this.resolutionToolBar.updateResolutionLabelAndSlider(spacing);
    }
    /**
     * Gets the position of the project
     * @param {*} event 
     * @returns {Array<number>} Returns the X and Y coordinates
     * @memberof BareViewManager
     */
    getEventPosition(event) {
        return this.view.getProjectPosition(event.clientX, event.clientY);
    }
    /**
     * Checks if it has current grid 
     * @returns {Boolean} 
     * @memberof BareViewManager
     */
    __hasCurrentGrid() {
        if (Registry.currentGrid) return true;
        else return false;
    }
    /**
     * Checks if the layers is in the current device
     * @param {Layer} layer Layer object
     * @returns {Boolean}
     * @memberof BareViewManager
     */
    __isLayerInCurrentDevice(layer) {
        if (Registry.currentDevice && layer.device === Registry.currentDevice) return true;
        else return false;
    }
    /**
     * Checks if the feature is in current device
     * @param {Feature} feature Feature object
     * @returns {Boolean}
     * @memberof BareViewManager
     */
    __isFeatureInCurrentDevice(feature) {
        if (Registry.currentDevice && this.__isLayerInCurrentDevice(feature.layer)) return true;
        else return false;
    }
    /**
     * Loads a device from a JSON format
     * @param {JSON} json 
     * @memberof BareViewManager
     * @returns {void}
     */
    loadDeviceFromJSON(json) {
        let device;
        Registry.viewManager.clear();
        //Check and see the version number if its 0 or none is present,
        // its going the be the legacy format, else it'll be a new format
        var version = json.version;
        if (null === version || undefined === version) {
            console.log("Loading Legacy Format...");
            device = Device.fromJSON(json);
            Registry.currentDevice = device;
            this.__currentDevice = device;
        } else {
            console.log("Version Number: " + version);
            switch (version) {
            case 1:
                device = Device.fromInterchangeV1(json);
                Registry.currentDevice = device;
                this.__currentDevice = device;

                break;
            default:
                alert("Version '" + version + "' is not supported by 3DuF !");
            }
        }
        //Common Code for rendering stuff
        Registry.currentLayer = Registry.currentDevice.layers[0];
        Registry.currentTextLayer = Registry.currentDevice.textLa;

        //TODO: Need to replace the need for this function, right now without this, the active layer system gets broken
        Registry.viewManager.addDevice(Registry.currentDevice);

        this.view.initializeView();
        this.updateGrid();
        this.updateDevice(Registry.currentDevice);
        this.refresh(true);
        Registry.currentLayer = Registry.currentDevice.layers[0];
        // this.layerToolBar.setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();
    }

    // removeFeaturesByPaperElements(paperElements) {
    //     if (paperElements.length > 0) {
    //         for (let i = 0; i < paperElements.length; i++) {
    //             let paperFeature = paperElements[i];
    //             Registry.currentDevice.removeFeatureByID(paperFeature.featureID);
    //         }
    //         this.currentSelection = [];
    //     }
    // }

    // getFeaturesOfType(typeString, setString, features){
    //     let output = [];
    //     for (let i =0; i < features.length; i++){
    //         let feature = features[i];
    //         if (feature.getType() == typeString && feature.getSet() == setString){
    //             output.push(feature);
    //         }
    //     }
    //     return output;
    // }

    // adjustAllFeatureParams(valueString, value, features){
    //     for (let i = 0 ; i < features.length; i++){
    //         let feature = features[i];
    //         feature.updateParameter(valueString, value);
    //     }
    // }
    //
    // adjustParams(typeString, setString, valueString, value){
    //     let selectedFeatures = this.view.getSelectedFeatures();
    //     if (selectedFeatures.length > 0){
    //         let correctType = this.getFeaturesOfType(typeString, setString, selectedFeatures);
    //         if (correctType.length >0 ){
    //             this.adjustAllFeatureParams(valueString, value, correctType);
    //         }
    //     }else{
    //         this.updateDefault(typeString, setString, valueString, value);
    //     }
    // }

    // /**
    //  * Updates the default feature parameter
    //  * @param typeString
    //  * @param setString
    //  * @param valueString
    //  * @param value
    //  */
    // updateDefault(typeString, setString, valueString, value){
    //     Registry.featureDefaults[setString][typeString][valueString] = value;
    // }
    //
    // /**
    //  * Updates the defaults in the feature
    //  * @param feature
    //  */
    // updateDefaultsFromFeature(feature){
    //     let heritable = feature.getHeritableParams();
    //     for (let key in heritable){
    //         this.updateDefault(feature.getType(), feature.getSet(), key, feature.getValue(key));
    //     }
    // }

    // /**
    //  * Reverts the feature to default
    //  * @param valueString
    //  * @param feature
    //  */
    // revertFieldToDefault(valueString, feature) {
    //     feature.updateParameter(valueString, Registry.featureDefaults[feature.getSet()][feature.getType()][valueString]);
    // }

    // /**
    //  * Reverts the feature to params to defaults
    //  * @param feature
    //  */
    // revertFeatureToDefaults(feature) {
    //     let heritable = feature.getHeritableParams();
    //     for (let key in heritable) {
    //         this.revertFieldToDefault(key, feature);
    //     }
    // }
    // revertFeaturesToDefaults(features) {
    //     for (let feature in features) {
    //         this.revertFeatureToDefaults(feature);
    //     }
    // }

    /**
     * Checks if the point intersects with any other feature
     * @param {Array<number>} point X and Y coordinates of the point
     * @return PaperJS rendered Feature
     * @memberof BareViewManager
     */
    hitFeature(point) {
        return this.view.hitFeature(point);
    }

    /**
     * Checks if the element intersects with any other feature
     * @param {Object} element
     * @return {*|Array}
     * @memberof BareViewManager
     */
    hitFeaturesWithViewElement(element) {
        return this.view.hitFeaturesWithViewElement(element);
    }

    // /**
    //  * Activates the given tool
    //  * @param toolString
    //  * @param rightClickToolString
    //  */
    // activateTool(toolString , rightClickToolString = "SelectTool") {
    //     if(this.tools[toolString] == null){
    //         throw new Error("Could not find tool with the matching string");
    //     }
    //     this.mouseAndKeyboardHandler.leftMouseTool = this.tools[toolString];
    //     this.mouseAndKeyboardHandler.rightMouseTool = this.tools[rightClickToolString];
    //     this.mouseAndKeyboardHandler.updateViewMouseEvents();
    // }

    /**
     * Switches to 2D
     * @returns {void}
     * @memberof BareViewManager
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

    // switchTo3D() {
    //     if (!this.threeD) {
    //         this.threeD = true;
    //         setButtonColor(this.__button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
    //         setButtonColor(this.__button2D, inactiveBackground, inactiveText);
    //         this.renderer.loadJSON(Registry.currentDevice.toJSON());
    //         let cameraCenter = this.view.getViewCenterInMillimeters();
    //         let height = Registry.currentDevice.params.getValue("height") / 1000;
    //         let pixels = this.view.getDeviceHeightInPixels();
    //         this.renderer.setupCamera(cameraCenter[0], cameraCenter[1], height, pixels, paper.view.zoom);
    //         this.renderer.showMockup();
    //         HTMLUtils.removeClass(this.__renderBlock, "hidden-block");
    //         HTMLUtils.addClass(this.__canvasBlock, "hidden-block");
    //         HTMLUtils.addClass(this.__renderBlock, "shown-block");
    //         HTMLUtils.removeClass(this.__canvasBlock, "shown-block");
    //     }
    // }

    /**
     * Reads a selected file of the user
     * @param {Object} selector Selector object
     * @returns {void}
     * @memberof BareViewManager
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

    // /**
    //  * Closes the params window
    //  */
    // killParamsWindow() {
    //     let paramsWindow = document.getElementById("parameter_menu");
    //     if (paramsWindow) paramsWindow.parentElement.removeChild(paramsWindow);
    // }

    // /**
    //  * This method saves the current device to the design history
    //  */
    // saveDeviceState(){
    //     console.log("Saving to statck");
    //
    //     let save = JSON.stringify(Registry.currentDevice.toInterchangeV1());
    //
    //     this.undoStack.pushDesign(save);
    // }
    //
    // /**
    //  * Undoes the recent update
    //  */
    // undo(){
    //     let previousdesign = this.undoStack.popDesign();
    //     console.log(previousdesign);
    //     if(previousdesign){
    //         let result = JSON.parse(previousdesign);
    //         this.loadDeviceFromJSON(result);
    //     }
    //
    // }

    // /**
    //  * Resets the tool to the default tool
    //  */
    // resetToDefaultTool(){
    //     this.cleanupActiveTools();
    //     this.activateTool("MouseSelectTool");
    //     this.componentToolBar.setActiveButton("SelectButton");
    // }

    // /**
    //  * Runs cleanup method on the activated tools
    //  */
    // cleanupActiveTools() {
    //     this.mouseAndKeyboardHandler.leftMouseTool.cleanup();
    //     this.mouseAndKeyboardHandler.rightMouseTool.cleanup();
    // }

    // /**
    //  * Updates the renders for all the connection in the blah
    //  */
    // updatesConnectionRender(connection){
    //     //First Redraw all the segements without valves or insertions
    //     connection.regenerateSegments();
    //
    //     //Get all the valves for a connection
    //     let valves = Registry.currentDevice.getValvesForConnection(connection);
    //
    //     //Cycle through each of the valves
    //     for(let j in valves){
    //         let valve = valves[j];
    //         let boundingbox = valve.getBoundingRectangle();
    //         connection.insertFeatureGap(boundingbox);
    //     }
    //
    // }
    //

    // showUIMessage(message){
    //     this.messageBox.MaterialSnackbar.showSnackbar(
    //         {
    //             message: message
    //         }
    //     );
    // }

    // setupTools() {
    //     this.tools["SelectTool"] = new SelectTool();
    //     this.tools["MouseSelectTool"] = new MouseSelectTool();
    //     this.tools["InsertTextTool"] = new InsertTextTool();
    //     this.tools["Chamber"] = new ComponentPositionTool("Chamber", "Basic");
    //     this.tools["Valve"] = new ValveInsertionTool("Valve", "Basic");
    //     this.tools["Channel"] = new ChannelTool("Channel", "Basic");
    //     this.tools["Connection"] = new ConnectionTool("Connection", "Basic");
    //     this.tools["RoundedChannel"] = new ChannelTool("RoundedChannel", "Basic");
    //     this.tools["Node"] = new ComponentPositionTool("Node", "Basic");
    //     this.tools["CircleValve"] = new ValveInsertionTool("CircleValve", "Basic");
    //     this.tools["RectValve"] = new ComponentPositionTool("RectValve", "Basic");
    //     this.tools["Valve3D"] = new ValveInsertionTool("Valve3D", "Basic", true);
    //     this.tools["Port"] = new ComponentPositionTool("Port", "Basic");
    //     this.tools["Via"] = new PositionTool("Via", "Basic");
    //     this.tools["DiamondReactionChamber"] = new ComponentPositionTool("DiamondReactionChamber", "Basic");
    //     this.tools["BetterMixer"] = new ComponentPositionTool("BetterMixer", "Basic");
    //     this.tools["CurvedMixer"] = new ComponentPositionTool("CurvedMixer", "Basic");
    //     this.tools["Mixer"] = new ComponentPositionTool("Mixer", "Basic");
    //     this.tools["GradientGenerator"] = new ComponentPositionTool("GradientGenerator", "Basic");
    //     this.tools["Tree"] = new ComponentPositionTool("Tree", "Basic");
    //     this.tools["YTree"] = new ComponentPositionTool("YTree", "Basic");
    //     this.tools["Mux"] = new MultilayerPositionTool("Mux", "Basic");
    //     this.tools["Transposer"] = new MultilayerPositionTool("Transposer", "Basic");
    //     this.tools["RotaryMixer"] = new MultilayerPositionTool("RotaryMixer", "Basic");
    //     this.tools["CellTrapL"] = new CellPositionTool("CellTrapL", "Basic");
    //     this.tools["DropletGen"] = new ComponentPositionTool("DropletGen", "Basic");
    //     this.tools["Transition"] = new PositionTool("Transition", "Basic");
    //     this.tools["AlignmentMarks"] = new MultilayerPositionTool("AlignmentMarks", "Basic");
    //     this.tools["Pump"] = new MultilayerPositionTool("Pump", "Basic");
    //     this.tools["Pump3D"] = new MultilayerPositionTool("Pump3D", "Basic");
    //
    //     //All the new tools
    //     this.tools["MoveTool"] = new MoveTool();
    //     this.tools["GenerateArrayTool"] = new GenerateArrayTool();
    //
    // }

    // addCustomComponentTool(identifier){
    //     let customcomponent = this.customComponentManager.getCustomComponent(identifier);
    //     this.tools[identifier] = new CustomComponentPositionTool(customcomponent, "Custom");
    //     Registry.featureDefaults["Custom"][identifier] = CustomComponent.defaultParameterDefinitions().defaults;
    // }
}
