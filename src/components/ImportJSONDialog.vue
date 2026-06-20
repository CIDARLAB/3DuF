<template>
    <Dialog title="Import JSON">
        <template #content>
            <h4>Upload a local JSON file:</h4>
            <div class="mdl-dialog__content">
                <v-card
                    id="drop_box_json"
                    class="mx-auto d-flex align-center justify-center text-body-2"
                    tile
                    outlined
                    width="400"
                    color="grey lighten-2"
                    height="200"
                    @dragover.prevent
                    @drop.prevent="onDrop"
                >
                    Drop a .json file here
                </v-card>
                <input
                    id="json_input"
                    ref="file"
                    type="file"
                    class="hidden-json-input"
                    accept=".json,application/json"
                    @change="onFileChange"
                />
                <div class="json-file-picker mt-3">
                    <v-btn small class="mr-2" @click="selectJsonFile"> Choose File </v-btn>
                    <span class="text-caption">{{ selectedFileName || "No file chosen" }}</span>
                </div>
            </div>
        </template>
        <template #actions="{ callbacks }">
            <v-btn class="white--text" color="green dark" @click="importJSON(callbacks)"> Confirm </v-btn>
            <v-btn class="white--text" color="red dark" @click="callbacks.close()"> Cancel </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "@/app/core/registry";

export default {
    components: {
        Dialog
    },
    data() {
        return {
            selectedFile: null,
            selectedFileName: ""
        };
    },
    methods: {
        logDebug(stage, payload) {
            // eslint-disable-next-line no-console
            console.log("[ImportJSONDialog]", stage, payload || "");
        },
        selectJsonFile() {
            if (this.$refs.file) {
                this.logDebug("selectJsonFile:open-picker");
                this.$refs.file.click();
            }
        },
        onDrop(event) {
            const files = event?.dataTransfer?.files;
            if (!files || files.length === 0) return;
            try {
                this.consumeFile(files[0]);
            } catch (err) {
                const message = err && err.message ? err.message : String(err);
                // eslint-disable-next-line no-console
                console.error("[ImportJSONDialog] onDrop failed:", err);
                alert("JSON import failed: " + message);
            }
        },
        onFileChange() {
            const file = this.$refs.file?.files?.[0];
            if (!file) return;
            try {
                this.consumeFile(file);
            } catch (err) {
                const message = err && err.message ? err.message : String(err);
                // eslint-disable-next-line no-console
                console.error("[ImportJSONDialog] onFileChange failed:", err);
                alert("JSON import failed: " + message);
            }
        },
        consumeFile(file) {
            const fileName = String(file?.name || "");
            if (!/\.json$/i.test(fileName)) {
                this.selectedFile = null;
                this.selectedFileName = "";
                if (this.$refs.file) this.$refs.file.value = "";
                alert("Only .json files are supported.");
                return;
            }
            this.selectedFile = file;
            this.selectedFileName = fileName;
            this.logDebug("consumeFile:selected", {
                name: fileName,
                size: file.size,
                type: file.type
            });
        },
        readSelectedFileText() {
            if (!this.selectedFile) {
                throw new Error("No JSON file selected.");
            }
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ""));
                reader.onerror = () => reject(new Error("Failed to read JSON file."));
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
        importJSON(callbacks) {
            this.logDebug("importJSON:start", {
                hasSelectedFile: !!this.selectedFile,
                selectedFileName: this.selectedFileName
            });
            if (Registry.viewManager == null || !Registry.viewManager.loadDeviceFromJSON) {
                const err = new Error("3DuF view manager is not ready.");
                // eslint-disable-next-line no-console
                console.error("[ImportJSONDialog] importJSON failed:", err);
                alert("JSON import failed: " + err.message);
                return;
            }

            this.readSelectedFileText()
                .then((fileText) => {
                    this.logDebug("importJSON:file-read", { textLength: fileText.length });
                    const parsedJson = this.parseJsonFor3DuF(fileText);
                    this.logDebug("importJSON:json-parsed", {
                        rootType: typeof parsedJson,
                        hasName: !!parsedJson.name,
                        hasLayers: Array.isArray(parsedJson.layers),
                        hasComponents: Array.isArray(parsedJson.components)
                    });
                    Registry.viewManager.loadDeviceFromJSON(parsedJson);
                    Registry.viewManager.updateGrid();
                    Registry.viewManager.refresh();
                    this.logDebug("importJSON:render-finished");
                    if (callbacks && callbacks.close) callbacks.close();
                })
                .catch((err) => {
                    const message = err && err.message ? err.message : String(err);
                    // eslint-disable-next-line no-console
                    console.error("[ImportJSONDialog] importJSON failed:", err);
                    alert("JSON import failed: " + message);
                });
        }
    }
};
</script>

<style lang="scss" scoped>
#drop_box_json {
    position: relative;
    top: 10px;
}
#json_input {
    display: none;
}
.json-file-picker {
    display: flex;
    align-items: center;
}
.hidden-json-input {
    display: none;
}
</style>
