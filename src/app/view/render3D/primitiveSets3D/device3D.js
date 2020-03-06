import * as THREE from "three";
import * as Basic3D from "./basic3D";
import * as ThreeUtils from "../threeUtils";
var TwoPointRoundedLine = Basic3D.TwoPointRoundedLine;
var mergeGeometries = ThreeUtils.mergeGeometries;

var HOLDER_BORDER_WIDTH = 0.41;
var INTERLOCK_TOLERANCE = 0.125;
var SLIDE_THICKNESS = 1.2;

export function Slide(params) {
    let width = params.width;
    let height = params.height;
    let thickness = params.thickness;
    var slide = new THREE.BoxGeometry(width, height, thickness);
    var matrix = new THREE.Matrix4();
    slide.applyMatrix(matrix.makeTranslation(width / 2, height / 2, thickness / 2));
    return slide;
}

export function SlideHolder(params) {
    let width = params.width;
    let height = params.height;
    let slideThickness = params.slideThickness;
    let borderWidth = params.borderWidth;
    let interlock = params.interlock;
    var w = borderWidth;
    var i = interlock;
    var h = slideThickness;
    var bottomLeft = [-w / 2 - i, -w / 2 - i];
    var topLeft = [-w / 2 - i, height + w / 2 + i];
    var topRight = [width + w / 2 + i, height + w / 2 + i];
    var bottomRight = [width + w / 2 + i, -w / 2 - i];
    var leftBar = TwoPointRoundedLine({
        start: bottomLeft,
        end: topLeft,
        width: w,
        height: h
    });
    var topBar = TwoPointRoundedLine({
        start: topLeft,
        end: topRight,
        width: w,
        height: h
    });

    var rightBar = TwoPointRoundedLine({
        start: topRight,
        end: bottomRight,
        width: w,
        height: h
    });

    var bottomBar = TwoPointRoundedLine({
        start: bottomRight,
        end: bottomLeft,
        width: w,
        height: h
    });

    var border = mergeGeometries([leftBar, topBar, rightBar, bottomBar]);
    return border;
}

export function DevicePlane(params) {
    let width = params.width;
    let height = params.height;
    var plane = new THREE.PlaneBufferGeometry(width, height);
    var matrix = new THREE.Matrix4();
    plane.applyMatrix(matrix.makeTranslation(width / 2, height / 2, 0));
    return plane;
}
