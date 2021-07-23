<template>
    <div class="zoomsliderbase">
        <veeno ref="Zoomslider" vertical v-bind="sliderOptions" @change="updateSlider" />
    </div>
</template>

<script>
import Registry from "@/app/core/registry";
import veeno from "veeno";
import "nouislider/distribute/nouislider.min.css";

export default {
    components: {
        veeno
    },
    data() {
        return {
            zoom: 0,
            zoom_optimal: 0,
            isUserGeneratedEvent: false,
            sliderOptions: {
                connect: [false, true],
                handles: 0.5,
                behavior: "tap-drag",
                range: {
                    min: -3.61,
                    max: 0.6545
                }
            }
        };
    },
    mounted() {
        // setTimeout(() => {
        //     this.zoom_optimal = Math.log10(Registry.viewManager.view.computeOptimalZoom());
        // }, 1000);
    },
    methods: {
        updateSlider: function(event) {
            console.log(event);
            this.zoom = event.values[0];
            if (this.isUserGeneratedEvent) {
                console.log("Zoom Value:", this.zoom);
                // TODO - Map this directly to the zoom functions
                //console.log(registryref);
                try {
                    Registry.viewManager.setZoom(this.convertLinearToZoomScale(this.zoom));
                } catch (e) {
                    console.log("Could not set the zoom");
                }
            }
            this.isUserGeneratedEvent = true;
        },
        setZoom(zoom) {
            this.isUserGeneratedEvent = false;
            zoom = this.convertZoomtoLinearScale(zoom);
        },
        convertLinearToZoomScale(linvalue) {
            return Math.pow(10, linvalue);
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
    right: 50px;
    z-index: 9;
    height: 300px;
}
</style>
