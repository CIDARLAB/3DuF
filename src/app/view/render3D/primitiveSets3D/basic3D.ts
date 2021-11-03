import * as THREE from "three";
import mergeGeometries from "../threeUtils";
const CONE_SEGMENTS = 16;

export function TwoPointRoundedLineFeature(params: { [k: string]: any }, flip: boolean, z_offset: number) {
    const start = params.start;
    const end = params.end;
    const width = params.width;
    const height = params.height;
    const box = TwoPointRoundedLine({
        start: start,
        end: end,
        width: width,
        height: height
    });
    const matrix = new THREE.Matrix4();

    if (flip) {
        box.applyMatrix(matrix.makeTranslation(0, 0, -height));
    }
    box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return box;
}

export function EdgedBoxFeature(params: { [k: string]: any }, flip: boolean, z_offset: number) {
    const position = params.position;
    const width = params.width;
    const length = params.length;
    const start = [position[0] - width / 2, position[1] - width / 2];
    const end = [start[0] + width, start[1] + length];
    const borderWidth = 0;
    const height = params.height;
    const box = TwoPointRoundedBox({
        start: start,
        end: end,
        borderWidth: borderWidth,
        height: height
    });
    const matrix = new THREE.Matrix4();
    if (flip) {
        box.applyMatrix(matrix.makeTranslation(0, 0, -height));
    }
    box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return box;
}

export function TwoPointRoundedBoxFeature(params: { [k: string]: any }, flip: boolean, z_offset: number) {
    const start = params.start;
    const end = params.end;
    const borderWidth = params.borderWidth;
    const height = params.height;
    const box = TwoPointRoundedBox({
        start: start,
        end: end,
        borderWidth: borderWidth,
        height: height
    });
    const matrix = new THREE.Matrix4();
    if (flip) {
        box.applyMatrix(matrix.makeTranslation(0, 0, -height));
    }
    box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return box;
}

export function Cone(params: { [k: string]: any }) {
    const position = params.position;
    const radius1 = params.radius1;
    const radius2 = params.radius2;
    const height = params.height;
    const cyl = new THREE.CylinderGeometry(radius2, radius1, height, CONE_SEGMENTS);
    const matrix = new THREE.Matrix4();
    cyl.applyMatrix(matrix.makeRotationX(Math.PI / 2));
    cyl.applyMatrix(matrix.makeTranslation(position[0], position[1], height / 2));
    return cyl;
}

export function TwoPointLine(params: { [k: string]: any }) {
    const start = params.start;
    const end = params.end;
    const width = params.width;
    const height = params.height;
    const dX = end[0] - start[0];
    const dY = end[1] - start[1];
    const boxAngle = Math.atan2(dY, dX);
    const dXPow = Math.pow(dX, 2);
    const dYPow = Math.pow(dY, 2);
    const length = Math.sqrt(dXPow + dYPow);
    const box = new THREE.BoxGeometry(length, width, height);
    const matrix = new THREE.Matrix4();
    box.applyMatrix(matrix.makeRotationZ(boxAngle));
    box.applyMatrix(matrix.makeTranslation(start[0], start[1], height / 2));
    box.applyMatrix(matrix.makeTranslation(dX / 2, dY / 2, 0));
    return box;
}

export function TwoPointRoundedBox(params: { [k: string]: any }) {
    const start = params.start;
    const end = params.end;
    const borderWidth = params.borderWidth;
    const height = params.height;
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

    const w = endX - startX;
    const h = endY - startY;
    const bottomLeft = [startX, startY];
    const bottomRight = [endX, startY];
    const topLeft = [startX, endY];
    const topRight = [endX, endY];

    const core = new THREE.BoxGeometry(w, h, height);
    const matrix = new THREE.Matrix4();
    core.applyMatrix(matrix.makeTranslation(w / 2, h / 2, height / 2));
    core.applyMatrix(matrix.makeTranslation(bottomLeft[0], bottomLeft[1], 0));
    const left = TwoPointRoundedLine({
        start: bottomLeft,
        end: topLeft,
        width: borderWidth,
        height: height
    });
    const top = TwoPointRoundedLine({
        start: topLeft,
        end: topRight,
        width: borderWidth,
        height: height
    });
    const right = TwoPointRoundedLine({
        start: topRight,
        end: bottomRight,
        width: borderWidth,
        height: height
    });
    const down = TwoPointRoundedLine({
        start: bottomRight,
        end: bottomLeft,
        width: borderWidth,
        height: height
    });
    const geom = mergeGeometries([core, left, top, right, down]);
    return geom;
}

export function ConeFeature(params: { [k: string]: any }, flip: boolean, z_offset: number) {
    const position = params.position;
    const radius1 = params.radius1;
    const radius2 = params.radius2;
    const height = params.height;
    const cone = Cone({
        position: position,
        radius1: radius1,
        radius2: radius2,
        height: height
    });
    const matrix = new THREE.Matrix4();
    if (flip) {
        cone.applyMatrix(matrix.makeRotationX(Math.PI));
        cone.applyMatrix(matrix.makeTranslation(0, position[1] * 2, 0));
    }
    cone.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
    return cone;
}

export function TwoPointRoundedLine(params: { [k: string]: any }) {
    const start = params.start;
    const end = params.end;
    const width = params.width;
    const height = params.height;
    const box = TwoPointLine({
        start: start,
        end: end,
        width: width,
        height: height
    });
    const cone1 = Cone({
        position: start,
        radius1: width / 2,
        radius2: width / 2,
        height: height
    });
    const cone2 = Cone({
        position: end,
        radius1: width / 2,
        radius2: width / 2,
        height: height
    });
    const merged = mergeGeometries([box, cone1, cone2]);
    return merged;
}
