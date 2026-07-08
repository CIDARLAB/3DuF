/**
 * Structured representation of microfluidic DXF sketches (Fusion / SolidWorks style).
 * Coordinates are in millimeters, matching the source DXF files.
 */

export type DxfPoint3 = { x: number; y: number; z: number };

export type DxfLineSeg = {
    a: DxfPoint3;
    b: DxfPoint3;
    layer: string;
};

export type DxfCircleSeg = {
    center: DxfPoint3;
    radius: number;
    layer: string;
};

export type DxfSketch = {
    name: string;
    z: number;
    lines: DxfLineSeg[];
    circles: DxfCircleSeg[];
};

export type DxfDeviceModel = {
    sourceName: string;
    sketches: DxfSketch[];
    borderSketch: DxfSketch | null;
    channelSketches: DxfSketch[];
    bounds: { minX: number; minY: number; maxX: number; maxY: number };
    baseZ: number;
    channelFloorZ: number;
    channelTopZ: number;
    channelHeight: number;
    entities: any[];
};

const MM_TO_UM = 1000;
const POINT_EPS = 1e-3;
const CIRCLE_DEDUPE_EPS = 0.05;

function pointKey(p: DxfPoint3): string {
    return `${Math.round(p.x / CIRCLE_DEDUPE_EPS)}_${Math.round(p.y / CIRCLE_DEDUPE_EPS)}_${Math.round(p.z / CIRCLE_DEDUPE_EPS)}`;
}

function lineLength(a: DxfPoint3, b: DxfPoint3): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function getLineEndpoints(entity: any): [DxfPoint3, DxfPoint3] | null {
    if (entity.vertices && entity.vertices.length >= 2) {
        const a = entity.vertices[0];
        const b = entity.vertices[entity.vertices.length - 1];
        return [
            { x: a.x, y: a.y, z: a.z ?? 0 },
            { x: b.x, y: b.y, z: b.z ?? a.z ?? 0 }
        ];
    }
    if (entity.startPoint && entity.endPoint) {
        return [
            { x: entity.startPoint.x, y: entity.startPoint.y, z: entity.startPoint.z ?? 0 },
            { x: entity.endPoint.x, y: entity.endPoint.y, z: entity.endPoint.z ?? 0 }
        ];
    }
    return null;
}

function updateBounds(bounds: DxfDeviceModel["bounds"], x: number, y: number): void {
    bounds.minX = Math.min(bounds.minX, x);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxY = Math.max(bounds.maxY, y);
}

function sketchFromEntities(layerName: string, entities: any[]): DxfSketch {
    const lines: DxfLineSeg[] = [];
    const circles: DxfCircleSeg[] = [];
    let z = 0;
    for (const entity of entities) {
        if (entity.type === "LINE") {
            const endpoints = getLineEndpoints(entity);
            if (!endpoints) continue;
            const [a, b] = endpoints;
            z = a.z;
            lines.push({ a, b, layer: layerName });
            updateBounds({ minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }, a.x, a.y);
        } else if (entity.type === "CIRCLE" && entity.center) {
            const center = { x: entity.center.x, y: entity.center.y, z: entity.center.z ?? 0 };
            z = center.z;
            circles.push({ center, radius: entity.radius, layer: layerName });
        }
    }
    return { name: layerName, z, lines, circles };
}

function isAxisAlignedRect(sketch: DxfSketch, tol = 0.5): boolean {
    if (sketch.lines.length !== 4) return false;
    const xs = new Set<number>();
    const ys = new Set<number>();
    for (const line of sketch.lines) {
        xs.add(Math.round(line.a.x / tol) * tol);
        xs.add(Math.round(line.b.x / tol) * tol);
        ys.add(Math.round(line.a.y / tol) * tol);
        ys.add(Math.round(line.b.y / tol) * tol);
    }
    return xs.size === 2 && ys.size === 2;
}

function computeBoundsFromSketches(sketches: DxfSketch[]): DxfDeviceModel["bounds"] {
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    for (const sketch of sketches) {
        for (const line of sketch.lines) {
            updateBounds(bounds, line.a.x, line.a.y);
            updateBounds(bounds, line.b.x, line.b.y);
        }
        for (const circle of sketch.circles) {
            updateBounds(bounds, circle.center.x - circle.radius, circle.center.y - circle.radius);
            updateBounds(bounds, circle.center.x + circle.radius, circle.center.y + circle.radius);
        }
    }
    if (!Number.isFinite(bounds.minX)) {
        return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }
    return bounds;
}

function dedupeCircles(circles: DxfCircleSeg[]): DxfCircleSeg[] {
    const seen = new Map<string, DxfCircleSeg>();
    for (const circle of circles) {
        const key = pointKey(circle.center);
        if (!seen.has(key)) {
            seen.set(key, circle);
        }
    }
    return Array.from(seen.values());
}

function mergeChannelSketches(sketches: DxfSketch[], borderSketch: DxfSketch | null): DxfSketch {
    const lines: DxfLineSeg[] = [];
    const circleMap = new Map<string, DxfCircleSeg>();
    let z = 0;
    for (const sketch of sketches) {
        z = Math.max(z, sketch.z);
        for (const line of sketch.lines) {
            if (!isBorderLineInSketch(line, sketch)) {
                lines.push(line);
            }
        }
        for (const circle of sketch.circles) {
            circleMap.set(pointKey(circle.center), circle);
        }
    }
    return {
        name: "channel_merged",
        z,
        lines: filterPerimeterLines(dedupeLines(lines), borderSketch),
        circles: Array.from(circleMap.values())
    };
}

function dedupeLines(lines: DxfLineSeg[]): DxfLineSeg[] {
    const seen = new Set<string>();
    const out: DxfLineSeg[] = [];
    for (const line of lines) {
        const key = [
            Math.round(line.a.x * 1000),
            Math.round(line.a.y * 1000),
            Math.round(line.b.x * 1000),
            Math.round(line.b.y * 1000)
        ]
            .sort()
            .join("_");
        if (!seen.has(key)) {
            seen.add(key);
            out.push(line);
        }
    }
    return out;
}

export function isBorderLineInSketch(line: DxfLineSeg, sketch: DxfSketch, tol = 0.5): boolean {
    if (!isAxisAlignedRect(sketch)) return false;
    const xs = sketch.lines.flatMap((l) => [l.a.x, l.b.x]);
    const ys = sketch.lines.flatMap((l) => [l.a.y, l.b.y]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return isLineOnRectPerimeter(line, { minX, maxX, minY, maxY }, tol);
}

export function getBorderBounds(borderSketch: DxfSketch | null): { minX: number; maxX: number; minY: number; maxY: number } | null {
    if (!borderSketch || borderSketch.lines.length === 0) return null;
    const xs = borderSketch.lines.flatMap((l) => [l.a.x, l.b.x]);
    const ys = borderSketch.lines.flatMap((l) => [l.a.y, l.b.y]);
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
    };
}

export function isLineOnRectPerimeter(
    line: DxfLineSeg,
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    tol = 0.6
): boolean {
    const onLeft = Math.abs(line.a.x - bounds.minX) < tol && Math.abs(line.b.x - bounds.minX) < tol;
    const onRight = Math.abs(line.a.x - bounds.maxX) < tol && Math.abs(line.b.x - bounds.maxX) < tol;
    const onBottom = Math.abs(line.a.y - bounds.minY) < tol && Math.abs(line.b.y - bounds.minY) < tol;
    const onTop = Math.abs(line.a.y - bounds.maxY) < tol && Math.abs(line.b.y - bounds.maxY) < tol;
    return onLeft || onRight || onBottom || onTop;
}

export function filterPerimeterLines(lines: DxfLineSeg[], borderSketch: DxfSketch | null, tol = 0.6): DxfLineSeg[] {
    const bounds = getBorderBounds(borderSketch);
    if (!bounds) return lines;
    return lines.filter((line) => !isLineOnRectPerimeter(line, bounds, tol));
}

export function parseDxfDocument(parsed: any, sourceName = "imported"): DxfDeviceModel {
    const entities: any[] = parsed?.entities ?? [];
    const layerMap = new Map<string, any[]>();
    for (const entity of entities) {
        if (entity.type === "POINT" || entity.type === "DIMENSION" || entity.type === "MTEXT") {
            continue;
        }
        const layer = entity.layer || "default";
        if (!layerMap.has(layer)) layerMap.set(layer, []);
        layerMap.get(layer)!.push(entity);
    }

    const sketches: DxfSketch[] = [];
    for (const [layerName, layerEntities] of layerMap.entries()) {
        sketches.push(sketchFromEntities(layerName, layerEntities));
    }
    sketches.sort((a, b) => a.z - b.z || a.name.localeCompare(b.name));

    const bounds = computeBoundsFromSketches(sketches);
    const minSketchZ = sketches.length > 0 ? Math.min(...sketches.map((s) => s.z)) : 0;
    let borderSketch: DxfSketch | null = null;
    const channelSketches: DxfSketch[] = [];
    for (const sketch of sketches) {
        if (sketch.z <= minSketchZ + 0.01 && isAxisAlignedRect(sketch)) {
            borderSketch = sketch;
        } else if (sketch.lines.length > 0 || sketch.circles.length > 0) {
            channelSketches.push(sketch);
        }
    }
    if (!borderSketch && sketches.length > 0) {
        borderSketch = sketches[0];
    }

    const zValues = sketches.map((s) => s.z);
    const baseZ = Math.min(...zValues, 0);
    const channelFloorZ = channelSketches.length > 0 ? Math.min(...channelSketches.map((s) => s.z)) : baseZ;
    const maxZ = Math.max(...zValues);
    let channelTopZ = maxZ;
    if (maxZ - baseZ >= 8) {
        channelTopZ = maxZ + 2;
    }
    const channelHeight = Math.max(channelTopZ - channelFloorZ, 0.5);

    return {
        sourceName,
        sketches,
        borderSketch,
        channelSketches,
        bounds,
        baseZ,
        channelFloorZ,
        channelTopZ,
        channelHeight,
        entities
    };
}

export function dxfPointToDeviceUm(point: DxfPoint3, model: DxfDeviceModel): [number, number] {
    return [mmToUm(point.x - model.bounds.minX), mmToUm(model.bounds.maxY - point.y)];
}

export function mmToUm(value: number): number {
    return value * MM_TO_UM;
}

export function umToMm(value: number): number {
    return value * 0.001;
}

export function umPointDist(a: [number, number], b: [number, number]): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function getMergedChannelSketch(model: DxfDeviceModel): DxfSketch {
    if (model.channelSketches.length === 0) {
        return { name: "empty", z: model.channelFloorZ, lines: [], circles: [] };
    }
    if (model.channelSketches.length === 1) {
        const sketch = model.channelSketches[0];
        const internalLines = sketch.lines.filter((line) => !isBorderLineInSketch(line, sketch));
        return {
            ...sketch,
            lines: filterPerimeterLines(internalLines, model.borderSketch),
            circles: dedupeCircles(sketch.circles)
        };
    }
    return mergeChannelSketches(model.channelSketches, model.borderSketch);
}

export function detectChannelWidth(lines: DxfLineSeg[], line: DxfLineSeg): number {
    const dx = line.b.x - line.a.x;
    const dy = line.b.y - line.a.y;
    const len = Math.hypot(dx, dy);
    if (len < POINT_EPS) return 1;
    const nx = -dy / len;
    const ny = dx / len;
    let best = 1;
    for (const other of lines) {
        if (other === line) continue;
        const odx = other.b.x - other.a.x;
        const ody = other.b.y - other.a.y;
        const olen = Math.hypot(odx, ody);
        if (olen < POINT_EPS) continue;
        const dot = Math.abs((dx * odx + dy * ody) / (len * olen));
        if (dot < 0.98) continue;
        const dist =
            Math.abs(nx * (other.a.x - line.a.x) + ny * (other.a.y - line.a.y));
        if (dist > 0.2 && dist < 20 && dist < best * 1.5) {
            best = dist;
        }
    }
    return best;
}

export function serializeDxfModel(model: DxfDeviceModel): any {
    return {
        sourceName: model.sourceName,
        bounds: model.bounds,
        baseZ: model.baseZ,
        channelFloorZ: model.channelFloorZ,
        channelTopZ: model.channelTopZ,
        channelHeight: model.channelHeight,
        entities: model.entities
    };
}

export function deserializeDxfModel(data: any, sourceName = "imported"): DxfDeviceModel | null {
    if (!data || !Array.isArray(data.entities)) return null;
    return parseDxfDocument({ entities: data.entities }, data.sourceName || sourceName);
}
