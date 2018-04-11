var Registry = require("../core/registry");
var Device = require("../core/device");
var ChannelTool = require("./tools/channelTool");
var MouseTool = require("./tools/mouseTool");
var PanTool = require("./tools/panTool");
var PanAndZoom = require("./PanAndZoom");
var SelectTool = require("./tools/selectTool");
var SimpleQueue = require("../utils/SimpleQueue");
var PositionTool = require("./tools/positionTool");
var MultilayerPositionTool = require('./tools/multilayerPositionTool');
var CellPositionTool = require('./tools/cellPositionTool');

class ViewManager {
    constructor(view) {
        this.view = view;
        this.tools = {};
        this.middleMouseTool = new PanTool();
        this.rightMouseTool = new SelectTool();
        let reference = this;
        this.updateQueue = new SimpleQueue(function() {
            reference.view.refresh();
        }, 20);
        this.saveQueue = new SimpleQueue(function() {
            reference.saveToStorage();
        })
        window.onkeydown = function(event) {
            let key = event.keyCode || event.which;
            if (key == 46) {
                event.preventDefault();
            }
        }
        this.view.setKeyDownFunction(function(event) {
            let key = event.keyCode || event.which;
            if (key == 46 || key == 8) {
                reference.view.deleteSelectedFeatures();
            }

            if(key == 37){
                //console.log("left arrow");
                reference.view.moveCenter(new paper.Point(1000,0));
                reference.updateGrid();
            }
            if(key == 38){
                //console.log("Up arrow");
                reference.view.moveCenter(new paper.Point(0,1000));
                reference.updateGrid();
            }
            if(key == 39){
                //console.log("right arrow");
                reference.view.moveCenter(new paper.Point(-1000,0));
                reference.updateGrid();
            }
            if(key == 40){
                //console.log("down arrow");
                reference.view.moveCenter(new paper.Point(0,-1000));
                reference.updateGrid();
            }
        });

        this.view.setResizeFunction(function() {
            reference.updateGrid();
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

    addDevice(device, refresh = true) {
        this.view.addDevice(device);
        this.__addAllDeviceLayers(device, false);
        this.refresh(refresh);
    }

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

    updateLayer(layer, index, refresh = true) {
        if (this.__isLayerInCurrentDevice(layer)) {
            this.view.updateLayer(layer);
            this.refresh(refresh);
        }
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

    clear() {
        this.view.clear();
    }

    setZoom(zoom, refresh = true) {
        if (zoom > this.maxZoom) zoom = this.maxZoom;
        else if (zoom < this.minZoom) zoom = this.minZoom;
        this.view.setZoom(zoom);
        this.updateGrid(false);
        this.updateDevice(Registry.currentDevice, false);
        this.__updateViewTarget(false);
        this.refresh(refresh);
    }

    removeTarget() {
        this.view.removeTarget();
    }

    updateTarget(featureType, featureSet, position, refresh = true) {
        this.view.addTarget(featureType, featureSet, position);
        this.refresh(refresh);
    }

    __updateViewTarget(refresh = true) {
        this.view.updateTarget();
        this.refresh(refresh);
    }

    adjustZoom(delta, point, refresh = true) {
        let belowMin = (this.view.getZoom() >= this.maxZoom && delta < 0);
        let aboveMax = (this.view.getZoom() <= this.minZoom && delta > 0);
        if (!aboveMax && !belowMin) {
            this.view.adjustZoom(delta, point);
            this.updateGrid(false);
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
        this.updateDevice(Registry.currentDevice, false);
        this.refresh(refresh);
    }

    moveCenter(delta, refresh = true) {
        this.view.moveCenter(delta);
        this.updateGrid(false);
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

    constructMouseDownEvent(tool1, tool2, tool3) {
        return this.constructMouseEvent(tool1.down, tool2.down, tool3.down);
    }

    constructMouseMoveEvent(tool1, tool2, tool3) {
        return this.constructMouseEvent(tool1.move, tool2.move, tool3.move);
    }

    constructMouseUpEvent(tool1, tool2, tool3) {
        return this.constructMouseEvent(tool1.up, tool2.up, tool3.up);
    }

    loadDeviceFromJSON(json) {
        Registry.viewManager.clear();
        //Check and see the version number if its 0 or none is present,
        // its going the be the legacy format, else it'll be a new format
        var version = json.version;
        if(null == version || undefined == version){
            console.log("Loading Legacy Format...")
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

    static __eventButtonsToWhich(num) {
        if (num == 1) {
            return 1;
        } else if (num == 2) {
            return 3;
        } else if (num == 4) {
            return 2;
        } else if (num == 3) {
            return 2;
        }
    }

    constructMouseEvent(func1, func2, func3) {
        return function(event) {
            let target;
            if (event.buttons) {
                target = ViewManager.__eventButtonsToWhich(event.buttons);
            } else {
                target = event.which;
            }
            if (target == 2) func2(event);
            else if (target == 3) func3(event);
            else if (target == 1 || target == 0) func1(event);
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
        }
        this.updateDefault(typeString, setString, valueString, value);
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

    hitFeature(point) {
        return this.view.hitFeature(point);
    }

    hitFeaturesWithViewElement(element) {
        return this.view.hitFeaturesWithViewElement(element);
    }

    __updateViewMouseEvents() {
        this.view.setMouseDownFunction(this.constructMouseDownEvent(this.leftMouseTool, this.middleMouseTool, this.rightMouseTool));
        this.view.setMouseUpFunction(this.constructMouseUpEvent(this.leftMouseTool, this.middleMouseTool, this.rightMouseTool));
        this.view.setMouseMoveFunction(this.constructMouseMoveEvent(this.leftMouseTool, this.middleMouseTool, this.rightMouseTool));
    }

    activateTool(toolString) {
        this.leftMouseTool = this.tools[toolString];
        this.__updateViewMouseEvents();
    }

    setupTools() {
        this.tools["Chamber"] = new ChannelTool("Chamber", "Basic");
        this.tools["Valve"] = new PositionTool("Valve", "Basic");
        this.tools["Channel"] = new ChannelTool("Channel", "Basic");
        this.tools["RoundedChannel"] = new ChannelTool("RoundedChannel", "Basic");
        this.tools["Node"] = new PositionTool("Node", "Basic");
        this.tools["CircleValve"] = new PositionTool("CircleValve", "Basic");
        this.tools["RectValve"] = new PositionTool("RectValve", "Basic");
        this.tools["Valve3D"] = new MultilayerPositionTool("Valve3D", "Basic");
        this.tools["Port"] = new PositionTool("Port", "Basic");
        this.tools["Via"] = new PositionTool("Via", "Basic");
        this.tools["DiamondReactionChamber"] = new PositionTool("DiamondReactionChamber", "Basic");
        this.tools["BetterMixer"] = new PositionTool("BetterMixer", "Basic");
        this.tools["CurvedMixer"] = new PositionTool("CurvedMixer", "Basic");
        this.tools["Mixer"] = new PositionTool("Mixer", "Basic");
        this.tools["Tree"] = new PositionTool("Tree", "Basic");
        this.tools["Mux"] = new MultilayerPositionTool("Mux", "Basic");
        this.tools["Transposer"] = new MultilayerPositionTool("Transposer", "Basic");
        this.tools["RotaryMixer"] = new MultilayerPositionTool("RotaryMixer", "Basic");
        this.tools["CellTrapL"] = new CellPositionTool("CellTrapL", "Basic");
        this.tools["DropletGen"] = new PositionTool("DropletGen", "Basic");
        this.tools["Transition"] = new PositionTool("Transition", "Basic");
    }
}

module.exports = ViewManager;