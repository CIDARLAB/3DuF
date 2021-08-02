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
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "@/app/index";
import Vue from "vue";
import ResolutionToolbar from "@/components/ResolutionToolbar";
import ZoomSlider from "@/components/ZoomSlider.vue";
import EventBus from "@/events/events";
import RightClickMenu from "@/components/RightClickMenu.vue";
import { ComponentAPI } from "@/componentAPI";

export default {
    components: {
        ResolutionToolbar,
        RightClickMenu,
        ZoomSlider
    },
    data() {
        return {
            specs: this.computedSpec("Connection")
        };
    },
    computed: {},
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
    methods: {
        computedSpec: function(threeduftype) {
            // Get the corresponding the definitions object from the componentAPI, convert to a spec object and return
            let definition = ComponentAPI.getDefinition(threeduftype);
            let spec = [];
            for (let key in definition.heritable) {
                console.log(definition.units[key]);
                // const unittext = definition.units[key] !== "" ? he.htmlDecode(definition.units[key]) : "";
                let item = {
                    mint: key,
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: definition.defaults[key],
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10,
                    name: key
                };
                spec.push(item);
            }
            return spec;
        }
    }
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
}
#contextMenu {
    position: absolute;
    z-index: 19;
    background-color: "#fff";
}
</style>
