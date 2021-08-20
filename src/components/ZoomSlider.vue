<template>
    <!-- <div ref="slider" class="zoomsliderbase"></div> -->
    <div class="zoomsliderbase">
        <veeno
            :set="currentZoom"
            vertical
            :handles="30"
            :range="{
                min: -3.61,
                max: 0.6545
            }"
            :connect="[false, true]"
            @update="updateZoom"
        />
    </div>
</template>

<script>
import Registry from "@/app/core/registry";
import veeno from "veeno";
import "nouislider/distribute/nouislider.min.css";

export default {
    name: "ZoomSlider",
    components: {
        veeno
    },
    data() {
        return {
            zoomOptimal: [0.1],
            isUserGeneratedEvent: false,
            currentGridSpacing: 500,
            currentZoom: -3.5
        };
    },
    mounted() {
        setTimeout(() => {
            Math.log10(Registry.viewManager.view.computeOptimalZoom());
            this.currentZoom = Registry.viewManager.view.zoom;
            // console.log("currentZoom", this.currentZoom);
            // this.currentZoom = Registry.viewManager.view.getZoom();
        }, 100);
        // Create the onupdate method
        // EventBus.get().on(EventBus.UPDATE_ZOOM, this.setZoom);
    },
    methods: {
        /**
         * Pass the value that needs to be set for the
         * @param zoom
         */
        setZoom(zoom) {
            this.currentZoom = zoom;
        },
        convertLinearToZoomScale(linvalue) {
            return Math.pow(10, linvalue);
        },
        updateZoom(params) {
            console.log("Zoom Value:", parseFloat(params.values[0]));
            Registry.viewManager.setZoom(this.convertLinearToZoomScale(parseFloat(params.values[0])));
        },
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
