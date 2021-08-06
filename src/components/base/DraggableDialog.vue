<template>
    <v-dialog v-model="dialog" content-class="draggable-dialog" hide-overlay persistent no-click-animation width="500">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator">
                <v-btn id="context_button_move" color="white indigo--text" depressed v-bind="attrs" v-on="on">
                    <span class="material-icons">open_with</span>
                </v-btn>
            </slot>
        </template>
        <v-card>
            <v-card-title class="text-h5 lighten-2">{{ title }} </v-card-title>

            <v-card-text>
                <slot name="content"> Add something here </slot>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <slot name="actions">
                    <v-btn
                        color="red"
                        class="white--text ml-9"
                        @click="
                            dialog = false;
                            activated = false;
                        "
                    >
                        Cancel
                    </v-btn>
                </slot>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";
import EventBus from "@/events/events";

import "@mdi/font/css/materialdesignicons.css";

export default {
    name: "DraggableDialog",
    props: {
        title: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            activated: false,
            callbacks: {},
            dialog: false
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "ml-4", "mb-2", "btn"];
        }
    },
    mounted() {
        // Setup an event for closing all the dialogs
        const ref = this;
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function() {
            ref.dialog = false;
        });
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activated = false;
        });

        (function() {
            // make vuetify dialogs movable
            const d = {};
            document.addEventListener("mousedown", e => {
                const closestDialog = e.target.closest(".draggable-dialog");
                if (e.button === 0 && closestDialog != null && e.target.classList.contains("v-card__title")) {
                    // element which can be used to move element
                    d.el = closestDialog; // element which should be moved
                    d.mouseStartX = e.clientX;
                    d.mouseStartY = e.clientY;
                    d.elStartX = d.el.getBoundingClientRect().left;
                    d.elStartY = d.el.getBoundingClientRect().top;
                    d.el.style.position = "fixed";
                    d.el.style.margin = 0;
                    d.oldTransition = d.el.style.transition;
                    d.el.style.transition = "none";
                }
            });
            document.addEventListener("mousemove", e => {
                if (d.el === undefined) return;
                d.el.style.left = Math.min(Math.max(d.elStartX + e.clientX - d.mouseStartX, 0), window.innerWidth - d.el.getBoundingClientRect().width) + "px";
                d.el.style.top = Math.min(Math.max(d.elStartY + e.clientY - d.mouseStartY, 0), window.innerHeight - d.el.getBoundingClientRect().height) + "px";
            });
            document.addEventListener("mouseup", () => {
                if (d.el === undefined) return;
                d.el.style.transition = d.oldTransition;
                d.el = undefined;
            });
            setInterval(() => {
                // prevent out of bounds
                const dialog = document.querySelector(".draggable-dialog");
                if (dialog === null) return;
                dialog.style.left = Math.min(parseInt(dialog.style.left), window.innerWidth - dialog.getBoundingClientRect().width) + "px";
                dialog.style.top = Math.min(parseInt(dialog.style.top), window.innerHeight - dialog.getBoundingClientRect().height) + "px";
            }, 100);
        })();
    },
    methods: {
        showProperties() {
            this.activated = !this.activated;
            let attachPoint = document.querySelector("[data-app]");

            if (!attachPoint) {
                console.error("Could not find [data-app] element");
            }

            this.setDrawerPosition();

            attachPoint.appendChild(this.$refs.drawer);
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
            this.$refs.drawer.style.top = bounds.bottom - bounds.height + "px";
        },
        onSave() {
            console.log("Saved data for Move");
        }
    }
};
</script>

<style lang="scss" scoped>
.subtitle-1 {
    margin-left: 12px;
}

#box {
    height: 90px;
    width: 70px;
    background-color: #e2e2e2;
    margin-top: 30px;
}

.mdl-textfield__input {
    width: 100px;
}

.bottom-xy {
    margin-top: 40px;
}

#left-col {
    margin-left: 10px;
}

#right-col {
    margin-top: 10px;
}

.v-text-field {
    width: 100px;
}

#actions-row {
    margin-top: 10px;
}

.property-drawer-parent {
    overflow: visible;
    position: relative;
}
.move-drawer {
    position: absolute;
    float: left;
    width: 450px;
    left: 225px;
    z-index: 100;
}

.draggable-dialog .text-h5 {
    cursor: grab;
}

.draggable-dialog .text-h5:hover {
    cursor: grabbing;
}
</style>
