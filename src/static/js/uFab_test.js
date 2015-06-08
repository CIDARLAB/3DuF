//watchify uFab_test.js -t babelify -v --outfile bundle.js

var uFab = require('./uFab');
var handlers = require('./handlers');
var featureLoader = require('./featureLoader');
var uFabCanvas = require('./uFabCanvas').uFabCanvas;

document.getElementById('c').width = document.getElementById('canvas_block').clientWidth;
document.getElementById('c').height = document.getElementById('canvas_block').clientHeight;
var canvas = new uFabCanvas('c');

var Device = uFab.Device;
var Layer = uFab.Layer;


var dev = new Device({height: 50, width: 100, ID: "test_device"});
dev.canvas = canvas;
var lay = new Layer({z_offset: 0, color: "blue", ID: "layer_1"});

dev.addLayer(lay);

featureLoader.loadDefaultFeatures();

var foo = new Port({
	position: [200,10],
	radius: 10,
	height: 5}, "black");

var bar = new Channel({
	start: [200, 50],
	end: [200, 30],
	height: 5,
	width: 20}, "blue");

lay.addFeature(foo);
lay.addFeature(bar);
/*

var foo = new fabric.Circle(
	{
		fill: 'black',
		radius: 100,
		top: 50,
		left: 50
	});
*/
foo.render2D();
bar.render2D();

/*

canvas.add(new fabric.Rect({
	left: 0,
	top: 0,
	width: 50,
	height: 50,
	fill: 'black'
}))

*/