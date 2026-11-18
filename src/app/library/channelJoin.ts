/**
 * Constant-width square-channel outline.
 *
 * Each segment is a rectangle that used to stop on the centerline, so a bend
 * left a gap on the outside and an axis-aligned square patched only the 90°
 * case — at any other angle that square stuck out past the walls.
 *
 * Right-angle corners stay a sharp miter (same outer corner as the old
 * square patch). Every other corner is a round join of radius half the
 * channel width, so the two walls meet on an arc.
 */

export type ChannelPoint = [number, number];

const RIGHT_ANGLE = Math.PI / 2;
const RIGHT_ANGLE_TOLERANCE = (8 * Math.PI) / 180;
const ARC_STEP = Math.PI / 18;
const MITER_LIMIT = 3;

interface DirectedSegment {
    a: ChannelPoint;
    b: ChannelPoint;
    ux: number;
    uy: number;
    lx: number;
    ly: number;
}

function finitePoint(value: unknown): ChannelPoint | null {
    if (!Array.isArray(value) || value.length < 2) {
        return null;
    }
    const x = Number(value[0]);
    const y = Number(value[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
    }
    return [x, y];
}

function dedupe(points: ChannelPoint[]): ChannelPoint[] {
    const out: ChannelPoint[] = [];
    for (const point of points) {
        const prev = out[out.length - 1];
        if (prev && Math.hypot(prev[0] - point[0], prev[1] - point[1]) < 1e-4) {
            continue;
        }
        out.push(point);
    }
    return out;
}

function directedSegments(points: ChannelPoint[]): DirectedSegment[] {
    const segs: DirectedSegment[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy);
        if (len < 1e-6) {
            continue;
        }
        const ux = dx / len;
        const uy = dy / len;
        segs.push({ a, b, ux, uy, lx: -uy, ly: ux });
    }
    return segs;
}

function offsetAt(point: ChannelPoint, seg: DirectedSegment, side: 1 | -1, half: number): ChannelPoint {
    return [point[0] + seg.lx * side * half, point[1] + seg.ly * side * half];
}

function miterPoint(joint: ChannelPoint, prev: DirectedSegment, next: DirectedSegment, side: 1 | -1, half: number): ChannelPoint | null {
    const p0 = offsetAt(joint, prev, side, half);
    const p1 = offsetAt(joint, next, side, half);
    const det = prev.ux * next.uy - prev.uy * next.ux;
    if (Math.abs(det) < 1e-12) {
        return p0;
    }
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const t = (dx * next.uy - dy * next.ux) / det;
    const point: ChannelPoint = [p0[0] + prev.ux * t, p0[1] + prev.uy * t];
    if (Math.hypot(point[0] - joint[0], point[1] - joint[1]) > half * MITER_LIMIT) {
        return null;
    }
    return point;
}

function shortSweep(from: ChannelPoint, to: ChannelPoint, center: ChannelPoint, ccw: boolean): number {
    const a0 = Math.atan2(from[1] - center[1], from[0] - center[0]);
    const a1 = Math.atan2(to[1] - center[1], to[0] - center[0]);
    let sweep = a1 - a0;
    while (sweep <= -Math.PI) {
        sweep += Math.PI * 2;
    }
    while (sweep > Math.PI) {
        sweep -= Math.PI * 2;
    }
    if (ccw && sweep < 0) {
        sweep += Math.PI * 2;
    }
    if (!ccw && sweep > 0) {
        sweep -= Math.PI * 2;
    }
    return sweep;
}

function arcPoints(center: ChannelPoint, from: ChannelPoint, to: ChannelPoint, half: number, ccw: boolean): ChannelPoint[] {
    const a0 = Math.atan2(from[1] - center[1], from[0] - center[0]);
    const sweep = shortSweep(from, to, center, ccw);
    const steps = Math.max(1, Math.ceil(Math.abs(sweep) / ARC_STEP));
    const points: ChannelPoint[] = [];
    for (let i = 1; i < steps; i++) {
        const angle = a0 + sweep * (i / steps);
        points.push([center[0] + Math.cos(angle) * half, center[1] + Math.sin(angle) * half]);
    }
    return points;
}

/**
 * Points inserted between the incoming and outgoing offset, ending at the
 * outgoing offset so the next wall can continue from there.
 */
function joinSide(joint: ChannelPoint, prev: DirectedSegment, next: DirectedSegment, side: 1 | -1, half: number): ChannelPoint[] {
    const incoming = offsetAt(joint, prev, side, half);
    const outgoing = offsetAt(joint, next, side, half);
    const turn = prev.ux * next.uy - prev.uy * next.ux;
    const align = prev.ux * next.ux + prev.uy * next.uy;
    if (Math.hypot(incoming[0] - outgoing[0], incoming[1] - outgoing[1]) < 1e-4) {
        return [outgoing];
    }
    const deflection = Math.atan2(turn, align);
    const inner = side === 1 ? turn > 0 : turn < 0;
    const nearRightAngle = Math.abs(Math.abs(deflection) - RIGHT_ANGLE) <= RIGHT_ANGLE_TOLERANCE;
    if (inner || nearRightAngle || Math.abs(turn) < 1e-8) {
        const miter = miterPoint(joint, prev, next, side, half);
        if (!miter) {
            return [incoming, outgoing];
        }
        // The miter already lies on the next wall, so the chain continues
        // from it. Including `outgoing` would detour out to the end face.
        return [miter];
    }
    // Outer side of a non-right-angle bend: short arc of radius `half`.
    // A left (CCW) turn puts the arc on the right side and walks CCW.
    const ccw = turn > 0;
    return [incoming, ...arcPoints(joint, incoming, outgoing, half, ccw), outgoing];
}

function sideChain(segs: DirectedSegment[], side: 1 | -1, half: number): ChannelPoint[] {
    const chain: ChannelPoint[] = [offsetAt(segs[0].a, segs[0], side, half)];
    for (let i = 0; i < segs.length; i++) {
        if (i < segs.length - 1) {
            chain.push(...joinSide(segs[i].b, segs[i], segs[i + 1], side, half));
        } else {
            chain.push(offsetAt(segs[i].b, segs[i], side, half));
        }
    }
    return dedupe(chain);
}

export interface ChannelWalls {
    left: ChannelPoint[];
    right: ChannelPoint[];
}

/**
 * Open wall polylines. A straight run is two parallel lines; bends are
 * mitered or filleted so the exported walls meet.
 */
export function squareChannelWalls(points: ChannelPoint[], channelWidth: number): ChannelWalls | null {
    if (!(channelWidth > 0)) {
        return null;
    }
    const segs = directedSegments(dedupe(points));
    if (segs.length === 0) {
        return null;
    }
    const half = channelWidth / 2;
    return {
        left: sideChain(segs, 1, half),
        right: sideChain(segs, -1, half)
    };
}

/** Closed outline, left wall then the right wall back to the start. */
export function squareChannelOutline(points: ChannelPoint[], channelWidth: number): ChannelPoint[] {
    const walls = squareChannelWalls(points, channelWidth);
    if (!walls) {
        return [];
    }
    return dedupe([...walls.left, ...walls.right.slice().reverse()]);
}

/**
 * Split a segment list into centerlines that actually touch.
 * Valve gaps leave the runs separate so the join does not bridge them.
 */
export function contiguousCenterlines(segments: Array<[unknown, unknown]>): ChannelPoint[][] {
    const runs: ChannelPoint[][] = [];
    for (const segment of segments) {
        if (!segment || segment.length < 2) {
            continue;
        }
        const start = finitePoint(segment[0]);
        const end = finitePoint(segment[1]);
        if (!start || !end || Math.hypot(end[0] - start[0], end[1] - start[1]) < 1e-6) {
            continue;
        }
        const last = runs[runs.length - 1];
        const prev = last && last[last.length - 1];
        if (prev && Math.hypot(prev[0] - start[0], prev[1] - start[1]) < 0.5) {
            last.push(end);
        } else {
            runs.push([start, end]);
        }
    }
    return runs;
}
