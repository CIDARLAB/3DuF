var CanvasManager = require("./graphics/CanvasManager");
//var CanvasManager = require("./graphics/CanvasManager");
var Registry = require("./core/registry");
var Device = require('./core/device');
var Layer = require('./core/layer');
var Features = require('./core/features');

var Channel = Features.Channel;
var CircleValve = Features.CircleValve;
var HollowChannel = Features.HollowChannel;

var manager;

var dev = new Device({
    "width": 75.8 * 1000,
    "height": 51 * 1000
    }, "My Device");
var flow = new Layer({
    "z_offset": 0,
    "flip": false
}, "flow");
var control = new Layer({
    "z_offset": 1.2 * 1000,
    "flip": true
}, "control");
dev.addLayer(flow);
dev.addLayer(control);
var chan1 = new Channel({
    "start": [20 * 1000, 20 * 1000],
    "end": [40 * 1000, 40 * 1000],
    "width": .4 * 1000
});
flow.addFeature(chan1);
var circ1 = new CircleValve({
    "position": [30 * 1000,30 * 1000],
    "radius1": .8 * 1000
});
control.addFeature(circ1);
var chan2 = new Channel({
    "start": [25 * 1000, 20 * 1000],
    "end": [45*1000, 40*1000],
    "width": 10
});
flow.addFeature(chan2);

Registry.currentDevice = dev;
Registry.currentLayer = dev.layers[0];

paper.setup("c");

window.onload = function(){
    manager = new CanvasManager(document.getElementById("c"));
    manager.render();

    window.dev = dev;
    window.Channel = Channel;
    window.man = manager;
    window.Features = Features;
    window.Registry = Registry;
    let canvas = document.getElementById("c");
    paper.view.center = new paper.Point(30 * 1000, 30 * 1000);
    manager.setZoom(.04);
    manager.updateGridSpacing();
};

/*

var paperFunctions = require("./paperFunctions");

paper.install(window);
paper.setup("c");

window.onload = function(){
    paperFunctions.setup()
    //paperFunctions.channel([100,100],[200,200],20);
};

document.getElementById("c").onmousewheel = function(event){
    view.zoom = paperFunctions.changeZoom(view.zoom, event.wheelDelta);
    console.log(event.offsetX);
}



*/