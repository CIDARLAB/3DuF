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

class CanvasManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.paperDevice = undefined;
        this.grid = undefined;
        this.tools = {};
        this.minPixelSpacing = 10;
        this.maxPixelSpacing = 50;
        this.gridSpacing = 10;
        this.thickCount = 5;
        this.minZoom = .00001;
        this.maxZoom = 10;
        this.currentTool = null;
        this.setupMouseEvents();
        this.generateTools();
        this.selectTool("Channel");

        if (!Registry.canvasManager) Registry.canvasManager = this;
        else throw new Error("Cannot register more than one CanvasManager");

        this.setupZoomEvent();
        this.setupContextEvent();
    }

    //TODO: Find a non-manual way to do this
    generateTools(){
        this.tools[Channel.typeString()] = new ChannelTool(Channel);
        this.tools[HollowChannel.typeString()] = new ChannelTool(HollowChannel);
        this.tools[Port.typeString()] = new ValveTool(Port);
        this.tools[CircleValve.typeString()] = new ValveTool(CircleValve);
        this.tools[Via.typeString()] = new ValveTool(Via);
        this.tools["pan"] = new PanTool();
        //this.tools["none"] = new paper.Tool();
    }

    selectTool(typeString){
        this.tools[typeString].activate();
        this.currentTool = this.tools[typeString];
    }

    snapToGrid(point){
        return GridGenerator.snapToGrid(point, this.gridSpacing);
    }

    setupMouseEvents(){
        var manager = this;
        this.canvas.onmousedown = function(e){
            console.log("foo");
            if(e.which == 2) {
                manager.currentTool.abort();
                manager.tools["pan"].activate();
                manager.tools["pan"].startPoint = manager.canvasToProject(e.clientX, e.clientY);
            } else if (e.which == 3){
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
            console.log("Context menu!");
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

    render(forceUpdate = true) {
        this.renderDevice();
        this.renderGrid();
        paper.view.update(forceUpdate);
    }

    renderGrid(forceUpdate = true) {
        if (this.grid) {
            this.grid.remove();
        }
        this.grid = GridGenerator.makeGrid(this.gridSpacing, this.thickCount);
        if (this.paperDevice) this.grid.insertBelow(this.paperDevice);
        paper.view.update(forceUpdate);
    }

    setGridSize(size, forceUpdate = true) {
        this.gridSpacing = size;
        this.renderGrid(forceUpdate);
    }

    renderDevice(forceUpdate = true) {
        if (this.paperDevice) {
            this.paperDevice.remove();
        }
        this.paperDevice = Registry.currentDevice.render2D(this.paper);
        if (this.grid) this.paperDevice.insertAbove(this.grid);
        paper.view.update(forceUpdate);
    }

    updateGridSpacing() {
        let min = this.minPixelSpacing / paper.view.zoom;
        let max = this.maxPixelSpacing / paper.view.zoom;
        while (this.gridSpacing < min) {
            this.gridSpacing = this.gridSpacing * 5;
        }
        while (this.gridSpacing > max) {
            this.gridSpacing = this.gridSpacing / 5;
        }
        this.render();
    }

    adjustZoom(delta, position) {
        PanAndZoom.adjustZoom(delta, position);
    }

    setZoom(zoom) {
        paper.view.zoom = zoom;
        this.updateGridSpacing();
        this.render();
    }

    moveCenter(delta){
        let newCenter = paper.view.center.subtract(delta);
        this.setCenter(newCenter);
    }

    setCenter(x, y) {
        paper.view.center = new paper.Point(x, y);
        this.render();
    }

    saveToStorage(){
        localStorage.setItem('currentDevice', JSON.stringify(Registry.currentDevice.toJSON()));
    }

    loadFromStorage(){
        Registry.currentDevice = Device.fromJSON(JSON.parse(localStorage.getItem("currentDevice")));
        Registry.currentLayer = Registry.currentDevice.layers[0];
        this.render();
    }
}

module.exports = CanvasManager;