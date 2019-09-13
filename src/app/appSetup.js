const Registry = require("./core/registry");

import PaperView from "./view/paperView";
import ViewManager from "./view/viewManager";
import AdaptiveGrid from "./view/grid/adaptiveGrid";
import { TrackJS } from 'trackjs';

const Examples = require("./examples/jsonExamples");

let viewManager;
let grid;

function getQueryVariable(variable)
{
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i=0;i<vars.length;i++) {
        let pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

function checkBrowCompatibility(){

    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
        // is Google Chrome on IOS
    } else if(
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isOpera === false &&
        isIEedge === false
    ) {
        // is Google Chrome
        return true;
    } else {
        // not Google Chrome
        alert("Warning ! Unsupported browser detected. 3DuF has been developed and tested only in Chrome. " +
            "The tool may not work correctly on this browser");

        return false;
    }

}



window.onload = function() {


    if(checkBrowCompatibility()){
        viewManager = new ViewManager();


        console.log("Checking Host: ");
        console.log(window.location.host);

        if(window.location.host === "3duf.org"){
            console.log("Enabling TrackJS");
            TrackJS.install({
                token: "1f4d3a9c263e4e3fb2fe4c7f96f8808e"
            });

            viewManager = TrackJS.watchAll(viewManager);
        }


        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
        viewManager.updateGrid();
        Registry.currentDevice.updateView();

        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;

        // Registry.threeRenderer = new ThreeDeviceRenderer(document.getElementById("renderContainer"));

        if(false != getQueryVariable("file")){
            let url = decodeURIComponent(getQueryVariable("file"));
            //Download the json
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

                })
                .catch(function(err) {
                    // This is where you run code if the server returns any errors
                    alert("Error fetching the json");
                    alert(err)
                });

            //Now check if there are any components that need to be modified
            if(false != getQueryVariable("component")){
                //Create a function that modifies the data
                let componentname = getQueryVariable("component");
                let params = JSON.parse(getQueryVariable("params"));
                viewManager.updateComponentParameters(componentname, params);
            }
        }else if(false != getQueryVariable("dafdparams")){
            let params = JSON.parse(getQueryVariable("dafdparams"));
            Registry.viewManager.activateDAFDPlugin(params);
        }

        Registry.viewManager.setupToolBars();
        Registry.viewManager.generateBorder();
    }


};

