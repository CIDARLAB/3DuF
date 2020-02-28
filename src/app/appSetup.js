import * as Registry from "./core/registry";

import PaperView from "./view/paperView";
import BareViewManager from "./view/bareViewManager";

import Registry from "./core/registry";
import BareViewManager from "./view/bareViewManager";
import * as Examples from "./examples/jsonExamples";

let viewManager;

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

        if (false != getQueryVariable("file")) {
            let url = decodeURIComponent(getQueryVariable("file"));
            //Download the json
            fetch(url) // Call the fetch function passing the url of the API as a parameter
                .then(resp => resp.json())
                .then(function(data) {
                    // Create and append the li's to the ul
                    //alert(data);
                    console.log(data);
                    viewManager.loadDeviceFromJSON(data);
                    viewManager.updateGrid();
                    Registry.currentDevice.updateView();

                    window.dev = Registry.currentDevice;
                    window.Registry = Registry;

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