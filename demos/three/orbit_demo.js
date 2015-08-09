var container;
var camera, controls, scene, renderer;

var redMaterial = new THREE.MeshLambertMaterial( { color: 0xF44336, shading: THREE.FlatShading});
var blueMaterial = new THREE.MeshLambertMaterial( { color: 0x3F51B5, shading: THREE.FlatShading});
var whiteMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading});
var purpleMaterial = new THREE.MeshLambertMaterial( { color: 0x673AB7, shading: THREE.FlatShading});
var greyMaterial = new THREE.MeshLambertMaterial( { color: 0x9E9E9E, shading: THREE.FlatShading});
var slideMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, opacity: 0.1, transparent: true});
var holderMaterial = greyMaterial;
var groundMaterial = new THREE.MeshBasicMaterial({color: 0x414141, shading: THREE.FlatShading});
var backgroundColor = 0xEEEEEE

var INTERLOCK_TOLERANCE = .125;
var HOLDER_BORDER_WIDTH = .41;
var SLIDE_Z_OFFSET = 1.20;
var HOLDER_SKIRT_WIDTH = .8;
var HOLDER_SKIRT_HEIGHT = .2;
var CORNER_DISTANCE = 10;
var SLIDE_THICKNESS = 1.20;

var mockup = null;
var mockupScene = null;
var layers = null;

var layerMaterials = {
	"indigo": blueMaterial,
	"red": redMaterial,
	"purple": purpleMaterial,
	"grey": greyMaterial
};

function getFeatureMaterial(feature, layer){
	var colorString = layer.color;
	if (colorString && layerMaterials.hasOwnProperty(colorString)){
		return layerMaterials[colorString];
	} else return layerMaterials["grey"];
}

init();
render();
loadJSON(device_json);

function loadJSON(json) { 
	sanitizeJSON(json);
	mockup = renderMockup(json);
	layers = renderLayers(json);
	showMockup(json);
	//showLayer(0);
}

function showLayer(index){
	scene.add(layers[index]);
	render();
	//saveSTL(scene, "layer");
}

function showMockup(json) {
	scene.add(mockup);
	render();
	//saveSTL(scene, "test");
}

function renderFeatures(layer, z_offset) {
	var renderedFeatures = new THREE.Group();
	for (var featureID in layer.features){
		var feature = layer.features[featureID];
		renderedFeatures.add(renderFeature(feature, layer, z_offset));
	}
	return renderedFeatures;
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

function renderLayers(json){
	renderedLayers = [];
	for (var i= 0; i < json.layers.length; i ++){
		renderedLayers.push(renderLayer(json, i));
	}
	return renderedLayers;
}

function renderLayer(json, layerIndex){
	console.log("Rendering layer: " + layerIndex);
	var width = json.params.width;
	var height = json.params.height;
	var layer = json.layers[layerIndex];
	var renderedFeatures = new THREE.Group();
	renderedLayer = new THREE.Group();
	renderedFeatures.add(renderFeatures(layer, 0));
	if (layer.params.flip) {
		flipLayer(renderedFeatures, height, layer.params.z_offset);
	}
	renderedLayer.add(renderedFeatures);
	renderedLayer.add(SlideHolder(width, height, SLIDE_THICKNESS, true));
	return renderedLayer;
}

function flipLayer(layer, height, z_offset){
	layer.rotation.x += Math.PI;
	layer.position.y += height;
	layer.position.z += z_offset;
}	

function renderMockup(json){
	mockup = null;
	var renderedMockup = new THREE.Group();
	var layers = json.layers;
	for (var i = 0; i < layers.length; i ++){
		layer = layers[i];
		var renderedLayer = renderFeatures(layer, layer.params.z_offset);
		renderedMockup.add(renderedLayer);
	}
	var renderedHolder = SlideHolder(json.params.width, json.params.height, SLIDE_THICKNESS, true);
	renderedMockup.add(renderedHolder);
	return renderedMockup;
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
}

function init() {
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

	controls = new THREE.OrbitControls(camera);
	controls.damping = 0.2;
	controls.addEventListener('change', render);


	scene = new THREE.Scene();

	var slide = Slide(70, 50, 1);
	slide.position.z -= 1;
	//scene.add(slide);

	//world

	var flow = {
		params: {
			z_offset: 0,
			flip: false,
		},
		color: "indigo"
	};

	var control = {
		params: {
			z_offset: 1,
			flip: true,
		},
		color: "red"
	};

	var via = {
		params: {
			position: [5,10],
			height: .6,
			radius1: .6,
			radius2: .4
		}
	};

	var channel = { 
		params: {
			start: [0,0],
			end: [10,10],
			height: .4,
			width: .6
		}
	};

	var boxGeom = new THREE.BoxGeometry(1,1,1);

	var viaMesh = Via(via, control);
	var channelMesh = Channel(channel, flow);


	var group = new THREE.Group();

	//console.log(viaMesh.geometry);

	//scene.add(viaMesh);
	//scene.add(channelMesh);

	//lights
	var light1 = new THREE.DirectionalLight( 0xffffff );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	light2 = new THREE.DirectionalLight( 0x002288 );
	light2.position.set( -1, -1, -1 );
	scene.add( light2 );

	var light3 = new THREE.AmbientLight( 0x222222 );
	scene.add( light3 );

	//renderer

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(backgroundColor, 1);

	container = document.getElementById('renderContainer');
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);

	//controls.update();

	//scene.remove(slide);
	//saveSTL(scene, "foo");
	//scene.add(slide);

	setupCamera(35,25,50.8, 500);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

function render() {
	renderer.render(scene, camera);
}

function setupCamera(centerX, centerY, deviceHeight, pixelHeight){
	camera.position.z = getCameraDistance(deviceHeight, pixelHeight);
	controls.panLeft(-centerX);
	controls.panUp(-centerY + deviceHeight);
	controls.update();
}

function DevicePlane(width, height, offset){
	var plane = new THREE.PlaneGeometry(width, height);
	var material = whiteMaterial;
	var mesh = new THREE.Mesh(plane, material);
	var matrix = new THREE.Matrix4();
	mesh.geometry.applyMatrix(matrix.makeTranslation(width/2, height/2, -offset));
	return mesh;
}

function GroundPlane(width, height){
	var plane = new THREE.PlaneGeometry(width, height);
	var material = groundMaterial;
	var mesh = new THREE.Mesh(plane, material);
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
	var material = redMaterial;
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
	var material = blueMaterial;
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

function SlideHolder(width, height, thickness, slide){
	var renderedHolder = new THREE.Group();
	if (slide) {
		renderedHolder.add(Slide(width, height, thickness));	
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

function mergeGeometries(geometries){
	var merged = new THREE.Geometry();
	for (var i =0 ;i < geometries.length; i++){
		merged.merge(geometries[i]);
	}
	return merged;
}

function sanitizeJSON(json) {
	sanitizeParams(json.params);
	for (var i = 0; i < json.layers.length; i++) {
		sanitizeParams(json.layers[i].params, json.params.height);
		for (var key in json.layers[i].features) {
			sanitizeParams(json.layers[i].features[key].params, json.params.height);
		}
	}
}

function sanitizeParams(params, height) {
	for (var key in params) {
		if (key == "start" || key == "end" || key == "position") {
			var pos = params[key];
			params[key] = [pos[0] / 1000, height - (pos[1] / 1000)];
		} else {
			params[key] = params[key] / 1000;
		}
	}
}

function computeHeightInPixels(objectHeight, distance){
	var vFOV = camera.fov * Math.PI / 180; // 
	var height = 2 * Math.tan(vFOV/2) * distance; // visible height
	var ratio = objectHeight / height;
	var pixels = window.innerHeight * ratio;
	return pixels;
}

function getCameraDistance(objectHeight, pixelHeight){
	var vFOV = camera.fov * Math.PI / 180;
	var ratio = pixelHeight / window.innerHeight;
	var height = objectHeight / ratio;
	var distance = height / (2 * Math.tan(vFOV/2));
	return distance;
}
