
import paper from 'paper';

const Colors = require("../colors");
import LinkedList from "../../utils/linkedList";
import GeometryGraph from "../../geometry/geometryGraph";

export function renderCustomComponentFeature(feature, color) {
    let position = feature.getValue("position");
    let rotation = feature.getValue("rotation");
    let render = renderDXFObjects(feature.dxfObjects);
    render.translate(new paper.Point(position[0], position[1]));
    render.rotate(rotation);
    render.fillColor = color;
    return render;
}

export function renderCustomComponentTarget(customcomponent, params) {
    // console.log("Render Posiition:", position);
    let position = params["position"];
    let color = params["color"];
    let rotation = params["rotation"];
    let p = new paper.Point(position[0], position[1]);
    let render = renderDXFObjects(customcomponent.dxfData);

    render.fillColor = color;
    render.fillColor.alpha = 0.5;
    render.translate(p);
    render.rotate(rotation);
    return render;
}

export function renderFeatureObjects(feature) {
    console.log('rendering the features dxf objects');
    for(let i in feature.getDXFObjects()){
        let dxfobject = feature.getDXFObjects()[i];

    }
    throw new Error("Implement the renderer");
    return undefined;
}

/**
 * Calculates and returns the bulge through point
 * @param startpoint
 * @param endpoint
 * @param bulgevalue
 * @return {paper.Point}
 */
function calculateBulgeThroughPoint(startpoint, endpoint, bulgevalue) {
    let throughpoint = 0;

    let start = new paper.Point(startpoint.x, startpoint.y);
    let end = new paper.Point(endpoint.x, endpoint.y);
    let angle = 4 * Math.atan(bulgevalue);


    /*
    https://math.stackexchange.com/questions/9365/endpoint-of-a-line-knowing-slope-start-and-distance
     */
    let epsilon = angle/4;

    let midpoint = new paper.Point(startpoint.x/2 + endpoint.x/2,
        startpoint.y/2 + endpoint.y/2);

    let p = new paper.Point(startpoint.x, startpoint.y).getDistance(midpoint) * bulgevalue;

    let slope = (endpoint.y - startpoint.y)/(endpoint.x - startpoint.x);

    let chordvector = end.subtract(start);

    // console.log("all points:", start, end, chordvector);
    /*
    First handle the two cases when they're nicely aligned to the axes
     */

    // console.log(chordvector, "Angle:",chordvector.angle, Math.round(chordvector.angle), "Dist from midpoint:", p);

    if(Math.round(chordvector.angle) == 0){
        //Horizontal
        // console.log("Horizontal Case");
        throughpoint = new paper.Point(midpoint.x, midpoint.y - p);
        return throughpoint;

    }else if(Math.round(chordvector.angle) == 90){
        //Vertical
        // console.log("Vertical Case");
        throughpoint = new paper.Point(midpoint.x + p, midpoint.y);
        return throughpoint;
    }else{
        // All other angles
        // console.log("Angled Case")
        slope = -1*slope;

        //midpoint
        let k = -p / Math.sqrt(1 + slope*slope);

        throughpoint = midpoint.add(new paper.Point(k, k*slope));

    }

    //let base = startpoint


    //Find the distance on the perpendicular


    return throughpoint;
}

function isClosedPolyline(dxfobject) {
    let data = dxfobject.getData();
    // console.log(data, data.shape);
    return data.shape;
}

function processARC(geometryGraph, data) {
    // console.warn("Implement this function !!");

    /*

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


    let center = new paper.Point(data.center.x * 1000, data.center.y * 1000);
    let radius = data.radius * 1000;
    let startAngle = data.startAngle;
    let endAngle = data.endAngle; //* 180/Math.PI;

    let startpoint = new paper.Point(center.x + radius* Math.cos(startAngle), center.y + radius* Math.sin(startAngle));


    let endpoint = new paper.Point(center.x + radius* Math.cos(endAngle), center.y + radius* Math.sin(endAngle));



    geometryGraph.addEdge(startpoint, endpoint, data);

}

function processClosedPolyLine(entity) {
    let polygon = new paper.Path();
    polygon.origin = "POLYLINE";
    // // create geometry
    for(let i = 0; i < entity.vertices.length; i++) {
        let dxfvertex = entity.vertices[i];
        polygon.add(new paper.Point(dxfvertex.x * 1000, dxfvertex.y * 1000));

    }
    polygon.closed = true;

    return polygon;
}

function processPolyLine(geometryGraph, data) {
    console.warn("Implement this function !!");

}

function processSpline(geometryGraph, data) {
    console.warn("Implement this function !!");

}

function processLine(geometryGraph, data) {

    let startPoint = data.vertices[0];
    let endPoint = data.vertices[1];

    geometryGraph.addEdge(startPoint, endPoint, data);

}

export function renderDXFObjects(dxfobjectarray) {
    // let path = new paper.CompoundPath();

    if(dxfobjectarray == undefined){
        throw new Error("Cannot find DXF DATA");
    }
    // console.log("DXF Object Array to render:", dxfobjectarray);

    let patharray = new LinkedList();
    let closedshapes = [];

    let geometryGraph = new GeometryGraph();

    for(let i in dxfobjectarray){
        let dxfobject = dxfobjectarray[i];

        /*
        If ARC - Get the start and end points - save to edge graph as
         */

        if(dxfobject.getType() === 'ARC'){
            processARC(geometryGraph, dxfobject.getData());
        } else if (dxfobject.getType() === 'LINE') {
            processLine(geometryGraph, dxfobject.getData());
        } else if (dxfobject.getType() === 'LWPOLYLINE' || dxfobject.getType() === 'POLYLINE'){
            if(isClosedPolyline(dxfobject)){
                closedshapes.push(processClosedPolyLine(dxfobject.getData()));
            }else{
                processPolyLine(geometryGraph, dxfobject.getData());
            }
        } else if(dxfobject.getType() === 'ELLIPSE'){
            closedshapes.push(drawEllipse(dxfobject.getData()));
        } else if(dxfobject.getType() === 'CIRCLE' ){
            closedshapes.push(drawCircle(dxfobject.getData()));
        } else if(dxfobject.getType() === 'SPLINE') {
            alert("The current version of the DXF Parser does not support SPLINE objects. Support will be added in future versions");
            throw new Error("Unsupported render object");
            processSpline(geometryGraph, dxfobject.getData())
        } else if(dxfobject.getType() === 'DIMENSION'){
            console.warn("DIMENSION entry in DXF will be ignored. Please ensure that all the designs are of the correct dimensions");
        } else if(dxfobject.getType() === 'MTEXT'){
            console.warn("MTEXT entry in DXF will be ignored. Please ensure that none of the features require text ");
        } else if(dxfobject.getType() === 'INSERT'){
            alert("The current version of the DXF Parser does not support INSERT and BLOCK design references.");
            throw new Error("Unsupported render object");
        } else {
            alert("Unsupported DXF Entity Type for Component Import : " + dxfobject.getType());
            console.error("Unsupported DXF Entity Type for Component Import : " + dxfobject.getType());
        }
    }

    // console.log("Geometry grpah:",geometryGraph);
    // console.log("Closed Shapes:", closedshapes);
    //TODO: Generate the Geometry from the geometry graph , this should a return a compound path that takes care of the
    // right kind of correct connected paths

    let path = geometryGraph.generateGeometry();

    //TODO: Now add all the remainder closed shapes to the compound paths
    for(let child of closedshapes){
        path.addChild(child);
    }

    // path.strokeColor = '#000000';
    // path.strokeWidth = 1;
    path.closed = true;
    path.fillColor = '#ff7606';
    path.fillRule = 'evenodd';
    let topleft = path.bounds.topLeft;
    path.translate(new paper.Point(-topleft.x, -topleft.y));
    path.scale(1, -1); //The coordinate system is all different for DXF

    path.scale(1000, 1000); //Scale the coordinates to microns

    return path;
}


/**
 * Returns a PaperJS outline rendering of the given
 * DXF objects contained in the feature.
 * @param feature
 */
export function renderEdgeFeature(feature) {
    let path = new paper.CompoundPath();

    // console.log('rendering the outline dxf objects....', feature.getDXFObjects());
    for(let i in feature.getDXFObjects()){
        let dxfobject = feature.getDXFObjects()[i];
        // Figure out what entity this is and then based on that do the drawing
        let mesh;
        if(dxfobject.getType() === 'ARC') {
            path.addChild(drawArc(dxfobject.getData()));
        } else if(dxfobject.getType() === 'LWPOLYLINE' || dxfobject.getType() === 'LINE' || dxfobject.getType() === 'POLYLINE') {
            path.addChild(drawLine(dxfobject.getData()));
        } else if(dxfobject.getType() === 'SPLINE') {
            path.addChild(drawSpline(dxfobject.getData()));
        } else if(dxfobject.getType() === 'ELLIPSE') {
            path.addChild(drawEllipse(dxfobject.getData()));
        } else if(dxfobject.getType() === 'CIRCLE' ){
            path.addChild(drawCircle(dxfobject.getData()));
        }
        else {
            console.error("Unsupported DXF Entity Type for Outline Generation : " + dxfobject.getType());
        }
    }
    //Set the visual properties for the path
    path.strokeColor = '#ff7606';
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
    if (decimal >1) decimal = 1;
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
 */
function drawEllipse(entity) {
    /*
    https://www.autodesk.com/techpubs/autocad/acad2000/dxf/ellipse_dxf_06.htm
     */
    // console.log("DXF Data", entity);

    let center = new paper.Point(entity.center.x * 1000, entity.center.y * 1000);
    let axisratio = entity.axisRatio;
    let majoraxislength = Math.sqrt(Math.pow(entity.majorAxisEndPoint.x * 1000, 2)
        + Math.pow(entity.majorAxisEndPoint.y * 1000, 2));
    let minoraxislength = majoraxislength * axisratio;
    let rotation = Math.atan(entity.majorAxisEndPoint.y/entity.majorAxisEndPoint.x) * 180/Math.PI;
    // console.log("Rotation:", rotation);
    if(Number.isNaN(rotation)){
        rotation = 0;
    }
    // console.log("Rotation:", rotation);
    // console.log("lengths:", majoraxislength, minoraxislength);
    let ellipse = new paper.Path.Ellipse({
        center: [center.x, center.y],
        radius: [majoraxislength, minoraxislength],
    });

    ellipse.rotate(rotation, center);
    return ellipse;
}

function drawMtext(entity, data) {
    var color = getColor(entity, data);

    var geometry = new THREE.TextGeometry( entity.text, {
        font: font,
        size: entity.height * (4/5),
        height: 1
    });
    var material = new THREE.MeshBasicMaterial( {color: color} );
    var text = new THREE.Mesh( geometry, material );

    // Measure what we rendered.
    var measure = new THREE.Box3();
    measure.setFromObject( text );

    var textWidth  = measure.max.x - measure.min.x;

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
            text.position.x = entity.position.x - textWidth/2;
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
            text.position.y = entity.position.y - entity.height/2;
            break;
        case 5:
            // Middle Center
            text.position.x = entity.position.x - textWidth/2;
            text.position.y = entity.position.y - entity.height/2;
            break;
        case 6:
            // Middle Right
            text.position.x = entity.position.x - textWidth;
            text.position.y = entity.position.y - entity.height/2;
            break;

        case 7:
            // Bottom Left
            text.position.x = entity.position.x;
            text.position.y = entity.position.y;
            break;
        case 8:
            // Bottom Center
            text.position.x = entity.position.x - textWidth/2;
            text.position.y = entity.position.y;
            break;
        case 9:
            // Bottom Right
            text.position.x = entity.position.x - textWidth;
            text.position.y = entity.position.y;
            break;

        default:
            return undefined;
    };

    return text;
}

function drawSpline(entity, path) {
    let curve;
    var points = entity.controlPoints.map(function(vec) {
        return new paper.Point(vec.x, vec.y);
    });

    var interpolatedPoints = [];
    if (entity.degreeOfSplineCurve === 2 || entity.degreeOfSplineCurve === 3) {
        for(var i = 0; i + 2 < points.length; i = i + 2) {
            if (entity.degreeOfSplineCurve === 2) {
                curve = new THREE.QuadraticBezierCurve(points[i], points[i + 1], points[i + 2]);
            } else {
                curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], points[i + 2]);
            }
            interpolatedPoints.push.apply(interpolatedPoints, curve.getPoints(50));
        }
    } else {
        curve = new THREE.SplineCurve(points);
        interpolatedPoints = curve.getPoints( 400 );
    }

    var geometry = new THREE.BufferGeometry().setFromPoints( interpolatedPoints );
    var material = new THREE.LineBasicMaterial( { linewidth: 1, color : color } );
    var splineObject = new THREE.Line( geometry, material );

    return splineObject;
}

function drawCircle(entity){
    let center = new paper.Point(entity.center.x * 1000, entity.center.y * 1000);
    let circle = new paper.Path.Circle(center, entity.radius * 1000);
    return circle;
}

/**
 * Generates the paper.js equivalent of the LINE, POLYLINE, LWPOLYLINE DXF object
 * @param entity DXF Data
 */
function drawLine(entity) {
    //Create a path
    let basepath = new paper.Path();
    basepath.origin = "LINE";

    let bulge, bugleGeometry;
    let startPoint, endPoint;

    // // create geometry
    for(let i = 0; i < entity.vertices.length; i++) {
        // console.log("Point:", i , entity.vertices[i]);
        if(entity.vertices[i].bulge) {
            console.log("Drawing arc segment to incorporate bulge values");
            //TODO: Figure out what to do with the bugle value
            bulge = entity.vertices[i].bulge;
            startPoint = entity.vertices[i];
            if(i < entity.vertices.length-1){
                endPoint = entity.vertices[i+1];
            }else{
                console.log("LAst vertex")
                endPoint = entity.vertices[0];
            }
            // endPoint = (i + 1 < entity.vertices.length) ? entity.vertices[i + 1] :entity.vertices[0];
            console.log("Start Point:", startPoint);
            console.log("End Point:", endPoint);
            let throughpoint = calculateBulgeThroughPoint(startPoint, endPoint, bulge);

            console.log("Throughpoint:", throughpoint);

            basepath.add(new paper.Point(startPoint.x * 1000, startPoint.y * 1000));
            //basepath.add(new paper.Point(endPoint.x, endPoint.y));
            basepath.arcTo(throughpoint, new paper.Point(endPoint.x * 1000, endPoint.y * 1000));
            i++;

        } else {
            // let vertex = entity.vertices[i];
            // let nextvertex = entity.vertices[(i + 1 < entity.vertices.length) ? i + 1 : 0];
            // let point = new paper.Point(vertex.x * 1000, vertex.y * 1000); //Need to convert everything to microns
            // let nextpoint = new paper.Point(nextvertex.x * 1000, nextvertex.y * 1000);
            // // console.log("Vertex:", point, nextpoint);
            // let line = new paper.Path.Line(point, nextpoint);
            // path.addChild(line);

            let dxfvertex = entity.vertices[i];
            basepath.add(new paper.Point(dxfvertex.x * 1000, dxfvertex.y * 1000));

        }

    }
    return basepath;
}

/**
 * Generates the paper.js equivalent of the ARC DXF object
 * @param entity DXF Data
 */
function drawArc(entity) {
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


    let center = new paper.Point(entity.center.x * 1000, entity.center.y *1000);
    let radius = entity.radius * 1000;
    let startAngle = entity.startAngle;
    let endAngle = entity.endAngle; //* 180/Math.PI;
    let midAngle = (startAngle + endAngle)/2;

    let startpoint = new paper.Point(center.x + radius* Math.cos(startAngle), center.y + radius* Math.sin(startAngle));


    let midpoint = new paper.Point(center.x + radius* Math.cos(midAngle), center.y + radius* Math.sin(midAngle));


    let endpoint = new paper.Point(center.x + radius* Math.cos(endAngle), center.y + radius* Math.sin(endAngle));


    let arc = paper.Path.Arc(startpoint, midpoint, endpoint);

    arc.origin = "ARC";
    return arc;
}


function drawSolid(entity, data) {
    var material, mesh, verts,
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
    if(vector1.z < 0) {
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

    if(!font)
        return console.warn('Text is not supported without a Three.js font loaded with THREE.FontLoader! Load a font of your choice and pass this into the constructor. See the sample for this repository or Three.js examples at http://threejs.org/examples/?q=text#webgl_geometry_text for more details.');

    geometry = new THREE.TextGeometry(entity.text, { font: font, height: 0, size: entity.textHeight || 12 });

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
    var colors = new Float32Array( numPoints*3 );
    colors[0] = color.r;
    colors[1] = color.g;
    colors[2] = color.b;

    geometry.colors = colors;
    geometry.computeBoundingBox();

    material = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
    point = new THREE.Points(geometry, material);
    scene.add(point);
}

