<template>
    <div ref="slider" class="zoomsliderbase"></div>
</template>

<script>
import Registry from "@/app/core/registry";
import noUiSlider from "nouislider";
import "@/assets/nouislider/nouislider.min.css";
import EventBus from "@/events/events";
import Vue from "vue";

export default {
    name: "ZoomSlider",
    components: {},
    data() {
        return {
            zoomOptimal: [0.1],
            isUserGeneratedEvent: false,
            currentGridSpacing: 500
        };
    },
    mounted() {
        setTimeout(() => {
            this.zoomOptimal = [Math.log10(Registry.viewManager.view.computeOptimalZoom())];
            console.log("this.zoomOptimal", this.zoomOptimal);
        }, 10);

        noUiSlider.create(this.$refs.slider, {
            start: [this.zoomOptimal],
            connect: "lower",
            range: {
                min: -3.61,
                max: 0.6545
            },
            orientation: "vertical",
            direction: "rtl"
        });

        // Create the onupdate method
        const registryref = Registry;
        const ref = this;
        this.$refs.slider.noUiSlider.on("update", function(values, handle, unencoded, tap, positions) {
            if (ref.isUserGeneratedEvent) {
                console.log("Zoom Value:", values[0]);
                //created a getter to get current Sapcing from Registry.currentGrid.__spacing
                let updatedSpacing = Registry.currentGrid.spacing;
                console.log("updatedSpacing zoombar:", updatedSpacing);
                //let updatedSpacing = ref.getGridSpacing();
                EventBus.get().emit(EventBus.UPDATE_GRID, updatedSpacing);
                // EventBus emit updated spacing, ResolutionToolBar.vue listen to this
                try {
                    registryref.viewManager.setZoom(ref.convertLinearToZoomScale(values[0]));
                } catch (e) {
                    console.log("Could not set the zoom");
                }
            }
            ref.isUserGeneratedEvent = true;
        });
        EventBus.get().on(EventBus.UPDATE_ZOOM, this.setZoom);
        //???? Ask Krishna where this eventbus go??
    },
    methods: {
        /**
         * Pass the value that needs to be set for the
         * @param zoom
         */
        setZoom(zoom) {
            this.isUserGeneratedEvent = false;
            this.$$refs.slider.noUiSlider.set(this.convertZoomtoLinearScale(zoom));
        },
        convertLinearToZoomScale(linvalue) {
            return Math.pow(10, linvalue);
        },
        // getGridSpacing() {
        //     return Registry.currentGrid.__spacing;
        // },
        convertZoomtoLinearScale(zoomvalue) {
            return Math.log10(zoomvalue);
        }
    }
};
</script>

<style lang="scss" scoped>
.zoomsliderbase {
    position: absolute;
    top: 200px;
    right: 35px;
    z-index: 9;
    height: 300px;
}
</style>
