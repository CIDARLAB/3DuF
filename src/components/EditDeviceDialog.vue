<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on, attrs }">
            <div color="primary" dark v-bind="attrs" v-on="on" class="button_row">
                <a id="resize_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised feature-button"> Edit Device</a>
            </div>
        </template>
        <v-card>
            <v-card-title class="headline"> Edit Device </v-card-title>
            <v-card-text>


                <h4>Rename:</h4>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input
                                class="mdl-textfield__input"
                                type="text"
                                id="devicename_textinput"
                            />
                            <label
                                class="mdl-textfield__label"
                                for="devicename_textinput"
                            >Device Name</label>
                        </div>
                    </form>

                    <h4>Resize:</h4>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input
                                class="mdl-textfield__input"
                                type="text"
                                pattern="-?[0-9]*(\.[0-9]+)?"
                                id="xspan_textinput"
                            />
                            <label class="mdl-textfield__label" for="xspan_textinput">X-Span (mm)</label>
                            <span class="mdl-textfield__error">Input is not a number!</span>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input
                                class="mdl-textfield__input"
                                type="text"
                                pattern="-?[0-9]*(\.[0-9]+)?"
                                id="yspan_textinput"
                            />
                            <label class="mdl-textfield__label" for="yspan_textinput">Y-Span (mm)</label>
                            <span class="mdl-textfield__error">Input is not a number!</span>
                        </div>
                    </form>

            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="dialog = false"> Cancel </v-btn>
                <v-btn color="green darken-1" text @click="dialog = false"> Save </v-btn>
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