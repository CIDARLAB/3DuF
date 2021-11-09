<template>
    <div>
        <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    id="grid-button"
                    v-bind="attrs"
                    class="pink white--text"
                    fab
                    v-on="on"
                    @click="showProperties()"
                    @mouseenter.native="hover = true"
                    @mouseleave.native="hover = false"
                >
                    <span class="material-icons">grid_on</span>
                </v-btn>
            </template>
            <span>Grid Settings</span>
        </v-tooltip>
        <v-card v-show="activated" id="resolution-toolbar">
            <v-card-text>
                <v-switch v-model="slider_enabled" color="#304FFE" hide-details @change="clickedGrid">
                    <template v-slot:label class="mdl-switch__label">
                        Enable Automatic Grid
                    </template>
                </v-switch>
                <v-switch v-model="renderSnap" color="#304FFE" @change="clickedSnap">
                    <template v-slot:label class="mdl-switch__label">
                        Render Snap Points
                    </template>
                </v-switch>
                <veeno
                    ref="slider"
                    v-model="gridSizeValue"
                    :pipsy="{
                        mode: 'steps',
                        density: 5,
                        stepped: true,
                        format: suffix
                    }"
                    :handles="1000"
                    :range="{
                        min: [1],
                        '10%': [10],
                        '30%': [100],
                        '90%': [1000],
                        max: [5000]
                    }"
                    :step="100"
                    :connect="[true, false]"
                    @update="updateGridSize"
                />
            </v-card-text>
        </v-card>
        <div id="bottom-info-bar">Grid Size: {{ gridSizeValue }} &mu;m</div>
    </div>
</template>

<script>
import veeno from "veeno";
import "nouislider/distribute/nouislider.min.css";
import Registry from "../app/core/registry";
import wNumb from "wnumb";
import EventBus from "@/events/events";

export default {
    name: "ResolutionToolbar",
    components: { veeno },
    data() {
        return {
            suffix: wNumb({ suffix: "μm" }),
            activated: false,
            hover: false,
            slider_enabled: true,
            renderSnap: true,
            gridSizeValue: 1000
        };
    },
    mounted() {
        // listen to ZoomSlider and get grid size data and show here as sliderValue
        // we doesn't need eventbus anymore
        EventBus.get().on(EventBus.UPDATE_GRID, data => {
            this.gridSizeValue = data;
        });

        // Create the noUiSlider
        // noUiSlider.create(this.$refs.slider, {
        //     start: [500],
        //     connect: "lower",
        //     range: {
        //         min: [1, 1],
        //         "10%": [10, 10],
        //         "30%": [100, 100],
        //         "90%": [1000, 1000],
        //         max: [5000]
        //     },
        //     pips: {
        //         mode: "range",
        //         density: 5,
        //         format: wNumb({ suffix: "μm" })
        //     },
        //     tooltips: [true]
        // });

        // Associate an onchange function
        const ref = this;
        const registryref = Registry;
        // this.__gridResolutionSlider.noUiSlider.on("update", function(values, handle, unencoded, isTap, positions) {
        //     ref.__smallresolutionLabel.innerHTML = values[0] + " μm";
        // });
    },
    // updated() {
    //     Registry.currentGrid.enableAdaptiveGrid();
    // },
    methods: {
        showProperties() {
            this.activated = !this.activated;
            console.log("grid clicked");
        },
        clickedGrid() {
            console.log(this.slider_enabled);
            if (this.slider_enabled) {
                //Enable Adaptive Grid
                Registry.currentGrid.enableAdaptiveGrid();
                //this.$ref.slider.setAttribute("disabled", true);
            } else {
                //Disable Adaptive Grid
                Registry.currentGrid.disableAdaptiveGrid();
                //this.$ref.slider.removeAttribute("disabled");
            }
        },
        clickedSnap() {
            if (this.renderSnap) {
                //Enable Snap
                Registry.viewManager.view.enableSnapRender();
            } else {
                //Disable Snap
                Registry.viewManager.view.disableSnapRender();
            }
        },
        updateGridSize(event) {
            const { values } = event;
            this.gridSizeValue = parseInt(values[0], 10);
            if (Registry.currentGrid !== null) {
                console.log("updating grid size to " + this.gridSizeValue);
                Registry.currentGrid.updateGridSpacing(this.gridSizeValue);
                //registryref.currentGrid.notifyViewManagerToUpdateView();
                // console.log("grid updated gridSizeValue", this.gridSizeValue);
                // console.log("grid updated registry", registryref.currentGrid.spacing);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
#resolution-toolbar {
    align-content: center;
    position: absolute;
    width: 500px;
    height: 200px;
    top: 10px;
    right: 100px;
    background-color: rgb(250, 250, 250);
    z-index: 9;
    box-shadow: 0px 2px 5px 0 rgba(0, 0, 0, 0.36);
    transition: all 0.4s;
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 5px;
    opacity: 0.9;
    border-radius: 5px;
}
#grid-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9;
}
#grid-resolution-slider {
    font-size: 10px;
}
#grid-hover {
    position: absolute;
    top: 22.5px;
    left: 1080px;
    z-index: 9;
}
.veeno.noUi-pips.noUi-pips-horizontal {
    padding: 0px;
    left: 10px;
}
#bottom-info-bar {
    z-index: 9;
    bottom: 2px;
    right: 50px;
    position: absolute;
}
</style>
