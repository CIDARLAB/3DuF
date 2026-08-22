import { Segment } from "@/app/core/init";

/**
 * VALVE3D FLOW cutout: in the valve's local frame this is the same rectangle
 * subtracted from the circle to form the two crescents
 * (|x| <= valveRadius, |y| <= gap/2), then rotated by ``rotation`` (paper.js).
 */
export type ValveGapRect = {
    cx: number;
    cy: number;
    radius: number;
    gap: number;
    rotation: number;
};

const EPS = 1e-9;
const MIN_SEGMENT_UM = 1;

function toLocal(x: number, y: number, g: ValveGapRect): [number, number] {
    const rad = (g.rotation * Math.PI) / 180;
    const dx = x - g.cx;
    const dy = y - g.cy;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [dx * c + dy * s, -dx * s + dy * c];
}

function fromLocal(lx: number, ly: number, g: ValveGapRect): [number, number] {
    const rad = (g.rotation * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [g.cx + lx * c - ly * s, g.cy + lx * s + ly * c];
}

function dist(a: [number, number], b: [number, number]): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.hypot(dx, dy);
}

/**
 * Liang–Barsky: parameter interval of the line p(t)=a+t*(b-a), t in [0,1],
 * that lies inside the axis-aligned box. Null if the segment misses the box.
 */
function liangBarskyInside(
    a: [number, number],
    b: [number, number],
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number
): [number, number] | null {
    let t0 = 0;
    let t1 = 1;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const p = [-dx, dx, -dy, dy];
    const q = [a[0] - xmin, xmax - a[0], a[1] - ymin, ymax - a[1]];
    for (let i = 0; i < 4; i++) {
        if (Math.abs(p[i]) < EPS) {
            if (q[i] < 0) {
                return null;
            }
            continue;
        }
        const r = q[i] / p[i];
        if (p[i] < 0) {
            if (r > t1) {
                return null;
            }
            if (r > t0) {
                t0 = r;
            }
        } else {
            if (r < t0) {
                return null;
            }
            if (r < t1) {
                t1 = r;
            }
        }
    }
    if (t0 > t1) {
        return null;
    }
    return [t0, t1];
}

function splitSegmentByValveGap(seg: Segment, g: ValveGapRect): Segment[] {
    if (!seg || seg.length < 2 || !seg[0] || !seg[1]) {
        return [];
    }
    const start: [number, number] = [Number(seg[0][0]), Number(seg[0][1])];
    const end: [number, number] = [Number(seg[1][0]), Number(seg[1][1])];
    if (!Number.isFinite(start[0]) || !Number.isFinite(start[1]) || !Number.isFinite(end[0]) || !Number.isFinite(end[1])) {
        return [];
    }
    if (dist(start, end) < MIN_SEGMENT_UM) {
        return [];
    }

    const a = toLocal(start[0], start[1], g);
    const b = toLocal(end[0], end[1], g);
    const inside = liangBarskyInside(a, b, -g.radius, g.radius, -g.gap / 2, g.gap / 2);
    if (!inside) {
        return [seg];
    }

    const [t0, t1] = inside;
    const lerp = (t: number): [number, number] => {
        const lx = a[0] + t * (b[0] - a[0]);
        const ly = a[1] + t * (b[1] - a[1]);
        return fromLocal(lx, ly, g);
    };

    const out: Segment[] = [];
    if (t0 > EPS) {
        const p = lerp(t0);
        if (dist(start, p) >= MIN_SEGMENT_UM) {
            out.push([start, p]);
        }
    }
    if (t1 < 1 - EPS) {
        const p = lerp(t1);
        if (dist(p, end) >= MIN_SEGMENT_UM) {
            out.push([p, end]);
        }
    }
    return out;
}

/**
 * Remove the portion of each centerline segment that sits in a VALVE3D FLOW gap.
 * Stubs on both sides of the valve are kept; the gap itself is not drawn.
 */
export function clipSegmentsByValveGaps(segments: Segment[], gaps: ValveGapRect[]): Segment[] {
    if (!Array.isArray(segments) || segments.length === 0 || !Array.isArray(gaps) || gaps.length === 0) {
        return Array.isArray(segments) ? segments.slice() : [];
    }
    let current: Segment[] = segments.slice();
    for (const g of gaps) {
        if (!g || !Number.isFinite(g.cx) || !Number.isFinite(g.cy) || !Number.isFinite(g.radius) || g.radius <= 0) {
            continue;
        }
        if (!Number.isFinite(g.gap) || g.gap <= 0) {
            continue;
        }
        const next: Segment[] = [];
        for (const seg of current) {
            next.push(...splitSegmentByValveGap(seg, g));
        }
        current = next;
    }
    return current;
}

export function valveGapRectFromValues(
    position: number[] | undefined,
    radius: unknown,
    gap: unknown,
    rotation: unknown
): ValveGapRect | null {
    if (!position || position.length < 2) {
        return null;
    }
    const cx = Number(position[0]);
    const cy = Number(position[1]);
    const r = Number(radius);
    const g = Number(gap);
    const rot = Number(rotation);
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r) || r <= 0 || !Number.isFinite(g) || g <= 0) {
        return null;
    }
    return {
        cx,
        cy,
        radius: r,
        gap: g,
        rotation: Number.isFinite(rot) ? rot : 0
    };
}
