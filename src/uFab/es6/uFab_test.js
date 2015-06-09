//watchify uFab_test.js -t babelify -v --outfile bundle.js
//watchify uFab_test.js -t babelify -v --outfile ../../renderer/static/js/uFabApp.js

var uFab = require('./uFab');
var handlers = require('./handlers');
var featureLoader = require('./featureLoader');
var uFabCanvas = require('./uFabCanvas').uFabCanvas;
var Transposer = require('./transposerModule').Transposer;

document.getElementById('c').width = document.getElementById('canvas_block').clientWidth;
document.getElementById('c').height = document.getElementById('canvas_block').clientHeight;
var canvas = new uFabCanvas('c');

var Device = uFab.Device;
var Layer = uFab.Layer;

var dev = new Device({width: 75.8, height: 51, ID: "test_device"});
var flow = new Layer({z_offset: 0, color: "blue", ID: "flow"});
var control = new Layer({z_offset: 1.4, color: "red", ID: "control"});

var featureDefaults = {
	Channel: {
		height: .2,
		width: .41
	},
	PneumaticChannel: {
		height: .4,
		width: .4
	},
	Via: {
		height: 1,
		radius1: .8,
		radius2: .7
	},
	CircleValve: {
		height: .9,
		radius1: 1.4,
		radius2: 1.2
	}
}

var transposerParams = {
	position: [dev.width/2,dev.height/2],
	buffer: 1,
	flowLayer: flow,
	controlLayer: control
}

dev.addLayer(flow);
dev.addLayer(control);


featureLoader.loadDefaultFeatures();

var trans = new Transposer(featureDefaults, transposerParams);
/*
var up = [15,5];
var down = [15,25];
var left = [5, 15];
var right = [25, 15];
var mid = [15, 15];

var p1 = new Port({
	position: up,
	radius: 1,
	height: .4
});

var p2 = new Port({
	position: down,
	radius: 1,
	height: .4
})

var p3 = new Port({
	position: left,
	radius: 1,
	height: .4
})

var p4 = new Port({
	position: right,
	radius: 1,
	height: .4
})

var p5 = new Port({
	position: mid,
	radius: 1,
	height: .4
})

control.addFeature(p1);
control.addFeature(p2);
control.addFeature(p3);
control.addFeature(p4);
control.addFeature(p5);

var c1 = new Channel({
	start: up,
	end: down,
	width: .2, 
	height: .4
});

var c2 = new Channel({
	start: left,
	end: right,
	width: .2, 
	height: .4
});

flow.addFeature(c1);
control.addFeature(c2);

console.log(c2);
console.log(c1);

*/

canvas.setDevice(dev);

console.log()

/*
var valve = new CircleValve({
	position: [100, 50],
	radius1: 30,
	radius2: 40,
	height: 5});

var foo = new Port({
	position: [200,10],
	radius: 10,
	height: 5});

var bar = new Channel({
	start: [200, 50],
	end: [200, 30],
	height: 5,
	width: 20});

flow.addFeature(foo);
flow.addFeature(bar);
flow.addFeature(valve);

console.log(valve);

*/

dev.render2D();


