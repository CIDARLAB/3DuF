<template>
    <div>
        <div id="view-container">
            <div id="canvas_block">
                <canvas id="c" tabindex="0" resize />
                <slot>
                    <RightClickMenu id="contextMenu" ref="contextMenu" :spec="specs" />
                </slot>
            </div>
            <div id="renderContainer" />
        </div>
        <ResolutionToolbar />
        <zoomSlider />
    </div>
</template>

<script>
import { registerSets } from "@/app/featureSets";
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "../app/index";
import Vue from "vue";
import ResolutionToolbar from "./ResolutionToolbar";
import zoomSlider from "@/components/zoomSlider.vue";
import EventBus from "@/events/events";
import RightClickMenu from "@/components/RightClickMenu.vue";
import PropertyDrawer from "@/components/base/PropertyDrawer.vue";
import ConnectionPropertyDrawer from "@/components/ConnectionPropertyDrawer.vue";

export default {
    components: {
        ResolutionToolbar,
        RightClickMenu,
        zoomSlider
    },
    data() {
        return {};
    },
    // computed: {
    //     specs: function() {
    //         //if (this.Feature
    //         return RoundedChannelSpec;
    //     }
    // },
    mounted() {
        // registerSets({Basic: Basic});
        let viewManager = new ViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.UpdatedExample));
        viewManager.updateGrid();
        Registry.viewManager.updateDevice(viewManager.currentDevice);

        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;
        Registry.viewManager.setupToolBars();
        //EventBus.get().on(EventBus.DBL_CLICK, this.placement, this.placement2);
    },
    methods: {}
};
</script>

<style lang="scss" scoped>
#view-container {
    width: 100%;
    height: 100%;
    overflow-y: hidden;
}
#c {
    z-index: 1;
}
#contextMenu {
    position: absolute;
    z-index: 19;
    background-color: "#fff";
}
</style>
