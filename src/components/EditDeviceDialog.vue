<template>
    <Dialog title="Edit Device">
        <template v-slot:content>
            <h4>Rename:</h4>
            <form action="#">
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                    <input id="devicename_textinput" class="mdl-textfield__input" type="text" />
                    <label class="mdl-textfield__label" for="devicename_textinput">Device Name</label>
                </div>
            </form>

            <h4>Resize:</h4>
            <form action="#">
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                    <input id="xspan_textinput" class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" />
                    <label class="mdl-textfield__label" for="xspan_textinput">X-Span (mm)</label>
                    <span class="mdl-textfield__error">Input is not a number!</span>
                </div>
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                    <input id="yspan_textinput" class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" />
                    <label class="mdl-textfield__label" for="yspan_textinput">Y-Span (mm)</label>
                    <span class="mdl-textfield__error">Input is not a number!</span>
                </div>
            </form>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-btn color="green darken-1" text @click="callbacks.close()">
                Cancel
            </v-btn>
            <v-btn color="green darken-1" text @click="callbacks.close(onSave)">
                Save
            </v-btn>
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
