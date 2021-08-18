<template>
    <v-dialog v-model="dialog" content-class="draggable-dialog topleft-dialog" hide-overlay persistent no-click-animation width="500">
        <template v-slot:activator="{ on, attrs }">
            <v-btn id="context_button_move" color="white indigo--text" depressed v-bind="attrs" v-on="on">
                <span class="material-icons">open_with</span>
            </v-btn>
        </template>

        <v-card>
            <v-card-title class="text-h5 lighten-2"> Move Component: </v-card-title>

            <v-card-text>
                <v-row>
                    <v-col>
                        <v-row>
                            <v-col id="left-col" cols="3">
                                <v-row>
                                    <v-card-text>{{ topLeft.x }}, {{ topLeft.y }}</v-card-text>
                                </v-row>
                                <v-row>
                                    <v-card-text class="bottom-xy">{{ bottomLeft.x }}, {{ bottomLeft.y }}</v-card-text>
                                </v-row>
                            </v-col>
                            <v-col id="box"></v-col>
                            <v-col cols="3">
                                <v-row>
                                    <v-card-text>{{ topRight.x }}, {{ topRight.y }}</v-card-text>
                                </v-row>
                                <v-row>
                                    <v-card-text class="bottom-xy">{{ bottomRight.x }}, {{ bottomRight.y }}</v-card-text>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col id="right-col">
                        <tr>
                            <td>
                                <v-card-text>X (mm):</v-card-text>
                            </td>
                            <td width="125px">
                                <v-text-field v-model="posX" placeholder="0" :step="1" type="number"> </v-text-field>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <v-card-text>Y (mm):</v-card-text>
                            </td>
                            <td width="125px">
                                <v-text-field v-model="posY" placeholder="0" :step="1" type="number"> </v-text-field>
                            </td>
                        </tr>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green" class="white--text" @click="callbacks.close(onSave)"> Save </v-btn>
                <v-btn color="red" class="white--text ml-9" @click="dialog = false"> Cancel </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";
import EventBus from "@/events/events";
import Component from "@/app/core/component";

import "@mdi/font/css/materialdesignicons.css";
import Registry from "@/app/core/registry";

export default {
    name: "MoveDialog",
    props: {
        component: {
            type: Component,
            required: true
        }
    },
    data() {
        return {
            dialog: false,
            activated: false,
            callbacks: {},
            number: 0,
            posX: 0,
            posY: 0
        };
    },
    computed: {
        buttonClasses: function () {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "ml-4", "mb-2", "btn"];
        },
        topLeft: function () {
            return { x: 0, y: 0 };
        },
        topRight: function () {
            return { x: 0, y: 0 };
        },
        bottomLeft: function () {
            return { x: 0, y: 0 };
        },
        bottomRight: function () {
            return { x: 0, y: 0 };
        }
        // posX: function() {
        //     return this.component.x;
        // },
        // posY: function() {
        //     return this.component.y;
        // }
    },
    watch: {
        dialog: function (newValue) {
            if (newValue) {
                console.log("MoveDialog: Dialog opened");
                Registry.viewManager.activateTool("MoveTool");
                Registry.viewManager.tools.MoveTool.activate(this.component);
            } else {
                //Run deactivation
                Registry.viewManager.tools.MoveTool.deactivate();
            }
        }
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCROLL_EVENT, this.setDrawerPosition);
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activated = false;
        });

        (function () {
            // make vuetify dialogs movable
            const d = {};
            document.addEventListener("mousedown", e => {
                const closestDialog = e.target.closest(".draggable-dialog");
                if (e.button === 0 && closestDialog !== null && e.target.classList.contains("v-card__title")) {
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

            Registry.viewManager.activateTool("MoveTool");
            Registry.viewManager.tools.MoveTool.activate(this.currentComponent);
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
.topleft-dialog {
    position: absolute;
    top: 50px;
    left: 50px;
}
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

.draggable-dialog .text-h5 {
    cursor: grab;
}

.draggable-dialog .text-h5:hover {
    cursor: grabbing;
}
</style>
