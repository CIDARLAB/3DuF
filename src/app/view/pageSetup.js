var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");
var JSZip = require("jszip");

let activeButton = null;
let activeLayer = null;
let channelButton = document.getElementById("channel_button");
let circleValveButton = document.getElementById("circleValve_button")
let portButton = document.getElementById("port_button")
let viaButton = document.getElementById("via_button")
let chamberButton = document.getElementById("chamber_button");

let jsonButton = document.getElementById("json_button");
let svgButton = document.getElementById("svg_button");
let stlButton = document.getElementById("stl_button");

let button2D = document.getElementById("button_2D");
let button3D = document.getElementById("button_3D");

let flowButton = document.getElementById("flow_button");
let controlButton = document.getElementById("control_button");

let inactiveBackground = Colors.GREY_200;
let inactiveText = Colors.BLACK;
let activeText = Colors.WHITE;

let canvas = document.getElementById("c");

let canvasBlock = document.getElementById("canvas_block");
let renderBlock = document.getElementById("renderContainer");

let renderer;
let view;

let threeD = false;

let buttons = {
    "Channel": channelButton,
    "Via": viaButton,
    "Port": portButton,
    "CircleValve": circleValveButton,
    "Chamber": chamberButton
}

let layerButtons = {
    "0": flowButton,
    "1": controlButton
}

let layerIndices = {
    "0": 0,
    "1": 1
}



let zipper = new JSZip();

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function setButtonColor(button, background, text) {
    button.style.background = background;
    button.style.color = text;
}

function setActiveButton(feature) {
    if (activeButton) setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
    activeButton = feature;
    setButtonColor(buttons[activeButton], Colors.getDefaultFeatureColor(activeButton, Registry.currentLayer), activeText);
}

function setActiveLayer(layerName) {
    if (activeLayer) setButtonColor(layerButtons[activeLayer], inactiveBackground, inactiveText);
    activeLayer = layerName;
    setActiveButton(activeButton);
    let bgColor = Colors.getDefaultLayerColor(Registry.currentLayer);
    setButtonColor(layerButtons[activeLayer], bgColor, activeText);
    if (threeD){
        setButtonColor(button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button2D, inactiveBackground, inactiveText);
    } else {
        setButtonColor(button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button3D, inactiveBackground, inactiveText);
    }
}

function switchTo3D() {
    if (!threeD) {
        threeD = true;
        setButtonColor(button3D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button2D, inactiveBackground, inactiveText);
        renderer.loadJSON(Registry.currentDevice.toJSON());
        let cameraCenter = view.getViewCenterInMillimeters();
        let height = Registry.currentDevice.params.getValue("height") / 1000;
        let pixels = view.getDeviceHeightInPixels();
        renderer.setupCamera(cameraCenter[0], cameraCenter[1], height, pixels, paper.view.zoom);
        renderer.showMockup();
        HTMLUtils.removeClass(renderBlock, "hidden-block");
        HTMLUtils.addClass(canvasBlock, "hidden-block");
        HTMLUtils.addClass(renderBlock, "shown-block");
        HTMLUtils.removeClass(canvasBlock, "shown-block");
    }
}


//TODO: transition backwards is super hacky. Fix it!
function switchTo2D() {
    if (threeD) {
        threeD = false;
        let center = renderer.getCameraCenterInMicrometers();
        let zoom = renderer.getZoom();
        let newCenterX = center[0];
        if (newCenterX < 0) {
            newCenterX = 0
        } else if (newCenterX > Registry.currentDevice.params.getValue("width")) {
            newCenterX = Registry.currentDevice.params.getValue("width");
        }
        let newCenterY = paper.view.center.y - center[1];
        if (newCenterY < 0) {
            newCenterY = 0;
        } else if (newCenterY > Registry.currentDevice.params.getValue("height")) {
            newCenterY = Registry.currentDevice.params.getValue("height")
        }
        setButtonColor(button2D, Colors.getDefaultLayerColor(Registry.currentLayer), activeText);
        setButtonColor(button3D, inactiveBackground, inactiveText);
        Registry.viewManager.setCenter(new paper.Point(newCenterX, newCenterY));
        Registry.viewManager.setZoom(zoom);
        HTMLUtils.addClass(renderBlock, "hidden-block");
        HTMLUtils.removeClass(canvasBlock, "hidden-block");
        HTMLUtils.removeClass(renderBlock, "shown-block");
        HTMLUtils.addClass(canvasBlock, "shown-block");
    }
}

function setupAppPage() {

    view = Registry.viewManager.view;
    renderer = Registry.threeRenderer;
    channelButton.onclick = function() {
        Registry.viewManager.activateTool("Channel");
        let bg = Colors.getDefaultFeatureColor("Channel", "Basic",Registry.currentLayer);
        setActiveButton("Channel");
        switchTo2D();
    };

    circleValveButton.onclick = function() {
        Registry.viewManager.activateTool("CircleValve");
        let bg = Colors.getDefaultFeatureColor("CircleValve", "Basic", Registry.currentLayer);
        setActiveButton("CircleValve");
        switchTo2D();

    };

    portButton.onclick = function() {
        Registry.viewManager.activateTool("Port");
        let bg = Colors.getDefaultFeatureColor("Port", "Basic", Registry.currentLayer);
        setActiveButton("Port");
        switchTo2D();
    };

    viaButton.onclick = function() {
        Registry.viewManager.activateTool("Via");
        let bg = Colors.getDefaultFeatureColor("Via", "Basic", Registry.currentLayer);
        setActiveButton("Via");
        switchTo2D();
    };

    chamberButton.onclick = function() {
        Registry.viewManager.activateTool("Chamber");
        let bg = Colors.getDefaultFeatureColor("Chamber", "Basic", Registry.currentLayer);
        setActiveButton("Chamber");
        switchTo2D();
    };

    flowButton.onclick = function() {
        if (threeD){
            if (activeLayer == "0") renderer.toggleLayerView(0);
            else renderer.showLayer(0);
        }
        Registry.currentLayer = Registry.currentDevice.layers[0];
        setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();

    }

    controlButton.onclick = function() {
        if (threeD){
            if (activeLayer == "1") renderer.toggleLayerView(1);
            else renderer.showLayer(1);
        }
        Registry.currentLayer = Registry.currentDevice.layers[1];
        setActiveLayer("1");
        Registry.viewManager.updateActiveLayer();
    }

    jsonButton.onclick = function() {
        let json = new Blob([JSON.stringify(Registry.currentDevice.toJSON())], {
            type: "application/json"
        });
        saveAs(json, "device.json");
    }

    stlButton.onclick = function() {
        let json = Registry.currentDevice.toJSON();
        let stls = renderer.getSTL(json);
        let blobs = [];
        let zipper = new JSZip();
        for (let i =0 ; i < stls.length; i++){
            let name = "" + i + "_" + json.name + "_" + json.layers[i].name + ".stl";
            zipper.file(name, stls[i]);
        }
        let content = zipper.generate({
            type: "blob"
        });
        saveAs(content, json.name + "_layers.zip");
    }

    svgButton.onclick = function() {
        let svgs = Registry.viewManager.layersToSVGStrings();
        //let svg = paper.project.exportSVG({asString: true});
        let blobs = [];
        let success = 0;
        let zipper = new JSZip();
        for (let i = 0; i < svgs.length; i++) {
            if (svgs[i].slice(0, 4) == "<svg") {
                zipper.file("Device_layer_" + i + ".svg", svgs[i]);
                success++;
            }
        }

        if (success == 0) throw new Error("Unable to generate any valid SVGs. Do all layers have at least one non-channel item in them?");
        else {
            let content = zipper.generate({
                type: "blob"
            });
            saveAs(content, "device_layers.zip");
        }
    }

    button2D.onclick = function() {
        switchTo2D();
    }

    button3D.onclick = function() {
        switchTo3D();
    }

    let dnd = new HTMLUtils.DnDFileController("#c", function(files) {
        var f = files[0];

        var reader = new FileReader();
        reader.onloadend = function(e) {
            var result = JSON.parse(this.result);
            Registry.canvasManager.loadDeviceFromJSON(result);
        };
        try {
            reader.readAsText(f);
        } catch (err) {
            console.log("unable to load JSON: " + f);
        }
    });

    setActiveButton("Channel");
    setActiveLayer("0");
    switchTo2D();
}

module.exports.setupAppPage = setupAppPage;