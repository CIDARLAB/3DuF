<template>
    <Dialog title="Import" color="primary" text-color="white--text">
        <template #content>
            <h4>Drag and Drop the DXF File:</h4>
            <div class="mdl-dialog__content">
                <v-card id="drop_box" class="mx-auto" tile outlined width="400" color="grey lighten-2" height="200"> </v-card>
                <input id="dxf_input" ref="file" type="file" class="upload" />
            </div>
        </template>
        <template #actions="{ callbacks }">
            <v-btn class="white--text" color="green dark" @click="callbacks.close()"> Import </v-btn>
            <v-btn class="white--text" color="red dark" @click="callbacks.close()"> Cancel </v-btn>
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
<style lang="scss" scoped>
#drop_box {
    position: relative;
    top: 10px;
}
#dxf_input {
    position: relative;
    top: 30px;
}
</style>
