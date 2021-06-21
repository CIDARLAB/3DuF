<template>
    <Dialog title="Insert Text">
        <template #content>
            <form action="#">
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                    <input id="inserttext_textinput" class="mdl-textfield__input" type="text" />
                    <label class="mdl-textfield__label" for="inserttext_textinput">Text</label>
                </div>
            </form>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-spacer />
            <v-btn color="green darken-1" text @click="callbacks.close()"> Cancel </v-btn>
            <v-btn color="green darken-1" text @click="callbacks.close()"> Insert </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "@/app/core/registry.ts";
import insertTextTool from "@/app/view/tools/insertTextTool.js";
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
        },
        onclick() {
            Registry.viewManager.activateTool("InsertTextTool");
<<<<<<< HEAD
            insertTextTool.text = document.getElementById("inserttext_textinput").value;
=======
            insertTextTool.text(document.getElementById("inserttext_textinput").value);
>>>>>>> Added onclick()
            this.__dialog.close();
        }
    }
};
</script>
