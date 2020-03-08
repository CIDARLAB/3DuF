import "../../lib/material/material.min.css";
import "../../lib/material/material.min.js";

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
    Registry.viewManager.setupToolBars();
};