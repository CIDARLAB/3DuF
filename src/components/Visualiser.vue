<template>
    <div>
        <div id="view-container">
            <div id="canvas_block">
                <canvas id="c" tabindex="0" resize />
            </div>
            <div id="renderContainer" />
        </div>
<<<<<<< HEAD
=======
        <ResolutionToolbar />
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
    </div>
</template>

<script>
<<<<<<< HEAD
import { Registry, BareViewManager } from "../app/index";
import { Examples } from "../app/index";

export default {
    mounted() {
        let viewManager = new BareViewManager();
=======
import { registerSets } from "@/app/featureSets";
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "../app/index";
import ResolutionToolbar from "./ResolutionToolbar";

export default {
    components: {
        ResolutionToolbar
    },
    mounted() {
        // registerSets({ Basic: Basic });
        let viewManager = new ViewManager();
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
        viewManager.updateGrid();
<<<<<<< HEAD
        Registry.currentDevice.updateView();
=======
        Registry.viewManager.updateDevice(viewManager.currentDevice);
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a

        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;
<<<<<<< HEAD
    }
=======
        Registry.viewManager.setupToolBars();
    },
    methods: {}
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
};
</script>

<style lang="scss" scoped>
#view-container {
    width: 100%;
    height: 100%;
<<<<<<< HEAD
=======
    overflow-y: hidden;
}
#c {
    z-index: 1;
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
}
</style>
