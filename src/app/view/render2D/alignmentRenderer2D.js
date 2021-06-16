import * as Colors from "../colors";
import Feature from "../../core/feature";
import * as FeatureSets from "../../featureSets";
import paper from "paper";

function getLayerColor(feature) {
    let height = feature.getValue("height");
    let layerHeight = 1; // feature.layer.estimateLayerHeight();
    let decimal = height / layerHeight;
    if (decimal > 1) decimal = 1;
    if (!feature.layer.flip) decimal = 1 - decimal;
    let targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
}

function getBaseColor(feature) {
    let decimal = 0;
    if (!feature.layer.flip) decimal = 1 - decimal;
    let targetColorSet = Colors.getLayerColors(feature.layer);
    return Colors.decimalToLayerColor(decimal, targetColorSet, Colors.darkColorKeys);
}

function getDefaultValueForType(typeString, setString, key) {
    return Feature.getDefaultsForType(typeString, setString)[key];
}

function getFeatureRenderer(typeString, setString) {
    let rendererInfo = FeatureSets.getRender2D(typeString, setString);
    return rendererInfo;
}

function calculateDistance(pointer_position, feature_position) {
    return Math.sqrt(Math.pow(pointer_position[0] - feature_position.x, 2) + Math.pow(pointer_position[1] - feature_position.y, 2));
}

export function renderAlignmentMarks(position, radius, features) {
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
    let alignmentmarkergroup = new paper.Group();

    for (let i in features) {
        let feature = features[i];
        if (feature === null) {
            continue;
        }
        if (calculateDistance(position, feature.getBounds().center) < radius) {
            //TODO: figure out how check for different kinds of components and then generate

            //Generate the alignment H | V lines for each of the features

            //Get the bounds of the feature

            let bounds = feature.getBounds();

            //Only the centroid alignment marks
            let center = bounds.center;
            let hstart = new paper.Point(center.x - radius, center.y);
            let hend = new paper.Point(center.x + radius, center.y);

            let vstart = new paper.Point(center.x, center.y - radius);
            let vend = new paper.Point(center.x, center.y + radius);

            let hpath = new paper.Path(hstart, hend);
            let vpath = new paper.Path(vstart, vend);

            hpath.strokeColor = "#696965";
            hpath.strokeWidth = 500;
            hpath.strokeCap = "round";

            hpath.dashArray = [1000, 1200];

            vpath.strokeColor = "#696965";
            vpath.strokeWidth = 500;
            vpath.strokeCap = "round";

            vpath.dashArray = [1000, 1200];

            alignmentmarkergroup.addChild(vpath);
            alignmentmarkergroup.addChild(hpath);
        }
    }

    return alignmentmarkergroup;
}
