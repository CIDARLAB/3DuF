var ThreeUtils = require("./threeUtils");

var mergeGeometries = ThreeUtils.mergeGeometries;

var INTERLOCK_TOLERANCE = .125;
var HOLDER_BORDER_WIDTH = .41;
var SLIDE_Z_OFFSET = 1.20;
var HOLDER_SKIRT_WIDTH = .8;
var HOLDER_SKIRT_HEIGHT = .2;
var CORNER_DISTANCE = 10;
var SLIDE_THICKNESS = 1.20;

var defaultMaterial = new THREE.MeshBasicMaterial();
var whiteMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading});
var slideMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, opacity: 0.1, transparent: true});
var holderMaterial = new THREE.MeshLambertMaterial( { color: 0x9E9E9E, shading: THREE.FlatShading});

var layerMaterials = {
	"red": new THREE.MeshLambertMaterial( { color: 0xF44336, shading: THREE.SmoothShading}),
	"indigo": new THREE.MeshLambertMaterial( { color: 0x3F51B5, shading: THREE.SmoothShading}),
	"purple": new THREE.MeshLambertMaterial( { color: 0x673AB7, shading: THREE.SmoothShading}),
	"grey": new THREE.MeshLambertMaterial( { color: 0x9E9E9E, shading: THREE.SmoothShading})
}

function getFeatureMaterial(feature, layer){
	var colorString = layer.color;
	if (colorString && layerMaterials.hasOwnProperty(colorString)){
		return layerMaterials[colorString];
	} else return layerMaterials["grey"];
}

function DevicePlane(width, height, offset){
	var plane = new THREE.PlaneBufferGeometry(width, height);
	var material = whiteMaterial;
	var mesh = new THREE.Mesh(plane, material);
	var matrix = new THREE.Matrix4();
	mesh.geometry.applyMatrix(matrix.makeTranslation(width/2, height/2, -offset));
	return mesh;
}

function Via(via, layer, z_offset){
	var radius1 = via.params.radius1;
	var radius2 = via.params.radius2;
	var height = via.params.height;
	var position = via.params.position;
	var z_offset = layer.params.z_offset;
	var flip = layer.params.flip;
	var geom = ConeFeature(position, radius1, radius2, height, flip, z_offset);
	var material = getFeatureMaterial(via, layer);
	var mesh = new THREE.Mesh(geom, material);
	return mesh;
}

function Port(port, layer, z_offset){
	var radius1 = port.params.radius1;
	var radius2 = port.params.radius2;
	var height = port.params.height;
	var position = port.params.position;
	var z_offset = layer.params.z_offset;
	var flip = layer.params.flip;
	var geom = ConeFeature(position, radius1, radius2, height, flip, z_offset);
	var material = getFeatureMaterial(port, layer);
	var mesh = new THREE.Mesh(geom, material);
	return mesh;
}

function CircleValve(circleValve, layer, z_offset){
	var radius1 = circleValve.params.radius1;
	var radius2 = circleValve.params.radius2;
	var height = circleValve.params.height;
	var position = circleValve.params.position;
	var z_offset = layer.params.z_offset;
	var flip = layer.params.flip;
	var geom = ConeFeature(position, radius1, radius2, height, flip, z_offset);
	var material = getFeatureMaterial(circleValve, layer);
	var mesh = new THREE.Mesh(geom, material);
	return mesh;
}

function ConeFeature(position, radius1, radius2, height, flip, z_offset){
	var cone = Cone(position, radius1, radius2, height);
	var matrix = new THREE.Matrix4();
	if (flip){
		cone.applyMatrix(matrix.makeRotationX(Math.PI));
		cone.applyMatrix(matrix.makeTranslation(0,position[1]*2, 0));
	}
	cone.applyMatrix(matrix.makeTranslation(0,0,z_offset));
	return cone;
}

function TwoPointBoxFeature(start, end, width, height, flip, z_offset){
	var box = TwoPointRoundedBox(start, end, width, height);
	var matrix = new THREE.Matrix4();
	
	if (flip){
		box.applyMatrix(matrix.makeTranslation(0,0,-height));
	}
	box.applyMatrix(matrix.makeTranslation(0,0,z_offset));
	return box;
}

function Channel(channel, layer, z_offset){
	var start = channel.params.start;
	var end = channel.params.end;
	var width = channel.params.width;
	var height = channel.params.height;
	var flip = layer.params.flip;
	var z_offset = layer.params.z_offset;
	var geom = TwoPointBoxFeature(start, end, width, height, flip, z_offset);
	var material = getFeatureMaterial(channel, layer);
	var mesh = new THREE.Mesh(geom, material);
	return mesh;
}

function Cone(position, radius1, radius2, height){
	var cyl = new THREE.CylinderGeometry(radius2, radius1, height, 16);
	var matrix = new THREE.Matrix4();
	cyl.applyMatrix(matrix.makeRotationX(Math.PI/2));
	cyl.applyMatrix(matrix.makeTranslation(position[0],position[1], height/2));
	return cyl;
}

function TwoPointBox(start, end, width, height){
	var dX = end[0] - start[0];
	var dY = end[1] - start[1];
	var boxAngle = Math.atan2(dY, dX);
	var dXPow = Math.pow(dX, 2);
	var dYPow = Math.pow(dY, 2);
	var length = Math.sqrt(dXPow + dYPow);
	var material = defaultMaterial;
	var box = new THREE.BoxGeometry(length, width, height);
	var matrix = new THREE.Matrix4();
	box.applyMatrix(matrix.makeRotationZ(boxAngle));
	box.applyMatrix(matrix.makeTranslation(start[0], start[1], height/2));
	box.applyMatrix(matrix.makeTranslation(dX/2, dY/2,0));
	return box;
}

function Slide(width, height, thickness){
	var group = new THREE.Group();
	var slide = new THREE.BoxGeometry(width, height, thickness);
	var material = slideMaterial;
	var matrix = new THREE.Matrix4();
	slide.applyMatrix(matrix.makeTranslation(width/2, height/2, -thickness/2));
	var mesh = new THREE.Mesh(slide, material);
	group.add(mesh);
	group.add(DevicePlane(width, height, thickness + .001));
	return group;
}

function SlideHolder(width, height, slide){
	var renderedHolder = new THREE.Group();
	if (slide) {
		renderedHolder.add(Slide(width, height, SLIDE_THICKNESS));	
	}
	return renderedHolder;
}

function TwoPointRoundedBox(start, end, width, height){
	var box = TwoPointBox(start, end, width, height);
	var cone1 = Cone(start, width/2, width/2, height);
	var cone2 = Cone(end, width/2, width/2, height);
	var merged = mergeGeometries([box, cone1, cone2]);
	return merged;
}

function renderFeature(feature, layer, z_offset){
	var type = feature.type;
	var renderedFeature; 

	if (type == "Channel") renderedFeature = Channel(feature, layer, z_offset);
	else if (type == "CircleValve") renderedFeature = CircleValve(feature, layer, z_offset); 
	else if (type == "Via") renderedFeature = Via(feature, layer, z_offset); 
	else if (type == "Port") renderedFeature = Port(feature, layer, z_offset); 
	else console.log("Feature type not recognized: " + type);

	return renderedFeature;
}

module.exports.renderFeature = renderFeature;
module.exports.SlideHolder = SlideHolder;