<template>
  <Dialog title="Edit Border">
    <template #content>
      <h4>Drag Drop the DXF file containing border to import:</h4>
      <div class="mdl-dialog__content">
          <canvas id="border_import_panel" tabindex="1" width="300" height="200"></canvas>
          <br />
          <input type="file" class="upload" id="dxf_input" />
      </div>
    </template>
    <template v-slot:actions="{ callbacks }">
        <v-btn color="green darken-1" text @click="callbacks.close()">Import Border</v-btn>
        <v-btn color="green darken-1" text @click="callbacks.close()">Delete Border</v-btn>
        <v-btn color="green darken-1" text @click="callbacks.close(onSave)">Save</v-btn>
        <v-btn color="green darken-1" text @click="callbacks.close()">Cancel</v-btn>
    </template>
 </Dialog>
</template>

<script>
import Dialog from "@/components/Dialog.vue"
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
        console.log("Saved data for Edit Border")
      }
    }
};
</script>

<style lang="scss" scoped>
</style>