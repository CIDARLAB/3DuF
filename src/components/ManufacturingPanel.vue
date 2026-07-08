<template>
    <div>
        <v-list>
            <v-list-item-group mandatory color="indigo">
                <v-list-item @click="downloadJSON">
                    <v-list-item-icon>
                        <v-icon>mdi-code-json</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title class="wrap-title">3DuF design (.json)</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadDXF">
                    <v-list-item-icon>
                        <v-icon>mdi-file-cad</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title class="wrap-title">CAD sketch (.dxf)</v-list-item-title>
                        <v-list-item-subtitle class="text-wrap">2D geometry for Fusion 360 / CAM (mm)</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadSVG">
                    <v-list-item-icon>
                        <v-icon>mdi-vector-line</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title class="wrap-title">Vector art (.svg)</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="downloadGCode">
                    <v-list-item-icon>
                        <v-icon>mdi-axis-arrow</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title class="wrap-title">CNC / router (.gcode)</v-list-item-title>
                        <v-list-item-subtitle class="text-wrap">Fusion-style contour toolpath</v-list-item-subtitle>
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

.wrap-title {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset !important;
    overflow-wrap: anywhere;
    line-height: 1.25rem;
}

.text-wrap {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset !important;
    overflow-wrap: anywhere;
    line-height: 1.15rem;
}

.v-list-item {
    min-height: 56px;
    align-items: flex-start;
}

.v-list-item__content {
    overflow: visible;
}
</style>

<script>
import Registry from "@/app/core/registry";
import { saveAs } from "file-saver";
import ManufacturingLayer from "@/app/manufacturing/manufacturingLayer";
import { generateConnectionProfileGCode } from "@/app/manufacturing/additiveManufacturingExport";
import { generateDeviceDxf } from "@/app/manufacturing/dxfExport";
import {
    generateDxfFusionGCode,
    generateDxfSVG,
    getDxfModelForDevice
} from "@/app/manufacturing/dxfManufacturingExport";

export default {
    name: "ManufacturingPanel",
    components: {},
    data() {
        return {
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
            this.viewManagerRef.downloadJSON();
        },
        downloadDXF() {
            const text = generateDeviceDxf(Registry.currentDevice);
            const blob = new Blob([text], { type: "application/dxf;charset=utf-8" });
            saveAs(blob, Registry.currentDevice.name + ".dxf");
        },
        downloadSVG() {
            const dxfSvg = generateDxfSVG(Registry.currentDevice);
            if (dxfSvg) {
                const blob = new Blob([dxfSvg], { type: "image/svg+xml;charset=utf-8" });
                saveAs(blob, Registry.currentDevice.name + ".svg");
                return;
            }

            const svgs = this.viewManagerRef.layersToSVGStrings();
            const width = Registry.currentDevice.getXSpan();
            const height = Registry.currentDevice.getYSpan();
            const prepend = ManufacturingLayer.generateSVGTextPrepend(width, height);
            const append = ManufacturingLayer.generateSVGTextAppend();

            for (let i = 0; i < svgs.length; i++) {
                if (svgs[i] && svgs[i].slice(0, 4) === "<svg") {
                    const svgContent = prepend + svgs[i] + append;
                    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
                    saveAs(blob, Registry.currentDevice.name + ".svg");
                    return;
                }
            }

            throw new Error("Unable to generate SVG. Does the design have at least one visible feature?");
        },
        downloadGCode() {
            const hasDxf = getDxfModelForDevice(Registry.currentDevice) !== null;
            const text = hasDxf
                ? generateDxfFusionGCode(Registry.currentDevice)
                : generateConnectionProfileGCode(Registry.currentDevice);
            const blob = new Blob([text], { type: "text/x-gcode;charset=utf-8" });
            saveAs(blob, Registry.currentDevice.name + ".gcode");
        }
    }
};
</script>
