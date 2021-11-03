import * as THREE from "three";
import * as Basic3D from "./basic3D";
import * as ThreeUtils from "../threeUtils";
const TwoPointRoundedLine = Basic3D.TwoPointRoundedLine;
const mergeGeometries = ThreeUtils.mergeGeometries;

const HOLDER_BORDER_WIDTH = 0.41;
const INTERLOCK_TOLERANCE = 0.125;
const SLIDE_THICKNESS = 1.2;

export function Slide(params: { [k: string]: any }) {
    const width = params.width;
    const height = params.height;
    const thickness = params.thickness;
    const slide = new THREE.BoxGeometry(width, height, thickness);
    const matrix = new THREE.Matrix4();
    slide.applyMatrix(matrix.makeTranslation(width / 2, height / 2, thickness / 2));
    return slide;
}

export function SlideHolder(params: { [k: string]: any }) {
    const width = params.width;
    const height = params.height;
    const slideThickness = params.slideThickness;
    const borderWidth = params.borderWidth;
    const interlock = params.interlock;
    const w = borderWidth;
    const i = interlock;
    const h = slideThickness;
    const bottomLeft = [-w / 2 - i, -w / 2 - i];
    const topLeft = [-w / 2 - i, height + w / 2 + i];
    const topRight = [width + w / 2 + i, height + w / 2 + i];
    const bottomRight = [width + w / 2 + i, -w / 2 - i];
    const leftBar = TwoPointRoundedLine({
        start: bottomLeft,
        end: topLeft,
        width: w,
        height: h
    });
    const topBar = TwoPointRoundedLine({
        start: topLeft,
        end: topRight,
        width: w,
        height: h
    });

    const rightBar = TwoPointRoundedLine({
        start: topRight,
        end: bottomRight,
        width: w,
        height: h
    });

    const bottomBar = TwoPointRoundedLine({
        start: bottomRight,
        end: bottomLeft,
        width: w,
        height: h
    });

    const border = mergeGeometries([leftBar, topBar, rightBar, bottomBar]);
    return border;
}

export function DevicePlane(params: { [k: string]: any }) {
    const width = params.width;
    const height = params.height;
    const plane = new THREE.PlaneBufferGeometry(width, height);
    const matrix = new THREE.Matrix4();
    plane.applyMatrix(matrix.makeTranslation(width / 2, height / 2, 0));
    return plane;
}
