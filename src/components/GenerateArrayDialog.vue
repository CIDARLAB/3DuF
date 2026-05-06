<template>
    <v-dialog
        v-model="dialog"
        content-class="draggable-dialog topleft-dialog generate-array-context-dialog"
        hide-overlay
        persistent
        no-click-animation
        width="300px"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-tooltip bottom>
                <template v-slot:activator="{ on: onTip, attrs: attrsTip }">
                    <v-btn
                        id="context_button_array"
                        class="context-icon-btn"
                        color="white"
                        depressed
                        v-bind="{ ...attrs, ...attrsTip }"
                        v-on="{ ...on, ...onTip }"
                    >
                        <span class="material-icons primary--text">view_comfy</span>
                    </v-btn>
                </template>
                <span>Create a grid of copies with spacing you choose (opens array tool)</span>
            </v-tooltip>
        </template>

        <v-card>
            <v-card-title class="text-h5 lighten-2"> Generate Array </v-card-title>

            <v-card-text>
                <v-row> Generate: </v-row>
                <v-row>
                    <v-text-field v-model="dimx" label="Dim X" type="number" step="1" min="1" required></v-text-field>
                    <v-text-field v-model="dimy" label="Dim Y" type="number" step="1" min="1" required></v-text-field>
                </v-row>
                <v-row> Spacing: </v-row>
                <v-row>
                    <v-text-field v-model="spacingX" label="X Spacing (mm)" type="number" step="1" min="0" required></v-text-field>
                    <v-text-field v-model="spacingY" label="Y Spacing (mm)" type="number" step="1" min="0" required></v-text-field>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green" class="white--text" @click="onSave"> Save </v-btn>
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
import { applyAnchorToDialogContent, getPlacedComponentScreenBottomRight } from "@/utils/contextDialogAnchor";

export default {
    name: "GenerateArrayDialog",
    props: {
        component: {
            type: Component,
            required: true
        },
        dialogAnchor: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            dialog: false,
            activated: false,
            callbacks: {},
            number: 0,
            dimx: 1,
            dimy: 1,
            spacingX: 10,
            spacingY: 10
        };
    },
    watch: {
        dialog: function(newValue) {
            if (newValue) {
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
                this.$emit("close");
                Registry.viewManager.activateTool("GenerateArrayTool");
                Registry.viewManager.tools.GenerateArrayTool.activate(this.component);
                EventBus.get().on(EventBus.UPDATE_RENDERS, this._onArrayCanvasUpdate);
                EventBus.get().on(EventBus.UPDATE_ZOOM, this._onArrayCanvasUpdate);
                this.$nextTick(() => {
                    this.repositionArrayDialog();
                    this.$nextTick(() => this.repositionArrayDialog());
                });
            } else {
                EventBus.get().off(EventBus.UPDATE_RENDERS, this._onArrayCanvasUpdate);
                EventBus.get().off(EventBus.UPDATE_ZOOM, this._onArrayCanvasUpdate);
                Registry.viewManager.tools.GenerateArrayTool.deactivate();
            }
        },
        dialogAnchor() {
            if (this.dialog) {
                this.$nextTick(() => this.repositionArrayDialog());
            }
        }
    },
    created() {
        this._onArrayCanvasUpdate = () => {
            if (this.dialog) {
                this.$nextTick(() => this.repositionArrayDialog());
            }
        };
    },
    mounted() {
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activated = false;
        });

        (function() {
            // make vuetify dialogs movable
            const d = {};
            document.addEventListener("mousedown", e => {
                const closestDialog = e.target.closest(".generate-array-context-dialog.draggable-dialog");
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
                const dialog = document.querySelector(".generate-array-context-dialog.draggable-dialog");
                if (dialog === null) return;
                const left = parseInt(dialog.style.left, 10);
                if (!Number.isNaN(left)) {
                    dialog.style.left =
                        Math.min(Math.max(left, 0), window.innerWidth - dialog.getBoundingClientRect().width) + "px";
                }
            }, 100);
        })();
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.UPDATE_RENDERS, this._onArrayCanvasUpdate);
        EventBus.get().off(EventBus.UPDATE_ZOOM, this._onArrayCanvasUpdate);
    },
    methods: {
        repositionArrayDialog() {
            const anchor = getPlacedComponentScreenBottomRight(this.component) || this.dialogAnchor;
            applyAnchorToDialogContent(anchor, "generate-array-context-dialog");
        },
        onSave() {
            console.log("Saved data for Generate array");
            Registry.viewManager.tools.GenerateArrayTool.generateArray(this.dimx, this.dimy, this.spacingX * 1000, this.spacingY * 1000);
            this.dialog = false;
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
