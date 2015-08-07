var HTMLUtils = require("../utils/htmlUtils");
var Registry = require("../core/registry");
var Colors = require("./colors");

let activeButton = null;
let channelButton = document.getElementById("channel_button");
let circleValveButton = document.getElementById("circleValve_button")
let portButton = document.getElementById("port_button")
let viaButton = document.getElementById("via_button")

let channelColorClass = "mdl-color--indigo-500";
let circleValveColorClass = "mdl-color--red-500";
let portColorClass = "mdl-color--deep-purple-500";
let viaColorClass = "mdl-color--green-500";

let typeColors = {
    Channel: channelColorClass,
    CircleValve: circleValveColorClass,
    Port: portColorClass,
    Via: viaColorClass
};

let buttons = {
    Channel: channelButton,
    CircleValve: circleValveButton,
    Port: portButton,
    Via: viaButton
};

let activeTextColor = "mdl-color-text--white";

let inactiveClass = "mdl-color--grey-200";
let inactiveText = "mdl-color-text--black";

let addClasses = function(button, color, text){
    HTMLUtils.addClass(button, color);
    HTMLUtils.addClass(button, text);
}

let removeClasses = function(button, color, text){
    HTMLUtils.removeClass(button, color);
    HTMLUtils.removeClass(button, text);
}

let setNewActiveButton = function(button){
    if (activeButton) {
        removeClasses(buttons[activeButton], typeColors[activeButton], activeTextColor);
        addClasses(buttons[activeButton], inactiveClass, inactiveText);
    }
    activeButton = button;
    console.log(activeButton);
    console.log(buttons[activeButton]);
    removeClasses(buttons[activeButton], inactiveClass, inactiveText);
    addClasses(buttons[activeButton], typeColors[activeButton], activeTextColor);
}

channelButton.onclick = function(){
    Registry.viewManager.activateTool("Channel");
    setNewActiveButton("Channel");
};

circleValveButton.onclick = function(){
    Registry.viewManager.activateTool("CircleValve");
    setNewActiveButton("CircleValve");
};

portButton.onclick = function(){
    Registry.viewManager.activateTool("Port");
    setNewActiveButton("Port");
};

viaButton.onclick = function(){
    Registry.viewManager.activateTool("Via");
    setNewActiveButton("Via");
};

setNewActiveButton("Channel");