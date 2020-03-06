import * as THREE from "three";
import paper from "paper";

import * as Colors from "../colors";

export function renderFeatureObjects(feature) {
    console.log("rendering the features dxf objects");
    for (let i in feature.getDXFObjects()) {
        let dxfobject = feature.getDXFObjects()[i];
    }
    throw new Error("Implement the renderer");
    return undefined;
}

/**
 * Returns a PaperJS outline rendering of the given
 * DXF objects contained in the feature.
 * @param feature
 */
export function renderEdgeFeature(feature) {
    let path = new paper.CompoundPath();

    // console.log('rendering the outline dxf objects....', feature.getDXFObjects());
    for (let i in feature.getDXFObjects()) {
        let dxfobject = feature.getDXFObjects()[i];
        // Figure out what entity this is and then based on that do the drawing
        let mesh;
        if (dxfobject.getType() === "ARC") {
            drawArc(dxfobject.getData(), path);
        } else if (dxfobject.getType() === "LWPOLYLINE" || dxfobject.getType() === "LINE" || dxfobject.getType() === "POLYLINE") {
            drawLine(dxfobject.getData(), path);
        } else if (dxfobject.getType() === "SPLINE") {
            drawSpline(dxfobject.getData(), path);
        } else if (dxfobject.getType() === "ELLIPSE") {
            drawEllipse(dxfobject.getData(), path);
        } else if (dxfobject.getType() === "CIRCLE") {
            drawCircle(dxfobject.getData(), path);
        } else {
            console.error("Unsupported DXF Entity Type for Outline Generation : " + dxfobject.getType());
        }
    }
    //Set the visual properties for the path
    path.strokeColor = "#ff7606";
    path.strokeWidth = 200;
    //Since this is an outline we need to do the required transformations to it
    path.scale(1, -1); //The coordinate system is all different for DXF
    // console.log(path.bounds.topLeft);
    let topleft = path.bounds.topLeft;
    path.translate(new paper.Point(-topleft.x, -topleft.y));

    //Add the feature id to the rendered object or else the whole things breaks down
    //TODO: Streamline the feature ID insertion for each rendered object business
    path.featureID = feature.getID();
    return path;
}

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

/**
 * Generates the paper.js equivalent of the ELLIPSE DXF object
 * @param entity DXF Data
 * @param path Compound Path onto which the drawing will be inserted into
 */
function drawEllipse(entity, path) {
    /*
    https://www.autodesk.com/techpubs/autocad/acad2000/dxf/ellipse_dxf_06.htm
     */
    // console.log("DXF Data", entity);

    let center = new paper.Point(entity.center.x * 1000, entity.center.y * 1000);
    let axisratio = entity.axisRatio;
    let majoraxislength = Math.sqrt(Math.pow(entity.majorAxisEndPoint.x * 1000, 2) + Math.pow(entity.majorAxisEndPoint.y * 1000, 2));
    let minoraxislength = majoraxislength * axisratio;
    let rotation = (Math.atan(entity.majorAxisEndPoint.y / entity.majorAxisEndPoint.x) * 180) / Math.PI;
    // console.log("Rotation:", rotation);
    if (Number.isNaN(rotation)) {
        rotation = 0;
    }
    // console.log("Rotation:", rotation);
    // console.log("lengths:", majoraxislength, minoraxislength);
    let ellipse = new paper.Path.Ellipse({
        center: [center.x, center.y],
        radius: [majoraxislength, minoraxislength]
    });

    ellipse.rotate(rotation, center);
    path.addChild(ellipse);
}

function drawMtext(entity, data) {
    var color = getColor(entity, data);

    var geometry = new THREE.TextGeometry(entity.text, {
        font: font,
        size: entity.height * (4 / 5),
        height: 1
    });
    var material = new THREE.MeshBasicMaterial({ color: color });
    var text = new THREE.Mesh(geometry, material);

    // Measure what we rendered.
    var measure = new THREE.Box3();
    measure.setFromObject(text);

    var textWidth = measure.max.x - measure.min.x;

    // If the text ends up being wider than the box, it's supposed
    // to be multiline. Doing that in threeJS is overkill.
    if (textWidth > entity.width) {
        console.log("Can't render this multipline MTEXT entity, sorry.", entity);
        return undefined;
    }

    text.position.z = 0;
    switch (entity.attachmentPoint) {
    case 1:
        // Top Left
        text.position.x = entity.position.x;
        text.position.y = entity.position.y - entity.height;
        break;
    case 2:
        // Top Center
        text.position.x = entity.position.x - textWidth / 2;
        text.position.y = entity.position.y - entity.height;
        break;
    case 3:
        // Top Right
        text.position.x = entity.position.x - textWidth;
        text.position.y = entity.position.y - entity.height;
        break;

    case 4:
        // Middle Left
        text.position.x = entity.position.x;
        text.position.y = entity.position.y - entity.height / 2;
        break;
    case 5:
        // Middle Center
        text.position.x = entity.position.x - textWidth / 2;
        text.position.y = entity.position.y - entity.height / 2;
        break;
    case 6:
        // Middle Right
        text.position.x = entity.position.x - textWidth;
        text.position.y = entity.position.y - entity.height / 2;
        break;

    case 7:
        // Bottom Left
        text.position.x = entity.position.x;
        text.position.y = entity.position.y;
        break;
    case 8:
        // Bottom Center
        text.position.x = entity.position.x - textWidth / 2;
        text.position.y = entity.position.y;
        break;
    case 9:
        // Bottom Right
        text.position.x = entity.position.x - textWidth;
        text.position.y = entity.position.y;
        break;

    default:
        return undefined;
    }

    return text;
}

function drawSpline(entity, path) {
    var points = entity.controlPoints.map(function(vec) {
        return new paper.Point(vec.x, vec.y);
    });

    var interpolatedPoints = [];
    if (entity.degreeOfSplineCurve === 2 || entity.degreeOfSplineCurve === 3) {
        for (var i = 0; i + 2 < points.length; i = i + 2) {
            if (entity.degreeOfSplineCurve === 2) {
                curve = new THREE.QuadraticBezierCurve(points[i], points[i + 1], points[i + 2]);
            } else {
                curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], points[i + 2]);
            }
            interpolatedPoints.push.apply(interpolatedPoints, curve.getPoints(50));
        }
    } else {
        curve = new THREE.SplineCurve(points);
        interpolatedPoints = curve.getPoints(400);
    }

    var geometry = new THREE.BufferGeometry().setFromPoints(interpolatedPoints);
    var material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
    var splineObject = new THREE.Line(geometry, material);

    return splineObject;
}

function drawCircle(entity, path) {
    let center = new paper.Point(entity.center.x * 1000, entity.center.y * 1000);
    let circle = new paper.Path.Circle(center, entity.radius * 1000);
    path.addChild(circle);
}

/**
 * Generates the paper.js equivalent of the LINE, POLYLINE, LWPOLYLINE DXF object
 * @param entity DXF Data
 * @param path Compound Path onto which the drawing will be inserted into
 */
function drawLine(entity, path) {
    let bulge, bugleGeometry;
    let startPoint, endPoint;

    // // create geometry
    for (let i = 0; i < entity.vertices.length; i++) {
        if (entity.vertices[i].bulge) {
            //TODO: Figure out what to do with the bugle value
            bulge = entity.vertices[i].bulge;
            startPoint = entity.vertices[i];
            endPoint = i + 1 < entity.vertices.length ? entity.vertices[i + 1] : geometry.vertices[0];
            console.log("Start Point:", startPoint);
            console.log("End Point:", endPoint);
        } else {
            let vertex = entity.vertices[i];
            let nextvertex = entity.vertices[i + 1 < entity.vertices.length ? i + 1 : 0];
            let point = new paper.Point(vertex.x * 1000, vertex.y * 1000); //Need to convert everything to microns
            let nextpoint = new paper.Point(nextvertex.x * 1000, nextvertex.y * 1000);
            // console.log("Vertex:", point, nextpoint);
            let line = new paper.Path.Line(point, nextpoint);
            path.addChild(line);
        }
    }
}

/**
 * Generates the paper.js equivalent of the ARC DXF object
 * @param entity DXF Data
 * @param path Compound Path onto which the drawing will be inserted into
 */
function drawArc(entity, path) {
    /*
    Ok so for this to work in paperjs, we need to have 3 variables
    1. Start
    2. Through
    3. End

    DXF gives :
    1. startAngle
    2. endAngle
    3. center
    4. radius

    To translate we start with the center point, then calculate points at start angle and end angle

    center-> @------r------* <- startAngle
              \
               \
                r
                 \
                  \
                   * <- endAngle

     */

    let center = new paper.Point(entity.center.x * 1000, entity.center.y * 1000);
    let radius = entity.radius * 1000;
    let startAngle = entity.startAngle;
    let endAngle = entity.endAngle; //* 180/Math.PI;
    let midAngle = (startAngle + endAngle) / 2;

    let startpoint = new paper.Point(center.x + radius * Math.cos(startAngle), center.y + radius * Math.sin(startAngle));

    // var starcenter = new paper.Point(startpoint);
    // var points = 5;
    // var radius1 = 250;
    // var radius2 = 400;
    // var star = new paper.Path.Star(starcenter, points, radius1, radius2);
    //
    // path.addChild(star);

    let midpoint = new paper.Point(center.x + radius * Math.cos(midAngle), center.y + radius * Math.sin(midAngle));

    // starcenter = new paper.Point(midpoint);
    // points = 10;
    // star = new paper.Path.Star(starcenter, points, radius1, radius2);
    //
    // path.addChild(star);

    let endpoint = new paper.Point(center.x + radius * Math.cos(endAngle), center.y + radius * Math.sin(endAngle));

    // starcenter = new paper.Point(endpoint);
    // points = 20;
    // star = new paper.Path.Star(starcenter, points, radius1, radius2);
    //
    // path.addChild(star);

    let arc = paper.Path.Arc(startpoint, midpoint, endpoint);

    path.addChild(arc);
}

function drawSolid(entity, data) {
    var material,
        mesh,
        verts,
        geometry = new THREE.Geometry();

    verts = geometry.vertices;
    verts.push(new THREE.Vector3(entity.points[0].x, entity.points[0].y, entity.points[0].z));
    verts.push(new THREE.Vector3(entity.points[1].x, entity.points[1].y, entity.points[1].z));
    verts.push(new THREE.Vector3(entity.points[2].x, entity.points[2].y, entity.points[2].z));
    verts.push(new THREE.Vector3(entity.points[3].x, entity.points[3].y, entity.points[3].z));

    // Calculate which direction the points are facing (clockwise or counter-clockwise)
    var vector1 = new THREE.Vector3();
    var vector2 = new THREE.Vector3();
    vector1.subVectors(verts[1], verts[0]);
    vector2.subVectors(verts[2], verts[0]);
    vector1.cross(vector2);

    // If z < 0 then we must draw these in reverse order
    if (vector1.z < 0) {
        geometry.faces.push(new THREE.Face3(2, 1, 0));
        geometry.faces.push(new THREE.Face3(2, 3, 1));
    } else {
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.faces.push(new THREE.Face3(1, 3, 2));
    }

    material = new THREE.MeshBasicMaterial({ color: getColor(entity, data) });

    return new THREE.Mesh(geometry, material);
}

function drawText(entity, data) {
    var geometry, material, text;

    if (!font)
        return console.warn(
            "Text is not supported without a Three.js font loaded with THREE.FontLoader! Load a font of your choice and pass this into the constructor. See the sample for this repository or Three.js examples at http://threejs.org/examples/?q=text#webgl_geometry_text for more details."
        );

    geometry = new THREE.TextGeometry(entity.text, {
        font: font,
        height: 0,
        size: entity.textHeight || 12
    });

    material = new THREE.MeshBasicMaterial({ color: getColor(entity, data) });

    text = new THREE.Mesh(geometry, material);
    text.position.x = entity.startPoint.x;
    text.position.y = entity.startPoint.y;
    text.position.z = entity.startPoint.z;

    return text;
}

function drawPoint(entity, data) {
    var geometry, material, point;

    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z));

    // TODO: could be more efficient. PointCloud per layer?

    var numPoints = 1;

    var color = getColor(entity, data);
    var colors = new Float32Array(numPoints * 3);
    colors[0] = color.r;
    colors[1] = color.g;
    colors[2] = color.b;

    geometry.colors = colors;
    geometry.computeBoundingBox();

    material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: THREE.VertexColors
    });
    point = new THREE.Points(geometry, material);
    scene.add(point);
}
