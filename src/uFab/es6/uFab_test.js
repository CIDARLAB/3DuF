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
		radius2: 1.2,

	}
}

var updateBuffer = function(){
	transposerParams.buffer = ex1.getValue();
	trans.refresh();
	dev.render2D();
	console.log(dev);
}

var ex1 = $('#ex1').slider({
	min: 0,
	max: 5,
	step: .1,
	value: 1
})
		.on('slide', updateBuffer)
		.data('slider');

var transposerParams = {
	position: [dev.width/2,dev.height],
	buffer: .5,
	flowLayer: flow,
	controlLayer: control
}

dev.addLayer(flow);
dev.addLayer(control);


featureLoader.loadDefaultFeatures();

var trans = new Transposer(featureDefaults, transposerParams);



canvas.setDevice(dev);

dev.render2D();


