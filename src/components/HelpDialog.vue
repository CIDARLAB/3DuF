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
                    label: "v1.1",
                    previousVersion: null,
                    developers: "Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka",
                    branch: "main",
                    branchUrl: "https://github.com/CIDARLAB/3DuF/tree/main",
                    paperTitle: "Scientific Reports (2019): \"3DuF: A Design Environment for Digital Microfluidic Biochips\"",
                    paperUrl: "https://www.nature.com/articles/s41598-019-45623-z",
                    changes: []
                },
                {
                    label: "v1.2",
                    previousVersion: "v1.1",
                    developers: "Yangruirui Zhou, Eric Xie and Radhakrishna Sanka",
                    branch: "webpack-build-2",
                    branchUrl: "https://github.com/CIDARLAB/3DuF/tree/webpack-build-2",
                    changes: [
                        "Added blackbox rendering for unknown components.",
                        "Added multiple geometric reflection parameters across components (mirrorByX and mirrorByY), with coordinated renderer updates.",
                        "Corrected primitive server device rendering behavior."
                    ]
                },
                {
                    label: "v1.3",
                    previousVersion: "v1.2",
                    developers: "Yangruirui Zhou",
                    branch: "Neptune_Render",
                    branchUrl: "https://github.com/CIDARLAB/3DuF/tree/Neptune_Render",
                    changes: [
                        "Expanded DXF import coverage and updated 2D DXF object/solid rendering.",
                        "Improved feature rendering and view-management flow for clearer on-canvas results.",
                        "Updated additive manufacturing export and manufacturing panel behavior for newer workflows."
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
