<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on, attrs }">
            <a
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                id="show_import_dialog"
                class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button mdl-button--colored"
                >Import</a
            >
        </template>
        <v-card>
            <v-card-title class="headline"> Drag and drop the DXF file on the canvas </v-card-title>
            <v-card-text>
                <div class="mdl-dialog__content">
                    <canvas id="component_preview_canvas" tabindex="1" width="500" height="400"></canvas>
                </div>
                <form action="#">
                    <div class="mdl-textfield mdl-js-textfield" width="300px">
                        <input class="mdl-textfield__input" type="text" id="new_component_name" />
                        <label class="mdl-textfield__label" for="new_component_name">Name...</label>
                    </div>
                </form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="dialog = false"> Cancel </v-btn>
                <v-btn color="green darken-1" text @click="dialog = false"> Import </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            dialog: false
        };
    }
};
</script>

<style lang="scss" scoped>
</style>