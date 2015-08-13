var Registry = require("./core/registry");
var Device = require('./core/device');
var Layer = require('./core/layer');
var PaperView = require("./view/paperView");
var ViewManager = require("./view/viewManager");
var AdaptiveGrid = require("./view/grid/adaptiveGrid");
var PageSetup = require("./view/pageSetup");
var Colors = require("./view/colors");
var ThreeDeviceRenderer = require("./view/render3D/ThreeDeviceRenderer");
var Examples = require("./examples/jsonExamples");

var view;
var viewManager;
var grid;

paper.setup("c");

window.onload = function() {
    view = new PaperView(document.getElementById("c"));
    viewManager = new ViewManager(view);
    grid = new AdaptiveGrid();
    grid.setColor(Colors.TEAL_100);


    Registry.viewManager = viewManager;

    viewManager.loadDeviceFromJSON(JSON.parse(Examples.example1));
    viewManager.updateGrid();
    Registry.currentDevice.updateView();

    window.dev = Registry.currentDevice;
    window.Registry = Registry;

    window.view = Registry.viewManager.view;

    Registry.threeRenderer = new ThreeDeviceRenderer(document.getElementById("renderContainer"));
    PageSetup.setupAppPage();

};