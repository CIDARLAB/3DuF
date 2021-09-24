<template>
    <v-row>
        <v-col>
            <v-navigation-drawer app permanent class="pt-4" color="grey lighten-3">
                <div class="d-flex flex-column mx-2">
                    <v-img class="mx-auto" src="img/logo.png" alt="3DuF Logo" style="width: 90%" />
                    <v-divider class="mb-1" />
                    <v-divider />
                    <v-divider />
                    <LayerToolbar />
                    <v-divider />
                    <HelpDialog />
                    <v-divider />
                    <br />
                </div>
            </v-navigation-drawer>
        </v-col>
        <v-col>
            <div>
                <Visualiser />
            </div>
        </v-col>
    </v-row>
    <!-- <v-navigation-drawer app permanent class="pt-4" color="grey lighten-3">
            <div class="d-flex flex-column mx-2">
                <v-img class="mx-auto" src="img/logo.png" alt="3DuF Logo" style="width: 90%" />
                <v-divider class="mb-1" />
                <IntroHelpDialog />
                <HelpDialog />
                <v-divider />
                <EditDeviceDialog />
                <EditBorderDialog />
                <InsertTextDialog />
                <ImportDXFDialog />
                <v-divider />
                <LayerToolbar />
                <ComponentToolbar />
            </div>

            <ManufacturingPanel />
        </v-navigation-drawer>

        <v-main id="visualizer-slot">
            <slot name="main" />
        </v-main> -->
</template>

<script>
import EventBus from "@/events/events";
import HelpDialog from "@/components/HelpDialog.vue";
import IntroHelpDialog from "@/components/IntroHelpDialog.vue";
import EditDeviceDialog from "@/components/EditDeviceDialog.vue";
import EditBorderDialog from "@/components/EditBorderDialog.vue";
import ImportDXFDialog from "@/components/ImportDXFDialog.vue";
import InsertTextDialog from "@/components/InsertTextDialog.vue";
import LayerToolbar from "@/components/LayerToolbar.vue";
import ComponentToolbar from "@/components/ComponentToolBar.vue";
import ManufacturingPanel from "@/components/ManufacturingPanel.vue";
import Visualiser from "@/components/Visualiser.vue";

export default {
    components: {
        HelpDialog,
        // IntroHelpDialog,
        // EditDeviceDialog,
        // EditBorderDialog,
        // ImportDXFDialog,
        // InsertTextDialog,
        LayerToolbar,
        // ComponentToolbar,
        // ManufacturingPanel,
        Visualiser
    },
    data() {
        return {
            buttons: [
                ["json", "mdi-devices", "3DuF File (.json)"],
                ["svg", "mdi-border-all", "Vector Art (.svg)"],
                ["cnc", "mdi-toolbox", "CNC (.svg)"],
                ["laser", "mdi-toolbox", "Laser Cutting (.svg)"],
                ["metafluidics", "mdi-toolbox", "Publish on Metafluidics"]
            ]
        };
    },
    mounted() {
        const scrollElement = document.querySelector(".v-navigation-drawer__content");
        scrollElement.addEventListener("scroll", this.handleScroll);
        window.addEventListener("scroll", () => {
            window.scrollTo(0, 0);
        });
    },
    destroyed() {
        // this.$el.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        handleScroll() {
            EventBus.get().emit(EventBus.NAVBAR_SCROLL_EVENT);
        }
    }
};
</script>
<style scoped>
.newbox {
    position: absolute;
    right: 0;
    width: 85vw;
    height: 100vh;
}
</style>
