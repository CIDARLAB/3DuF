import * as OrbitControls from "./threeLib/orbitControls";
import * as STLExporter from "./threeLib/stlExporter";
import * as Detector from "./threeLib/detector";
var getSTLString = STLExporter.getSTLString;
import { Device3D } from "./primitiveSets3D";
import { renderFeature } from "./threeFeatureRenderer";
import * as Colors from "../colors";
import * as THREE from "three";

var SLIDE_HOLDER_MATERIAL = new THREE.MeshLambertMaterial({
    color: 0x9e9e9e,
    shading: THREE.SmoothShading
});
var SLIDE_GLASS_MATERIAL = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    opacity: 0.0,
    transparent: true
});
var DEVICE_PLANE_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading
});

var HOLDER_BORDER_WIDTH = 0.41;
var INTERLOCK_TOLERANCE = 0.125;
var SLIDE_THICKNESS = 1.2;

export class ThreeDeviceRenderer {
    constructor(renderContainer) {
        this.container = renderContainer;
        this.camera;
        this.controls;
        this.scene;
        this.renderer;
        this.backgroundColor = Colors.BLUE_50;
        this.mockup = null;
        this.layers = null;
        this.json = null;
        this.initialY = 0;
        this.showingLayer = false;

        this.init();
        this.render();
    }

    init() {
        if (!Detector.webgl) Detector.addGetWebGLMessage();
        this.initCamera();
        this.initControls();
        this.initScene();
        this.initRenderer();
        let reference = this;
        window.addEventListener(
            "resize",
            function() {
                reference.onWindowResize();
            },
            false
        );
    }

    toggleLayerView(index) {
        if (this.showingLayer) this.showMockup();
        else this.showLayer(index);
    }

    getLayerSTL(json, index) {
        let scene = this.emptyScene();
        let layer = json.layers[index];
        scene.add(this.renderLayer(json, index, false));
        this.renderer.render(scene, this.camera);
        let string = getSTLString(scene);
        this.renderer.render(this.scene, this.camera);
        return getSTLString(scene);
    }

    getLayerSTLStrings(json) {
        let output = [];
        for (let i = 0; i < json.layers.length; i++) {
            output.push(this.getLayerSTL(json, i));
        }
        return output;
    }

    getSTL(json) {
        ThreeDeviceRenderer.sanitizeJSON(json);
        return this.getLayerSTLStrings(json);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 1, 1000);
        this.camera.position.z = 100;
    }

    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.container);
        this.controls.damping = 0.2;
        let reference = this;
        this.controls.addEventListener("change", function() {
            reference.render();
        });
    }

    emptyScene() {
        let scene = new THREE.Scene();
        scene = new THREE.Scene();
        //lights
        var light1 = new THREE.DirectionalLight(0xffffff);
        light1.position.set(1, 1, 1);
        scene.add(light1);

        var light2 = new THREE.DirectionalLight(0xffffff);
        light2.position.set(-1, -1, -1);
        scene.add(light2);

        var light3 = new THREE.AmbientLight(0x333333);
        scene.add(light3);
        return scene;
    }

    initScene() {
        this.scene = this.emptyScene();
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(this.backgroundColor, 1);
        this.container.appendChild(this.renderer.domElement);
    }

    static sanitizeJSON(json) {
        ThreeDeviceRenderer.sanitizeParams(json.params);
        for (var i = 0; i < json.layers.length; i++) {
            ThreeDeviceRenderer.sanitizeParams(json.layers[i].params, json.params.height);
            for (var key in json.layers[i].features) {
                ThreeDeviceRenderer.sanitizeParams(json.layers[i].features[key].params, json.params.height);
            }
        }
    }

    static sanitizeParams(params, height) {
        for (var key in params) {
            if (key == "start" || key == "end" || key == "position") {
                var pos = params[key];
                params[key] = [pos[0] / 1000, height - pos[1] / 1000];
            } else {
                params[key] = params[key] / 1000;
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    setupCamera(centerX, centerY, deviceHeight, pixelHeight, initialZoom) {
        this.controls.reset();
        this.camera.position.z = this.getCameraDistance(deviceHeight, pixelHeight);
        this.controls.panLeft(-centerX);
        this.controls.panUp(-centerY + deviceHeight);
        this.controls.update();
        this.initialY = this.camera.position.y;
        this.initialZoom = initialZoom;
    }

    getCameraCenterInMicrometers() {
        let position = this.camera.position;
        return [position.x * 1000, (this.camera.position.y - this.initialY) * 1000];
    }

    getZoom() {
        let height = this.json.params.height / 1000;
        let distance = this.camera.position.z;
        if (distance < 0) {
            return this.initialZoom;
        }
        let pixels = this.computeHeightInPixels(height, distance);
        let zoom = pixels / this.json.params.height;
        return zoom;
    }

    getCameraDistance(objectHeight, pixelHeight) {
        var vFOV = (this.camera.fov * Math.PI) / 180;
        var ratio = pixelHeight / this.container.clientHeight;
        var height = objectHeight / ratio;
        var distance = height / (2 * Math.tan(vFOV / 2));
        return distance;
    }

    computeHeightInPixels(objectHeight, distance) {
        var vFOV = (this.camera.fov * Math.PI) / 180; //
        var height = 2 * Math.tan(vFOV / 2) * distance; // visible height
        var ratio = objectHeight / height;
        var pixels = this.container.clientHeight * ratio;
        return pixels;
    }

    loadDevice(renderedDevice) {
        this.initScene();
        this.scene.add(renderedDevice);
        this.render();
    }

    showMockup() {
        if (this.mockup) {
            this.showingLayer = false;
            this.loadDevice(this.mockup);
        }
    }

    showLayer(index) {
        if (this.layers && this.json) {
            let layer = this.layers[index].clone();
            this.loadDevice(layer);
            this.showingLayer = true;
        }
    }

    loadJSON(json) {
        this.json = json;
        ThreeDeviceRenderer.sanitizeJSON(json);
        this.mockup = this.renderMockup(json);
        this.layers = this.renderLayers(json);
    }

    renderFeatures(layer, z_offset) {
        var renderedFeatures = new THREE.Group();
        for (var featureID in layer.features) {
            var feature = layer.features[featureID];
            renderedFeatures.add(renderFeature(feature, layer, z_offset));
        }
        return renderedFeatures;
    }

    renderLayers(json) {
        var renderedLayers = [];
        for (var i = 0; i < json.layers.length; i++) {
            renderedLayers.push(this.renderLayer(json, i, true));
        }
        return renderedLayers;
    }

    renderSlide(width, height, thickness, slideMaterial = SLIDE_GLASS_MATERIAL, planeMaterial = DEVICE_PLANE_MATERIAL) {
        let slideParams = {
            width: width,
            height: height,
            thickness: thickness
        };

        let planeParams = {
            width: width,
            height: height
        };
        let slideGeometry = Device3D.Slide(slideParams);
        let planeGeometry = Device3D.DevicePlane(planeParams);
        let group = new THREE.Group();
        let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        let slideMesh = new THREE.Mesh(slideGeometry, slideMaterial);
        group.add(planeMesh);
        group.add(slideMesh);
        return group;
    }

    renderSlideHolder(width, height, slideThickness, borderWidth, interlock, material = SLIDE_HOLDER_MATERIAL) {
        let holderParams = {
            width: width,
            height: height,
            slideThickness: slideThickness,
            borderWidth: borderWidth,
            interlock: interlock
        };

        let holderGeometry = Device3D.SlideHolder(holderParams);
        let holderMesh = new THREE.Mesh(holderGeometry, material);
        return holderMesh;
    }

    renderSlideAssembly(width, height, slide = false, slideThickness = SLIDE_THICKNESS, borderWidth = HOLDER_BORDER_WIDTH, interlock = INTERLOCK_TOLERANCE) {
        let assembly = new THREE.Group();
        let holder = this.renderSlideHolder(width, height, slideThickness, borderWidth, interlock);
        assembly.add(holder);
        if (slide) {
            let slide = this.renderSlide(width, height, slideThickness);
            assembly.add(slide);
        }
        assembly.position.z -= slideThickness;
        return assembly;
    }

    renderLayer(json, layerIndex, viewOnly = false) {
        var width = json.params.width;
        var height = json.params.height;
        var layer = json.layers[layerIndex];
        var renderedFeatures = new THREE.Group();
        var renderedLayer = new THREE.Group();
        if (viewOnly) renderedFeatures.add(this.renderFeatures(layer, layer.params.z_offset));
        else renderedFeatures.add(this.renderFeatures(layer, 0));
        if (layer.params.flip && !viewOnly) this.flipLayer(renderedFeatures, height, layer.params.z_offset);
        renderedLayer.add(renderedFeatures);
        let assembly = this.renderSlideAssembly(width, height, viewOnly);
        renderedLayer.add(assembly);
        return renderedLayer;
    }

    flipLayer(layer, height, z_offset) {
        layer.rotation.x += Math.PI;
        layer.position.y += height;
        layer.position.z += z_offset;
    }

    renderMockup(json) {
        let width = json.params.width;
        let height = json.params.height;
        var renderedMockup = new THREE.Group();
        var layers = json.layers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var renderedLayer = this.renderFeatures(layer, layer.params.z_offset);
            renderedMockup.add(renderedLayer);
        }
        var renderedHolder = this.renderSlideAssembly(width, height, true);
        renderedMockup.add(renderedHolder);
        return renderedMockup;
    }

    animate() {
        requestAnimationFrame(animate);
        this.controls.update();
    }
}
