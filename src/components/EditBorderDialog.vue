<template>
    <Dialog title="Edit Border">
        <template #content>
            <h4>Drag Drop the DXF Boarder File:</h4>
            <div class="mdl-dialog__content">
                <!-- <canvas id="border_import_panel" tabindex="1" width="300" height="200" color="gray" @drop.prevent="addFile()" @dragover.prevent /> -->
                <canvas id="border_import_panel" tabindex="1" width="300" height="200" color="gray" />
                <br />
                <input id="dxf_input" type="file" class="upload" />
            </div>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-btn dark color="green dark" :disabled="uploadDisabled" @click="uploads"> Import Border </v-btn>
            <v-btn dark color="red dark" @click="removeFile(file)"> Delete Border </v-btn>
            <v-btn color="white" @click="callbacks.close(onSave)"> Okay </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
// import Registry from "@/src/app/core/registry";

export default {
    components: {
        Dialog
    },
    data() {
        return {
            dialog: false
        };
    },
    computed: {
        uploadDisabled() {
            return this.files.length === 0;
        },
        // file size

        methods: {
            onSave() {
                console.log("Saved data for Edit Border");
            },

            addFile(e) {
                let droppedFiles = e.dataTransfer.files;
                console.log(droppedFiles.name);
                console.log(droppedFiles.size);
                if (!droppedFiles) return;
            },

            removeFile(file) {
                this.files = this.files.filter(f => {
                    return f != file;
                });
                // Registry.viewManager.deleteBorder();
                console.log("Delete border clicked");
                this.generateBorder();
            },
            uploads: {
                upload() {
                    let formData = new FormData();
                    this.files.forEach((f, x) => {
                        formData.append("file" + (x + 1), f);
                    });

                    fetch("https://httpbin.org/post", {
                        method: "POST",
                        body: formData
                    })
                        .then(res => res.json())
                        .then(res => {
                            console.log("done uploading", res);
                        })
                        .catch(e => {
                            console.error(JSON.stringify(e.message));
                        });
                    // Registry.viewManager.deleteBorder();
                    // Registry.viewManager.importBorder(formData);
                    //callbacks.close();
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped></style>
