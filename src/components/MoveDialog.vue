<template>
    <v-dialog
        v-model="dialog"
        content-class="draggable-dialog topleft-dialog move-component-context-dialog"
        hide-overlay
        persistent
        no-click-animation
        width="420"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-tooltip bottom>
                <template v-slot:activator="{ on: onTip, attrs: attrsTip }">
                    <v-btn
                        id="context_button_move"
                        class="context-icon-btn"
                        color="white"
                        depressed
                        v-bind="{ ...attrs, ...attrsTip }"
                        v-on="{ ...on, ...onTip }"
                    >
                        <span class="material-icons primary--text">open_with</span>
                    </v-btn>
                </template>
                <span>Move this component on the canvas (opens move tool)</span>
            </v-tooltip>
        </template>

        <v-card>
            <v-card-title class="text-h5 lighten-2">Move component</v-card-title>

            <v-card-text>
                <v-row align="center">
                    <v-col cols="12" sm="4">
                        <v-card-text class="pa-0">X (mm)</v-card-text>
                    </v-col>
                    <v-col cols="12" sm="8">
                        <v-text-field
                            v-model="posX"
                            dense
                            hide-details
                            outlined
                            placeholder="0"
                            type="number"
                            :step="1"
                            @change="updateComponent"
                        />
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col cols="12" sm="4">
                        <v-card-text class="pa-0">Y (mm)</v-card-text>
                    </v-col>
                    <v-col cols="12" sm="8">
                        <v-text-field
                            v-model="posY"
                            dense
                            hide-details
                            outlined
                            placeholder="0"
                            type="number"
                            :step="1"
                            @change="updateComponent"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />

            <v-card-actions>
                <v-spacer />
                <v-btn color="green" class="white--text" @click="dialog = false">Save</v-btn>
                <v-btn color="red" class="white--text ml-9" @click="cancelMove">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import EventBus from "@/events/events";
import Component from "@/app/core/component";
import "@mdi/font/css/materialdesignicons.css";
import Registry from "@/app/core/registry";
import { applyAnchorToDialogContent, getPlacedComponentScreenBottomRight } from "@/utils/contextDialogAnchor";

export default {
    name: "MoveDialog",
    props: {
        component: {
            type: Component,
            required: true,
            default: null
        },
        /** Bottom-right of placed component (screen px); used to align this dialog. */
        dialogAnchor: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            dialog: false,
            callbacks: {},
            posX: 0,
            posY: 0
        };
    },
    watch: {
        dialog: function(newValue) {
            if (newValue) {
                this.syncPositionFieldsFromComponent();
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
                this.$emit("close");
                Registry.viewManager.activateTool("MoveTool");
                Registry.viewManager.tools.MoveTool.activate(this.component, this.toolCallback);
                EventBus.get().on(EventBus.UPDATE_RENDERS, this._onMoveCanvasUpdate);
                EventBus.get().on(EventBus.UPDATE_ZOOM, this._onMoveCanvasUpdate);
                this.$nextTick(() => {
                    this.repositionMoveDialog();
                    this.$nextTick(() => this.repositionMoveDialog());
                });
            } else {
                EventBus.get().off(EventBus.UPDATE_RENDERS, this._onMoveCanvasUpdate);
                EventBus.get().off(EventBus.UPDATE_ZOOM, this._onMoveCanvasUpdate);
                Registry.viewManager.tools.MoveTool.deactivate();
                Registry.viewManager.view.clearSelectedItems();
                EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
            }
        },
        dialogAnchor() {
            if (this.dialog) {
                this.$nextTick(() => this.repositionMoveDialog());
            }
        }
    },
    created() {
        this._onMoveCanvasUpdate = () => {
            if (this.dialog) {
                this.$nextTick(() => this.repositionMoveDialog());
            }
        };
    },
    mounted() {
        (function() {
            const d = {};
            document.addEventListener("mousedown", e => {
                const closestDialog = e.target.closest(".move-component-context-dialog.draggable-dialog");
                if (e.button === 0 && closestDialog !== null && e.target.classList.contains("v-card__title")) {
                    d.el = closestDialog;
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
                d.el.style.left =
                    Math.min(Math.max(d.elStartX + e.clientX - d.mouseStartX, 0), window.innerWidth - d.el.getBoundingClientRect().width) + "px";
                d.el.style.top =
                    Math.min(Math.max(d.elStartY + e.clientY - d.mouseStartY, 0), window.innerHeight - d.el.getBoundingClientRect().height) + "px";
            });
            document.addEventListener("mouseup", () => {
                if (d.el === undefined) return;
                d.el.style.transition = d.oldTransition;
                d.el = undefined;
            });
        })();
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.UPDATE_RENDERS, this._onMoveCanvasUpdate);
        EventBus.get().off(EventBus.UPDATE_ZOOM, this._onMoveCanvasUpdate);
    },
    methods: {
        repositionMoveDialog() {
            const anchor = getPlacedComponentScreenBottomRight(this.component) || this.dialogAnchor;
            applyAnchorToDialogContent(anchor, "move-component-context-dialog");
        },
        syncPositionFieldsFromComponent() {
            const c = this.component.getCenterPosition();
            const x = Array.isArray(c) ? c[0] : c?.x;
            const y = Array.isArray(c) ? c[1] : c?.y;
            this.posX = Math.round(Number(x) || 0);
            this.posY = Math.round(Number(y) || 0);
        },
        cancelMove() {
            Registry.viewManager.tools.MoveTool.revertToOriginalPosition();
            this.syncPositionFieldsFromComponent();
            this.dialog = false;
        },
        toolCallback(xpos, ypos) {
            this.posX = Math.round(Number(xpos));
            this.posY = Math.round(Number(ypos));
        },
        updateComponent() {
            const x = Math.round(Number(this.posX));
            const y = Math.round(Number(this.posY));
            this.posX = x;
            this.posY = y;
            this.component.updateComponentPosition([x, y]);
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

.draggable-dialog .text-h5 {
    cursor: grab;
}

.draggable-dialog .text-h5:hover {
    cursor: grabbing;
}
</style>
