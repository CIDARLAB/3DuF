/* Returns the the radian value of the specified degrees in the range of (-PI, PI] */
export function degToRad(degrees: number) {
    const res = (degrees / 180) * Math.PI;
    return res;
}

/* Returns the radian value of the specified radians in the range of [0,360), to a precision of four decimal places. */
export function radToDeg(radians: number) {
    const res = (radians * 180) / Math.PI;
    return res;
}

export function computeAngleFromPoints(start: number[], end: number[]) {
    const dX = end[0] - start[0];
    const dY = end[1] - start[1];
    return computeAngle(dX, dY);
}

export function computeAngle(dX: number, dY: number) {
    return radToDeg(Math.atan2(dY, dX));
}

export function computeDistanceBetweenPoints(start: number[], end: number[]) {
    return computeDistance(end[0] - start[0], end[1] - start[1]);
}

export function computeDistance(dX: number, dY: number) {
    return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
}

export function computeEndPoint(start: number[], angle: number, length: string | number) {
    length = parseFloat(length as string);
    const rad = degToRad(angle);
    const dX = length * Math.cos(rad);
    const dY = length * Math.sin(rad);
    return [start[0] + dX, start[1] + dY];
}
