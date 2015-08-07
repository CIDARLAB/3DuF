var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");
var Features = require("../core/features");

let activeButton = null;
let activeLayer = null;
let channelButton = document.getElementById("channel_button");
let circleValveButton = document.getElementById("circleValve_button")
let portButton = document.getElementById("port_button")
let viaButton = document.getElementById("via_button")

let flowButton = document.getElementById("flow_button");
let controlButton = document.getElementById("control_button");

let inactiveBackground = Colors.GREY_200;
let inactiveText = Colors.BLACK;
let activeText = Colors.WHITE;

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

function setButtonColor(button, background, text) {
    button.style.background = background;
    button.style.color = text;
}

function setActiveButton(feature) {
    if (activeButton) setButtonColor(buttons[activeButton], inactiveBackground, inactiveText);
    activeButton = feature;
    setButtonColor(buttons[activeButton], Colors.getDefaultFeatureColor(Features[activeButton], Registry.currentLayer), activeText);
}

function setActiveLayer(layerName){
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

    setActiveButton("Channel");
    setActiveLayer("0");
}

module.exports.setupAppPage = setupAppPage;