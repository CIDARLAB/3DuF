<template>
    <div>
        <div id="view-container">
            <div id="canvas_block">
                <canvas id="c" tabindex="0" resize />
            </div>
            <div id="renderContainer" />
        </div>
    </div>
</template>

<script>
import { Registry, BareViewManager, ViewManager } from "../app/index";
import { Examples } from "../app/index";

export default {
    mounted() {
        let viewManager = new ViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.example2));
        viewManager.updateGrid();
        //Registry.currentDevice.updateView();
        Registry.viewManager.updateDevice(viewManager.currentDevice);

        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;
    }
};
</script>

<style lang="scss" scoped>
#view-container {
    width: 100%;
    height: 100%;
}
</style>
