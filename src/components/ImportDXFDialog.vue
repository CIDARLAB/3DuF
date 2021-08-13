<template>
    <Dialog title="Import" color="primary" text-color="white--text">
        <template #content>
            <h4>Drag Drop the DXF Border File:</h4>
            <div class="mdl-dialog__content">
                <canvas id="component_preview_canvas" tabindex="1" width="400" height="200" color="gray" />
                <input id="dxf_input" ref="file" type="file" class="upload" />
            </div>
            <!-- <form action="#">
                <div class="mdl-textfield mdl-js-textfield" width="300px">
                    <input id="new_component_name" class="mdl-textfield__input" type="text" />
                    <label class="mdl-textfield__label" for="new_component_name">Name......</label>
                </div>
            </form> -->
        </template>
        <template #actions="{ callbacks }">
            <v-btn class="white--text" color="green dark" @click="callbacks.close()"> Import </v-btn>
            <v-btn class="white--text" color="red dark" @click="callbacks.close()"> Cancel </v-btn>
            <v-btn color="white" @click="callbacks.close(onSave)"> Okay </v-btn>
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
