<template>
  <v-dialog v-model="dialog" persistent max-width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" :id="buttonID" :class="buttonClasses">{{ title }}</v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>
        <slot name="content">Dialog content goes here</slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="actions" v-bind:callbacks="callbacks">
          <v-btn color="green darken-1" text @click="callbacks.close()">Close</v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import Vue from "vue"
export default {
    props: {
      title: String,
      color: String,
      textColor: String
    },
    data(){
        return {
            dialog: false,
            callbacks: {}
        }
    },
    mounted() {
        // Here we set ouf default callbacks for the dialog in mounted to ensure the properties exist in the slot scope
        // when called by the children. Setting this up in data would result in undefined slot scope values
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.dialog = false;
        });
    },
    computed: {
      buttonID: function() {
        return this.title.toLowerCase().replace(" ", "_") + "_dialog_button"
      },
      buttonClasses: function() {
        return [
        (this.color && this.color.length > 0) ? this.color : "white",
        (this.textColor && this.textColor.length > 0) ? this.textColor : "blue--text",
        'mb-2',
        'feature-button',
        'button-row'
        ]
      }
  }
}
</script>