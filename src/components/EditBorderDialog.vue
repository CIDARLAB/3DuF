<template>
    <Dialog title="Edit Border">
        <template #content>
            <h4>Drag Drop the DXF Border File:</h4>
            <div class="mdl-dialog__content">
                <v-card id="border_import_panel" class="mx-auto" tile outlined width="400" color="grey lighten-2" height="200"> </v-card>
                <br />
                <input id="file_input" ref="file" type="file" class="upload" @change="addFile()" />
            </div>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-btn dark color="green dark" @click="importBorderButton()"> Import Border </v-btn>
            <v-btn dark color="red dark" @click="deleteBorderButton()"> Delete Border </v-btn>
            <v-btn color="white" @click="callbacks.close(onSave)"> Okay </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "../app/core/registry";
import viewManager from "@/app/view/viewManager";
import DxfParser from "dxf-parser";
import DXFObject from "../app/core/dxfObject";
import HTMLUtils from "@/app/utils/htmlUtils";
//import paper from "@/"

export default {
    components: {
        Dialog
    },
    data() {
        return {
            dialog: false,
            dxfObject: []
        };
    },
    mounted: () => {},
    methods: {
        onSave() {
            console.log("Saved data for Edit Border");
        },
        deleteBorderButton() {
            Registry.viewManager.deleteBorder();
            console.log("Delete border clicked");
            Registry.viewManager.generateBorder();
        },
        dragover(event) {
            event.preventDefault();
            // visual effect
            if (!event.currentTarget.classList.contains("bg-gray-300")) {
                event.currentTarget.classList.remove("bg-gray-100");
                event.currentTarget.classList.add("bg-gray-300");
            }
        },

        dragleave(event) {
            // Clean up
            event.currentTarget.classList.add("bg-gray-100");
            event.currentTarget.classList.remove("bg-gray-300");
        },

        drop(event) {
            event.preventDefault();
            this.$refs.file.files = event.dataTransfer.files;
            this.addFile(); // Trigger the add File event manually
            event.currentTarget.classList.add("bg-gray-100");
            event.currentTarget.classList.remove("bg-gray-300");
        },

        addFile() {
            // file reader
            const ref = this;
            const reader = new FileReader();
            reader.onload = function(e) {
                //console.log(reader.result);
                ref.loadDXFText(reader.result);
            };
            // log file
            let files = this.$refs.file.files[0];
            console.log(files.name);
            console.log(files.size);
            reader.readAsText(files);
        },
        importBorderButton() {
            // import file
            console.log("import button clicked");
            Registry.viewManager.deleteBorder();
            Registry.viewManager.importBorder(this.getDXFfile());
        },
        getDXFfile() {
            return this.$refs.dxfObject;
        },
        loadDXFText(file) {
            {
                //let files = file.files[0];
                const parser = new DxfParser();
                try {
                    this.$refs.dxfObject = parser.parseSync(file);
                    console.log("parsed dxf object", this.$refs.dxfObject);
                } catch (e) {
                    console.error(e.stack);
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped>
#border_import_panel {
    position: relative;
    top: 10px;
}
#file_input {
    position: relative;
    top: 30px;
}
</style>
