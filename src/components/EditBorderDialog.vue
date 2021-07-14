<template>
    <Dialog title="Edit Border">
        <template #content>
            <h4>Drag Drop the DXF Border File:</h4>
            <div class="mdl-dialog__content">
                <canvas id="border_import_panel" tabindex="1" width="400" height="200" color="gray" />
                <br />
                <input id="dxf_input" ref="file" type="file" class="upload" @change="addFile()" />
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
import * as HTMLUtils from "@/app/utils/htmlUtils";
//import paper from "@/"

export default {
    components: {
        Dialog
    },
    data() {
        return {
            dialog: false
        };
    },
    // computed: {
    //     dxfObject
    // },
    mounted: () => {
        this.__setupDragAndDropLoad("border_import_panel");
        Registry.currentDevice.updateView();
        Registry.viewManager.importBorder(this.getDXFfile());
        //Registry.viewManager.importBorder(this.file);
        //TODO - Need to setup paper for the canvas here so that the import dxf border can be visualized
    },
    methods: {
        onSave() {
            console.log("Saved data for Edit Border");
        },
        deleteBorderButton() {
            Registry.viewManager.deleteBorder();
            console.log("Delete border clicked");
            Registry.viewManager.generateBorder();
        },
        // dragover(event) {
        //     event.preventDefault();
        //     // visual effect
        //     if (!event.currentTarget.classList.contains("bg-green-300")) {
        //         event.currentTarget.classList.remove("bg-gray-100");
        //         event.currentTarget.classList.add("bg-green-300");
        //     }
        // },

        // dragleave(event) {
        //     // Clean up
        //     event.currentTarget.classList.add("bg-gray-100");
        //     event.currentTarget.classList.remove("bg-green-300");
        // },

        // drop(event) {
        //     event.preventDefault();
        //     this.$refs.file.files = event.dataTransfer.files;
        //     this.addFile(); // Trigger the add File event manually
        //     event.currentTarget.classList.add("bg-gray-100");
        //     event.currentTarget.classList.remove("bg-green-300");
        // },

        addFile() {
            // file reader
            const ref = this;
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log(reader.result);
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
            return this.dxfObject;
        },
        loadDXFText(file) {
            {
                //let files = file.files[0];
                const parser = new DxfParser();
                try {
                    let dxfObject = [];
                    dxfObject = parser.parseSync(file);
                    console.log("parsed dxf object", dxfObject);
                } catch (e) {
                    console.error(e.stack);
                }
            }
        },

        __setupDragAndDropLoad(selector) {
            const ref = this;
            new HTMLUtils.DnDFileController(selector, function(file) {
                const files = file.files[0];

                const reader = new FileReader();
                reader.onloadend = function(e) {
                    ref.loadDXFText(reader.result);
                };
                try {
                    reader.readAsText(files);
                } catch (err) {
                    console.log("unable to load DXF: " + files);
                }
            });
        }
        // __loadDXFData(text) {
        //     const parser = new DxfParser();
        //     const dxfdata = parser.parseSync(text);
        //     const dxfobjects = [];
        //     for (const i in dxfdata.entities) {
        //         const entity = dxfdata.entities[i];
        //         dxfobjects.push(new DXFObject(entity));
        //     }
        // }
    }
};
</script>

<style lang="scss" scoped></style>
