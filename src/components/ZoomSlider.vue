<template>
    <!-- <div ref="slider" class="zoomsliderbase"></div> -->
    <div class="zoomsliderbase">
        <div ref="zoomslider" class="zslidermain" height="300px" ></div>
    </div>
</template>

<script>
import Registry from "@/app/core/registry";
// import veeno from "veeno";
import "@/assets/lib/nouislider/nouislider.min.css";
import noUiSlider from "nouislider";
import wNumb from "wnumb";
import EventBus from "@/events/events";

export default {
    name: "ZoomSlider",
    components: {
        // veeno
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

        noUiSlider.create(this.$refs.zoomslider, {
            start: 40,
            orientation: "vertical",
            connect: [false, true],
            tooltips: [true],
            range: {
                "min": -3.61,
                "max": 0.6545
            }},
        );
        
        this.$refs.zoomslider.noUiSlider.updateOptions({}, false);

        // Associate an onchange function
        this.$refs.zoomslider.noUiSlider.on("update", (params) => {
            this.isUserGeneratedEvent = true;
            let zoom = parseFloat(params[0]);
            console.log("scroll bar event zoom:", zoom);
            this.updateViewManagerZoom(zoom);
        });
        let zoomOptimal = 0;
        setTimeout(() => {
            zoomOptimal = Math.log10(Registry.viewManager.view.computeOptimalZoom());
            // this.currentZoom = zoomOptimal;
            console.log("Optimal Zoom:", zoomOptimal);
            this.$refs.zoomslider.noUiSlider.set(zoomOptimal);

            // this.currentZoom = Registry.viewManager.view.getZoom();
        }, 100);
        // Create the onupdate method
        // EventBus.get().on(EventBus.UPDATE_ZOOM, this.setZoom);
        EventBus.get().on(EventBus.UPDATE_ZOOM, () => {
            console.log("RX: Update Zoom");
            // this.viewManagerZoomChanged();
            let newzoom = this.convertZoomtoLinearScale(Registry.viewManager.view.getZoom());
            console.log("new zoom:", newzoom);

            // this.$refs.zoomslider.noUiSlider.set(zoomOptimal);
        });
        // console.log("currentZoom:", this.currentZoom);

    },
    methods: {
        /**
         * Pass the value that needs to be set for the
         * @param zoom
         */
        setZoom(zoom) {
            console.log("Set Zoom Event:", zoom);
            // this.currentZoom = zoom;
        },
        convertLinearToZoomScale(linvalue) {
            return Math.pow(10, linvalue);
        },
        updateViewManagerZoom(zoom) {
            console.log("Zoom Value on slide update:", zoom);
            Registry.viewManager.setZoom(this.convertLinearToZoomScale(zoom));
        },
        convertZoomtoLinearScale(zoomvalue) {
            return Math.log10(zoomvalue);
        },
        viewManagerZoomChanged() {
            let newzoom = Registry.viewManager.view.getZoom();
            console.log("Zoom Value on view manager change:", newzoom);
        }
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
