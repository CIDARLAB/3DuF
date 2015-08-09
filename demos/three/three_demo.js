var container = window;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, container.innerWidth / container.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(container.innerWidth, container.innerHeight);
renderer.setClearColor(scene.fog.color);
renderer.setPixelRatio(container.devicePixelRatio);

document.body.appendChild(renderer.domElement);

var geometry = new CircleValve([0,0], 2, 1, 1, false, 0);
var material = new THREE.MeshPhongMaterial({
	color: 0x00ff00
});
var cube = new THREE.Mesh(geometry, material);
var light = new THREE.DirectionalLight(0xFFFFFF, .5);
light.position.set(0,1,10);
light.target = (cube);
scene.add(cube);
scene.add(light);
cube.rotation.y += .5;

camera.position.z = 5;

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

function CircleValve(position, radius1, radius2, height, flip, z_offset){
	return Cylinder(position, radius1, radius2, height, flip, z_offset);
}

function Cylinder(position, radius1, radius2, height, flip, z_offset){
	var cyl = new THREE.CylinderGeometry(radius2, radius1, height, 16);
	return cyl;
}


//From: http://buildaweso.me/project/2013/2/25/converting-threejs-objects-to-stl-files
function stringifyVector(vec) {
	return "" + vec.x + " " + vec.y + " " + vec.z;
}

function stringifyVertex(vec) {
	return "vertex " + stringifyVector(vec) + " \n";
}

function generateSTL(geometry) {
	var vertices = geometry.vertices;
	var tris = geometry.faces;

	stl = "solid pixel";
	for (var i = 0; i < tris.length; i++) {
		stl += ("facet normal " + stringifyVector(tris[i].normal) + " \n");
		stl += ("outer loop \n");
		stl += stringifyVertex(vertices[tris[i].a]);
		stl += stringifyVertex(vertices[tris[i].b]);
		stl += stringifyVertex(vertices[tris[i].c]);
		stl += ("endloop \n");
		stl += ("endfacet \n");
	}
	stl += ("endsolid");

	return stl
}

function saveSTL(geometry) {

	var stlString = generateSTL(geometry);

	var blob = new Blob([stlString], {
		type: 'text/plain'
	});

	saveAs(blob, 'test.stl');

}

render();
//saveSTL(geometry);