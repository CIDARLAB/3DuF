var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");
var Features = require("../core/features");
var JSZip = require("jszip");

let activeButton = null;
let activeLayer = null;
let channelButton = document.getElementById("channel_button");
let circleValveButton = document.getElementById("circleValve_button")
let portButton = document.getElementById("port_button")
let viaButton = document.getElementById("via_button")

let jsonButton = document.getElementById("json_button");
let svgButton = document.getElementById("svg_button");

let flowButton = document.getElementById("flow_button");
let controlButton = document.getElementById("control_button");

let inactiveBackground = Colors.GREY_200;
let inactiveText = Colors.BLACK;
let activeText = Colors.WHITE;

let canvas = document.getElementById("c");

let buttons = {
    "Channel": channelButton,
    "Via": viaButton,
    "Port": portButton,
    "CircleValve": circleValveButton
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

function saveBlobs(blobs) {
    for (let i = 0; i < blobs.length; i++) {
        saveAs(blobs[i], "device_layer_" + i + ".svg");
    }
}

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
    setButtonColor(buttons[activeButton], Colors.getDefaultFeatureColor(Features[activeButton], Registry.currentLayer), activeText);
}

function setActiveLayer(layerName) {
    if (activeLayer) setButtonColor(layerButtons[activeLayer], inactiveBackground, inactiveText);
    activeLayer = layerName;
    setActiveButton(activeButton);
    let bgColor = Colors.getDefaultLayerColor(Registry.currentLayer);
    setButtonColor(layerButtons[activeLayer], bgColor, activeText);
}

function setupAppPage() {
    channelButton.onclick = function() {
        Registry.viewManager.activateTool("Channel");
        let bg = Colors.getDefaultFeatureColor(Features.Channel, Registry.currentLayer);
        setActiveButton("Channel");
    };

    circleValveButton.onclick = function() {
        Registry.viewManager.activateTool("CircleValve");
        let bg = Colors.getDefaultFeatureColor(Features.CircleValve, Registry.currentLayer);
        setActiveButton("CircleValve");
    };

    portButton.onclick = function() {
        Registry.viewManager.activateTool("Port");
        let bg = Colors.getDefaultFeatureColor(Features.Port, Registry.currentLayer);
        setActiveButton("Port");
    };

    viaButton.onclick = function() {
        Registry.viewManager.activateTool("Via");
        let bg = Colors.getDefaultFeatureColor(Features.Via, Registry.currentLayer);
        setActiveButton("Via");
    };

    flowButton.onclick = function() {
        Registry.currentLayer = Registry.currentDevice.layers[0];
        setActiveLayer("0");
        Registry.viewManager.updateActiveLayer();
    }

    controlButton.onclick = function() {
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
}

module.exports.setupAppPage = setupAppPage;