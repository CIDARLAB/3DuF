<template>
    <Dialog title="Import (.json / .dxf)">
        <template #content>
            <h4>Supported input formats: JSON and DXF only</h4>
            <div class="mdl-dialog__content">
                <v-card
                    id="drop_box_import"
                    class="mx-auto d-flex align-center justify-center text-body-2"
                    tile
                    outlined
                    width="400"
                    color="grey lighten-2"
                    height="200"
                    @dragover.prevent
                    @drop.prevent="onDrop"
                >
                    Drop a .json or .dxf file here
                </v-card>
                <input
                    id="import_input"
                    ref="file"
                    type="file"
                    class="hidden-import-input"
                    accept=".json,.dxf,application/json"
                    @change="onFileChange"
                />
                <div class="import-file-picker">
                    <v-btn small class="mr-2" @click="selectFile"> Choose File </v-btn>
                    <span class="text-caption">{{ selectedFileName || "No file chosen" }}</span>
                </div>
            </div>
        </template>
        <template #actions="{ callbacks }">
            <v-btn class="white--text" color="green dark" @click="importSelectedFile(callbacks)"> Confirm </v-btn>
            <v-btn class="white--text" color="red dark" @click="callbacks.close()"> Cancel </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "@/app/core/registry";
import DxfParser from "dxf-parser";
import { buildDeviceJsonFromDxf } from "@/app/import/dxfDeviceImport";

export default {
    components: {
        Dialog
    },
    data() {
        return {
            selectedFile: null,
            selectedFileName: "",
            parsedDXF: null
        };
    },
    methods: {
        selectFile() {
            if (this.$refs.file) this.$refs.file.click();
        },
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
        getFileExtension(fileName) {
            const segments = String(fileName || "").toLowerCase().split(".");
            return segments.length > 1 ? segments.pop() : "";
        },
        consumeFile(file) {
            const fileName = String(file?.name || "");
            const ext = this.getFileExtension(fileName);
            if (ext !== "json" && ext !== "dxf") {
                this.selectedFile = null;
                this.selectedFileName = "";
                if (this.$refs.file) this.$refs.file.value = "";
                alert("Only .json and .dxf files are supported.");
                return;
            }
            this.selectedFile = file;
            this.selectedFileName = fileName;
            this.parsedDXF = null;
        },
        readSelectedFileText() {
            if (!this.selectedFile) {
                throw new Error("No file selected.");
            }
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.onerror = () => reject(new Error("Failed to read file."));
                reader.readAsText(this.selectedFile);
            });
        },
        parseJsonFor3DuF(rawInput) {
            if (rawInput != null && typeof rawInput === "object") return rawInput;
            if (typeof rawInput !== "string") {
                throw new Error("File content is not a JSON string.");
            }

            const text = rawInput.trim();
            if (!text) throw new Error("JSON file is empty.");
            if (text.toLowerCase().startsWith("<!doctype html") || text.toLowerCase().startsWith("<html")) {
                throw new Error("Received HTML instead of JSON.");
            }
            if (text === "[object Object]") {
                throw new Error("JSON content is corrupted as [object Object].");
            }

            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (_) {
                throw new Error("Invalid JSON format.");
            }

            if (typeof parsed === "string") {
                try {
                    parsed = JSON.parse(parsed);
                } catch (_) {
                    throw new Error("JSON payload is double-encoded but invalid.");
                }
            }

            if (!parsed || typeof parsed !== "object") {
                throw new Error("Parsed JSON must be an object.");
            }
            return parsed;
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
        importSelectedFile(callbacks) {
            const ext = this.getFileExtension(this.selectedFileName);
            if (!this.selectedFile || !ext) {
                alert("Please choose a .json or .dxf file first.");
                return;
            }

            let importTask;
            if (ext === "dxf") {
                importTask = this.importDXF();
            } else if (ext === "json") {
                importTask = this.importJSON();
            } else {
                importTask = Promise.reject(new Error("Unsupported file type."));
            }

            importTask
                .then(() => {
                    if (callbacks && callbacks.close) callbacks.close();
                })
                .catch((err) => {
                    const message = err && err.message ? err.message : String(err);
                    alert("Import failed: " + message);
                });
        },
        importDXF() {
            if (Registry.viewManager == null) {
                throw new Error("3DuF view manager is not ready.");
            }

            return this.parseSelectedDXF().then((parsedDXF) => {
                this.parsedDXF = parsedDXF;
                const deviceJson = buildDeviceJsonFromDxf(parsedDXF, this.selectedFileName);
                Registry.viewManager.loadDeviceFromJSON(deviceJson);
                Registry.viewManager.updateGrid();
                Registry.viewManager.refresh();
            });
        },
        importJSON() {
            if (Registry.viewManager == null || !Registry.viewManager.loadDeviceFromJSON) {
                throw new Error("3DuF view manager is not ready.");
            }

            return this.readSelectedFileText().then((fileText) => {
                const parsedJson = this.parseJsonFor3DuF(fileText);
                Registry.viewManager.loadDeviceFromJSON(parsedJson);
                Registry.viewManager.updateGrid();
                Registry.viewManager.refresh();
            });
        }
    }
};
</script>
<style lang="scss" scoped>
#drop_box_import {
    position: relative;
    top: 10px;
}
#import_input {
    display: none;
}
.import-file-picker {
    display: flex;
    align-items: center;
    margin-top: 24px;
}
.hidden-import-input {
    display: none;
}
</style>
