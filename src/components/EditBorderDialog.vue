<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="600">
            <template v-slot:activator="{ on, attrs }">
                <div color="primary" dark v-bind="attrs" v-on="on" class="button_row">
                    <a id="edit_border_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button"> Edit Border</a>
                </div>
            </template>
            <v-card>
                <v-card-title class="headline"> Edit Device Border </v-card-title>
                <v-card-text>
                    <h4>Drag Drop the DXF file containing border to import:</h4>
                    <div class="mdl-dialog__content">
                        <canvas id="border_import_panel" tabindex="1" width="300" height="200"></canvas>
                        <br />
                        <input type="file" class="upload" id="dxf_input" />
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="dialog = false"> Import Borde </v-btn>
                    <v-btn color="green darken-1" text @click="dialog = false"> Delete Border </v-btn>
                    <v-btn color="green darken-1" text @click="dialog = false"> Save </v-btn>
                    <v-btn color="green darken-1" text @click="dialog = false"> Cancel </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
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