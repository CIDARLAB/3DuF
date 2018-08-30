import CNCGenerator from "../../manufacturing/cncGenerator";

const Registry = require("../../core/registry");

export default class ManufacturingPanel {
    constructor(viewManagerDelegate){
        this.__viewManagerDelegate = viewManagerDelegate;

        this.__cncButton = document.getElementById("cnc_button");
        console.log("current device:", Registry.currentDevice);
        let cncGenerator = new CNCGenerator(Registry.currentDevice, this.__viewManagerDelegate);
        let registryref = Registry;
        this.__cncButton.addEventListener('click', function (event) {
            console.log("Running generatePortLayers");
            cncGenerator.setDevice(registryref.currentDevice);
            cncGenerator.generatePortLayers();
            cncGenerator.generateDepthLayers();
            cncGenerator.generateEdgeLayers();
        })
    }
}