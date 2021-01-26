<template>
    <Dialog 
      title="Import" 
      color="primary"
      textColor="white--text">
      <template #content>
      <div class="mdl-dialog__content">
          <canvas id="component_preview_canvas" tabindex="1" width="500" height="400"></canvas>
      </div>
      <form action="#">
          <div class="mdl-textfield mdl-js-textfield" width="300px">
              <input class="mdl-textfield__input" type="text" id="new_component_name" />
              <label class="mdl-textfield__label" for="new_component_name">Name...</label>
          </div>
      </form>
      </template>
      <template #actions="{ callbacks }">
      <v-btn color="green darken-1" text @click="callbacks.close()"> Cancel </v-btn>
      <v-btn color="green darken-1" text @click="callbacks.close()"> Import </v-btn>
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
          console.log("Saved data for Edit Device")
        }
      }
  };
</script>

<style lang="scss" scoped>
</style>