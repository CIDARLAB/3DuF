<template>
    <Dialog title="Import">
        <template #content>
            <h4>Drag and Drop the DXF File:</h4>
            <div class="mdl-dialog__content">
                <v-card
                    id="drop_box"
                    class="mx-auto d-flex align-center justify-center text-body-2"
                    tile
                    outlined
                    width="400"
                    color="grey lighten-2"
                    height="200"
                    @dragover.prevent
                    @drop.prevent="onDrop"
                >
                    Drop a .dxf file here
                </v-card>
                <input id="dxf_input" ref="file" type="file" class="upload" accept=".dxf" @change="onFileChange" />
                <div v-if="selectedFileName" class="mt-2 text-caption">
                    Selected: {{ selectedFileName }}
                </div>
            </div>
        </template>
        <template #actions="{ callbacks }">
            <v-btn class="white--text" color="green dark" @click="callbacks.close(importDXF)"> Import </v-btn>
            <v-btn class="white--text" color="red dark" @click="callbacks.close()"> Cancel </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "@/app/core/registry";
import DxfParser from "dxf-parser";

export default {
    components: {
        Dialog
    },
    data() {
        return {
            dialog: false,
            selectedFile: null,
            selectedFileName: "",
            parsedDXF: null
        };
    },
    methods: {
        onDrop(event) {
            const files = event?.dataTransfer?.files;
            if (!files || files.length === 0) return;
            this.consumeFile(files[0]);
        },
        onFileChange() {
            const file = this.$refs.file?.files?.[0];
            if (!file) return;
            this.consumeFile(file);
        },
        consumeFile(file) {
            this.selectedFile = file;
            this.selectedFileName = file.name || "";
            this.parsedDXF = null;
        },
        parseSelectedDXF() {
            if (!this.selectedFile) {
                throw new Error("No DXF file selected.");
            }
            const parser = new DxfParser();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const text = String(reader.result || "");
                        const parsed = parser.parseSync(text);
                        resolve(parsed);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read DXF file."));
                reader.readAsText(this.selectedFile);
            });
        },
        async importDXF() {
            try {
                if (Registry.viewManager == null) {
                    throw new Error("3DuF view manager is not ready.");
                }
                if (Registry.currentDevice == null) {
                    throw new Error("No active device loaded.");
                }

                this.parsedDXF = await this.parseSelectedDXF();

                // Step 1: parse DXF entities and inject them as renderable edge geometry.
                Registry.viewManager.deleteBorder();
                Registry.viewManager.importBorder(this.parsedDXF);

                // Step 2: normalize through 3DuF JSON interchange so the loaded state is
                // exactly what Neptune/3DuF consume downstream.
                const normalizedJson = Registry.viewManager.generateExportJSON();
                Registry.viewManager.loadDeviceFromJSON(normalizedJson);
                Registry.viewManager.updateGrid();
                Registry.viewManager.refresh();
            } catch (err) {
                const message = err && err.message ? err.message : String(err);
                alert("DXF import failed: " + message);
            }
        },
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
