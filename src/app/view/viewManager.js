var Registry = require("../core/registry");
var ChannelTool = require("./tools/channelTool");
var MouseTool = require("./tools/mouseTool");
var Features = require("../core/features");
var PanTool = require("./tools/panTool");
var PanAndZoom = require("./PanAndZoom");

class ViewManager {
    constructor(view){
        this.view = view;
        let chan = new ChannelTool(Features.Channel);
        let pan = new PanTool();
        let reference = this;
        this.view.setMouseDownFunction(this.constructMouseDownEvent(chan, pan, pan));
        this.view.setMouseUpFunction(this.constructMouseUpEvent(chan, pan,pan));
        this.view.setMouseMoveFunction(this.constructMouseMoveEvent(chan, pan, pan));
        this.view.setResizeFunction(function(){
            reference.updateGrid();
            reference.updateDevice(Registry.currentDevice);
        })
        let func = function(event){
            reference.adjustZoom(event.deltaY, reference.getEventPosition(event));
        };
        this.view.setMouseWheelFunction(func);
        this.minZoom = .0001;
        this.maxZoom = 5;
    }

    updateDevice(device){
        if(this.__isCurrentDevice(device)){
            this.view.updateDevice(device);
            this.view.refresh();
        }
    }

    updateFeature(feature){
        if(this.__isInCurrentDevice(feature)){
            this.view.updateFeature(feature);
            this.view.refresh();   
        }
    }

    removeFeature(feature){
        if(this.__isInCurrentDevice(feature)){
            this.view.removeFeature(feature);
            this.view.refresh(); 
        }
    }

    removeGrid(){
        if (this.__hasCurrentGrid()){
            this.view.removeGrid();
            this.view.refresh(); 
        }    
    }

    updateGrid(){
        if (this.__hasCurrentGrid()){
            this.view.updateGrid(Registry.currentGrid);
            this.view.refresh(); 
        }
    }

    setZoom(zoom){
        this.view.setZoom(zoom);
        this.updateGrid();
        this.updateDevice(Registry.currentDevice);
    }

    adjustZoom(delta, point){
        let belowMin = (paper.view.zoom >= this.maxZoom && event.deltaY < 0);
        let aboveMax = (paper.view.zoom <= this.minZoom && event.deltaY > 0);
        if (!aboveMax && !belowMin) {
            this.view.adjustZoom(delta, point);
            this.updateGrid();
            this.updateDevice(Registry.currentDevice);
        } else {
            console.log("Too big or too small!");
        }
    }

    setCenter(center){
        this.view.setCenter(center);
        this.updateGrid();
        this.updateDevice(Registry.currentDevice);
    }

    moveCenter(delta){
        this.view.moveCenter(delta);
        this.updateGrid();
        this.updateDevice(Registry.currentDevice);
    }

    getEventPosition(event){
        return this.view.getProjectPosition(event.clientX, event.clientY);
    }

    __hasCurrentGrid(){
        if (Registry.currentGrid) return true;
        else return false;
    }

    __isCurrentDevice(device){
        if (device == Registry.currentDevice) return true;
        else return false;
    }

    __isInCurrentDevice(feature){
        if (feature.layer.device == Registry.currentDevice) return true;
        else return false;
    }

    constructMouseDownEvent(tool1, tool2, tool3){
        return this.constructMouseEvent(tool1.down, tool2.down, tool3.down);
    }

    constructMouseMoveEvent(tool1,tool2,tool3){
        return this.constructMouseEvent(tool1.move, tool2.move, tool3.move);
    }

    constructMouseUpEvent(tool1, tool2, tool3){
        return this.constructMouseEvent(tool1.up, tool2.up, tool3.up);
    }

    constructMouseEvent(func1, func2, func3){
        return function(event){
            if (event.which ==2) func2(event);
            else if (event.which ==3) func3(event);
            else func1(event);
        } 
    }

    snapToGrid(point){
        if(Registry.currentGrid) return Registry.currentGrid.getClosestGridPoint(point);
        else return point;
    }
}

module.exports = ViewManager;