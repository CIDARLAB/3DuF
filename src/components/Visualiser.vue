<template>
    <div>
        <div id="view-container">
            <div id="canvas_block">
                <canvas id="c" ref="rendingcanvas" tabindex="0" resize />
                <slot>
                    <ComponentContextMenu id="contextMenu" ref="contextMenu" />
                </slot>
                <slot>
                    <ConnectionContextMenu id="contextMenu" ref="contextMenu" />
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
import ConnectionContextMenu from "@/components/ConnectionContextMenu";
import * as HTMLUtils from "@/app/utils/htmlUtils";

export default {
    components: {
        ResolutionToolbar,
        ComponentContextMenu,
        ConnectionContextMenu,
        ZoomSlider
    },
    data() {
        return {};
    },
    computed: {},
    mounted() {
        // registerSets({Basic: Basic});
        let viewManager = new ViewManager();

        Registry.viewManager = viewManager;

        viewManager.loadDeviceFromJSON(JSON.parse(Examples.UpdatedExample));
        // TODO - Make thi work with the programmatic generation of the device
        // viewManager.createNewDevice("New_Device");
        viewManager.updateGrid();
        viewManager.refresh();
        window.dev = Registry.currentDevice;
        window.Registry = Registry;

        window.view = Registry.viewManager.view;
        Registry.viewManager.setupToolBars();
        this.setupDragAndDropOnCanvas();

        // Allow Neptune (and other hosts) to programmatically load a design JSON.
        // Neptune will postMessage: { type: 'loadDeviceFromJSON', json: <object|string> }
        this._postMessageHandler = (event) => {
            const data = event && event.data ? event.data : null;
            if (!data || typeof data !== "object") return;

            if (data.type === "loadDeviceFromJSON") {
                try {
                    let json = data.json;
                    if (typeof json === "string") json = JSON.parse(json);
                    if (!json) return;

                    if (Registry.viewManager && Registry.viewManager.loadDeviceFromJSON) {
                        Registry.viewManager.loadDeviceFromJSON(json);
                        Registry.viewManager.updateGrid();
                        Registry.viewManager.refresh();
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("3DuF: failed to load JSON from postMessage", err);
                }
            }

            // Optional helper for clearing the current device
            if (data.type === "clearDevice") {
                try {
                    if (Registry.viewManager && Registry.viewManager.clear) {
                        Registry.viewManager.clear();
                        Registry.viewManager.updateGrid();
                        Registry.viewManager.refresh();
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("3DuF: failed to clear device", err);
                }
            }
        };
        window.addEventListener("message", this._postMessageHandler);
        //EventBus.get().on(EventBus.DBL_CLICK, this.placement, this.placement2);
    },

    beforeDestroy() {
        if (this._postMessageHandler) {
            window.removeEventListener("message", this._postMessageHandler);
            this._postMessageHandler = null;
        }
    },
    methods: {
        setupDragAndDropOnCanvas: function() {

            function setupDnDFileController(el_, onDropCallback) {
                let dragenter = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    el_.classList.add("dropping");
                };

                let dragover = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                };

                let dragleave = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    // el_.classList.remove('dropping');
                };

                let drop = function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    el_.classList.remove("dropping");

                    onDropCallback(e.dataTransfer.files, e);
                };

                el_.addEventListener("dragenter", dragenter, false);
                el_.addEventListener("dragover", dragover, false);
                el_.addEventListener("dragleave", dragleave, false);
                el_.addEventListener("drop", drop, false);
            }


            setupDnDFileController(this.$refs.rendingcanvas, function(files) {
            const f = files[0];

            const reader = new FileReader();
            reader.onloadend = function(e) {
                let result = this.result;
                // try {
                let jsonresult = JSON.parse(result);
                Registry.viewManager.loadDeviceFromJSON(jsonresult);
                // } catch (error) {
                //     console.error(error.message);
                //     alert("Unable to parse the design file, please ensure that the file is not corrupted:\n" + error.message);
                // }
            };
            try {
                reader.readAsText(f);
            } catch (err) {
                console.log("unable to load JSON: " + f);
            }
        });
        },
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
