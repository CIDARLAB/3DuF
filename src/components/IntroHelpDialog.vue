<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" class="white pink--text text--darken-1 mb-2 feature-button button-row tutorial-font" v-on="on"> Tutorial </v-btn>
        </template>
        <v-card class="tutorial-font">
            <v-card-title class="headline dialog-title">{{ pageTitle }}</v-card-title>
            <v-card-text>
                <div class="section-title">Developer</div>
                <p class="body-text">{{ selectedVersion.developers }}</p>

                <div v-if="selectedVersion.publicationTitle">
                    <div class="subsection-title">Academic Publications:</div>
                    <p class="body-text">{{ selectedVersion.publicationTitle }}</p>
                    <a class="body-text" :href="selectedVersion.publicationUrl" target="_blank" rel="noopener noreferrer">{{ selectedVersion.publicationUrl }}</a>
                </div>

                <div v-if="selectedVersion.showVideos">
                    <div class="section-title">Videos</div>

                    <div class="video-block">
                        <div class="video-label">Introduction</div>
                        <iframe
                            width="355"
                            height="200"
                            :src="selectedVersion.introductionVideoUrl"
                            frameborder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        />
                    </div>

                    <div class="video-block">
                        <div class="video-label">Long Tutorial</div>
                        <iframe
                            width="355"
                            height="200"
                            :src="selectedVersion.longTutorialVideoUrl"
                            frameborder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        />
                    </div>

                    <br />
                </div>

                <div v-if="selectedVersion.guiDifferences && selectedVersion.guiDifferences.length">
                    <div class="section-title">GUI Differences vs V1.1</div>
                    <ul>
                        <li v-for="(item, idx) in selectedVersion.guiDifferences" :key="`gui-${selectedVersion.label}-${idx}`">
                            {{ item }}
                        </li>
                    </ul>
                </div>

                <div v-if="selectedVersion.workflowImprovements && selectedVersion.workflowImprovements.length">
                    <div class="section-title">Workflow Improvements</div>
                    <ul>
                        <li v-for="(item, idx) in selectedVersion.workflowImprovements" :key="`workflow-${selectedVersion.label}-${idx}`">
                            {{ item }}
                        </li>
                    </ul>
                </div>

                <div v-if="selectedVersion.showDesignsFromLiterature">
                    <div class="section-title">Designs From Literature</div>
                    <p class="body-text">
                        Check the various designs from microfluidic literature recreated in 3DµF can be found
                        <a href="https://cidarlab.github.io/3DuF-Paper-Designs/" target="_blank" rel="noopener noreferrer">here</a>.
                    </p>
                </div>

                <div v-if="selectedVersion.showUsage">
                    <div class="section-title">Usage</div>
                    <table class="tg">
                        <tr>
                            <td class="tg-yw4l">
                                <pre>del</pre>
                            </td>
                            <td class="tg-yw4l">- Delete Feature</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>F</pre>
                            </td>
                            <td class="tg-yw4l">- Reset Canvas</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>Esc</pre>
                            </td>
                            <td class="tg-yw4l">- Activate Select Tool/ Deselect Selected Components</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>ctrl+C, ctrl+V</pre>
                            </td>
                            <td class="tg-yw4l">- Activate Component Copy Mode</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>ctrl+Z</pre>
                            </td>
                            <td class="tg-yw4l">- Undo Last Edit</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>ctrl+A</pre>
                            </td>
                            <td class="tg-yw4l">- Select All</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>ctrl+S</pre>
                            </td>
                            <td class="tg-yw4l">- Save JSON file</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>left click</pre>
                            </td>
                            <td class="tg-yw4l">- Place Feature</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>right click</pre>
                            </td>
                            <td class="tg-yw4l">- Select Feature</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>mouse scroll</pre>
                            </td>
                            <td class="tg-yw4l">- Zoom</td>
                        </tr>
                        <tr>
                            <td class="tg-yw4l">
                                <pre>arrow keys</pre>
                            </td>
                            <td class="tg-yw4l">- Pan</td>
                        </tr>
                    </table>
                </div>

                <p class="body-text contact-line">
                    <b>Send in comments, suggestions and issues to </b>
                    <a href="mailto: 3dufhelp@gmail.com">3dufhelp@gmail.com</a>.
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <div>
                    <v-btn v-for="(version, index) in versions" :key="version.label" text :color="page === index + 1 ? 'pink darken-1' : ''" @click="page = index + 1">
                        {{ version.label }}
                    </v-btn>
                </div>
                <v-spacer />
                <v-btn color="green darken-1" text @click="dialog = false"> Close </v-btn>
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
                    label: "V1.1",
                    developers: "Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka",
                    publicationTitle:
                        "Sanka, Radhakrishna, Joshua Lippai, Dinithi Samarasekera, Sarah Nemsick, and Douglas Densmore. “3DμF - Interactive Design Environment for Continuous Flow Microfluidic Devices.” Scientific Reports 9, no. 1 (December 2019).",
                    publicationUrl: "https://doi.org/10.1038/s41598-019-45623-z",
                    showVideos: true,
                    showUsage: true,
                    showDesignsFromLiterature: false,
                    introductionVideoUrl: "https://www.youtube.com/embed/05nU8eQ73U8",
                    longTutorialVideoUrl: "https://www.youtube.com/embed/YOrnnZjma28"
                },
                {
                    label: "V1.2",
                    developers: "Yangruirui Zhou, Eric Xie and Radhakrishna Sanka",
                    showVideos: false,
                    showUsage: false,
                    showDesignsFromLiterature: false,
                    guiDifferences: [
                        "Added blackbox rendering for unsupported/unknown components so incomplete imports are visible on canvas.",
                        "Extended feature settings with mirrorByX and mirrorByY geometric reflection controls across component editors.",
                        "Improved renderer behavior so mirrored and transformed features are displayed more consistently in 2D views."
                    ],
                    workflowImprovements: [
                        "Unknown components now remain editable as placeholders instead of silently disappearing from visual output.",
                        "Reflection options reduce manual redraw work when creating symmetric layouts.",
                        "Primitive server device rendering corrections make final layout checks and export preparation more reliable."
                    ],
                    introductionVideoUrl: "https://www.youtube.com/embed/05nU8eQ73U8",
                    longTutorialVideoUrl: "https://www.youtube.com/embed/YOrnnZjma28"
                },
                {
                    label: "V1.3",
                    developers: "Yangruirui Zhou",
                    showVideos: true,
                    showUsage: true,
                    showDesignsFromLiterature: true,
                    // Placeholder: v1.3 videos are not ready yet, so reuse existing tutorials.
                    introductionVideoUrl: "https://www.youtube.com/embed/05nU8eQ73U8",
                    longTutorialVideoUrl: "https://www.youtube.com/embed/YOrnnZjma28"
                }
            ]
        };
    },
    created() {
        this.page = this.versions.length;
    },
    computed: {
        selectedVersion() {
            return this.versions[this.page - 1] || this.versions[0];
        },
        currentVersionLabel() {
            const currentVersion = this.versions[this.versions.length - 1];
            return currentVersion ? currentVersion.label : "";
        },
        pageTitle() {
            const suffix = this.selectedVersion.label === this.currentVersionLabel ? " (Current Version)" : "";
            return `Tutorial ${this.selectedVersion.label}${suffix}`;
        }
    }
};
</script>

<style lang="scss" scoped>
.tutorial-font {
    font-family: "Roboto", sans-serif !important;
}

.dialog-title {
    font-size: 28px !important;
    font-weight: 700;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 12px 0 6px;
}

.subsection-title {
    font-size: 18px;
    font-weight: 600;
    margin: 10px 0 6px;
}

.body-text,
ul li,
.tg td {
    font-size: 16px;
    line-height: 1.6;
}

.video-label {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 6px;
}

.video-block {
    margin-bottom: 14px;
}

.contact-line {
    margin-top: 20px;
}
</style>
