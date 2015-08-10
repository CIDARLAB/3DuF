var CanvasManager = require("./graphics/CanvasManager");
//var CanvasManager = require("./graphics/CanvasManager");
var Registry = require("./core/registry");
var Device = require('./core/device');
var Layer = require('./core/layer');
var Features = require('./core/features');
var PaperView = require("./view/paperView");
var ViewManager = require("./view/viewManager");
var AdaptiveGrid = require("./view/grid/adaptiveGrid");
var PageSetup = require("./view/pageSetup");
var Colors = require("./view/colors");
var ThreeDeviceRenderer = require("./renderer/ThreeDeviceRenderer");
var Examples = require("./examples/jsonExamples");

var Channel = Features.Channel;
var CircleValve = Features.CircleValve;
var HollowChannel = Features.HollowChannel;

var createPort = function(position, radius1, radius2, height) {
    let port = new Features.Port({
        position: position,
        radius1: radius1,
        radius2: radius2,
        height: height
    });
    Registry.currentLayer.addFeature(port);
}
var manager;
var view;
var viewManager;
var grid;

paper.setup("c");

window.onload = function() {
    manager = new CanvasManager(document.getElementById("c"));
    view = new PaperView(document.getElementById("c"));
    viewManager = new ViewManager(view);
    grid = new AdaptiveGrid();
    grid.setColor(Colors.TEAL_100);


    Registry.viewManager = viewManager;

    if (!localStorage){
        manager.loadDeviceFromJSON(JSON.parse(Examples.example1));
    }
    else if (!localStorage.getItem('currentDevice')) {
        localStorage.setItem('currentDevice', Examples.example1);
    } else {
        try {
            manager.loadFromStorage();
        } catch (err) {
            localStorage.setItem('currentDevice', Examples.example1);
            manager.loadFromStorage();
        }
    }


    viewManager.updateGrid();
    Registry.currentDevice.updateView();

    window.dev = Registry.currentDevice;
    window.Channel = Channel;
    window.man = manager;
    window.Features = Features;
    window.Registry = Registry;
    window.Port = createPort;

    window.view = Registry.viewManager.view;

    Registry.threeRenderer = new ThreeDeviceRenderer(document.getElementById("renderContainer"));
    PageSetup.setupAppPage();

};