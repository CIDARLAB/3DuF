import CNCGenerator from "../../manufacturing/cncGenerator";

import JSZip from 'jszip';

const Registry = require("../../core/registry");

export default class ManufacturingPanel {
    constructor(viewManagerDelegate){
        this.__viewManagerDelegate = viewManagerDelegate;

        this.__cncButton = document.getElementById("cnc_button");
        console.log("current device:", Registry.currentDevice);
        let cncGenerator = new CNCGenerator(Registry.currentDevice, this.__viewManagerDelegate);
        let registryref = Registry;

        let ref = this;
        this.__cncButton.addEventListener('click', function (event) {
            console.log("Running generatePortLayers");
            cncGenerator.setDevice(registryref.currentDevice);
            cncGenerator.generatePortLayers();
            cncGenerator.generateDepthLayers();
            cncGenerator.generateEdgeLayers();

            // console.log("SVG Data:", cncGenerator.getSVGOutputs());

            ref.packageAndDownloadBundle(cncGenerator.getSVGOutputs());

            cncGenerator.flushData();
        });
    }

    packageAndDownloadBundle(svgOutputs) {
        let zipper = new JSZip();

        for(const key of svgOutputs.keys()){
            zipper.file(key+".svg", svgOutputs.get(key));
        }

        let content = zipper.generate({
            type: "blob"
        });

        saveAs(content, Registry.currentDevice.getName()+".zip");


    }
}