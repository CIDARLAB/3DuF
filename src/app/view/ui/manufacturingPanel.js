import CNCGenerator from "../../manufacturing/cncGenerator";

import JSZip from 'jszip';
import LaserCuttingGenerator from "../../manufacturing/laserCuttingGenerator";

const Registry = require("../../core/registry");

export default class ManufacturingPanel {
    constructor(viewManagerDelegate){
        this.__viewManagerDelegate = viewManagerDelegate;

        this.__cncButton = document.getElementById("cnc_button");
        this.__laserButton = document.getElementById("laser_button");
        console.log("current device:", Registry.currentDevice);
        let cncGenerator = new CNCGenerator(Registry.currentDevice, this.__viewManagerDelegate);
        let laserCuttingGenerator = new LaserCuttingGenerator(Registry.currentDevice, this.__viewManagerDelegate);
        let registryref = Registry;

        let ref = this;
        this.__cncButton.addEventListener('click', function (event) {
            console.log("Generating CNC Layers");
            cncGenerator.setDevice(registryref.currentDevice);
            cncGenerator.generatePortLayers();
            cncGenerator.generateDepthLayers();
            cncGenerator.generateEdgeLayers();

            // console.log("SVG Data:", cncGenerator.getSVGOutputs());

            ref.packageAndDownloadBundle(cncGenerator.getSVGOutputs());

            cncGenerator.flushData();
        });

        this.__laserButton.addEventListener('click',function (event) {
            console.log("Generating Laser Cutting Layers");

            laserCuttingGenerator.setDevice(registryref.currentDevice);
            laserCuttingGenerator.generatePortLayers();
            laserCuttingGenerator.generateDepthLayers();
            laserCuttingGenerator.generateEdgeLayers();
            laserCuttingGenerator.generateInverseControlLayers();

            ref.packageAndDownloadBundle(laserCuttingGenerator.getSVGOutputs());
        })
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