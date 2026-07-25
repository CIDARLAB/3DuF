<template>
    <div>
        <v-divider class="mb-1" />
        <div class="export-section-label px-1 mb-1">Export</div>
        <div v-for="item in exportItems" :key="item.id">
            <v-tooltip bottom max-width="280">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        class="white blue--text mb-2 feature-button button-row"
                        v-bind="attrs"
                        v-on="on"
                        @click="runExport(item.id)"
                    >
                        <v-icon left small>{{ item.icon }}</v-icon>
                        {{ item.label }}
                    </v-btn>
                </template>
                <span>{{ item.tooltip }}</span>
            </v-tooltip>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.feature-button.button-row {
    text-transform: none;
    letter-spacing: normal;
    width: 100%;
}

.export-section-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.6);
    text-align: left;
}
</style>

<script>
import Registry from "@/app/core/registry";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import ManufacturingLayer from "@/app/manufacturing/manufacturingLayer";
import { generateDeviceDxfFiles, isMultilayerBiochip } from "@/app/manufacturing/dxfExport";
import { generateFlowGCodeFiles } from "@/app/manufacturing/flowGCodeExport";
import {
    generateDxfFusionGCode,
    generateDxfSVG,
    getDxfModelForDevice
} from "@/app/manufacturing/dxfManufacturingExport";

const MULTILAYER_GCODE_MESSAGE =
    "Multilayer biochips do not provide GCode export. Please export each layer as DXF (or SVG) instead.";

export default {
    name: "ManufacturingPanel",
    computed: {
        exportItems() {
            return [
                {
                    id: "json",
                    label: "JSON · 3DuF",
                    icon: "mdi-code-json",
                    tooltip:
                        "3DuF default design format (.json). Save, reopen, and share designs in 3DuF — the primary format for this tool."
                },
                {
                    id: "dxf",
                    label: "DXF",
                    icon: "mdi-file-cad",
                    tooltip:
                        "CAD sketch (.dxf). Open in AutoCAD, Fusion 360, and other CAD / CAM tools. Multilayer designs download as a zip."
                },
                {
                    id: "svg",
                    label: "SVG",
                    icon: "mdi-vector-line",
                    tooltip:
                        "Vector graphics (.svg). Use for documentation, illustrations, laser cutting prep, and web graphics."
                },
                {
                    id: "gcode",
                    label: "GCode",
                    icon: "mdi-axis-arrow",
                    tooltip:
                        "CNC / router (.gcode). Use for milling or routing flow-layer geometry. Not available for multilayer biochips."
                }
            ];
        }
    },
    methods: {
        runExport(id) {
            if (id === "json") this.downloadJSON();
            else if (id === "dxf") this.downloadDXF();
            else if (id === "svg") this.downloadSVG();
            else if (id === "gcode") this.downloadGCode();
        },
        requireDevice() {
            const device = Registry.currentDevice;
            if (!device) {
                throw new Error("No device loaded. Create or import a design first.");
            }
            return device;
        },
        requireViewManager() {
            const viewManager = Registry.viewManager;
            if (!viewManager) {
                throw new Error("View manager is not ready yet. Try again in a moment.");
            }
            return viewManager;
        },
        downloadBlob(content, filename, mimeType) {
            const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            saveAs(blob, filename);
        },
        downloadZip(files, zipName) {
            const zip = new JSZip();
            for (const file of files) {
                zip.file(file.filename, file.content);
            }
            return zip.generateAsync({ type: "blob" }).then(blob => {
                saveAs(blob, zipName);
            });
        },
        reportExportError(format, err) {
            console.error(`[Export ${format}]`, err);
            const message = err && err.message ? err.message : String(err);
            alert(`Unable to export ${format}: ${message}`);
        },
        downloadJSON() {
            try {
                this.requireViewManager().downloadJSON();
            } catch (err) {
                this.reportExportError("JSON", err);
            }
        },
        downloadDXF() {
            try {
                const device = this.requireDevice();
                const files = generateDeviceDxfFiles(device);
                if (!files || files.length === 0) {
                    throw new Error("DXF generator returned no files.");
                }
                if (files.length === 1) {
                    this.downloadBlob(files[0].content, files[0].filename, "application/dxf;charset=utf-8");
                    return;
                }
                this.downloadZip(files, `${device.name || "device"}_dxf.zip`).catch(err => {
                    this.reportExportError("DXF", err);
                });
            } catch (err) {
                this.reportExportError("DXF", err);
            }
        },
        downloadSVG() {
            try {
                const device = this.requireDevice();
                const viewManager = this.requireViewManager();
                const svgs = viewManager.layersToSVGStrings();
                const width = device.getXSpan();
                const height = device.getYSpan();
                const prepend = ManufacturingLayer.generateSVGTextPrepend(width, height);
                const append = ManufacturingLayer.generateSVGTextAppend();

                for (let i = 0; i < svgs.length; i++) {
                    if (svgs[i] && svgs[i].slice(0, 4) === "<svg") {
                        const svgContent = prepend + svgs[i] + append;
                        this.downloadBlob(svgContent, `${device.name || "device"}.svg`, "image/svg+xml;charset=utf-8");
                        return;
                    }
                }

                const dxfSvg = generateDxfSVG(device);
                if (dxfSvg) {
                    this.downloadBlob(dxfSvg, `${device.name || "device"}.svg`, "image/svg+xml;charset=utf-8");
                    return;
                }

                throw new Error("Unable to generate SVG. Does the design have at least one visible feature?");
            } catch (err) {
                this.reportExportError("SVG", err);
            }
        },
        downloadGCode() {
            try {
                const device = this.requireDevice();
                if (isMultilayerBiochip(device)) {
                    alert(MULTILAYER_GCODE_MESSAGE);
                    return;
                }

                const hasDxf = getDxfModelForDevice(device) !== null;
                // DXF-imported sketches without structured edits still use DXF CAM path;
                // otherwise emit multi-tool Fusion-style programs from live features.
                if (hasDxf && !this.deviceHasStructuredFlowFeatures(device)) {
                    const text = generateDxfFusionGCode(device);
                    this.downloadBlob(text, `${device.name || "device"}.gcode`, "text/x-gcode;charset=utf-8");
                    return;
                }

                const files = generateFlowGCodeFiles(device);
                if (!files || files.length === 0) {
                    throw new Error("GCode generator returned no files.");
                }
                if (files.length === 1) {
                    this.downloadBlob(files[0].content, files[0].filename, "text/x-gcode;charset=utf-8");
                    return;
                }
                const zip = new JSZip();
                const folder = zip.folder(device.name || "device") || zip;
                for (const file of files) {
                    folder.file(file.filename, file.content);
                }
                zip.generateAsync({ type: "blob" })
                    .then(blob => {
                        saveAs(blob, `${device.name || "device"}_gcode.zip`);
                    })
                    .catch(err => {
                        this.reportExportError("GCode", err);
                    });
            } catch (err) {
                this.reportExportError("GCode", err);
            }
        },
        deviceHasStructuredFlowFeatures(device) {
            const structured = new Set([
                "Port",
                "Connection",
                "BetterMixer",
                "Mixer",
                "CurvedMixer"
            ]);
            for (const layer of device.layers || []) {
                if (layer.type !== "FLOW" && layer.type !== "flow") continue;
                for (const key in layer.features || {}) {
                    const feature = layer.features[key];
                    const type = feature.getType ? feature.getType() : feature.type;
                    if (structured.has(type)) return true;
                }
            }
            return false;
        }
    }
};
</script>
