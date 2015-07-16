(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// to build me, run: watchify appSetup.js -t babelify -v --outfile "../../3DuFapp.js"
// from the src/app folder!

"use strict";

var paperFunctions = require("./paperFunctions");

paper.install(window);
paper.setup("c");

window.onload = function () {
    paperFunctions.setup();
    paperFunctions.channel([100, 100], [200, 200], 20);
};

document.getElementById("c").onmousewheel = function (event) {
    view.zoom = paperFunctions.changeZoom(view.zoom, event.wheelDelta);
    console.log(event.offsetX);
};

},{"./paperFunctions":2}],2:[function(require,module,exports){

// Keep global references to both tools, so the HTML
// links below can access them.
"use strict";

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
var forceHit = true;
var ctrl = false;
var vert;
var horiz;
var gridGroup;
var highlightGroup;
var intersectionGroup;
var background;

var hitOptions;
var view;

function setup() {

    view = paper.view;

    hitOptions = {
        stroke: true,
        ends: false,
        fill: false,
        segments: false,
        center: true,
        "class": Path,
        tolerance: 8
    };

    intersectionGroup = new Group();
    highlightGroup = new Group();
    gridGroup = new Group();

    background = new Path.Rectangle(view.bounds);
    //background.fillColor = 'grey';

    vert = new Symbol(vertGridLine());
    horiz = new Symbol(horizGridLine());

    makeGrid();

    view.update(true);

    tool1 = new Tool();
    tool1.onMouseDown = onMouseDown;
    tool1.onKeyDown = onKeyDown;
    tool1.onMouseMove = onMouseMove;

    tool1.onMouseDrag = function (event) {
        clearStroke();
        var target = targetHandler(event);
        current_stroke = makeChannel(start, target);
        current_stroke.insertBelow(intersectionGroup);
        current_stroke.selected = true;
    };

    tool1.onMouseUp = function (event) {
        strokes.push(current_stroke);
        strokeHistory.push([current_stroke.start.x, current_stroke.start.y, current_stroke.end.x, current_stroke.end.y]);
        saveStrokes();
        current_stroke.selected = false;
        start = null;
    };
}

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
    line.strokeColor = "lightblue";
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
    localStorage.setItem("strokes", JSON.stringify(strokeHistory));
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
        console.log("removing stroke");
    }
}

function XOR(bool1, bool2) {
    if (bool1 && !bool2 || bool2 && !bool1) {
        return true;
    } else {
        return false;
    }
}

function highlightTarget(target) {
    highlightGroup.removeChildren();
    var highlight = new Path.Circle(target, 15);
    highlight.fillColor = "purple";
    highlight.opacity = 0.5;
    highlight.parent = highlightGroup;
    highlight.removeOnMove();
}

function onMouseMove(event) {
    selectStroke(event);
    highlightTarget(targetHandler(event));
}

function getTarget(point, snap, sharp, hit) {
    var start = arguments[4] === undefined ? null : arguments[4];

    //first snap the target point to x/y if sharp corners are enforced
    if (start && sharp) {
        point = snapXY(start, point);
    }

    var hitResult = project.hitTest(point, hitOptions);

    if (!hitResult || !hit) {
        if (snap) {
            return snapToGrid(point, gridSize);
        } else {
            return point;
        }
    } else {
        if (snap) {
            var snapPoint = snapToGrid(point, gridSize);
            var snapResult = project.hitTest(snapPoint, hitOptions);
            if (snapResult) {
                return snapResult.point;
            } else {
                return hitResult.point;
            }
        } else {
            return hitResult.point;
        }
    }
}

function targetHandler(event) {
    var snapGrid = XOR(event.modifiers.control, forceSnap);
    var sharpCorners = XOR(event.modifiers.shift, forceSharpCorners);
    var hitStrokes = XOR(event.modifiers.option, forceHit);
    var point = event.point;
    return getTarget(point, snapGrid, sharpCorners, hitStrokes, start);
}

function onMouseDown(event) {
    start = targetHandler(event);
    if (current_stroke) {
        current_stroke.selected = false;
        current_stroke = null;
    }
}

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
            fillColor: "#009dec",
            parent: intersectionGroup
        }).removeOnMove();
    }
}

function clearStroke() {
    if (current_stroke) {
        current_stroke.remove();
    }
}

function channel(start, end, width) {
    var color = arguments[3] === undefined ? "purple" : arguments[3];

    start = new Point(start[0], start[1]);
    end = new Point(end[0], end[1]);
    var s = makeRoundedLine(start, end, width);
    var c1 = new Path.Circle(start, width / 2);
    var c2 = new Path.Circle(end, width / 2);
    var l = new makeGuideLine(start, end);
    var g = new Group([s, c1, c2, l]);
    g.start = start;
    g.end = end;
    g.fillColor = color;
    g.strokeColor = color;
    view.update(true);
    return g;
}

function makeChannel(start, end) {
    var s = makeRoundedLine(start, end, width);

    var c1 = new Path.Circle(start, cornerWidth);
    c1.fillColor = "black";
    var c2 = new Path.Circle(end, cornerWidth);
    c2.fillColor = "black";
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
    l.strokeColor = "none";
    return l;
}

function makeHollowLine(start, end) {
    var l1 = makeLine(start, end, width);
    var l2 = makeLine(start, end, width / 2);
    return new CompoundPath({
        children: [l1, l2],
        fillColor: "black"
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
        fillColor: "black"
    });
    rec.translate([0, -thickness / 2]);
    rec.rotate(vec.angle, start);
    return rec;
}

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

function changeZoom(oldZoom, delta) {
    var factor = 1.05;
    if (delta < 0) {
        return oldZoom * factor;
    }
    if (delta > 0) {
        return oldZoom / factor;
    }
    return oldZoom;
}

function changeZoomStable(oldZoom, delta, c, p) {
    var newZoom = changeZoom(oldZoom, delta);
    var beta = oldZoom / newZoom;
    var pc = p.subtract(c);
    var a = p.subtract(pc.multiply(beta)).subtract(c);
    return [newZoom, a];
}

function changeCenter(oldCenter, deltaX, deltaY, factor) {
    var offset = new paper.Point(deltaX, -deltaY);
    offset = offset.multiply(factor);
    oldCenter.add(offset);
}

exports.setup = setup;
exports.channel = channel;
exports.changeZoom = changeZoom;
exports.changeCenter = changeCenter;

},{}]},{},[1]);
