<template>
    <v-dialog v-model="dialog" persistent max-width="500">
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" text color="pink darken-1" v-on="on">
                About/Help
            </v-btn>
        </template>

        <v-card>
            <v-card-title class="headline">{{ pageTitle }}</v-card-title>

            <v-card-text>
                <div v-if="selectedVersion">
                    <img src="img/cidar_logo.png" width="100%" />
                    3DuF is microfluidic design environment developed by
                    <a href="http://cidarlab.org" target="_blank" rel="noopener noreferrer">CIDAR</a>.
                    <br />
                    For any help or queries, please send an email to
                    <a href="mailto:3dufhelp@gmail.com">3dufhelp@gmail.com</a>.
                    <br />
                    Developed by: {{ selectedVersion.developers }}.
                    <div v-if="selectedVersion.paperUrl">
                        Publication:
                        <a :href="selectedVersion.paperUrl" target="_blank" rel="noopener noreferrer">{{ selectedVersion.paperTitle }}</a>.
                    </div>
                    <hr />
                    Error Tracking powered by
                    <a href="https://trackjs.com">https://trackjs.com</a>.
                    <hr />

                    <div class="version-section">
                        <div class="branch-link">
                            Source code, issue tracking and feature requests:
                            <a :href="selectedVersion.branchUrl" target="_blank" rel="noopener noreferrer">Github ({{ selectedVersion.branch }})</a>
                        </div>

                        <div v-if="selectedVersion.changes.length">
                            Changes since {{ selectedVersion.previousVersion }}:
                            <ul>
                                <li v-for="(change, idx) in selectedVersion.changes" :key="`${selectedVersion.label}-${idx}`">
                                    {{ change }}
                                </li>
                            </ul>
                        </div>
                        <div v-else>
                            Initial release baseline (no previous version to compare).
                        </div>
                    </div>
                </div>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <!-- numbered buttons -->
                <div>
                    <v-btn v-for="(version, index) in versions" :key="version.label" text :color="page === index + 1 ? 'pink darken-1' : ''" @click="page = index + 1">
                        {{ version.label }}
                    </v-btn>
                </div>
                <v-spacer />
                <v-btn color="green darken-1" text @click="dialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            dialog: false,
            page: 1,
            versions: [
                {
                    label: "v1.0",
                    previousVersion: null,
                    developers: "Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka",
                    branch: "main",
                    branchUrl: "https://github.com/CIDARLAB/3DuF/tree/main",
                    paperTitle: "Scientific Reports (2019): \"3DuF: A Design Environment for Digital Microfluidic Biochips\"",
                    paperUrl: "https://www.nature.com/articles/s41598-019-45623-z",
                    changes: []
                },
                {
                    label: "v1.1",
                    previousVersion: "v1.0",
                    developers: "Yangruirui Zhou, Eric Xie and Radhakrishna Sanka",
                    branch: "webpack-build-2",
                    branchUrl: "https://github.com/CIDARLAB/3DuF/tree/webpack-build-2",
                    changes: [
                        "Added blackbox rendering for unknown/unsupported components, with sidebar cleanup so blackbox is no longer listed as a normal feature tool.",
                        "Added terrace as a new primitive component.",
                        "Added geometric reflection controls (mirrorByX / mirrorByY) across components, with rotation and mirroring about geoCenter.",
                        "Fixed port rendering when loading designs from JSON.",
                        "Corrected primitive-server device rendering behavior.",
                        "Enabled Neptune ↔ 3DuF JSON bridge (postMessage load of designs from Neptune).",
                        "Added a local-development CLI workflow for checking the 3DuF frontend on localhost."
                    ]
                },
                {
                    label: "v1.2",
                    previousVersion: "v1.1",
                    developers: "Yangruirui Zhou",
                    branch: "Neptune_Render",
                    branchUrl: "https://github.com/CIDARLAB/3DuF/tree/Neptune_Render",
                    changes: [
                        "Unified JSON and DXF import into a single Import dialog (drop zone + file picker, Confirm/Cancel), replacing separate sidebar import entries.",
                        "Expanded the DXF pipeline: multilayer designs export as a DXF zip, round-trip import/export is hardened, and device border / channel wall widths export correctly.",
                        "Reworked the manufacturing Export panel for JSON · 3DuF, DXF, SVG, and flow-feature GCode (multilayer biochips use per-layer DXF/SVG instead of GCode).",
                        "Added an All/Ports canvas toggle above Export: Ports keeps only flow (blue) and control (red) port circles so a cover layer can be prepared; All restores the full design. JSON, DXF, SVG, and GCode downloads include a matching ports-only file.",
                        "Added connection cross-section controls (square vs rounded stadium ends) with reliable canvas Apply, rounded endcap geometry, and filled 90° joints on square CHANNEL segments.",
                        "Registered DIYCOMPONENT as a built-in black-box placeholder so Neptune LFR user-designed parts round-trip without a custom library entry.",
                        "Updated the default port radius to 1 mm so newly placed ports match typical cover-layer hole sizes.",
                        "Made the floating settings panel draggable, with Apply / Reset that target the clicked component or connection.",
                        "Improved Valve3D placement and layer-aware rendering (CONTROL full circle vs FLOW crescents) plus precise flow-gap connection breaks.",
                        "Added legacy / paper-design JSON normalization so literature designs load into the current interchange format, with a Tutorial link to 3DuF-Paper-Designs.",
                        "Versioned About/Help and Tutorial dialogs (v1.0–v1.2) with current-version labeling."
                    ]
                }
            ]
        };
    },
    created() {
        this.page = this.versions.length;
    },
    computed: {
        selectedVersion() {
            return this.versions[this.page - 1] || null;
        },
        currentVersionLabel() {
            const currentVersion = this.versions[this.versions.length - 1];
            return currentVersion ? currentVersion.label : "";
        },
        pageTitle() {
            if (!this.selectedVersion) {
                return "3DuF Help";
            }

            const suffix = this.selectedVersion.label === this.currentVersionLabel ? " (current version)" : "";
            return `3DuF ${this.selectedVersion.label}${suffix}`;
        }
    }
};
</script>

<style lang="scss" scoped>
.property-drawer-parent {
    overflow: visible;
    position: relative;
}
.btn {
    width: 100%;
}

.version-section {
    text-align: left;
}

.branch-link {
    margin-bottom: 8px;
}
</style>
