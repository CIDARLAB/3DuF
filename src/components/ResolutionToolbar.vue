<template>
    <div>
        <v-btn id="grid-button" class="pink white--text" fab @click="showProperties()" @mouseenter.native="hover = true" @mouseleave.native="hover = false">
            <span class="material-icons">grid_on</span>
        </v-btn>
        <v-btn v-if="hover" id="grid-hover" class="grey white--text" x-small depressed>Grid Settings</v-btn>
        <div v-if="activated" id="resolution-toolbar">
            <v-switch v-model="slider_enabled" color="#304FFE" hide-details @change="clickedGrid">
                <template v-slot:label class="mdl-switch__label">Enable Automatic Grid</template>
            </v-switch>
            <v-switch v-model="switch2" color="#304FFE" @change="clickedSnap">
                <template v-slot:label class="mdl-switch__label">Render Snap Points</template>
            </v-switch>
            <veeno ref="slider" :disabled="slider_enabled" v-bind="sliderOptions" @change="updateGrid" />
        </div>
    </div>
</template>

<script>
import veeno from "veeno";
import "nouislider/distribute/nouislider.min.css";
import Registry from "../app/core/registry";
import wNumb from "wnumb";

export default {
    name: "ResolutionToolbar",
    components: {
        veeno
    },

    props: {},
    data() {
        return {
            activated: false,
            hover: false,
            slider_enabled: true,
            switch2: true,
            sliderOptions: {
                connect: [true, false],
                pipsy: { mode: "range", density: 5 },
                handles: 1000,
                range: { min: [1], "10%": [10], "30%": [100], "90%": [1000], max: [5000] }
            }
        };
    },
    mounted() {
        Registry.currentGrid.enableAdaptiveGrid();
    },
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
            if (this.switch2) {
                //Enable Snap
                Registry.viewManager.view.enableSnapRender();
            } else {
                //Disable Snap
                Registry.viewManager.view.disableSnapRender();
            }
        },
        updateGrid(event) {
            let registryref = Registry;
            const { values } = event;
            let value1 = parseInt(values[0], 10);
            //This ensures that there is something valid present
            if (registryref.currentGrid !== null) {
                registryref.currentGrid.updateGridSpacing(value1);
                registryref.currentGrid.notifyViewManagerToUpdateView();
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
</style>
