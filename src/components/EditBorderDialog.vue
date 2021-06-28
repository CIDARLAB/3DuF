<template>
    <Dialog title="Edit Border">
        <template #content>
            <h4>Drag Drop the DXF Boarder File:</h4>
            <div class="mdl-dialog__content">
                <canvas id="border_import_panel" tabindex="1" width="300" height="200" />
                <br />
                <input id="dxf_input" type="file" class="upload" color="gray" />
            </div>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-btn dark color="green dark" @click="callbacks.close()"> Import Border </v-btn>
            <v-btn dark color="red dark" @click="callbacks.close()"> Delete Border </v-btn>
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
            console.log("Saved data for Edit Border");
        }
    }
};
</script>

<style lang="scss" scoped></style>
