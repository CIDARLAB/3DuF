<template>
    <div>
        <v-navigation-drawer app permanent class="pt-4" color="grey lighten-3">
            <v-img class="mx-auto" src="img/logo.png" alt="3DuF Logo" style="width: 90%" />

            <v-divider></v-divider>
            <IntroHelpDialog />

            <v-divider></v-divider>
            <EditDeviceDialog />
            <v-list>
                <v-list-item-group mandatory color="indigo">
                    <v-list-item v-for="[icon, text] in buttons" :key="icon" link>
                        <v-list-item-icon>
                            <v-icon>{{ icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>{{ text }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <HelpDialog />
        </v-navigation-drawer>

        <v-main id="visualizer-slot">
            <slot name="main"></slot>
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
import HelpDialog from "../../components/HelpDialog.vue";
import IntroHelpDialog from "../../components/IntroHelpDialog.vue";
import EditDeviceDialog from "../../components/EditDeviceDialog.vue";

export default {
    components: {
        HelpDialog,
        IntroHelpDialog,
        EditDeviceDialog
    },
    data() {
        return {
            buttons: [
                ["mdi-devices", "Edit Device"],
                ["mdi-border-all", "Edit Border"],
                ["mdi-toolbox", "Select Tool"]
            ]
        };
    },
    methods: {
        showHelpDialog() {
            alert("TEST");
            this.$dialog.show(HelpDialog);
        }
    }
};
</script>