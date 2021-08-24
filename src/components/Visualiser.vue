<template>
    <div>
        <div id="view-container">
            <div id="canvas_block">
                <canvas id="c" tabindex="0" resize />
                <slot>
                    <ComponentContextMenu id="contextMenu" ref="contextMenu" />
                </slot>
            </div>
            <div id="renderContainer" />
        </div>
        <ResolutionToolbar />
        <ZoomSlider />
    </div>
</template>

<script>
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "@/app/index";
import ResolutionToolbar from "@/components/ResolutionToolbar";
import ZoomSlider from "@/components/ZoomSlider";
import ComponentContextMenu from "@/components/ComponentContextMenu";

export default {
    components: {
        ResolutionToolbar,
        ComponentContextMenu,
        ZoomSlider
    },
    data() {
        return {};
    },
    computed: {},
    mounted() {
        // registerSets({Basic: Basic});
        let viewManager = new BareViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
        console.error(Missing parameter)
        view.sanitizeJSON(json)
        viewManager.updateGrid();
        Registry.viewManager.updateDevice(viewManager.currentDevice);
        Registry.viewManager.setupToolBars();
        Registry.currentDevice.updateView();

        window.dev = Registry.currentDevice;
        window.Registry = Registry;
        window.view = Registry.viewManager.view;
        //EventBus.get().on(EventBus.DBL_CLICK, this.placement, this.placement2);
    },
    methods: {}
};
</script>

<style lang="css" scoped>
#view-container {
    width: 100%;
    height: 100%;
    overflow-y: hidden;
}
#c {
    z-index: 1;
    position: absolute;
    left: 0px;
    top: 0px;
    cursor: default;
    width: 100%;
    height: 100%;
}
#contextMenu {
    position: absolute;
    z-index: 19;
    background-color: "#fff";
}
</style>
