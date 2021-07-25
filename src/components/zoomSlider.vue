<template>
    <div class="zoomsliderbase">
        <veeno
            ref="Zoomslider"
            v-model="dummy"
            vertical
            rtl
            :connect="[true, false]"
            :set="dummy"
            :handles="dummy"
            :range="{
                min: 0.001,
                max: 5
            }"
            @change="updateSlider"
        />
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
            dummy: [0.1],
            isUserGeneratedEvent: false
        };
    },
    computed: {
        dummy2: function () {
            return this.convertLinearToZoomScale(this.dummy[0]);
        }
    },
    mounted() {
        setTimeout(() => {
            this.dummy = [Math.log10(Registry.viewManager.view.computeOptimalZoom())];
            console.log(this.dummy);
        }, 10);
    },
    methods: {
        updateSlider: function (event) {
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
    right: 35px;
    z-index: 9;
    height: 300px;
}
</style>
