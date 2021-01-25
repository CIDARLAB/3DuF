<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on, attrs }">
            <div class="button_row">
                <a color="primary" dark v-bind="attrs" v-on="on" id="insert_text_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button">
                    Insert Text</a
                >
            </div>
        </template>
        <v-card>
            <v-card-title class="headline"> Insert Text: </v-card-title>
            <v-card-text>
                <form action="#">
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <input class="mdl-textfield__input" type="text" id="inserttext_textinput" />
                        <label class="mdl-textfield__label" for="inserttext_textinput">Text</label>
                    </div>
                </form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="dialog = false"> Cancel </v-btn>
                <v-btn color="green darken-1" text @click="dialog = false"> Insert </v-btn>
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