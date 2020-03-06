import * as THREE from "three";
import mergeGeometries from "../threeUtils";
var CONE_SEGMENTS = 16;

export function TwoPointRoundedLineFeature(params, flip, z_offset) {
    let start = params.start;
    let end = params.end;
    let width = params.width;
    let height = params.height;
    var box = TwoPointRoundedLine({
        start: start,
        end: end,
        width: width,
        height: height
    });
    var matrix = new THREE.Matrix4();

    if (flip) {
        box.applyMatrix(matrix.makeTranslation(0, 0, -height));
    }
    box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return box;
}

export function EdgedBoxFeature(params, flip, z_offset) {
    var position = params.position;
    var width = params.width;
    var length = params.length;
    let start = [position[0] - width / 2, position[1] - width / 2];
    let end = [start[0] + width, start[1] + length];
    let borderWidth = 0;
    let height = params.height;
    var box = TwoPointRoundedBox({
        start: start,
        end: end,
        borderWidth: borderWidth,
        height: height
    });
    var matrix = new THREE.Matrix4();
    if (flip) {
        box.applyMatrix(matrix.makeTranslation(0, 0, -height));
    }
    box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return box;
}

export function TwoPointRoundedBoxFeature(params, flip, z_offset) {
    let start = params.start;
    let end = params.end;
    let borderWidth = params.borderWidth;
    let height = params.height;
    var box = TwoPointRoundedBox({
        start: start,
        end: end,
        borderWidth: borderWidth,
        height: height
    });
    var matrix = new THREE.Matrix4();
    if (flip) {
        box.applyMatrix(matrix.makeTranslation(0, 0, -height));
    }
    box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return box;
}

export function Cone(params) {
    let position = params.position;
    let radius1 = params.radius1;
    let radius2 = params.radius2;
    let height = params.height;
    var cyl = new THREE.CylinderGeometry(radius2, radius1, height, CONE_SEGMENTS);
    var matrix = new THREE.Matrix4();
    cyl.applyMatrix(matrix.makeRotationX(Math.PI / 2));
    cyl.applyMatrix(matrix.makeTranslation(position[0], position[1], height / 2));
    return cyl;
}

export function TwoPointLine(params) {
    let start = params.start;
    let end = params.end;
    let width = params.width;
    let height = params.height;
    var dX = end[0] - start[0];
    var dY = end[1] - start[1];
    var boxAngle = Math.atan2(dY, dX);
    var dXPow = Math.pow(dX, 2);
    var dYPow = Math.pow(dY, 2);
    var length = Math.sqrt(dXPow + dYPow);
    var box = new THREE.BoxGeometry(length, width, height);
    var matrix = new THREE.Matrix4();
    box.applyMatrix(matrix.makeRotationZ(boxAngle));
    box.applyMatrix(matrix.makeTranslation(start[0], start[1], height / 2));
    box.applyMatrix(matrix.makeTranslation(dX / 2, dY / 2, 0));
    return box;
}

export function TwoPointRoundedBox(params) {
    let start = params.start;
    let end = params.end;
    let borderWidth = params.borderWidth;
    let height = params.height;
    let startX;
    let startY;
    let endX;
    let endY;

    if (start[0] < end[0]) {
        startX = start[0];
        endX = end[0];
    } else {
        startX = end[0];
        endX = start[0];
    }
    if (start[1] < end[1]) {
        startY = start[1];
        endY = end[1];
    } else {
        startY = end[1];
        endY = start[1];
    }

    let w = endX - startX;
    let h = endY - startY;
    let bottomLeft = [startX, startY];
    let bottomRight = [endX, startY];
    let topLeft = [startX, endY];
    let topRight = [endX, endY];

    var core = new THREE.BoxGeometry(w, h, height);
    var matrix = new THREE.Matrix4();
    core.applyMatrix(matrix.makeTranslation(w / 2, h / 2, height / 2));
    core.applyMatrix(matrix.makeTranslation(bottomLeft[0], bottomLeft[1], 0));
    var left = TwoPointRoundedLine({
        start: bottomLeft,
        end: topLeft,
        width: borderWidth,
        height: height
    });
    var top = TwoPointRoundedLine({
        start: topLeft,
        end: topRight,
        width: borderWidth,
        height: height
    });
    var right = TwoPointRoundedLine({
        start: topRight,
        end: bottomRight,
        width: borderWidth,
        height: height
    });
    var down = TwoPointRoundedLine({
        start: bottomRight,
        end: bottomLeft,
        width: borderWidth,
        height: height
    });
    let geom = mergeGeometries([core, left, top, right, down]);
    return geom;
}

export function ConeFeature(params, flip, z_offset) {
    let position = params.position;
    let radius1 = params.radius1;
    let radius2 = params.radius2;
    let height = params.height;
    var cone = Cone({
        position: position,
        radius1: radius1,
        radius2: radius2,
        height: height
    });
    var matrix = new THREE.Matrix4();
    if (flip) {
        cone.applyMatrix(matrix.makeRotationX(Math.PI));
        cone.applyMatrix(matrix.makeTranslation(0, position[1] * 2, 0));
    }
    cone.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return cone;
}

export function TwoPointRoundedLine(params) {
    let start = params.start;
    let end = params.end;
    let width = params.width;
    let height = params.height;
    var box = TwoPointLine({
        start: start,
        end: end,
        width: width,
        height: height
    });
    var cone1 = Cone({
        position: start,
        radius1: width / 2,
        radius2: width / 2,
        height: height
    });
    var cone2 = Cone({
        position: end,
        radius1: width / 2,
        radius2: width / 2,
        height: height
    });
    var merged = mergeGeometries([box, cone1, cone2]);
    return merged;
}
