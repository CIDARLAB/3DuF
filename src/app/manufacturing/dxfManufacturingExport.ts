import Device from "../core/device";
import { getMergedChannelSketch, isBorderLineInSketch } from "../import/dxfDeviceModel";
import { getDxfModelFromDevice } from "../import/dxfDeviceImport";
import { generateFlowFusionGCode } from "./flowGCodeExport";

function cleanNum(value: number, decimals = 3): string {
    const rounded = value.toFixed(decimals);
    return rounded === "-0.000" ? "0.000" : rounded;
}

function circleToGcodePoints(cx: number, cy: number, radius: number, segments = 36): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return points;
}

export function generateDxfFusionGCode(device: Device, toolDiameterMm = 0.125): string {
    const model = getDxfModelFromDevice(device);
    if (!model) {
        return generateFlowFusionGCode(device);
    }

    const programName = (device.name || "3DUF_EXPORT").toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const zCut = -Math.min(toolDiameterMm, Math.max(model.channelHeight || 0.2, 0.1));
    const channelSketch = getMergedChannelSketch(model);
    const lines: string[] = [
        `(${programName})`,
        `(T1 D=${cleanNum(toolDiameterMm, 3)} CR=0. - ZMIN=${cleanNum(zCut, 2)} - FLAT END MILL)`,
        "G0 G90 G94 G17",
        "G21",
        "M5",
        "G53 G0 Z0.",
        "",
        `(${programName})`,
        "T1",
        "M3 S16000",
        "G90 G94 G17",
        "G55",
        "M8"
    ];

    const contours: Array<Array<{ x: number; y: number }>> = [];
    const channelLines = channelSketch.lines.filter((line) => !isBorderLineInSketch(line, channelSketch));
    for (const line of channelLines) {
        contours.push([
            { x: line.a.x, y: line.a.y },
            { x: line.b.x, y: line.b.y },
            { x: line.a.x, y: line.a.y }
        ]);
    }
    for (const circle of channelSketch.circles) {
        contours.push(circleToGcodePoints(circle.center.x, circle.center.y, circle.radius));
    }

    for (let ci = 0; ci < contours.length; ci++) {
        const contour = contours[ci];
        if (contour.length < 2) continue;
        lines.push(`G0 X${cleanNum(contour[0].x, 3)} Y${cleanNum(contour[0].y, 3)}`);
        lines.push("Z1.5");
        lines.push("G0 Z0.5");
        lines.push(`G1 Z${cleanNum(zCut, 2)} F300.`);
        for (let i = 1; i < contour.length; i++) {
            lines.push(`X${cleanNum(contour[i].x, 3)} Y${cleanNum(contour[i].y, 3)} F210.`);
        }
        lines.push("G0 Z0.5");
    }

    lines.push("M9");
    lines.push("M5");
    lines.push("G53 G0 Z0.");
    lines.push("M30");
    return lines.join("\r\n") + "\r\n";
}

export function generateDxfSVG(device: Device): string {
    const model = getDxfModelFromDevice(device);
    if (!model) {
        return "";
    }
    const { minX, minY, maxX, maxY } = model.bounds;
    const width = maxX - minX;
    const height = maxY - minY;
    const paths: string[] = [];
    for (const sketch of model.sketches) {
        for (const line of sketch.lines) {
            paths.push(
                `<path data-z="${line.a.z}" data-depth="${model.channelHeight}" d="M ${line.a.x} ${line.a.y} L ${line.b.x} ${line.b.y}" fill="none" stroke="#1565c0" stroke-width="0.15"/>`
            );
        }
        for (const circle of sketch.circles) {
            paths.push(
                `<circle data-z="${circle.center.z}" data-depth="${model.channelHeight}" cx="${circle.center.x}" cy="${circle.center.y}" r="${circle.radius}" fill="none" stroke="#c62828" stroke-width="0.15"/>`
            );
        }
    }
    return (
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="${minX} ${minY} ${width} ${height}">\n` +
        `<g transform="scale(1,-1) translate(0 ${-(minY + maxY)})">\n` +
        paths.join("\n") +
        `\n</g>\n</svg>\n`
    );
}

export { getDxfModelFromDevice as getDxfModelForDevice } from "../import/dxfDeviceImport";
