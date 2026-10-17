/**
 * Binary fan-out devices (TREE / YTREE / MUX / MUX3D) always size geometry
 * to the next power of two so out=3 keeps the same footprint as out=4.
 */

export const BINARY_BRANCH_MINTS = new Set(["TREE", "YTREE", "MUX", "MUX3D"]);

/** Smallest 2^k >= n (n clamped to >= 1). */
export function nextPowerOfTwo(n: number): number {
    const v = Math.max(1, Math.floor(Number(n) || 1));
    if (v <= 1) {
        return 1;
    }
    return Math.pow(2, Math.ceil(Math.log2(v)));
}

/**
 * Resolve leaf count the same way TREE/MUX historically did (max of in/out),
 * then pad up to 2^n for geometry and ports. Orientation is params.rotation;
 * do not add another 180° when in >= out.
 */
export function resolveBinaryLeafCount(params: { [k: string]: any }): {
    requested: number;
    leafs: number;
    roundedUp: boolean;
    /** Kept for callers. Drawing does not apply this; use params.rotation. */
    flip: boolean;
} {
    const ins = Math.max(1, Math.floor(Number(params.in) || 1));
    const outs = Math.max(1, Math.floor(Number(params.out) || 1));
    const useOuts = ins < outs;
    const requested = useOuts ? outs : ins;
    const leafs = nextPowerOfTwo(requested);
    return {
        requested,
        leafs,
        roundedUp: leafs !== requested,
        flip: !useOuts
    };
}
