import * as Registry from './core/registry';

<<<<<<< HEAD
import PaperView from "./view/paperView";
import BareViewManager from "./view/bareViewManager";
=======
import ViewManager from "./view/viewManager";
import { TrackJS } from 'trackjs';
>>>>>>> Removed the circular dependency in makeFeature method by moving it to class Device from Class Feature

import * as Examples from "./examples/jsonExamples";

let viewManager;
<<<<<<< HEAD
=======

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


>>>>>>> Removed the circular dependency in makeFeature method by moving it to class Device from Class Feature

window.onload = function() {
        viewManager = new BareViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
        viewManager.updateGrid();
        Registry.currentDevice.updateView();

        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;

        // Registry.threeRenderer = new ThreeDeviceRenderer(document.getElementById("renderContainer"));
        Registry.viewManager.setupToolBars();
    };

