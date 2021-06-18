<template>
    <div>
        <v-btn id="grid-button" class="pink white--text" fab @click="showProperties()" @mouseenter.native="hover = true" @mouseleave.native="hover = false">
            <span class="material-icons">grid_on</span>
        </v-btn>
        <v-btn v-if="hover" id="grid-hover" class="grey white--text" x-small depressed>Grid Settings</v-btn>
        <div v-if="activated" id="resolution-toolbar">
            <div>
                <toggle-button :value="true" color="#304FFE" :width="40" :height="18" @change="clicked()" />
                <span class="mdl-switch__label" style="thick">Enable Automatic Grid</span>
            </div>
            <div>
                <toggle-button :value="true" color="#304FFE" :width="40" :height="18" @change="clicked()" />
                <span class="mdl-switch__label" style="thick">Render Snap Points</span>
            </div>
            <div id="grid-resolution-slider">
                <veeno
                    id="__gridResolutionSlider"
                    :connect="[true, false]"
                    :pipsy="{ mode: 'steps', density: 5 }"
                    :handles="1000"
                    :range="{ min: [1], '10%': [10], '30%': [100], '90%': [1000], max: [5000] }"
                />
            </div>
        </div>
    </div>
</template>

<script>
import veeno from "veeno";
import "nouislider/distribute/nouislider.min.css";
import resolutionToolBar from "../app/view/ui/resolutionToolBar";

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
            value: true
        };
    },
    //mode(){

    // if (this.$refs.grid-enable.checked == true){
    //             //Enable Adaptive Grid
    //             Registry.currentGrid.enableAdaptiveGrid()
    //             grid-resolution-slider
    //         }
    //     else {
    //             //Disable Adaptive Grid
    //             Registry.currentGrid.disableAdaptiveGrid();
    //             ref.__gridResolutionSlider.removeAttribute("disabled");
    //         }
    // },
    methods: {
        showProperties() {
            this.activated = !this.activated;
            console.log("test clicked");
        },
        clicked() {
            this.value = !this.value;
            console.log("test clicked");
        },
        reolutionToolBar.__gridResolutionSlider.noUiSlider.on("change", function(values, handle, unencoded, isTap, positions) {
            let value = parseInt(values[0], 10);

            //This ensures that there is something valid present
            if (Registry.currentGrid != null) {
                Registry.currentGrid.updateGridSpacing(value);
                Registry.currentGrid.notifyViewManagerToUpdateView();
            }
        });
    }
};
</script>

<style lang="scss" scoped>
#resolution-toolbar {
    align-content: center;
    position: absolute;
    width: 500px;
    height: 120px;
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