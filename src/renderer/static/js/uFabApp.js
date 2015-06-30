(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//watchify uFab_test.js -t babelify -v --outfile bundle.js
//watchify uFab_test2.js -t babelify -v --outfile ../../renderer/static/js/uFabApp.js

/*

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

*/

'use strict';

paper.install(window);
// Keep global references to both tools, so the HTML
// links below can access them.
var tool1, tool2;
var start;
var current_stroke;
var width = 20;
var cornerWidth = width / 2;
var gridSize = 20;
var strokes = [];
var strokeHistory = [];
//console.log(strokeHistory);
var forceSnap = true;
var forceSharpCorners = false;
var ctrl = false;

var hitOptions = {
    stroke: true,
    ends: false,
    fill: false,
    segments: true,
    'class': Path,
    tolerance: 5
};

window.onload = function () {
    paper.setup('c');

    var intersectionGroup = new Group();
    var gridGroup = new Group();

    var background = new Path.Rectangle(view.bounds);
    //background.fillColor = 'grey';

    var vert = new Symbol(vertGridLine());
    var horiz = new Symbol(horizGridLine());

    makeGrid();

    function makeGrid() {
        vertGrid();
        horizGrid();
        gridGroup.insertBelow(intersectionGroup);
    }

    function vertGrid() {
        for (var i = 0; i < view.bounds.width; i += gridSize) {
            var p = new Point(i + gridSize / 2, view.bounds.height / 2);
            var s = vert.place(p);
            gridGroup.addChild(s);
        }
    }

    function horizGrid() {
        for (var i = 0; i < view.bounds.height; i += gridSize) {
            var p = new Point(view.bounds.width / 2, i + gridSize / 2);
            var s = horiz.place(p);
            gridGroup.addChild(s);
        }
    }

    // Create two drawing tools.
    // tool1 will draw straight lines,
    // tool2 will draw clouds.

    // Both share the mouseDown event:

    //loadStrokes();

    function gridLine(start, end) {
        var line = new Path.Line(start, end);
        line.strokeColor = 'lightblue';
        line.strokeWidth = 1;
        line.remove();
        line.guide = true;
        return line;
    }

    function vertGridLine() {
        return gridLine(view.bounds.bottomLeft, view.bounds.topLeft);
    }

    function horizGridLine() {
        return gridLine(view.bounds.topLeft, view.bounds.topRight);
    }

    function loadStrokes() {
        console.log(localStorage.strokes);
        strokeHistory = JSON.parse(localStorage.strokes);
        if (strokeHistory == null) {
            strokeHistory = [];
        }
        for (var stroke in strokeHistory) {
            st = strokeHistory[stroke];
            var sta = new Point(st[0], st[1]);
            var end = new Point(st[2], st[3]);
            var c = makeChannel(sta, end);
            strokes.push(c);
        }
    }

    function saveStrokes() {
        localStorage.setItem('strokes', JSON.stringify(strokeHistory));
        //console.log(localStorage.strokes);
    }

    function removeLastStroke() {
        var last;
        if (strokes.length > 1) {
            last = strokes.pop();
            strokeHistory.pop();
        } else if (strokes.length == 1) {
            last = strokes[0];
        }
        if (last) {
            last.remove();
        }
        saveStrokes();
    }

    function onKeyDown(event) {
        // When a key is pressed, set the content of the text item:
        if (event.key.charCodeAt(0) == 26) {
            removeLastStroke();
            console.log('removing stroke');
        }
    }

    function onMouseMove(event) {
        selectStroke(event);
        intersectionGroup.removeChildren();
        var res = project.hitTest(event.point, hitOptions);
        if (res && event.modifiers.shift) {
            console.log(res);
            var c = new Path.Circle(res.point, 20);
            c.fillColor = 'purple';
            c.parent = intersectionGroup;
            c.removeOnMove();
        }
    }

    function onMouseDown(event) {
        start = event.point;
        if (event.modifiers.control || forceSnap) {
            start = snapToGrid(start, gridSize);
        }
        if (current_stroke) {
            current_stroke.selected = false;
            current_stroke = null;
        }
    }

    tool1 = new Tool();
    tool1.onMouseDown = onMouseDown;
    tool1.onKeyDown = onKeyDown;
    tool1.onMouseMove = onMouseMove;

    function selectStroke(event) {
        project.activeLayer.selected = false;
        if (event.item && event.item != background) {
            event.item.selected = true;
        }
    }

    function hitTestAll(point) {
        var hitResult = project.hitTest(point, hitOptions);
        if (hitResult) {
            console.log(hitResult.type);
        }
    }

    function showIntersections(path1, path2) {
        var intersections = path1.getIntersections(path2);
        for (var i = 0; i < intersections.length; i++) {
            var c = new Path.Circle({
                center: intersections[i].point,
                radius: 5,
                fillColor: '#009dec',
                parent: intersectionGroup
            }).removeOnMove();
        }
    }

    tool1.onMouseDrag = function (event) {
        clearStroke();
        var target = event.point;

        if (event.modifiers.control || forceSnap) {
            target = snapToGrid(target, gridSize);
        }
        if (event.modifiers.shift || forceSharpCorners) {
            target = snapXY(start, target);
        }
        current_stroke = makeChannel(start, target);
        current_stroke.insertBelow(intersectionGroup);
        current_stroke.selected = true;
    };

    tool1.onMouseUp = function (event) {
        strokes.push(current_stroke);
        strokeHistory.push([current_stroke.start.x, current_stroke.start.y, current_stroke.end.x, current_stroke.end.y]);
        saveStrokes();
        current_stroke.selected = false;
    };

    function clearStroke() {
        if (current_stroke) {
            current_stroke.remove();
        }
    }

    function makeChannel(start, end) {
        var s = makeRoundedLine(start, end, width);

        var c1 = new Path.Circle(start, cornerWidth);
        c1.fillColor = 'black';
        var c2 = new Path.Circle(end, cornerWidth);
        c2.fillColor = 'black';
        var l = makeGuideLine(start, end);

        var g = new Group([s, c1, c2, l]);
        g.start = start;
        g.end = end;

        return g;
    }

    function snapToGrid(target, gridSize) {
        var newTarget = new Point();
        newTarget.x = Math.round(target.x / gridSize) * gridSize;
        newTarget.y = Math.round(target.y / gridSize) * gridSize;
        return newTarget;
    }

    function makeGuideLine(start, end) {
        var l = new Path.Line(start, end);
        l.strokeWidth = 1;
        l.strokeColor = 'none';
        return l;
    }

    function makeHollowLine(start, end) {
        var l1 = makeLine(start, end, width);
        var l2 = makeLine(start, end, width / 2);
        return new CompoundPath({
            children: [l1, l2],
            fillColor: 'black'
        });
    }

    function makeRoundedLine(start, end, thickness) {
        /*
        var l = new Path.Line(start, end);
        l.strokeColor = 'black';
        l.strokeWidth = width;
        return l;
        */
        var vec = end.subtract(start);
        var rec = new Path.Rectangle({
            size: [vec.length, thickness],
            point: start,
            fillColor: 'black'
        });
        rec.translate([0, -thickness / 2]);
        rec.rotate(vec.angle, start);
        return rec;
    }
};

function snapXY(start, end) {
    var vec = start.subtract(end);
    if (Math.abs(vec.x) > Math.abs(vec.y)) {
        vec.y = 0;
    } else {
        vec.x = 0;
    }
    return start.subtract(vec);

    //loadStrokes()
}

},{}]},{},[1]);
