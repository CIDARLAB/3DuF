//watchify uFab_test.js -t babelify -v --outfile bundle.js
//watchify uFab_test2.js -t babelify -v --outfile ../../renderer/static/js/uFabApp.js

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
		width: .21
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
	},
	Port: { 
		height: .4,
		radius: .7
	}
}

var updateBuffer = function(){
	transposerParams.buffer = ex1.getValue();
	trans.refresh();
	//dev.render2D();
}

var ex1 = $('#ex1').slider({
	min: 0,
	max: 5,
	step: .1,
	value: .5
})
		.on('slide', updateBuffer)
		.data('slider');

var transposerParams = {
	position: [dev.width/2,dev.height],
	buffer: .5,
	flowLayer: flow,
	controlLayer: control
}

var transposerParams2 = {
	position: [dev.width/2 - 20,dev.height],
	buffer: .5,
	flowLayer: flow,
	controlLayer: control
}

dev.addLayer(flow);
dev.addLayer(control);

var updateParam = function(list, parent, child, value){
	list[parent][child] = Number(value);
	trans.refresh();
	trans2.refresh();
	//dev.render2D();
}

featureLoader.loadDefaultFeatures();

var trans = new Transposer(featureDefaults, transposerParams);
var trans2 = new Transposer(featureDefaults, transposerParams2);


//canvas.setDevice(dev);

updateBuffer();

var makeSliders = function(params, linker){
	for (var foo in params){
		var container = $("<div></div>").addClass("param-slider-container");
		var string = "<h5>" + foo + "</h5>";
		var label = $(string);
		label.appendTo(container);
		container.appendTo("#param-controls");
		for (var subparam in params[foo]){
			if (subparam != "height" && subparam != "radius2"){
				var subContainer = $("<div></div>").addClass("param-slider-subcontainer");
				var subString = "<h6>" + subparam + "<h6>";
				var subLabel = $(subString);
				var subSliderID = foo + subparam ;
				var subSlider = $("<div></div>");
				subSlider.attr('id', subSliderID);
				//console.log(subSlider);
				subLabel.appendTo(subContainer);
				subSlider.appendTo(subContainer);
				subContainer.appendTo(container);
				var sl = subSlider.noUiSlider({
					start:  params[foo][subparam],
					step: .1,
					range: {
						'min': .2,
						'max': 5
					}
				});
				linker[subSliderID] = {
					params: params,
					parent: foo,
					child: subparam
				}
				$("#" + subSliderID).on({
					slide: function(){
						var link = linker[this.id];
						updateParam(params, link.parent, link.child, getSliderValue(this.id));	
					},
					change: function(){
						var link = linker[this.id];
						updateParam(params, link.parent, link.child, getSliderValue(this.id));	
						}
					});
			}
		}
	}
}

var getSliderValue = function(id){
	return $("#" + id).val();
}

//$("<input id='test'/>").appendTo("#param-controls");

var links = {};

makeSliders(featureDefaults, links);

paper.install(window);

// Only executed our code once the DOM is ready.
window.onload = function() {
// Setup directly from canvas id:
		paper.setup('c');
		// Create a simple drawing tool:
		var tool = new Tool();
		var path;

		// Define a mousedown and mousedrag handler
		tool.onMouseDown = function(event) {
			path = new Path();
			path.strokeColor = 'black';
			path.add(event.point);
		}

		tool.onMouseDrag = function(event) {
			path.add(event.point);
		}
}

//dev.render2D();


