<template>
    <div class="zoomsliderbase">
        <div ref="zoomslider" class="zslidermain" height="300px" ></div>
    </div>
</template>

<script>
import Registry from "@/app/core/registry";
import "@/assets/lib/nouislider/nouislider.min.css";
import noUiSlider from "nouislider";
import EventBus from "@/events/events";

export default {
    name: "ZoomSlider",
    components: {
    },
    data() {
        return {
            zoomOptimal: [0.1],
            ignoreUpdate: false,
            currentGridSpacing: 500,
            currentZoom: -3.5
        };
    },
    mounted() {

        noUiSlider.create(this.$refs.zoomslider, {
            start: 40,
            orientation: "vertical",
            connect: [false, true],
            range: {
                "min": -3.61,
                "max": 0.6545
            }},
        );
        
        this.$refs.zoomslider.noUiSlider.updateOptions({range: {
                "min": -3.61,
                "max": 0.6545
            }}, false);

        let zoomOptimal = 0;
        setTimeout(() => {
            // Associate an onchange function
            this.$refs.zoomslider.noUiSlider.on("update", (params) => {
                this.isUserGeneratedEvent = true;
                let zoom = parseFloat(params[0]);
                if (!this.ignoreUpdate) {
                    this.updateViewManagerZoom(zoom);
                }
            });

            zoomOptimal = Math.log10(Registry.viewManager.view.computeOptimalZoom());
            this.$refs.zoomslider.noUiSlider.set(zoomOptimal);
        }, 100);

        // Create the onupdate method
        EventBus.get().on(EventBus.UPDATE_ZOOM, () => {
            let newzoom = this.convertZoomtoLinearScale(Registry.viewManager.view.getZoom());
            this.ignoreUpdate = true;
            this.$refs.zoomslider.noUiSlider.set(newzoom);
            this.ignoreUpdate = false;
        });

    },
    methods: {
        convertLinearToZoomScale(linvalue) {
            return Math.pow(10, linvalue);
        },
        updateViewManagerZoom(zoom) {
            Registry.viewManager.setZoom(this.convertLinearToZoomScale(zoom));
        },
        convertZoomtoLinearScale(zoomvalue) {
            return Math.log10(zoomvalue);
        },
    }
};
</script>

<style lang="scss" scoped>
.zoomsliderbase {
    position: absolute;
    top: 200px;
    right: 35px;
    z-index: 1000;
    height: 300px;
}

.zslidermain{
    height: 300px;
}
</style>
