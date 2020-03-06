import JSZip from "jszip";
import ManufacturingLayer from "../../manufacturing/manufacturingLayer";

import * as Registry from "../../core/registry";

export default class ExportPanel {
    constructor(viewManagerDelegate) {
        this.__viewManagerDelegate = viewManagerDelegate;

        // this.__cncButton = document.getElementById("cnc_button");
        // console.log("current device:", Registry.currentDevice);
        // let cncGenerator = new CNCGenerator(Registry.currentDevice, this.__viewManagerDelegate);
        // let registryref = Registry;
        //
        // let ref = this;
        // this.__cncButton.addEventListener('click', function (event) {
        //     console.log("Running generatePortLayers");
        //     cncGenerator.setDevice(registryref.currentDevice);
        //     cncGenerator.generatePortLayers();
        //     cncGenerator.generateDepthLayers();
        //     cncGenerator.generateEdgeLayers();
        //
        //     // console.log("SVG Data:", cncGenerator.getSVGOutputs());
        //
        //     ref.packageAndDownloadBundle(cncGenerator.getSVGOutputs());
        //
        //     cncGenerator.flushData();
        // });

        this.__svgButton = document.getElementById("svg_button");
        this.__svgButton.onclick = function() {
            let svgs = Registry.viewManager.layersToSVGStrings();
            for (let i = 0; i < svgs.length; i++) {
                svgs[i] =
                    ManufacturingLayer.generateSVGTextPrepend(Registry.currentDevice.getXSpan(), Registry.currentDevice.getYSpan()) +
                    svgs[i] +
                    ManufacturingLayer.generateSVGTextAppend();
            }
            //let svg = paper.project.exportSVG({asString: true});
            let blobs = [];
            let success = 0;
            let zipper = new JSZip();
            for (let i = 0; i < svgs.length; i++) {
                if (svgs[i].slice(0, 4) == "<svg") {
                    zipper.file("Device_layer_" + i + ".svg", svgs[i]);
                    success++;
                }
            }

            if (success == 0) throw new Error("Unable to generate any valid SVGs. Do all layers have at least one non-channel item in them?");
            else {
                let content = zipper.generate({
                    type: "blob"
                });
                saveAs(content, "device_layers.zip");
            }
        };

        this.__interchangeV1Button = document.getElementById("interchange_button");

        this.__interchangeV1Button.addEventListener("click", this.saveJSON);
    }

    saveJSON() {
        let json = new Blob([JSON.stringify(Registry.viewManager.generateExportJSON())], {
            type: "application/json"
        });
        saveAs(json, Registry.currentDevice.getName() + ".json");
    }
}
