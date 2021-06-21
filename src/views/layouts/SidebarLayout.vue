<template>
    <div>
        <v-navigation-drawer app permanent class="pt-4" color="grey lighten-3">
            <div class="d-flex flex-column mx-2">
                <v-img class="mx-auto" src="img/logo.png" alt="3DuF Logo" style="width: 90%" />
                <v-divider class="mb-1" />
                <IntroHelpDialog />
                <HelpDialog />
                <v-divider />
                <MoveDialog />
                <ChangeAllDialog />
                <EditDeviceDialog />
                <EditBorderDialog />
                <InsertTextDialog />
                <ImportDXFDialog />
                <v-divider />
                <LayerToolbar />
                <ComponentToolbar />
            </div>

            <v-list>
                <v-list-item-group mandatory color="indigo">
                    <v-list-item v-for="[key, icon, text] in buttons" :key="key" link>
                        <v-list-item-icon>
                            <v-icon>{{ icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>{{ text }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>

        <v-main id="visualizer-slot">
            <slot name="main" />
        </v-main>
    </div>
</template>

<style lang="scss" scoped>
#visualizer-slot {
    width: 100%;
    min-height: 100vh;
}
</style>

<script>
import EventBus from "@/events/events";
import HelpDialog from "@/components/HelpDialog.vue";
import IntroHelpDialog from "@/components/IntroHelpDialog.vue";
import EditDeviceDialog from "@/components/EditDeviceDialog.vue";
import MoveDialog from "@/components/base/MoveDialog.vue";
import ChangeAllDialog from "@/components/base/ChangeAllDialog.vue";
import EditBorderDialog from "@/components/EditBorderDialog.vue";
import ImportDXFDialog from "@/components/ImportDXFDialog.vue";
import InsertTextDialog from "@/components/InsertTextDialog.vue";
import LayerToolbar from "@/components/LayerToolbar.vue";
import ComponentToolbar from "@/components/ComponentToolBar.vue";
export default {
    components: {
        HelpDialog,
        IntroHelpDialog,
        EditDeviceDialog,
        MoveDialog,
        ChangeAllDialog,
        EditBorderDialog,
        ImportDXFDialog,
        InsertTextDialog,
        LayerToolbar,
        ComponentToolbar
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
    },
    destroyed() {
        // this.$el.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        handleScroll() {
            EventBus.get().emit(EventBus.NAVBAR_SCOLL_EVENT);
        }
    }
};
</script>
