(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

'use strict';

THREE.OrbitControls = function (object, domElement) {

	this.object = object;
	this.domElement = domElement !== undefined ? domElement : document;

	// API

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the control orbits around
	// and where it pans with respect to.
	this.target = new THREE.Vector3();

	// center is old, deprecated; use "target" instead
	this.center = this.target;

	// This option actually enables dollying in and out; left as "zoom" for
	// backwards compatibility
	this.noZoom = false;
	this.zoomSpeed = 1.0;

	// Limits to how far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// Limits to how far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// Set to true to disable this control
	this.noRotate = false;
	this.rotateSpeed = 1.0;

	// Set to true to disable this control
	this.noPan = false;
	this.keyPanSpeed = 7.0; // pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = -Math.PI; // radians
	this.maxAzimuthAngle = Math.PI; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	//this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
	this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.MIDDLE };

	////////////
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
	var panOffset = new THREE.Vector3();

	var offset = new THREE.Vector3();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var theta;
	var phi;
	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();
	var lastQuaternion = new THREE.Quaternion();

	var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

	var state = STATE.NONE;

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	// so camera.up is the orbit axis

	var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
	var quatInverse = quat.clone().inverse();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	this.rotateLeft = function (angle) {

		if (angle === undefined) {

			angle = getAutoRotationAngle();
		}

		thetaDelta -= angle;
	};

	this.rotateUp = function (angle) {

		if (angle === undefined) {

			angle = getAutoRotationAngle();
		}

		phiDelta -= angle;
	};

	// pass in distance in world space to move left
	this.panLeft = function (distance) {

		var te = this.object.matrix.elements;

		// get X column of matrix
		panOffset.set(te[0], te[1], te[2]);
		panOffset.multiplyScalar(-distance);

		pan.add(panOffset);
	};

	// pass in distance in world space to move up
	this.panUp = function (distance) {

		var te = this.object.matrix.elements;

		// get Y column of matrix
		panOffset.set(te[4], te[5], te[6]);
		panOffset.multiplyScalar(distance);

		pan.add(panOffset);
	};

	// pass in x,y of change desired in pixel space,
	// right and down are positive
	this.pan = function (deltaX, deltaY) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if (scope.object instanceof THREE.PerspectiveCamera) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub(scope.target);
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);

			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
			scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
		} else if (scope.object instanceof THREE.OrthographicCamera) {

			// orthographic
			scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
			scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
		} else {

			// camera neither orthographic or perspective
			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
		}
	};

	this.dollyIn = function (dollyScale) {

		if (dollyScale === undefined) {

			dollyScale = getZoomScale();
		}

		if (scope.object instanceof THREE.PerspectiveCamera) {

			scale /= dollyScale;
		} else if (scope.object instanceof THREE.OrthographicCamera) {

			scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
			scope.object.updateProjectionMatrix();
			scope.dispatchEvent(changeEvent);
		} else {

			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
		}
	};

	this.dollyOut = function (dollyScale) {

		if (dollyScale === undefined) {

			dollyScale = getZoomScale();
		}

		if (scope.object instanceof THREE.PerspectiveCamera) {

			scale *= dollyScale;
		} else if (scope.object instanceof THREE.OrthographicCamera) {

			scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
			scope.object.updateProjectionMatrix();
			scope.dispatchEvent(changeEvent);
		} else {

			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
		}
	};

	this.update = function () {

		var position = this.object.position;

		offset.copy(position).sub(this.target);

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion(quat);

		// angle from z-axis around y-axis

		theta = Math.atan2(offset.x, offset.z);

		// angle from y-axis

		phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

		if (this.autoRotate && state === STATE.NONE) {

			this.rotateLeft(getAutoRotationAngle());
		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict theta to be between desired limits
		theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));

		// restrict phi to be between desired limits
		phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

		// move target to panned location
		this.target.add(pan);

		offset.x = radius * Math.sin(phi) * Math.sin(theta);
		offset.y = radius * Math.cos(phi);
		offset.z = radius * Math.sin(phi) * Math.cos(theta);

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion(quatInverse);

		position.copy(this.target).add(offset);

		this.object.lookAt(this.target);

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set(0, 0, 0);

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if (lastPosition.distanceToSquared(this.object.position) > EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {

			this.dispatchEvent(changeEvent);

			lastPosition.copy(this.object.position);
			lastQuaternion.copy(this.object.quaternion);
		}
	};

	this.reset = function () {

		state = STATE.NONE;

		this.target.copy(this.target0);
		this.object.position.copy(this.position0);
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent(changeEvent);

		this.update();
	};

	this.getPolarAngle = function () {

		return phi;
	};

	this.getAzimuthalAngle = function () {

		return theta;
	};

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}

	function getZoomScale() {

		return Math.pow(0.95, scope.zoomSpeed);
	}

	function onMouseDown(event) {

		if (scope.enabled === false) return;
		event.preventDefault();

		if (event.button === scope.mouseButtons.ORBIT) {
			if (scope.noRotate === true) return;

			state = STATE.ROTATE;

			rotateStart.set(event.clientX, event.clientY);
		} else if (event.button === scope.mouseButtons.ZOOM) {
			if (scope.noZoom === true) return;

			state = STATE.DOLLY;

			dollyStart.set(event.clientX, event.clientY);
		} else if (event.button === scope.mouseButtons.PAN || event.button == THREE.MOUSE.LEFT) {
			if (scope.noPan === true) return;

			state = STATE.PAN;

			panStart.set(event.clientX, event.clientY);
		}

		if (state !== STATE.NONE) {
			document.addEventListener('mousemove', onMouseMove, false);
			document.addEventListener('mouseup', onMouseUp, false);
			scope.dispatchEvent(startEvent);
		}
	}

	function onMouseMove(event) {

		if (scope.enabled === false) return;

		event.preventDefault();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if (state === STATE.ROTATE) {

			if (scope.noRotate === true) return;

			rotateEnd.set(event.clientX, event.clientY);
			rotateDelta.subVectors(rotateEnd, rotateStart);

			// rotating across whole screen goes 360 degrees around
			scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

			// rotating up and down along whole screen attempts to go 360, but limited to 180
			scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

			rotateStart.copy(rotateEnd);
		} else if (state === STATE.DOLLY) {

			if (scope.noZoom === true) return;

			dollyEnd.set(event.clientX, event.clientY);
			dollyDelta.subVectors(dollyEnd, dollyStart);

			if (dollyDelta.y > 0) {

				scope.dollyIn();
			} else if (dollyDelta.y < 0) {

				scope.dollyOut();
			}

			dollyStart.copy(dollyEnd);
		} else if (state === STATE.PAN) {

			if (scope.noPan === true) return;

			panEnd.set(event.clientX, event.clientY);
			panDelta.subVectors(panEnd, panStart);

			scope.pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);
		}

		if (state !== STATE.NONE) scope.update();
	}

	function onMouseUp() /* event */{

		if (scope.enabled === false) return;

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
		scope.dispatchEvent(endEvent);
		state = STATE.NONE;
	}

	function onMouseWheel(event) {

		if (scope.enabled === false || scope.noZoom === true || state !== STATE.NONE) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if (event.wheelDelta !== undefined) {
			// WebKit / Opera / Explorer 9

			delta = event.wheelDelta;
		} else if (event.detail !== undefined) {
			// Firefox

			delta = -event.detail;
		}

		if (delta > 0) {

			scope.dollyOut();
		} else if (delta < 0) {

			scope.dollyIn();
		}

		scope.update();
		scope.dispatchEvent(startEvent);
		scope.dispatchEvent(endEvent);
	}

	function onKeyDown(event) {

		if (scope.enabled === false || scope.noKeys === true || scope.noPan === true) return;

		switch (event.keyCode) {

			case scope.keys.UP:
				scope.pan(0, scope.keyPanSpeed);
				scope.update();
				break;

			case scope.keys.BOTTOM:
				scope.pan(0, -scope.keyPanSpeed);
				scope.update();
				break;

			case scope.keys.LEFT:
				scope.pan(scope.keyPanSpeed, 0);
				scope.update();
				break;

			case scope.keys.RIGHT:
				scope.pan(-scope.keyPanSpeed, 0);
				scope.update();
				break;

		}
	}

	function touchstart(event) {

		if (scope.enabled === false) return;

		switch (event.touches.length) {

			case 1:
				// one-fingered touch: rotate

				if (scope.noRotate === true) return;

				state = STATE.TOUCH_ROTATE;

				rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
				break;

			case 2:
				// two-fingered touch: dolly

				if (scope.noZoom === true) return;

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[0].pageX - event.touches[1].pageX;
				var dy = event.touches[0].pageY - event.touches[1].pageY;
				var distance = Math.sqrt(dx * dx + dy * dy);
				dollyStart.set(0, distance);
				break;

			case 3:
				// three-fingered touch: pan

				if (scope.noPan === true) return;

				state = STATE.TOUCH_PAN;

				panStart.set(event.touches[0].pageX, event.touches[0].pageY);
				break;

			default:

				state = STATE.NONE;

		}

		if (state !== STATE.NONE) scope.dispatchEvent(startEvent);
	}

	function touchmove(event) {

		if (scope.enabled === false) return;

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch (event.touches.length) {

			case 1:
				// one-fingered touch: rotate

				if (scope.noRotate === true) return;
				if (state !== STATE.TOUCH_ROTATE) return;

				rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
				rotateDelta.subVectors(rotateEnd, rotateStart);

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

				rotateStart.copy(rotateEnd);

				scope.update();
				break;

			case 2:
				// two-fingered touch: dolly

				if (scope.noZoom === true) return;
				if (state !== STATE.TOUCH_DOLLY) return;

				var dx = event.touches[0].pageX - event.touches[1].pageX;
				var dy = event.touches[0].pageY - event.touches[1].pageY;
				var distance = Math.sqrt(dx * dx + dy * dy);

				dollyEnd.set(0, distance);
				dollyDelta.subVectors(dollyEnd, dollyStart);

				if (dollyDelta.y > 0) {

					scope.dollyOut();
				} else if (dollyDelta.y < 0) {

					scope.dollyIn();
				}

				dollyStart.copy(dollyEnd);

				scope.update();
				break;

			case 3:
				// three-fingered touch: pan

				if (scope.noPan === true) return;
				if (state !== STATE.TOUCH_PAN) return;

				panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
				panDelta.subVectors(panEnd, panStart);

				scope.pan(panDelta.x, panDelta.y);

				panStart.copy(panEnd);

				scope.update();
				break;

			default:

				state = STATE.NONE;

		}
	}

	function touchend() /* event */{

		if (scope.enabled === false) return;

		scope.dispatchEvent(endEvent);
		state = STATE.NONE;
	}

	this.domElement.addEventListener('contextmenu', function (event) {
		event.preventDefault();
	}, false);
	this.domElement.addEventListener('mousedown', onMouseDown, false);
	this.domElement.addEventListener('mousewheel', onMouseWheel, false);
	this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox

	this.domElement.addEventListener('touchstart', touchstart, false);
	this.domElement.addEventListener('touchend', touchend, false);
	this.domElement.addEventListener('touchmove', touchmove, false);

	window.addEventListener('keydown', onKeyDown, false);

	// force an update at start
	this.update();
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

},{}],2:[function(require,module,exports){
/**
 * Based on https://github.com/mrdoob/three.js/blob/a72347515fa34e892f7a9bfa66a34fdc0df55954/examples/js/exporters/STLExporter.js
 * Tested on r68 and r70
 * @author jcarletto / https://github.com/jcarletto27
 * @author kjlubick / https://github.com/kjlubick
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/

 */
'use strict';

THREE.STLExporter = function () {};

THREE.STLExporter.prototype = {

	constructor: THREE.STLExporter,

	parse: (function () {

		var vector = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();

		return function (scene) {

			var output = '';

			output += 'solid exported\n';

			scene.traverse(function (object) {

				if (object instanceof THREE.Mesh) {

					var geometry = object.geometry;
					var matrixWorld = object.matrixWorld;
					var mesh = object;

					if (geometry instanceof THREE.Geometry) {

						var vertices = geometry.vertices;
						var faces = geometry.faces;

						normalMatrixWorld.getNormalMatrix(matrixWorld);

						for (var i = 0, l = faces.length; i < l; i++) {
							var face = faces[i];

							vector.copy(face.normal).applyMatrix3(normalMatrixWorld).normalize();

							output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
							output += '\t\touter loop\n';

							var indices = [face.a, face.b, face.c];

							for (var j = 0; j < 3; j++) {
								var vertexIndex = indices[j];
								if (mesh.geometry.skinIndices.length == 0) {
									vector.copy(vertices[vertexIndex]).applyMatrix4(matrixWorld);
									output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
								} else {
									vector.copy(vertices[vertexIndex]); //.applyMatrix4( matrixWorld );

									// see https://github.com/mrdoob/three.js/issues/3187
									boneIndices = [];
									boneIndices[0] = mesh.geometry.skinIndices[vertexIndex].x;
									boneIndices[1] = mesh.geometry.skinIndices[vertexIndex].y;
									boneIndices[2] = mesh.geometry.skinIndices[vertexIndex].z;
									boneIndices[3] = mesh.geometry.skinIndices[vertexIndex].w;

									weights = [];
									weights[0] = mesh.geometry.skinWeights[vertexIndex].x;
									weights[1] = mesh.geometry.skinWeights[vertexIndex].y;
									weights[2] = mesh.geometry.skinWeights[vertexIndex].z;
									weights[3] = mesh.geometry.skinWeights[vertexIndex].w;

									inverses = [];
									inverses[0] = mesh.skeleton.boneInverses[boneIndices[0]];
									inverses[1] = mesh.skeleton.boneInverses[boneIndices[1]];
									inverses[2] = mesh.skeleton.boneInverses[boneIndices[2]];
									inverses[3] = mesh.skeleton.boneInverses[boneIndices[3]];

									skinMatrices = [];
									skinMatrices[0] = mesh.skeleton.bones[boneIndices[0]].matrixWorld;
									skinMatrices[1] = mesh.skeleton.bones[boneIndices[1]].matrixWorld;
									skinMatrices[2] = mesh.skeleton.bones[boneIndices[2]].matrixWorld;
									skinMatrices[3] = mesh.skeleton.bones[boneIndices[3]].matrixWorld;

									//this checks to see if the mesh has any morphTargets - jc
									if (mesh.geometry.morphTargets !== 'undefined') {

										morphMatricesX = [];
										morphMatricesY = [];
										morphMatricesZ = [];
										morphMatricesInfluence = [];

										for (var mt = 0; mt < mesh.geometry.morphTargets.length; mt++) {
											//collect the needed vertex info - jc
											morphMatricesX[mt] = mesh.geometry.morphTargets[mt].vertices[vertexIndex].x;
											morphMatricesY[mt] = mesh.geometry.morphTargets[mt].vertices[vertexIndex].y;
											morphMatricesZ[mt] = mesh.geometry.morphTargets[mt].vertices[vertexIndex].z;
											morphMatricesInfluence[mt] = mesh.morphTargetInfluences[mt];
										}
									}
									var finalVector = new THREE.Vector4();

									if (mesh.geometry.morphTargets !== 'undefined') {

										var morphVector = new THREE.Vector4(vector.x, vector.y, vector.z);

										for (var mt = 0; mt < mesh.geometry.morphTargets.length; mt++) {
											//not pretty, but it gets the job done - jc
											morphVector.lerp(new THREE.Vector4(morphMatricesX[mt], morphMatricesY[mt], morphMatricesZ[mt], 1), morphMatricesInfluence[mt]);
										}
									}

									for (var k = 0; k < 4; k++) {
										if (mesh.geometry.morphTargets !== 'undefined') {
											var tempVector = new THREE.Vector4(morphVector.x, morphVector.y, morphVector.z);
										} else {
											var tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
										}
										tempVector.multiplyScalar(weights[k]);
										//the inverse takes the vector into local bone space
										//which is then transformed to the appropriate world space
										tempVector.applyMatrix4(inverses[k]).applyMatrix4(skinMatrices[k]);
										finalVector.add(tempVector);
									}

									output += '\t\t\tvertex ' + finalVector.x + ' ' + finalVector.y + ' ' + finalVector.z + '\n';
								}
							}
							output += '\t\tendloop\n';
							output += '\tendfacet\n';
						}
					}
				}
			});

			output += 'endsolid exported\n';

			return output;
		};
	})()
};

function saveSTL(scene, name) {
	var exporter = new THREE.STLExporter();
	var stlString = exporter.parse(scene);

	var blob = new Blob([stlString], {
		type: 'text/plain'
	});

	saveAs(blob, name + '.stl');
}
var exporter = new THREE.STLExporter();
var exportString = function exportString(output, filename) {

	var blob = new Blob([output], {
		type: 'text/plain'
	});
	var objectURL = URL.createObjectURL(blob);

	var link = document.createElement('a');
	link.href = objectURL;
	link.download = filename || 'data.json';
	link.target = '_blank';
	link.click();
};

module.exports.saveSTL = saveSTL;
module.exports.exportString = exportString;

},{}],3:[function(require,module,exports){
'use strict';

var device_json = JSON.parse('{"name":"My Device","params":{"width":75800,"height":51000},"layers":[{"name":"flow","color":"indigo","params":{"z_offset":0,"flip":false},"features":{"6bb96ad0-3d80-11e5-898a-2de600a0e2af":{"id":"6bb96ad0-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[30000,40000],"radius1":700,"radius2":700,"height":100}},"6bb96ad1-3d80-11e5-898a-2de600a0e2af":{"id":"6bb96ad1-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[40000,40000],"radius1":700,"radius2":700,"height":100}},"6bb96ad2-3d80-11e5-898a-2de600a0e2af":{"id":"6bb96ad2-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[50000,40000],"radius1":700,"radius2":700,"height":100}},"6bb96ad3-3d80-11e5-898a-2de600a0e2af":{"id":"6bb96ad3-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[20000,40000],"radius1":700,"radius2":700,"height":100}},"6bb991e0-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e0-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[20000,40000],"end":[20000,35000],"width":400,"height":100}},"6bb991e1-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e1-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[20000,38000],"end":[17000,38000],"width":400,"height":100}},"6bb991e2-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e2-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[17000,38000],"end":[17000,35000],"width":400,"height":100}},"6bb991e3-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e3-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[20000,35000],"end":[20000,20000],"width":400,"height":100}},"6bb991e4-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e4-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[20000,20000],"end":[10000,10000],"width":400,"height":100}},"6bb991e5-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e5-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[17000,35000],"end":[15000,30000],"width":400,"height":100}},"6bb991e6-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e6-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[15000,30000],"end":[10000,30000],"width":400,"height":100}},"6bb991e7-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e7-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[10000,30000],"end":[10000,28000],"width":400,"height":100}},"6bb991e8-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e8-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[10000,28000],"end":[15000,28000],"width":400,"height":100}},"6bb991e9-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991e9-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[15000,28000],"end":[15000,25000],"width":400,"height":100}},"6bb991ea-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991ea-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[15000,25000],"end":[8000,25000],"width":400,"height":100}},"6bb991eb-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991eb-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[8000,25000],"radius1":700,"radius2":700,"height":100}},"6bb991ec-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991ec-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[10000,10000],"radius1":700,"radius2":700,"height":100}},"6bb991ed-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991ed-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[30000,40000],"end":[30000,20000],"width":400,"height":100}},"6bb991ee-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991ee-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[30000,20000],"end":[20000,10000],"width":400,"height":100}},"6bb991ef-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991ef-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[20000,10000],"radius1":700,"radius2":700,"height":100}},"6bb991f0-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f0-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[30000,38000],"end":[27000,38000],"width":400,"height":100}},"6bb991f1-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f1-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[27000,38000],"end":[27000,30000],"width":400,"height":100}},"6bb991f2-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f2-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[27000,30000],"end":[22000,30000],"width":400,"height":100}},"6bb991f3-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f3-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[22000,30000],"end":[22000,28000],"width":400,"height":100}},"6bb991f4-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f4-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[22000,28000],"end":[27000,28000],"width":400,"height":100}},"6bb991f5-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f5-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[27000,28000],"end":[27000,26000],"width":400,"height":100}},"6bb991f6-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f6-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[27000,26000],"end":[22000,26000],"width":400,"height":100}},"6bb991f7-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f7-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[22000,26000],"end":[22000,24000],"width":400,"height":100}},"6bb991f8-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f8-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[22000,24000],"end":[27000,24000],"width":400,"height":100}},"6bb991f9-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991f9-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[27000,24000],"end":[27000,22000],"width":400,"height":100}},"6bb991fa-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991fa-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[27000,22000],"end":[22000,22000],"width":400,"height":100}},"6bb991fb-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991fb-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[22000,22000],"end":[22000,20000],"width":400,"height":100}},"6bb991fc-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991fc-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[22000,20000],"end":[25000,20000],"width":400,"height":100}},"6bb991fd-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991fd-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[25000,20000],"end":[25000,17000],"width":400,"height":100}},"6bb991fe-3d80-11e5-898a-2de600a0e2af":{"id":"6bb991fe-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[25000,17000],"end":[21000,17000],"width":400,"height":100}},"6bb9b8f0-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f0-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[21000,17000],"radius1":700,"radius2":700,"height":100}},"6bb9b8f1-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f1-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[40000,40000],"end":[40000,20000],"width":400,"height":100}},"6bb9b8f2-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f2-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[40000,20000],"end":[50000,10000],"width":400,"height":100}},"6bb9b8f3-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f3-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[40000,38000],"end":[43000,38000],"width":400,"height":100}},"6bb9b8f4-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f4-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[43000,38000],"end":[43000,30000],"width":400,"height":100}},"6bb9b8f5-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f5-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[43000,30000],"end":[48000,30000],"width":400,"height":100}},"6bb9b8f6-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f6-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[48000,30000],"end":[48000,28000],"width":400,"height":100}},"6bb9b8f7-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f7-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[48000,28000],"end":[43000,28000],"width":400,"height":100}},"6bb9b8f8-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f8-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[43000,28000],"end":[43000,26000],"width":400,"height":100}},"6bb9b8f9-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8f9-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[43000,26000],"end":[48000,26000],"width":400,"height":100}},"6bb9b8fa-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8fa-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[48000,26000],"end":[48000,24000],"width":400,"height":100}},"6bb9b8fb-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8fb-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[48000,24000],"end":[43000,24000],"width":400,"height":100}},"6bb9b8fc-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8fc-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[43000,24000],"end":[43000,22000],"width":400,"height":100}},"6bb9b8fd-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8fd-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[43000,22000],"end":[48000,22000],"width":400,"height":100}},"6bb9b8fe-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8fe-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[48000,22000],"end":[48000,20000],"width":400,"height":100}},"6bb9b8ff-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b8ff-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[48000,20000],"end":[45000,20000],"width":400,"height":100}},"6bb9b900-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b900-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[45000,20000],"end":[45000,17000],"width":400,"height":100}},"6bb9b901-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b901-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[45000,17000],"end":[49000,17000],"width":400,"height":100}},"6bb9b902-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b902-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[50000,10000],"radius1":700,"radius2":700,"height":100}},"6bb9b903-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b903-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[49000,17000],"radius1":700,"radius2":700,"height":100}},"6bb9b904-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b904-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[50000,40000],"end":[50000,20000],"width":400,"height":100}},"6bb9b905-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b905-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[50000,20000],"end":[60000,10000],"width":400,"height":100}},"6bb9b906-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9b906-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[60000,10000],"radius1":700,"radius2":700,"height":100}},"6bb9e000-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e000-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[50000,38000],"end":[53000,38000],"width":400,"height":100}},"6bb9e001-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e001-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[53000,38000],"end":[53000,35000],"width":400,"height":100}},"6bb9e002-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e002-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[53000,35000],"end":[55000,30000],"width":400,"height":100}},"6bb9e003-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e003-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[55000,30000],"end":[60000,30000],"width":400,"height":100}},"6bb9e004-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e004-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[60000,30000],"end":[60000,28000],"width":400,"height":100}},"6bb9e005-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e005-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[60000,28000],"end":[55000,28000],"width":400,"height":100}},"6bb9e006-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e006-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[55000,28000],"end":[55000,25000],"width":400,"height":100}},"6bb9e007-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e007-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[55000,25000],"end":[62000,25000],"width":400,"height":100}},"6bb9e008-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e008-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[62000,25000],"radius1":700,"radius2":700,"height":100}},"6bb9e009-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e009-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[15000,15000],"end":[15000,12000],"width":400,"height":100}},"6bb9e00a-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e00a-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[15000,12000],"radius1":800,"radius2":700,"height":1000}},"6bb9e00b-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e00b-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[26000,12000],"radius1":800,"radius2":700,"height":1000}},"6bb9e00c-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e00c-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[44000,12000],"radius1":800,"radius2":700,"height":1000}},"6bb9e00d-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e00d-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[55000,12000],"radius1":800,"radius2":700,"height":1000}},"6bb9e00e-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e00e-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[55000,12000],"end":[55000,15000],"width":400,"height":100}},"6bb9e00f-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e00f-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[26000,12000],"end":[30000,10000],"width":400,"height":100}},"6bb9e010-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e010-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[44000,12000],"end":[40000,10000],"width":400,"height":100}},"6bb9e011-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e011-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[40000,10000],"end":[38000,7000],"width":400,"height":100}},"6bb9e012-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e012-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[30000,10000],"end":[32000,7000],"width":400,"height":100}},"6bb9e013-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e013-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[32000,7000],"radius1":700,"radius2":700,"height":100}},"6bb9e014-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e014-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[38000,7000],"radius1":700,"radius2":700,"height":100}},"6bb9e015-3d80-11e5-898a-2de600a0e2af":{"id":"6bb9e015-3d80-11e5-898a-2de600a0e2af","name":"New CircleValve","type":"CircleValve","params":{"position":[35000,10000],"radius1":1400,"radius2":1200,"height":800}},"6bba0710-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0710-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[35000,10000],"end":[35000,30000],"width":400,"height":100}},"6bba0711-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0711-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[35000,30000],"radius1":700,"radius2":700,"height":100}},"6bba0712-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0712-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[35000,17000],"end":[38000,23000],"width":400,"height":100}},"6bba0713-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0713-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[38000,23000],"end":[36000,25000],"width":400,"height":100}},"6bba0714-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0714-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[36000,25000],"end":[35000,30000],"width":400,"height":100}},"6bba0715-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0715-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[35000,17000],"end":[32000,23000],"width":400,"height":100}},"6bba0716-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0716-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[32000,23000],"end":[34000,25000],"width":400,"height":100}},"6bba0717-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0717-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[34000,25000],"end":[35000,30000],"width":400,"height":100}},"6bba0718-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0718-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[32000,23000],"end":[35000,24000],"width":400,"height":100}},"6bba0719-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0719-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[38000,23000],"end":[35000,24000],"width":400,"height":100}},"6bba071a-3d80-11e5-898a-2de600a0e2af":{"id":"6bba071a-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[25000,20000],"end":[28000,20000],"width":400,"height":100}},"6bba071b-3d80-11e5-898a-2de600a0e2af":{"id":"6bba071b-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[28000,20000],"end":[28000,22000],"width":400,"height":100}},"6bba071c-3d80-11e5-898a-2de600a0e2af":{"id":"6bba071c-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[28000,22000],"end":[27000,22000],"width":400,"height":100}},"6bba071d-3d80-11e5-898a-2de600a0e2af":{"id":"6bba071d-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[45000,20000],"end":[42000,20000],"width":400,"height":100}},"6bba071e-3d80-11e5-898a-2de600a0e2af":{"id":"6bba071e-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[42000,20000],"end":[42000,22000],"width":400,"height":100}},"6bba071f-3d80-11e5-898a-2de600a0e2af":{"id":"6bba071f-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[42000,22000],"end":[44000,22000],"width":400,"height":100}},"8d30ec10-3d80-11e5-898a-2de600a0e2af":{"id":"8d30ec10-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[35000,30000],"radius1":800,"radius2":700,"height":1000}},"9b26fd00-3d80-11e5-898a-2de600a0e2af":{"id":"9b26fd00-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[32000,20000],"radius1":800,"radius2":700,"height":1000}},"9c3deb40-3d80-11e5-898a-2de600a0e2af":{"id":"9c3deb40-3d80-11e5-898a-2de600a0e2af","name":"New Via","type":"Via","params":{"position":[38000,20000],"radius1":800,"radius2":700,"height":1000}}}},{"name":"control","color":"red","params":{"z_offset":1200,"flip":true},"features":{"6bba0720-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0720-3d80-11e5-898a-2de600a0e2af","name":"New CircleValve","type":"CircleValve","params":{"position":[20000,34000],"radius1":1400,"radius2":1200,"height":800}},"6bba0721-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0721-3d80-11e5-898a-2de600a0e2af","name":"New CircleValve","type":"CircleValve","params":{"position":[30000,34000],"radius1":1400,"radius2":1200,"height":800}},"6bba0722-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0722-3d80-11e5-898a-2de600a0e2af","name":"New CircleValve","type":"CircleValve","params":{"position":[40000,34000],"radius1":1400,"radius2":1200,"height":800}},"6bba0723-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0723-3d80-11e5-898a-2de600a0e2af","name":"New CircleValve","type":"CircleValve","params":{"position":[50000,34000],"radius1":1400,"radius2":1200,"height":800}},"6bba0724-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0724-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[20000,34000],"end":[24000,34000],"width":400,"height":100}},"6bba0725-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0725-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[24000,34000],"end":[24000,47000],"width":400,"height":100}},"6bba0726-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0726-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[30000,34000],"end":[34000,34000],"width":400,"height":100}},"6bba0727-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0727-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[34000,34000],"end":[34000,47000],"width":400,"height":100}},"6bba0728-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0728-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[40000,34000],"end":[37000,34000],"width":400,"height":100}},"6bba0729-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0729-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[37000,34000],"end":[36000,34000],"width":400,"height":100}},"6bba072a-3d80-11e5-898a-2de600a0e2af":{"id":"6bba072a-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[36000,34000],"end":[36000,47000],"width":400,"height":100}},"6bba072b-3d80-11e5-898a-2de600a0e2af":{"id":"6bba072b-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[50000,34000],"end":[46000,34000],"width":400,"height":100}},"6bba072c-3d80-11e5-898a-2de600a0e2af":{"id":"6bba072c-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[46000,34000],"end":[46000,47000],"width":400,"height":100}},"6bba072d-3d80-11e5-898a-2de600a0e2af":{"id":"6bba072d-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[24000,47000],"radius1":700,"radius2":700,"height":100}},"6bba072e-3d80-11e5-898a-2de600a0e2af":{"id":"6bba072e-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[34000,47000],"radius1":700,"radius2":700,"height":100}},"6bba072f-3d80-11e5-898a-2de600a0e2af":{"id":"6bba072f-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[36000,47000],"radius1":700,"radius2":700,"height":100}},"6bba0730-3d80-11e5-898a-2de600a0e2af":{"id":"6bba0730-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[46000,47000],"radius1":700,"radius2":700,"height":100}},"6bba2e20-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e20-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[15000,12000],"end":[26000,12000],"width":400,"height":100}},"6bba2e21-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e21-3d80-11e5-898a-2de600a0e2af","name":"New Channel","type":"Channel","params":{"start":[44000,12000],"end":[55000,12000],"width":400,"height":100}},"6bba2e22-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e22-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[15000,12000],"radius1":700,"radius2":700,"height":100}},"6bba2e23-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e23-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[26000,12000],"radius1":700,"radius2":700,"height":100}},"6bba2e24-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e24-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[44000,12000],"radius1":700,"radius2":700,"height":100}},"6bba2e25-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e25-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[55000,12000],"radius1":700,"radius2":700,"height":100}},"6bba2e26-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e26-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[25000,21000],"radius1":700,"radius2":700,"height":100}},"6bba2e27-3d80-11e5-898a-2de600a0e2af":{"id":"6bba2e27-3d80-11e5-898a-2de600a0e2af","name":"New Port","type":"Port","params":{"position":[45000,21000],"radius1":700,"radius2":700,"height":100}}}}],"groups":[],"defaults":{}}');

module.exports = device_json;

},{}],4:[function(require,module,exports){
"use strict";

var OrbitControls = require("./OrbitControls");
var device_json = require("./device_json");
var STLExporter = require("./STLExporter");
var saveSTL = STLExporter.saveSTL;

var container = document.getElementById('renderContainer');
var camera, controls, scene, renderer;

var redMaterial = new THREE.MeshLambertMaterial({ color: 0xF44336, shading: THREE.FlatShading });
var blueMaterial = new THREE.MeshLambertMaterial({ color: 0x3F51B5, shading: THREE.FlatShading });
var whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, shading: THREE.FlatShading });
var purpleMaterial = new THREE.MeshLambertMaterial({ color: 0x673AB7, shading: THREE.FlatShading });
var greyMaterial = new THREE.MeshLambertMaterial({ color: 0x9E9E9E, shading: THREE.FlatShading });
var slideMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, opacity: 0.1, transparent: true });
var holderMaterial = greyMaterial;
var groundMaterial = new THREE.MeshBasicMaterial({ color: 0x414141, shading: THREE.FlatShading });
var backgroundColor = 0xEEEEEE;

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

function getFeatureMaterial(feature, layer) {
	var colorString = layer.color;
	if (colorString && layerMaterials.hasOwnProperty(colorString)) {
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

function showLayer(index) {
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
	for (var featureID in layer.features) {
		var feature = layer.features[featureID];
		renderedFeatures.add(renderFeature(feature, layer, z_offset));
	}
	return renderedFeatures;
}

function renderFeature(feature, layer, z_offset) {
	var type = feature.type;
	var renderedFeature;

	if (type == "Channel") renderedFeature = Channel(feature, layer, z_offset);else if (type == "CircleValve") renderedFeature = CircleValve(feature, layer, z_offset);else if (type == "Via") renderedFeature = Via(feature, layer, z_offset);else if (type == "Port") renderedFeature = Port(feature, layer, z_offset);else console.log("Feature type not recognized: " + type);

	return renderedFeature;
}

function renderLayers(json) {
	var renderedLayers = [];
	for (var i = 0; i < json.layers.length; i++) {
		renderedLayers.push(renderLayer(json, i));
	}
	return renderedLayers;
}

function renderLayer(json, layerIndex) {
	console.log("Rendering layer: " + layerIndex);
	var width = json.params.width;
	var height = json.params.height;
	var layer = json.layers[layerIndex];
	var renderedFeatures = new THREE.Group();
	var renderedLayer = new THREE.Group();
	renderedFeatures.add(renderFeatures(layer, 0));
	if (layer.params.flip) {
		flipLayer(renderedFeatures, height, layer.params.z_offset);
	}
	renderedLayer.add(renderedFeatures);
	renderedLayer.add(SlideHolder(width, height, SLIDE_THICKNESS, true));
	return renderedLayer;
}

function flipLayer(layer, height, z_offset) {
	layer.rotation.x += Math.PI;
	layer.position.y += height;
	layer.position.z += z_offset;
}

function renderMockup(json) {
	mockup = null;
	var renderedMockup = new THREE.Group();
	var layers = json.layers;
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
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
	camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
	camera.position.z = 100;
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
			flip: false
		},
		color: "indigo"
	};

	var control = {
		params: {
			z_offset: 1,
			flip: true
		},
		color: "red"
	};

	var via = {
		params: {
			position: [5, 10],
			height: .6,
			radius1: .6,
			radius2: .4
		}
	};

	var channel = {
		params: {
			start: [0, 0],
			end: [10, 10],
			height: .4,
			width: .6
		}
	};

	var boxGeom = new THREE.BoxGeometry(1, 1, 1);

	var viaMesh = Via(via, control);
	var channelMesh = Channel(channel, flow);

	var group = new THREE.Group();

	//console.log(viaMesh.geometry);

	//scene.add(viaMesh);
	//scene.add(channelMesh);

	//lights
	var light1 = new THREE.DirectionalLight(0xffffff);
	light1.position.set(1, 1, 1);
	scene.add(light1);

	var light2 = new THREE.DirectionalLight(0x002288);
	light2.position.set(-1, -1, -1);
	scene.add(light2);

	var light3 = new THREE.AmbientLight(0x222222);
	scene.add(light3);

	//renderer

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setClearColor(backgroundColor, 1);

	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);

	//controls.update();

	//scene.remove(slide);
	//saveSTL(scene, "foo");
	//scene.add(slide);

	//setupCamera(35,25,50.8, 500);
}

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.clientWidth, container.clientHeight);
	render();
}

function render() {
	renderer.render(scene, camera);
}

function setupCamera(centerX, centerY, deviceHeight, pixelHeight) {
	camera.position.z = getCameraDistance(deviceHeight, pixelHeight);
	controls.panLeft(-centerX);
	controls.panUp(-centerY + deviceHeight);
	controls.update();
}

function DevicePlane(width, height, offset) {
	var plane = new THREE.PlaneBufferGeometry(width, height);
	var material = whiteMaterial;
	var mesh = new THREE.Mesh(plane, material);
	var matrix = new THREE.Matrix4();
	mesh.geometry.applyMatrix(matrix.makeTranslation(width / 2, height / 2, -offset));
	return mesh;
}

function GroundPlane(width, height) {
	var plane = new THREE.PlaneGeometry(width, height);
	var material = groundMaterial;
	var mesh = new THREE.Mesh(plane, material);
	return mesh;
}

function Via(via, layer, z_offset) {
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

function Port(port, layer, z_offset) {
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

function CircleValve(circleValve, layer, z_offset) {
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

function ConeFeature(position, radius1, radius2, height, flip, z_offset) {
	var cone = Cone(position, radius1, radius2, height);
	var matrix = new THREE.Matrix4();
	if (flip) {
		cone.applyMatrix(matrix.makeRotationX(Math.PI));
		cone.applyMatrix(matrix.makeTranslation(0, position[1] * 2, 0));
	}
	cone.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
	return cone;
}

function TwoPointBoxFeature(start, end, width, height, flip, z_offset) {
	var box = TwoPointRoundedBox(start, end, width, height);
	var matrix = new THREE.Matrix4();

	if (flip) {
		box.applyMatrix(matrix.makeTranslation(0, 0, -height));
	}
	box.applyMatrix(matrix.makeTranslation(0, 0, z_offset));
	return box;
}

function Channel(channel, layer, z_offset) {
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

function Cone(position, radius1, radius2, height) {
	var cyl = new THREE.CylinderGeometry(radius2, radius1, height, 16);
	var material = redMaterial;
	var matrix = new THREE.Matrix4();
	cyl.applyMatrix(matrix.makeRotationX(Math.PI / 2));
	cyl.applyMatrix(matrix.makeTranslation(position[0], position[1], height / 2));
	return cyl;
}

function TwoPointBox(start, end, width, height) {
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
	box.applyMatrix(matrix.makeTranslation(start[0], start[1], height / 2));
	box.applyMatrix(matrix.makeTranslation(dX / 2, dY / 2, 0));
	return box;
}

function Slide(width, height, thickness) {
	var group = new THREE.Group();
	var slide = new THREE.BoxGeometry(width, height, thickness);
	var material = slideMaterial;
	var matrix = new THREE.Matrix4();
	slide.applyMatrix(matrix.makeTranslation(width / 2, height / 2, -thickness / 2));
	var mesh = new THREE.Mesh(slide, material);
	group.add(mesh);
	group.add(DevicePlane(width, height, thickness + .001));
	return group;
}

function SlideHolder(width, height, thickness, slide) {
	var renderedHolder = new THREE.Group();
	if (slide) {
		renderedHolder.add(Slide(width, height, thickness));
	}
	return renderedHolder;
}

function TwoPointRoundedBox(start, end, width, height) {
	var box = TwoPointBox(start, end, width, height);
	var cone1 = Cone(start, width / 2, width / 2, height);
	var cone2 = Cone(end, width / 2, width / 2, height);
	var merged = mergeGeometries([box, cone1, cone2]);
	return merged;
}

function mergeGeometries(geometries) {
	var merged = new THREE.Geometry();
	for (var i = 0; i < geometries.length; i++) {
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
			params[key] = [pos[0] / 1000, height - pos[1] / 1000];
		} else {
			params[key] = params[key] / 1000;
		}
	}
}

function computeHeightInPixels(objectHeight, distance) {
	var vFOV = camera.fov * Math.PI / 180; //
	var height = 2 * Math.tan(vFOV / 2) * distance; // visible height
	var ratio = objectHeight / height;
	var pixels = container.clientHeight * ratio;
	return pixels;
}

function getCameraDistance(objectHeight, pixelHeight) {
	var vFOV = camera.fov * Math.PI / 180;
	var ratio = pixelHeight / container.clientHeight;
	var height = objectHeight / ratio;
	var distance = height / (2 * Math.tan(vFOV / 2));
	return distance;
}

},{"./OrbitControls":1,"./STLExporter":2,"./device_json":3}]},{},[4]);
