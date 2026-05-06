<template>
    <v-card
        v-show="activeMenu"
        ref="RightClickMenu"
        class="component-context-card settings-panel-card settings-panel-card--chrome"
        :style="cardPositionStyle"
        scrollable
    >
        <div v-show="showRename" class="component-context-rename px-4 pt-3 pb-0">
            <v-row align="center" dense no-gutters>
                <v-text-field
                    v-model="componentName"
                    class="mr-2"
                    dense
                    hide-details
                    label="Name"
                    outlined
                />
                <v-btn class="mr-1" icon small @click="cancelRename">
                    <span class="material-icons">close</span>
                </v-btn>
                <v-btn icon small @click="saveName">
                    <span class="material-icons">check</span>
                </v-btn>
            </v-row>
        </div>

        <v-btn
            type="button"
            fab
            x-small
            dark
            :ripple="false"
            class="settings-corner-close"
            aria-label="Close"
            @click="closeCanvasSettingsCard"
        >
            <v-icon size="16" color="white">mdi-close</v-icon>
        </v-btn>
        <div class="settings-panel-heading">
            <span class="settings-panel-heading__title">{{ mint }}</span>
            <v-spacer />
            <v-btn
                small
                depressed
                dark
                color="orange darken-2"
                class="settings-panel-reset-btn"
                @click="resetCanvasComponentToFactoryDefaults"
            >
                Reset
            </v-btn>
        </div>

        <div v-if="!isSidebarPlacementDefaultsPanel" class="context-action-toolbar context-action-toolbar--panel">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        id="context_button_copy"
                        class="context-icon-btn"
                        color="white"
                        depressed
                        v-bind="attrs"
                        v-on="on"
                        @click="copyButton"
                    >
                        <span class="material-icons primary--text">file_copy</span>
                    </v-btn>
                </template>
                <span>Duplicate the selected component (copy / paste flow)</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        id="context_button_delete"
                        class="context-icon-btn"
                        color="white"
                        depressed
                        v-bind="attrs"
                        v-on="on"
                        @click="deleteButton"
                    >
                        <span class="material-icons primary--text">delete</span>
                    </v-btn>
                </template>
                <span>Remove this component from the device</span>
            </v-tooltip>
            <MoveDialog :component="currentComponent" :dialog-anchor="dialogAnchor" @close="closeContextMenu" />
            <ChangeAllDialog :component="currentComponent" :dialog-anchor="dialogAnchor" @close="closeContextMenu" />
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        id="context_button_showRename"
                        class="context-icon-btn"
                        color="white"
                        depressed
                        v-bind="attrs"
                        v-on="on"
                        @click="showRename = true"
                    >
                        <span class="material-icons primary--text">title</span>
                    </v-btn>
                </template>
                <span>Edit the component display name</span>
            </v-tooltip>
            <GenerateArrayDialog :component="currentComponent" :dialog-anchor="dialogAnchor" @close="closeContextMenu" />
        </div>

        <v-card-text class="settings-panel-body component-context-settings-body">
            <PropertyBlock density="sidebar" :title="mint" :spec="spec" @update="updateParameter" />
        </v-card-text>
    </v-card>
</template>

<script>
import Registry from "@/app/core/registry";
import Component from "@/app/core/component";
import Params from "@/app/core/params";
import EventBus, { SIDEBAR_CONNECTION_ID } from "@/events/events";
import MoveDialog from "@/components/MoveDialog.vue";
import ChangeAllDialog from "@/components/ChangeAllDialog.vue";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import { ComponentAPI } from "@/componentAPI";
import GenerateArrayDialog from "@/components/GenerateArrayDialog.vue";
import paper from "paper";
import { getPlacedComponentScreenBottomRight } from "@/utils/contextDialogAnchor";

export default {
    name: "ComponentContextMenu",
    components: { MoveDialog, ChangeAllDialog, PropertyBlock, GenerateArrayDialog },
    data() {
        return {
            mint: "",
            spec: [{ min: 0, max: 110, units: "", value: 0 }],
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            activeCopy: false,
            showRename: false,
            componentName: "",
            featureRef: null,
            marginLeft: 500,
            marginTop: 100,
            currentComponent: new Component(new Params({}, new Map(), new Map()), "", ""),
            dialogAnchor: null,
            /** Fallback when geometry anchor is unavailable (viewport px). */
            menuPointerAnchor: null,
            /** Settings opened from sidebar gear — same floating card as double-click, without canvas action toolbar. */
            isSidebarPlacementDefaultsPanel: false,
            /** Last anchor point (viewport px) for the sidebar-anchored placement settings card. */
            sidebarPlacementAnchor: null
        };
    },
    computed: {
        cardPositionStyle() {
            const w = "min(420px, calc(100vw - 24px))";
            return {
                position: "fixed",
                left: this.marginLeft + "px",
                top: this.marginTop + "px",
                zIndex: 200,
                maxWidth: w,
                width: w
            };
        }
    },
    mounted() {
        this._onCloseAllWindows = () => {
            this.dismissCanvasSettingsPopup();
        };
        this._onSidebarSettingsOpened = payload => {
            this.applySidebarSettingsOpenedPayload(payload);
        };
        this._onPlacementSettingsReposition = payload => {
            if (!this.activeMenu || !this.isSidebarPlacementDefaultsPanel) return;
            const anchor = payload && payload.anchor;
            if (!anchor) return;
            this.sidebarPlacementAnchor = anchor;
            this.$nextTick(() => this.positionMenuForSidebarAnchor(anchor));
        };
        this._onSidebarPlacementForClose = payload => {
            const m = payload && payload.mint;
            if (m == null || m === "") return;
            /* Re-activating the same MINT while the sidebar placement panel is open is part of the gear flow — do not close. */
            if (this.isSidebarPlacementDefaultsPanel && m === this.mint) return;
            const hadSidebarPanel = this.isSidebarPlacementDefaultsPanel;
            if (this.activeMenu) {
                this.dismissCanvasSettingsPopup();
            }
            if (hadSidebarPanel) {
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
            }
        };
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllWindows);
        EventBus.get().on(EventBus.DBL_CLICK_COMPONENT, this.activateMenu);
        EventBus.get().on(EventBus.SIDEBAR_SETTINGS_OPENED, this._onSidebarSettingsOpened);
        EventBus.get().on(EventBus.SIDEBAR_PLACEMENT_SETTINGS_REPOSITION, this._onPlacementSettingsReposition);
        EventBus.get().on(EventBus.SIDEBAR_COMPONENT_ACTIVATED, this._onSidebarPlacementForClose);
        this._onUpdateZoom = () => {
            if (!this.activeMenu) return;
            this.$nextTick(() => {
                if (this.isSidebarPlacementDefaultsPanel && this.sidebarPlacementAnchor) {
                    this.positionMenuForSidebarAnchor(this.sidebarPlacementAnchor);
                } else {
                    this.positionMenuNearComponent();
                }
            });
        };
        this._onUpdateRenders = () => {
            if (!this.activeMenu) return;
            this.$nextTick(() => {
                if (this.isSidebarPlacementDefaultsPanel && this.sidebarPlacementAnchor) {
                    this.positionMenuForSidebarAnchor(this.sidebarPlacementAnchor);
                } else {
                    this.positionMenuNearComponent();
                }
            });
        };
        EventBus.get().on(EventBus.UPDATE_ZOOM, this._onUpdateZoom);
        EventBus.get().on(EventBus.UPDATE_RENDERS, this._onUpdateRenders);
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllWindows);
        EventBus.get().off(EventBus.DBL_CLICK_COMPONENT, this.activateMenu);
        EventBus.get().off(EventBus.SIDEBAR_SETTINGS_OPENED, this._onSidebarSettingsOpened);
        EventBus.get().off(EventBus.SIDEBAR_PLACEMENT_SETTINGS_REPOSITION, this._onPlacementSettingsReposition);
        EventBus.get().off(EventBus.SIDEBAR_COMPONENT_ACTIVATED, this._onSidebarPlacementForClose);
        EventBus.get().off(EventBus.UPDATE_ZOOM, this._onUpdateZoom);
        EventBus.get().off(EventBus.UPDATE_RENDERS, this._onUpdateRenders);
    },
    methods: {
        dismissCanvasSettingsPopup() {
            this.activeMenu = false;
            this.showRename = false;
            this.isSidebarPlacementDefaultsPanel = false;
            this.sidebarPlacementAnchor = null;
        },
        closeSettingsPanel() {
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
        },
        closeContextMenu() {
            this.dismissCanvasSettingsPopup();
        },
        _getContextMenuRootEl() {
            const r = this.$refs.RightClickMenu;
            if (!r) return null;
            return r.$el || r;
        },
        _applyMenuPositionFromAnchor(anchor) {
            const menuEl = this._getContextMenuRootEl();
            if (!menuEl || typeof menuEl.getBoundingClientRect !== "function") return;
            const rect = menuEl.getBoundingClientRect();
            const w = rect.width || Math.min(420, window.innerWidth - 24);
            const pad = 12;
            const gap = 8;
            if (!anchor) {
                this.marginLeft = pad;
                this.marginTop = pad;
                return;
            }
            let left = anchor.left + gap;
            const top = Math.max(pad, anchor.top + gap);
            if (left + w + pad > window.innerWidth) {
                left = Math.max(pad, window.innerWidth - w - pad);
            }
            left = Math.max(pad, left);
            this.marginLeft = left;
            this.marginTop = top;
        },
        positionMenuForSidebarAnchor(anchor) {
            const menuEl = this._getContextMenuRootEl();
            if (!menuEl || typeof menuEl.getBoundingClientRect !== "function") return;
            const rect = menuEl.getBoundingClientRect();
            const w = rect.width || Math.min(420, window.innerWidth - 24);
            const pad = 12;
            const gap = 8;
            if (!anchor) {
                this.marginLeft = pad;
                this.marginTop = pad;
                return;
            }
            let left = (anchor.left || 0) + gap;
            const top = Math.max(pad, (anchor.top || 0) + gap);
            if (left + w + pad > window.innerWidth) {
                left = Math.max(pad, window.innerWidth - w - pad);
            }
            left = Math.max(pad, left);
            this.marginLeft = left;
            this.marginTop = top;
        },
        libraryDefaultSpecForMint(minttype) {
            const definition = ComponentAPI.getDefinitionForMINT(minttype);
            if (!definition) return [];
            const spec = [];
            for (const key in definition.heritable) {
                spec.push({
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: definition.defaults[key],
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10,
                    step: (definition.maximum[key] - definition.minimum[key]) / 10,
                    name: key
                });
            }
            return spec;
        },
        applySidebarSettingsOpenedPayload(payload) {
            const m = payload && payload.mint;
            const placementPanelAnchor = payload && payload.placementPanelAnchor;

            if (m == null || m === "") {
                this.dismissCanvasSettingsPopup();
                return;
            }

            if (m === SIDEBAR_CONNECTION_ID) {
                this.dismissCanvasSettingsPopup();
                return;
            }

            if (placementPanelAnchor) {
                this.isSidebarPlacementDefaultsPanel = true;
                this.sidebarPlacementAnchor = placementPanelAnchor;
                this.menuPointerAnchor = null;
                this.mint = m;
                this.spec = this.libraryDefaultSpecForMint(m);
                this.activeMenu = true;
                this.showRename = false;
                this.dialogAnchor = placementPanelAnchor;
                this.$nextTick(() => {
                    this.positionMenuForSidebarAnchor(placementPanelAnchor);
                    requestAnimationFrame(() => {
                        this.positionMenuForSidebarAnchor(placementPanelAnchor);
                    });
                });
                return;
            }

            if (m != null && m !== "") {
                this.dismissCanvasSettingsPopup();
            }
        },
        positionMenuNearComponent() {
            let anchor = getPlacedComponentScreenBottomRight(this.currentComponent);
            if (!anchor && this.menuPointerAnchor) {
                anchor = this.menuPointerAnchor;
            }
            this.dialogAnchor = anchor;
            const run = () => this._applyMenuPositionFromAnchor(anchor);
            this.$nextTick(() => {
                run();
                requestAnimationFrame(() => {
                    run();
                    requestAnimationFrame(run);
                });
            });
        },
        revertToDefaultParams() {
            const snap = ComponentAPI.snapshotFactoryDefaultsForMint(this.currentComponent.mint);
            if (!snap) return;
            const def = ComponentAPI.getDefinitionForMINT(this.currentComponent.mint);
            if (!def) return;
            for (const key in def.heritable) {
                if (!Object.prototype.hasOwnProperty.call(snap, key)) continue;
                this.currentComponent.updateParameter(key, snap[key]);
            }
            this.spec = this.computeSpec(this.currentComponent.mint, this.currentComponent.params);
        },
        resetSidebarPlacementLibraryDefaults() {
            const libType = ComponentAPI.getTypeForMINT(this.mint);
            if (!libType) return;
            const obj = ComponentAPI.library[libType] && ComponentAPI.library[libType].object;
            if (!obj || typeof obj.resetToFactoryParameterDefaults !== "function") return;
            obj.resetToFactoryParameterDefaults();
            this.spec = this.libraryDefaultSpecForMint(this.mint);
            const mint = this.mint;
            Registry.viewManager.activateComponentPlacementTool(mint, this.spec);
        },
        resetCanvasComponentToFactoryDefaults() {
            if (this.isSidebarPlacementDefaultsPanel) {
                this.resetSidebarPlacementLibraryDefaults();
                return;
            }
            this.revertToDefaultParams();
        },
        closeCanvasSettingsCard() {
            const wasSidebarPlacement = this.isSidebarPlacementDefaultsPanel;
            this.dismissCanvasSettingsPopup();
            if (wasSidebarPlacement) {
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
                return;
            }
            EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
        },
        updateParameter(value, key) {
            if (this.isSidebarPlacementDefaultsPanel) {
                const typeStr = ComponentAPI.getTypeForMINT(this.mint);
                if (!typeStr) return;
                const n = Number(value);
                Registry.viewManager.adjustParams(typeStr, key, n);
                const row = this.spec.find(r => r.name === key);
                if (row) {
                    this.$set(row, "value", n);
                }
                return;
            }
            this.currentComponent.updateParameter(key, value);
        },
        computeSpec: function(mint, params) {
            let spec = [];
            const definition = ComponentAPI.getDefinitionForMINT(mint);
            for (let i in params.heritable) {
                let key = params.heritable[i];
                let item = {
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: params.getValue(key),
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10,
                    step: (definition.maximum[key] - definition.minimum[key]) / 10,
                    name: key
                };
                spec.push(item);
            }
            return spec;
        },
        activateMenu: function(event, component) {
            this.isSidebarPlacementDefaultsPanel = false;
            this.sidebarPlacementAnchor = null;
            this.currentComponent = component;
            this.featureRef = component;
            this.componentName = component.name;
            this.activeMenu = true;
            this.showRename = false;
            if (event && typeof event.clientX === "number" && typeof event.clientY === "number") {
                this.menuPointerAnchor = { left: event.clientX, top: event.clientY };
            } else {
                this.menuPointerAnchor = null;
            }

            const spec = this.computeSpec(component.mint, component.params);
            this.mint = component.mint;
            this.spec = spec;

            this.$nextTick(() => {
                this.positionMenuNearComponent();
            });
        },
        deleteButton() {
            const view = Registry.viewManager.view;
            const items = paper.project && paper.project.selectedItems;
            const hasPaper = items && items.length > 0;

            if (hasPaper) {
                view.deleteSelectedFeatures();
            } else if (this.currentComponent && this.currentComponent.id) {
                const fids = this.currentComponent.featureIDs.slice();
                for (let i = 0; i < fids.length; i++) {
                    Registry.viewManager.removeFeatureByID(fids[i]);
                }
                const conn = Registry.currentDevice.removeComponent(this.currentComponent);
                if (conn) {
                    Registry.viewManager.updatesConnectionRender(conn);
                }
                view.clearSelectedItems();
            } else {
                view.deleteSelectedFeatures();
            }
            this.closeSettingsPanel();
            this.closeContextMenu();
        },
        copyButton() {
            Registry.viewManager.initiateCopy();
        },
        copyToAllButton() {
            this.activeCopy = !this.activeCopy;
            console.log("Change all the component parameters");
        },
        generateArrayButton() {
            Registry.viewManager.activateTool("GenerateArrayTool");
            Registry.viewManager.tools.GenerateArrayTool.activate(this.currentComponent);
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
            this.$refs.drawer.style.top = bounds.bottom - bounds.height + "px";
        },
        saveName() {
            this.currentComponent.name = this.componentName;
            this.showRename = false;
        },
        closeDialog() {
            this.activeMenu = false;
        },
        cancelRename() {
            this.showRename = false;
            this.componentName = this.currentComponent.name;
        }
    }
};
</script>

<style lang="scss" scoped>
/* Match PropertyDrawer settings panel (same classes + table field spacing) */
.component-context-card.settings-panel-card {
    box-sizing: border-box;
    font-family: Roboto, sans-serif !important;
    font-size: 0.875rem !important;
    font-weight: 500;
    letter-spacing: 0.0892857143em;
    line-height: 1.375rem;
}

.settings-panel-card--chrome {
    position: relative;
    overflow: visible;
}

.settings-corner-close.v-btn {
    position: absolute;
    z-index: 4;
    top: -17px;
    right: -17px;
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    border: 2px solid #fff;
    background: #e53935 !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24) !important;
    box-sizing: border-box;
}

.settings-corner-close.v-btn::before {
    background: transparent !important;
    opacity: 0 !important;
}

.settings-corner-close.v-btn:hover {
    background: #c62828 !important;
}

.settings-corner-close.v-btn .v-icon {
    color: #fff !important;
}

.settings-panel-heading {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 14px 12px 4px 12px;
    min-height: 48px;
}

.settings-panel-heading__title {
    font-size: calc(0.875rem + 2pt) !important;
    line-height: calc(1.375rem + 2pt) !important;
    word-break: break-word;
    min-width: 0;
}

.settings-panel-reset-btn {
    flex-shrink: 0;
    font-weight: 600 !important;
}

.settings-panel-body,
.component-context-settings-body {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.component-context-card ::v-deep .v-messages {
    display: none;
}

.component-context-card td {
    padding: 4px;
}

.component-context-card ::v-deep .v-input__slot {
    margin: 12px 0;
}

.component-context-card ::v-deep .v-text-field {
    padding-top: 0;
}

.component-context-card ::v-deep .v-text-field__details {
    display: none;
}

.context-action-toolbar {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 8px 12px 6px;
    box-sizing: border-box;
    max-width: 100%;
    overflow-x: auto;
}

.context-action-toolbar--panel {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.component-context-settings-body {
    padding-top: 8px !important;
}
</style>

<style lang="scss">
.context-icon-btn {
    min-width: 36px !important;
    width: 36px;
    height: 36px !important;
    padding: 0 !important;
    flex: 0 0 auto;
    background-color: #fff !important;
    border: 1px solid rgba(25, 118, 210, 0.35) !important;
}
.context-icon-btn .material-icons {
    font-size: 20px;
}
</style>
