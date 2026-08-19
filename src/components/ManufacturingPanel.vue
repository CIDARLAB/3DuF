<template>
    <div>
        <v-divider class="mb-1" />
        <div class="export-section-label px-1 mb-1">View</div>
        <v-tooltip bottom max-width="300">
            <template v-slot:activator="{ on, attrs }">
                <div class="ports-view-toggle-wrap mb-2 mx-1" v-bind="attrs" v-on="on">
                    <v-btn-toggle class="ports-view-toggle" tile borderless>
                        <v-btn
                            small
                            depressed
                            :color="portsOnlyView ? 'grey lighten-2' : 'blue'"
                            :class="portsOnlyView ? 'grey--text text--darken-2' : 'white--text'"
                            @click="setPortsOnlyView(false)"
                        >
                            ALL
                        </v-btn>
                        <v-btn
                            small
                            depressed
                            :color="portsOnlyView ? 'indigo' : 'grey lighten-2'"
                            :class="portsOnlyView ? 'white--text' : 'grey--text text--darken-2'"
                            @click="setPortsOnlyView(true)"
                        >
                            PORTS
                        </v-btn>
                    </v-btn-toggle>
                </div>
            </template>
            <span>{{ portsOnlyTooltip }}</span>
        </v-tooltip>
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

.ports-view-toggle-wrap {
    width: calc(100% - 8px);
}

.ports-view-toggle {
    width: 100%;
    display: flex;
}

.ports-view-toggle ::v-deep .v-btn {
    flex: 1;
    text-transform: none;
    letter-spacing: normal;
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
import EventBus from "@/events/events";

const MULTILAYER_GCODE_MESSAGE =
    "Multilayer biochips do not provide GCode export. Please export each layer as DXF (or SVG) instead.";

export default {
    name: "ManufacturingPanel",
    data() {
        return {
            portsOnlyView: false
        };
    },
    computed: {
        portsOnlyTooltip() {
            return (
                "Fabricated chips need a cover so fluid can flow inside closed channels — an open groove cannot be used experimentally. " +
                "PORTS keeps only the current flow (blue) and control (red) ports and hides every other component and connection; " +
                "ALL restores the full design."
            );
        },
        exportItems() {
            return [
                {
                    id: "json",
                    label: "JSON · 3DuF",
                    icon: "mdi-code-json",
                    tooltip:
                        "3DuF default design format (.json). Save, reopen, and share designs in 3DuF — the primary format for this tool. Downloads as a zip with the full design and a ports-only JSON for the cover layer."
                },
                {
                    id: "dxf",
                    label: "DXF",
                    icon: "mdi-file-cad",
                    tooltip:
                        "CAD sketch (.dxf). Open in AutoCAD, Fusion 360, and other CAD / CAM tools. Downloads as a zip with the full design and a ports-only DXF for the cover layer."
                },
                {
                    id: "svg",
                    label: "SVG",
                    icon: "mdi-vector-line",
                    tooltip:
                        "Vector graphics (.svg). Use for documentation, illustrations, laser cutting prep, and web graphics. Downloads as a zip with the full design and a ports-only SVG."
                },
                {
                    id: "gcode",
                    label: "GCode",
                    icon: "mdi-axis-arrow",
                    tooltip:
                        "CNC / router (.gcode). Use for milling or routing flow-layer geometry. Downloads as a zip with the full programs and a ports-only GCode. Not available for multilayer biochips."
                }
            ];
        }
    },
    mounted() {
        this.syncPortsOnlyView();
        this._onPortsOnlyViewChanged = enabled => {
            this.portsOnlyView = Boolean(enabled);
        };
        EventBus.get().on(EventBus.PORTS_ONLY_VIEW_CHANGED, this._onPortsOnlyViewChanged);
    },
    beforeDestroy() {
        if (this._onPortsOnlyViewChanged) {
            EventBus.get().off(EventBus.PORTS_ONLY_VIEW_CHANGED, this._onPortsOnlyViewChanged);
        }
    },
    methods: {
        syncPortsOnlyView() {
            const viewManager = Registry.viewManager;
            this.portsOnlyView = Boolean(viewManager && viewManager.portsOnlyView);
        },
        setPortsOnlyView(enabled) {
            const viewManager = Registry.viewManager;
            if (!viewManager) {
                return;
            }
            viewManager.setPortsOnlyView(enabled);
            this.portsOnlyView = Boolean(enabled);
        },
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
                const portsFiles = generateDeviceDxfFiles(device, { portsOnly: true });
                if (!files || files.length === 0) {
                    throw new Error("DXF generator returned no files.");
                }
                const zipFiles = files.concat(portsFiles || []);
                if (zipFiles.length === 1) {
                    this.downloadBlob(zipFiles[0].content, zipFiles[0].filename, "application/dxf;charset=utf-8");
                    return;
                }
                this.downloadZip(zipFiles, `${device.name || "device"}_dxf.zip`).catch(err => {
                    this.reportExportError("DXF", err);
                });
            } catch (err) {
                this.reportExportError("DXF", err);
            }
        },
        captureSvgContent(viewManager, device, portsOnly) {
            const fromCanvas = viewManager.exportSVGString
                ? viewManager.exportSVGString(portsOnly)
                : null;
            if (fromCanvas) {
                return fromCanvas;
            }
            const width = device.getXSpan();
            const height = device.getYSpan();
            const prepend = ManufacturingLayer.generateSVGTextPrepend(width, height);
            const append = ManufacturingLayer.generateSVGTextAppend();
            if (!portsOnly) {
                const svgs = viewManager.layersToSVGStrings();
                for (let i = 0; i < svgs.length; i++) {
                    if (svgs[i] && svgs[i].slice(0, 4) === "<svg") {
                        return prepend + svgs[i] + append;
                    }
                }
            }
            const dxfSvg = generateDxfSVG(device, { portsOnly });
            if (dxfSvg) {
                return dxfSvg;
            }
            return null;
        },
        downloadSVG() {
            try {
                const device = this.requireDevice();
                const viewManager = this.requireViewManager();
                const name = device.name || "device";
                const fullSvg = this.captureSvgContent(viewManager, device, false);
                const portsSvg = this.captureSvgContent(viewManager, device, true);
                if (!fullSvg && !portsSvg) {
                    throw new Error("Unable to generate SVG. Does the design have at least one visible feature?");
                }
                const files = [];
                if (fullSvg) {
                    files.push({ filename: `${name}.svg`, content: fullSvg });
                }
                if (portsSvg) {
                    files.push({ filename: `${name}_ports.svg`, content: portsSvg });
                }
                if (files.length === 1) {
                    this.downloadBlob(files[0].content, files[0].filename, "image/svg+xml;charset=utf-8");
                    return;
                }
                this.downloadZip(files, `${name}_svg.zip`).catch(err => {
                    this.reportExportError("SVG", err);
                });
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

                const name = device.name || "device";
                const hasDxf = getDxfModelForDevice(device) !== null;
                // DXF-imported sketches without structured edits still use DXF CAM path;
                // otherwise emit multi-tool Fusion-style programs from live features.
                if (hasDxf && !this.deviceHasStructuredFlowFeatures(device)) {
                    const fullText = generateDxfFusionGCode(device);
                    const portsText = generateDxfFusionGCode(device, 0.125, { portsOnly: true });
                    this.downloadZip(
                        [
                            { filename: `${name}.gcode`, content: fullText },
                            { filename: `${name}_ports.gcode`, content: portsText }
                        ],
                        `${name}_gcode.zip`
                    ).catch(err => {
                        this.reportExportError("GCode", err);
                    });
                    return;
                }

                const files = generateFlowGCodeFiles(device);
                const portsFiles = generateFlowGCodeFiles(device, { portsOnly: true });
                if (!files || files.length === 0) {
                    throw new Error("GCode generator returned no files.");
                }
                const zip = new JSZip();
                const folder = zip.folder(name) || zip;
                for (const file of files) {
                    folder.file(file.filename, file.content);
                }
                const portsFolder = folder.folder("ports") || folder;
                for (const file of portsFiles || []) {
                    portsFolder.file(file.filename, file.content);
                }
                zip.generateAsync({ type: "blob" })
                    .then(blob => {
                        saveAs(blob, `${name}_gcode.zip`);
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
