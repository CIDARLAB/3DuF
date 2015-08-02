var Registry = require("../core/registry");
var GridGenerator = require("./gridGenerator");
var PanAndZoom = require("./panAndZoom");
var Features = require("../core/features");
var Tools = require("./tools");
var Device = require("../core/device");

var Channel = Features.Channel;
var HollowChannel = Features.HollowChannel;
var Port = Features.Port;
var CircleValve = Features.CircleValve;
var Via = Features.Via;

var ChannelTool = Tools.ChannelTool;
var ValveTool = Tools.ValveTool;
var PanTool = Tools.PanTool;
var SelectTool = Tools.SelectTool;

class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.layers = [];
        this.backgroundLayer = new paper.Group();
        this.gridLayer = undefined;
        this.selectLayer = new paper.Group();
        this.tools = {};
        this.minPixelSpacing = 10;
        this.maxPixelSpacing = 100;
        this.gridSpacing = 1000;
        this.thickCount = 10;
        this.minZoom = .00001;
        this.maxZoom = 10;
        this.currentTool = null;
        this.setupMouseEvents();
        this.generateTools();
        this.generateToolButtons();
        this.selectTool("select");

        if (!Registry.canvasManager) Registry.canvasManager = this;
        else throw new Error("Cannot register more than one CanvasManager");

        this.setupZoomEvent();
        this.setupContextEvent();
        this.setupResizeEvent();
    }

    //TODO: Find a non-manual way to do this
    generateTools(){
        this.tools[Channel.typeString()] = new ChannelTool(Channel);
        this.tools[HollowChannel.typeString()] = new ChannelTool(HollowChannel);
        this.tools[Port.typeString()] = new ValveTool(Port);
        this.tools[CircleValve.typeString()] = new ValveTool(CircleValve);
        this.tools[Via.typeString()] = new ValveTool(Via);
        this.tools["pan"] = new PanTool();
        this.tools["select"] = new SelectTool();
        //this.tools["none"] = new paper.Tool();
    }

    generateToolButtons(){
        let container = document.getElementById("button_block");
        for (let toolName in this.tools){
            let btn = this.generateButton(toolName);
            container.appendChild(btn);
        }
    }

    generateButton(toolName){
        let btn = document.createElement("BUTTON");
        let t = document.createTextNode(toolName);
        let manager = this;
        btn.appendChild(t);
        btn.onclick = function(){
            manager.selectTool(toolName);
        }
        return btn;
    }

    selectTool(typeString){
        if (this.currentTool) this.currentTool.abort();
        this.tools[typeString].activate();
        this.currentTool = this.tools[typeString];
    }

    //TODO: Hit test only features instead of the whole device
    hitFeatureInDevice(point){
        let hitOptions = {
            fill: true,
            tolerance: 5,
            guides: false
        }

        let output = [];

        for (let i = this.layers.length-1; i >=0; i--){
            let layer = this.layers[i];
            let result = layer.hitTest(point, hitOptions);
            if (result){
                return result.item;
            }
        }
    }

    hitFeaturesWithPaperElement(paperElement){
        let output = [];
        for (let i = 0 ; i < this.layers.length; i ++){
            let layer = this.layers[i];
            for (let j = 0; j < layer.children.length; j++){
                let child = layer.children[j];
                if (paperElement.intersects(child) || child.isInside(paperElement.bounds)){
                    output.push(child);
                }
            }
        }
        return output;
    }

    snapToGrid(point){
        return GridGenerator.snapToGrid(point, this.gridSpacing);
    }

    setupResizeEvent(){
        let man = this;
        paper.view.onResize = function(event){
            man.render();
        }
    }

    setupMouseEvents(){
        var manager = this;
        this.canvas.onmousedown = function(e){
            if(e.which == 2) {
                manager.currentTool.abort();
                manager.tools["pan"].activate();
                manager.tools["pan"].startPoint = manager.canvasToProject(e.clientX, e.clientY);
            } else if (e.which == 3){
                man.currentTool.abort();
                let point = manager.canvasToProject(e.clientX, e.clientY);
                let target = manager.hitFeatureInDevice(point);
                if (target){
                    console.log(Registry.currentDevice.getFeatureByID(target.featureID));
                }
                manager.currentTool.abort();
            }
        }
        this.canvas.onmouseup = function(e){
            if(e.which == 2 || 3){
                manager.currentTool.activate();
            }
        }
    }

    setupContextEvent(){
        this.canvas.oncontextmenu = function(e){
            e.preventDefault();
        }
    }

    setupZoomEvent() {
        let min = this.minZoom;
        let max = this.maxZoom;
        let canvas = this.canvas;
        let manager = this;

        this.canvas.addEventListener("wheel", function(event){
            if (paper.view.zoom >= max && event.deltaY < 0) console.log("Whoa! Zoom is way too big.");
            else if (paper.view.zoom <= min && event.deltaY > 0) console.log("Whoa! Zoom is way too small.");
            else PanAndZoom.adjustZoom(event.deltaY, manager.canvasToProject(event.clientX, event.clientY));
            }, false);

    }

    canvasToProject(x, y) {
        let rect = this.canvas.getBoundingClientRect();
        let projX = x - rect.left;
        let projY = y - rect.top;
        return (paper.view.viewToProject(new paper.Point(projX,projY)));
    }

    renderFeature(feature, forceUpdate = true){
        feature.render2D();
        paper.view.update(forceUpdate);
    }

    renderBackground(forceUpdate = true){
        this.backgroundLayer.clear();
        let width = Registry.currentDevice.params.getValue("width");
        let height = Registry.currentDevice.params.getValue("height");
        let border = new paper.Path.Rectangle(new paper.Point(0,0), new paper.Point(width, height));
        border.fillColor = null;
        border.strokeColor = new paper.Color(.2,.2,.2);
        border.strokeWidth = 3 / paper.view.zoom;
        this.backgroundLayer.addChild(border);
        if(this.gridLayer) this.backgroundLayer.insertAbove(this.gridLayer);
        paper.view.update(forceUpdate);
    }

    render(forceUpdate = true) {
        this.renderBackground();
        this.renderDevice();
        this.renderGrid();
        paper.view.update(forceUpdate);
    }

    renderGrid(forceUpdate = true) {
        if (this.gridLayer) {
            this.gridLayer.remove();
        }
        let grid = GridGenerator.makeGrid(this.gridSpacing, this.thickCount);
        this.gridLayer = new paper.Group(grid); 
        if (this.layers.length > 0) this.gridLayer.insertBelow(this.layers[0]);
        if(this.backgroundLayer) this.gridLayer.insertBelow(this.backgroundLayer);

        paper.view.update(forceUpdate);
    }

    setGridSize(size, forceUpdate = true) {
        this.gridSpacing = size;
        this.renderGrid(forceUpdate);
    }

    //TODO: This is a hacky way to clear everything.
    clearLayers(){
        for (let i = 0; i < this.layers.length; i ++){
            this.layers[i].remove();
        }
    }

    //TODO: Optimize this to re-render only things that changed? 
    // Or write another partial-rendering procedure?
    renderDevice(forceUpdate = true) {
        this.clearLayers();
        let rendered = Registry.currentDevice.render2D(this.paper);
        let layers = [];
        for (let i =0 ; i < rendered.length; i++){
            let layer = rendered[i];
            let paperLayer = new paper.Group(layer);
            if (this.gridLayer) paperLayer.insertAbove(this.gridLayer);
            if (this.selectLayer) paperLayer.insertBelow(this.selectLayer);
            if (this.backgroundLayer) paperLayer.insertAbove(this.backgroundLayer);
            if (i > 0){
                paperLayer.insertAbove(layers[i-1]);
            }
            layers.push(paperLayer);
        }
        this.layers = layers;
        paper.view.update(forceUpdate);
    }

    updateGridSpacing() {
        let min = this.minPixelSpacing / paper.view.zoom;
        let max = this.maxPixelSpacing / paper.view.zoom;
        while (this.gridSpacing < min) {
            this.gridSpacing = this.gridSpacing * 10;
        }
        while (this.gridSpacing > max) {
            this.gridSpacing = this.gridSpacing / 10;
        }
        this.renderGrid();
    }

    adjustZoom(delta, position) {
        PanAndZoom.adjustZoom(delta, position);
    }

    setZoom(zoom) {
        paper.view.zoom = zoom;
        this.updateGridSpacing();
        this.renderGrid();
        this.renderBackground();

    }

    calculateOptimalZoom(){
        let breathingRoom = 100; //pixels
        let dev = Registry.currentDevice;
        let width = dev.params.getValue("width");
        let height = dev.params.getValue("height");
        let rect = this.canvas.getBoundingClientRect();
        if (rect.width - breathingRoom <= 0 || rect.height - breathingRoom <= 0) breathingRoom = 0;
        let widthRatio = width/(rect.width - breathingRoom);
        let heightRatio = height/(rect.height - breathingRoom);
        let targetRatio = 0;
        if (widthRatio > heightRatio) return 1/widthRatio;
        else return 1/heightRatio;

    }

    calculateMidpoint(){
        let dev = Registry.currentDevice;
        let width = dev.params.getValue("width");
        let height = dev.params.getValue("height");
        return new paper.Point(width/2, height/2);
    }

    moveCenter(delta){
        let newCenter = paper.view.center.subtract(delta);
        this.setCenter(newCenter);
    }

    setCenter(x, y) {
        paper.view.center = new paper.Point(x, y);
        this.renderGrid();
        this.renderBackground();
    }

    initializeView(){
        this.setZoom(this.calculateOptimalZoom());
        this.setCenter(this.calculateMidpoint());
    }
    
    loadDeviceFromJSON(json){
        Registry.currentDevice = Device.fromJSON(json);
        Registry.currentLayer = Registry.currentDevice.layers[0];
        this.initializeView();
        this.updateGridSpacing();
        this.render();
    }

    saveToStorage(){
        localStorage.setItem('currentDevice', JSON.stringify(Registry.currentDevice.toJSON()));
    }

    loadFromStorage(){
        this.loadDeviceFromJSON(JSON.parse(localStorage.getItem("currentDevice")));
    }
}

module.exports = CanvasManager;