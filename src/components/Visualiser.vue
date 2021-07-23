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
    </div>
</template>

<script>
import { registerSets } from "@/app/featureSets";
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "../app/index";
import Vue from "vue";
import ResolutionToolbar from "./ResolutionToolbar";
import EventBus from "@/events/events";
import RightClickMenu from "@/components/RightClickMenu.vue";
import ConnectionSpec from "@/models/property-drawer/ConnectionSpec.js";
import ChannelSpec from "@/models/property-drawer/ChannelSpec.js";
import RoundedChannelSpec from "@/models/property-drawer/RoundedChannelSpec.js";
import TransitionSpec from "@/models/property-drawer/TransitionSpec.js";
// import AlignmentMarksSpec from "@/models/property-drawer/AlignmentMarksSpec.js";
import PropertyDrawer from "@/components/base/PropertyDrawer.vue";
import ConnectionPropertyDrawer from "@/components/base/ConnectionPropertyDrawer.vue";
import MixSpec from "@/models/property-drawer/MixSpec.js";
import Mix3DSpec from "@/models/property-drawer/Mix3DSpec.js";
import GradientGenSpec from "@/models/property-drawer/GradientGenSpec.js";
import Valve3DSpec from "@/models/property-drawer/Valve3DSpec.js";
import ValveSpec from "@/models/property-drawer/ValveSpec.js";
import Pump3DSpec from "@/models/property-drawer/Pump3DSpec.js";
import PumpSpec from "@/models/property-drawer/PumpSpec.js";
import LLChamberSpec from "@/models/property-drawer/LLChamberSpec.js";
// import CellTrapSpec from "@/models/property-drawer/CellTrapSpec.js";
// import DiamondChamberSpec from "@/models/property-drawer/DiamondChamberSpec.js";
// import ChamberSpec from "@/models/property-drawer/ChamberSpec.js";
// import DropletGenSpec from "@/models/property-drawer/DropletGenSpec.js";
// import PortSpec from "@/models/property-drawer/PortSpec.js";
// import ViaSpec from "@/models/property-drawer/ViaSpec.js";
// import YTreeSpec from "@/models/property-drawer/YTreeSpec.js";
// import MuxSpec from "@/models/property-drawer/MuxSpec.js";
// import TransponderSpec from "@/models/property-drawer/TransponderSpec.js";

export default {
    components: {
        ResolutionToolbar,
        RightClickMenu
    },
    data() {
        return {};
    },
    computed: {
        specs: function() {
            //if (this.Feature
            return RoundedChannelSpec;
        }
    },
    mounted() {
        // registerSets({Basic: Basic});
        let viewManager = new ViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
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
