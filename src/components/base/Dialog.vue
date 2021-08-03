<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on, attrs }">
            <v-btn :id="buttonID" v-bind="attrs" :class="buttonClasses" v-on="on">
                {{ title }}
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline">
                {{ title }}
            </v-card-title>
            <v-card-text>
                <slot name="content"> Dialog content goes here </slot>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <slot name="actions" :callbacks="callbacks">
                    <v-btn color="green darken-1" text @click="callbacks.close()"> Close </v-btn>
                </slot>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="sass" scoped></style>

<script>
import Vue from "vue";
import EventBus from "@/events/events";
export default {
    name: "Dialog",
    props: {
        title: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: false,
            default: ""
        },
        textColor: {
            type: String,
            required: false,
            default: ""
        }
    },
    data() {
        return {
            dialog: false,
            callbacks: {}
        };
    },
    computed: {
        buttonID: function() {
            return this.title.toLowerCase().replace(" ", "_") + "_dialog_button";
        },
        buttonClasses: function() {
            return [
                this.color && this.color.length > 0 ? this.color : "white",
                this.textColor && this.textColor.length > 0 ? this.textColor : "blue--text",
                "mb-2",
                "feature-button",
                "button-row"
            ];
        }
    },
    mounted() {
        // Setup an event for closing all the dialogs
        const ref = this;
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function() {
            ref.dialog = false;
        });

        // Here we set ouf default callbacks for the dialog in mounted to ensure the properties exist in the slot scope
        // when called by the children. Setting this up in data would result in undefined slot scope values
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.dialog = false;
        });
    }
};
</script>
