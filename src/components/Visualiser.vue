<template>
    <div>
        <div id="view-container">
            <div id="canvas_block" @click="callbacks.close()">
                <canvas id="c" tabindex="0" resize />
                <slot v-if="activeMenu"><RightClickMenu id="rightclickmenu" :spec="roundedChannelSpec"/></slot>
            </div>
            <div id="renderContainer" />
        </div>
        <ResolutionToolbar />
    </div>
</template>

<script>
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "../app/index";
import Vue from "vue";
import ResolutionToolbar from "./ResolutionToolbar";
import EventBus from "@/events/events";
import RightClickMenu from "@/components/RightClickMenu.vue";
import RoundedChannelSpec from "@/models/property-drawer/RoundedChannelSpec.js";

export default {
    components: {
        ResolutionToolbar,
        RightClickMenu
    },
    data() {
        return {
            activeMenu: false,
            contextMenu_left: String,
            contextMenu_top: String
        };
    },
    computed: {
        roundedChannelSpec: function() {
            return RoundedChannelSpec;
        }
    },
    mounted() {
        let viewManager = new ViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
        viewManager.updateGrid();
        Registry.currentDevice.updateView();

        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;
        Registry.viewManager.setupToolBars();
        EventBus.get().on(EventBus.DBL_CLICK, this.activateMenu);
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activeMenu = false;
        });
    },
    methods: {
        activateMenu(event) {
            //alternate: Paperview.canvas.onmousedown
            this.activeMenu = !this.activeMenu;
            console.log(this.activeMenu);
            console.log(this.event);
            // if (event.clientX + 30 + this.$refs.rightclickmenu.clientWidth > window.innerWidth) {
            //     this.contextMenu_left = String(event.clientX - this.$refs.rightclickmenu.clientWidth - 30) + "px";
            //     console.log("this.contextMenu_left");
            // } else {
            //     this.contextMenu_left = String(event.clientX + 30) + "px";
            //     console.log("this.contextMenu_left");
            // }
            // if (event.clientY - 20 + this.$refs.rightclickmenu.clientHeight > window.innerHeight) {
            //     this.contextMenu_top = String(event.clientY - this.$refs.rightclickmenu.clientHeight + 20) + "px";
            // } else {
            //     this.contextMenu_top = String(event.clientY - 20) + "px";
            // }
        }
    }
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
#rightclickmenu {
    position: absolute;
    z-index: 19;
    left: 500px;
    top: 500px;
    background-color: "#fff";
}
</style>
