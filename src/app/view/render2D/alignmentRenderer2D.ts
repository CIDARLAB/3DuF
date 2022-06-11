import * as Colors from "../colors";
import Feature from "../../core/feature";
import paper from "paper";
import { Point } from "@/app/core/init";

function getLayerColor(feature: any) {
    const height = feature.getValue("height");
    const layerHeight = 1; // feature.layer.estimateLayerHeight();
    let decimal = height / layerHeight;
    if (decimal > 1) decimal = 1;
    if (!feature.layer.flip) decimal = 1 - decimal;
    const targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
}

function getBaseColor(feature:any) {
    let decimal = 0;
    if (!feature.layer.flip) decimal = 1 - decimal;
    const targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
}

function calculateDistance(pointer_position: Point, feature_position: paper.Point) {
    return Math.sqrt(Math.pow(pointer_position[0] - feature_position.x, 2) + Math.pow(pointer_position[1] - feature_position.y, 2));
}

export function renderAlignmentMarks(position: Point, radius: number, features: Array<any>) {
    // let renderer = getFeatureRenderer(typeString, setString);
    // let params = renderer.targetParams;
    // let prim = getPrimitive2D(renderer.targetPrimitiveType, renderer.targetPrimitiveSet);
    // let primParams = {};
    // for (let key in params) {
    //     primParams[key] = getDefaultValueForType(typeString, setString, params[key]);
    // }
    // primParams["position"] = position;
    // primParams["color"] = Colors.getDefaultFeatureColor(typeString, setString, Registry.currentLayer);
    // let rendered = prim(primParams);
    const alignmentmarkergroup = new paper.Group();

    for (const i in features) {
        const feature = features[i];
        if (feature === null) {
            continue;
        }
        if (calculateDistance(position, feature.getBounds().center) < radius) {
            // TODO: figure out how check for different kinds of components and then generate

            // Generate the alignment H | V lines for each of the features

            // Get the bounds of the feature

            const bounds = feature.getBounds();

            // Only the centroid alignment marks
            const center = bounds.center;
            const hstart = new paper.Point(center.x - radius, center.y);
            const hend = new paper.Point(center.x + radius, center.y);

            const vstart = new paper.Point(center.x, center.y - radius);
            const vend = new paper.Point(center.x, center.y + radius);

            const hpath = new paper.Path([hstart, hend]);
            const vpath = new paper.Path([vstart, vend]);

            hpath.strokeColor = new paper.Color("#696965");
            hpath.strokeWidth = 500;
            hpath.strokeCap = "round";

            hpath.dashArray = [1000, 1200];

            vpath.strokeColor = new paper.Color("#696965");
            vpath.strokeWidth = 500;
            vpath.strokeCap = "round";

            vpath.dashArray = [1000, 1200];

            alignmentmarkergroup.addChild(vpath);
            alignmentmarkergroup.addChild(hpath);
        }
    }

    return alignmentmarkergroup;
}
