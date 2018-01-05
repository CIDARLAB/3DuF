var Registry = require("./core/registry");
var Device = require('./core/device');
var Layer = require('./core/layer');
var PaperView = require("./view/paperView");
var ViewManager = require("./view/viewManager");
var AdaptiveGrid = require("./view/grid/adaptiveGrid");
var PageSetup = require("./view/pageSetup");
var Colors = require("./view/colors");
var ThreeDeviceRenderer = require("./view/render3D/ThreeDeviceRenderer");
var Examples = require("./examples/jsonExamples");

var view;
var viewManager;
var grid;

paper.setup("c");

function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

window.onload = function() {
    view = new PaperView(document.getElementById("c"));
    viewManager = new ViewManager(view);
    grid = new AdaptiveGrid();
    grid.setColor(Colors.BLUE_500);


    Registry.viewManager = viewManager;

    viewManager.loadDeviceFromJSON(JSON.parse(Examples.example1));
    viewManager.updateGrid();
    Registry.currentDevice.updateView();

    window.dev = Registry.currentDevice;
    window.Registry = Registry;

    window.view = Registry.viewManager.view;

    // Registry.threeRenderer = new ThreeDeviceRenderer(document.getElementById("renderContainer"));
    // PageSetup.setupAppPage();

    if(false != getQueryVariable("file")){
        //Download the json
        var url = decodeURIComponent(getQueryVariable("file"));
        fetch(url) // Call the fetch function passing the url of the API as a parameter
            .then((resp) => resp.json())
            .then(function(data) {
                // Create and append the li's to the ul
                //alert(data);
                console.log(data);
                viewManager.loadDeviceFromJSON(data);
                viewManager.updateGrid();
                Registry.currentDevice.updateView();

                window.dev = Registry.currentDevice;
                window.Registry = Registry;

                window.view = Registry.viewManager.view;

                // Registry.threeRenderer = new ThreeDeviceRenderer(document.getElementById("renderContainer"));
                //Find out what kind of rendering needs to be activated
                // PageSetup.setupAppPage();

            })
            .catch(function(err) {
                // This is where you run code if the server returns any errors
                alert("Error fetching the json");
                alert(err)
            });
    }

};

function loadJSON(json){
    console.log('from 3duf');
    console.log(json);
}

exports.loadJSON = loadJSON;

