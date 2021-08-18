<template>
    <Dialog title="Edit Device">
        <template v-slot:content>
            <tr>
                <h4 class="text--primary subtitle-1">Rename:</h4>
                <td>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <tr>
                                <v-text-field id="devicename_textinput" class="mdl-textfield__input" type="text" />
                                <label class="mdl-textfield__label" for="devicename_textinput">Device Name</label>
                            </tr>
                        </div>
                    </form>
                </td>
            </tr>
            <tr>
                <h4 class="text--primary subtitle-1">Resize:</h4>
                <td>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <v-text-field id="xspan_textinput" class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" />
                            <label class="mdl-textfield__label" for="xspan_textinput">X-Span (mm)</label>
                            <!-- <span class="mdl-textfield__error">Input is not a number!</span> -->
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <v-text-field id="yspan_textinput" class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" />
                            <label class="mdl-textfield__label" for="yspan_textinput">Y-Span (mm)</label>
                            <!-- <span class="mdl-textfield__error">Input is not a number!</span> -->
                        </div>
                    </form>
                </td>
            </tr>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-btn dark color="green dark" elevation="2" @click="callbacks.close(onSave)"> Save </v-btn>
            <v-btn dark color="red dark" elevation="2" @click="callbacks.close()"> Cancel </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
export default {
    components: {
        Dialog
    },
    data() {
        return {
            dialog: false
        };
    },
    methods: {
        onSave() {
            console.log("Saved data for Edit Device");
        }
    }
};
</script>

<style lang="scss" scoped></style>
