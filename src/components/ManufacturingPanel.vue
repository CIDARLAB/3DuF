<template>
    <div>
        <v-list>
            <v-list-item-group mandatory color="indigo">
                <v-list-item @click="downloadJSON">
                    <v-list-item-icon>
                        <v-icon>mdi-code-json</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>3DuF File (.json)</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadSVG">
                    <v-list-item-icon>
                        <v-icon>mdi-vector-line</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Vector Art (.svg)</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadCNC">
                    <v-list-item-icon>
                        <v-icon>mdi-file</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>CNC (.svg)</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadLASER">
                    <v-list-item-icon>
                        <v-icon>mdi-laser-pointer</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Laser Cutting (.svg)</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadMETAFLUIDICS">
                    <v-list-item-icon>
                        <v-icon>mdi-chip</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Publish on Metafluidics</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </div>
</template>

<style lang="scss" scoped>
#visualizer-slot {
    width: 100%;
    min-height: 100vh;
}
</style>

<script>
import Registry from "@/app/core/registry";
import { saveAs } from "file-saver";
import ManufacturingLayer from "@/app/manufacturing/manufacturingLayer";
import JSZip from "jszip";
import CNCGenerator from "@/app/manufacturing/cncGenerator";
import LaserCuttingGenerator from "@/app/manufacturing/laserCuttingGenerator";

export default {
    name: "ManufacturingPanel",
    components: {},
    data() {
        return {
            buttons: [
                ["json", "mdi-devices", "3DuF File (.json)"],
                ["svg", "mdi-border-all", "Vector Art (.svg)"],
                ["cnc", "mdi-toolbox", "CNC (.svg)"],
                ["laser", "mdi-toolbox", "Laser Cutting (.svg)"],
                ["metafluidics", "mdi-toolbox", "Publish on Metafluidics"]
            ],
            viewManagerRef: null
        };
    },
    mounted: function() {
        setTimeout(() => {
            this.viewManagerRef = Registry.viewManager;
        }, 100);
    },
    methods: {
        downloadJSON() {
            let json = new Blob([JSON.stringify(this.viewManagerRef.generateExportJSON())], {
                type: "application/json"
            });
            saveAs(json, Registry.currentDevice.name + ".json");
        },
        downloadSVG() {
            let svgs = this.viewManagerRef.layersToSVGStrings();
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
                if (svgs[i].slice(0, 4) === "<svg") {
                    zipper.file("Device_layer_" + i + ".svg", svgs[i]);
                    success++;
                }
            }

            if (success === 0) throw new Error("Unable to generate any valid SVGs. Do all layers have at least one non-channel item in them?");
            else {
                zipper
                    .generateAsync({
                        type: "blob"
                    })
                    .then(function(content) {
                        saveAs(content, Registry.currentDevice.name + ".zip");
                    });
            }
        },
        downloadCNC() {
            const cncGenerator = new CNCGenerator(Registry.currentDevice, Registry.viewManager);
            cncGenerator.setDevice(Registry.currentDevice);
            cncGenerator.generatePortLayers();
            cncGenerator.generateDepthLayers();
            cncGenerator.generateEdgeLayers();

            const zipper = new JSZip();

            let svgOutputs = cncGenerator.getSVGOutputs();
            for (const key of svgOutputs.keys()) {
                zipper.file(key + ".svg", svgOutputs.get(key));
            }

            zipper
                .generateAsync({
                    type: "blob"
                })
                .then(function(content) {
                    saveAs(content, Registry.currentDevice.name + ".zip");

                    cncGenerator.flushData();
                });
        },
        downloadLASER() {
            const laserCuttingGenerator = new LaserCuttingGenerator(Registry.currentDevice, Registry.viewManager);
            laserCuttingGenerator.setDevice(Registry.currentDevice);
            laserCuttingGenerator.generatePortLayers();
            laserCuttingGenerator.generateDepthLayers();
            laserCuttingGenerator.generateEdgeLayers();
            laserCuttingGenerator.generateInverseControlLayers();

            const zipper = new JSZip();

            let svgOutputs = laserCuttingGenerator.getSVGOutputs();
            for (const key of svgOutputs.keys()) {
                zipper.file(key + ".svg", svgOutputs.get(key));
            }

            zipper
                .generateAsync({
                    type: "blob"
                })
                .then(function(content) {
                    saveAs(content, Registry.currentDevice.name + ".zip");

                    laserCuttingGenerator.flushData();
                });
        },
        downloadMETAFLUIDICS() {
            console.log("coming soon");
        }
    }
};
</script>
