<template>
    <v-card
        v-show="activeMenu"
        ref="RightClickMenu"
        class="connection-context-card settings-panel-card settings-panel-card--chrome"
        :style="cardPositionStyle"
        scrollable
    >
        <div v-show="showRename" class="connection-context-rename px-4 pt-3 pb-0">
            <v-row align="center" dense no-gutters>
                <v-text-field
                    v-model="connectionName"
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
                color="primary"
                class="settings-panel-apply-btn"
                :disabled="!hasPendingSpecChanges"
                @click="applySettingsChanges"
            >
                Apply
            </v-btn>
            <v-btn
                small
                depressed
                dark
                color="orange darken-2"
                class="settings-panel-reset-btn"
                @click="resetCanvasConnectionToFactoryDefaults"
            >
                Reset
            </v-btn>
        </div>

        <div class="context-action-toolbar context-action-toolbar--panel">
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
                <span>Remove this connection from the device</span>
            </v-tooltip>
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
                <span>Edit the connection display name</span>
            </v-tooltip>
        </div>

        <v-card-text class="settings-panel-body connection-context-settings-body">
            <PropertyBlock density="sidebar" :title="mint" :spec="spec" @update="updateParameter" />
        </v-card-text>
    </v-card>
</template>

<script>
import Registry from "@/app/core/registry";
import Connection from "@/app/core/connection";
import Layer from "@/app/core/layer";
import Params from "@/app/core/params";
import EventBus from "@/events/events";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import { ComponentAPI } from "@/componentAPI";
import paper from "paper";
import { getPlacedComponentScreenBottomRight } from "@/utils/contextDialogAnchor";

export default {
    name: "ConnectionContextMenu",
    components: { PropertyBlock },
    data() {
        return {
            mint: "CHANNEL",
            spec: [{ min: 0, max: 110, units: "", value: 0 }],
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            activeCopy: false,
            showRename: false,
            connectionName: "",
            featureRef: null,
            marginLeft: 500,
            marginTop: 100,
            currentConnection: new Connection("", new Params({}, new Map(), new Map()), "", "", new Layer({}, Registry.currentDevice)),
            menuPointerAnchor: null,
            appliedSpecSnapshot: {}
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
        },
        hasPendingSpecChanges() {
            const pending = this.specToValueSnapshot(this.spec);
            const applied = this.appliedSpecSnapshot || {};
            return JSON.stringify(pending) !== JSON.stringify(applied);
        }
    },
    mounted() {
        this._onCloseAllWindows = () => {
            this.dismissCanvasSettingsPopup();
        };
        this._onComponentSettingsOpened = () => {
            if (!this.activeMenu) return;
            this.dismissCanvasSettingsPopup();
        };
        this._onUpdateZoom = () => {
            if (!this.activeMenu) return;
            this.$nextTick(() => this.positionMenuNearConnection());
        };
        this._onUpdateRenders = () => {
            if (!this.activeMenu) return;
            this.$nextTick(() => this.positionMenuNearConnection());
        };
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllWindows);
        EventBus.get().on(EventBus.DBL_CLICK_CONNECTION, this.activateMenu);
        EventBus.get().on(EventBus.DBL_CLICK_COMPONENT, this._onComponentSettingsOpened);
        EventBus.get().on(EventBus.UPDATE_ZOOM, this._onUpdateZoom);
        EventBus.get().on(EventBus.UPDATE_RENDERS, this._onUpdateRenders);
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllWindows);
        EventBus.get().off(EventBus.DBL_CLICK_CONNECTION, this.activateMenu);
        EventBus.get().off(EventBus.DBL_CLICK_COMPONENT, this._onComponentSettingsOpened);
        EventBus.get().off(EventBus.UPDATE_ZOOM, this._onUpdateZoom);
        EventBus.get().off(EventBus.UPDATE_RENDERS, this._onUpdateRenders);
    },
    methods: {
        dismissCanvasSettingsPopup() {
            this.activeMenu = false;
            this.showRename = false;
            this.appliedSpecSnapshot = {};
            this.menuPointerAnchor = null;
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
        positionMenuNearConnection() {
            let anchor = getPlacedComponentScreenBottomRight(this.currentConnection);
            if (!anchor && this.menuPointerAnchor) {
                anchor = this.menuPointerAnchor;
            }
            const run = () => this._applyMenuPositionFromAnchor(anchor);
            this.$nextTick(() => {
                run();
                requestAnimationFrame(() => {
                    run();
                    requestAnimationFrame(run);
                });
            });
        },
        specToValueSnapshot(rows) {
            const snapshot = {};
            if (!Array.isArray(rows)) return snapshot;
            for (const row of rows) {
                if (!row || !row.name) continue;
                snapshot[row.name] = Number(row.value);
            }
            return snapshot;
        },
        cloneSpecRows(rows) {
            if (!Array.isArray(rows)) return [];
            return rows.map(row => ({ ...row }));
        },
        applyConnectionChanges() {
            if (!this.currentConnection) return;
            for (const row of this.spec) {
                if (!row || !row.name) continue;
                const n = Number(row.value);
                const nextValue = Number.isNaN(n) ? row.value : n;
                this.currentConnection.updateParameter(row.name, nextValue);
                this.$set(row, "value", nextValue);
            }
            this.appliedSpecSnapshot = this.specToValueSnapshot(this.spec);
        },
        applySettingsChanges() {
            this.applyConnectionChanges();
        },
        updateParameter(value, key) {
            const n = Number(value);
            const nextValue = Number.isNaN(n) ? value : n;
            const row = this.spec.find(r => r.name === key);
            if (!row) return;
            this.$set(row, "value", nextValue);
        },
        computeSpec: function (mint, params) {
            // Get the corresponding the definitions object from the componentAPI, convert to a spec object and return
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
        resetCanvasConnectionToFactoryDefaults() {
            if (!this.currentConnection) return;
            const snap = ComponentAPI.snapshotFactoryDefaultsForMint("CHANNEL");
            if (!snap) return;
            for (const key in snap) {
                if (!Object.prototype.hasOwnProperty.call(snap, key)) continue;
                const value = Number(snap[key]);
                this.currentConnection.updateParameter(key, value);
            }
            this.spec = this.computeSpec("CHANNEL", this.currentConnection.params);
            this.appliedSpecSnapshot = this.specToValueSnapshot(this.spec);
        },
        closeCanvasSettingsCard() {
            this.dismissCanvasSettingsPopup();
            EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
        },
        activateMenu: function (event, connection) {
            this.currentConnection = connection;
            this.featureRef = connection;
            this.connectionName = connection.name;
            this.activeMenu = true;
            this.showRename = false;
            this.mint = "Connection";
            if (event && typeof event.clientX === "number" && typeof event.clientY === "number") {
                this.menuPointerAnchor = { left: event.clientX, top: event.clientY };
            } else {
                this.menuPointerAnchor = null;
            }

            const spec = this.computeSpec("CHANNEL", connection.params);
            this.spec = spec;
            this.appliedSpecSnapshot = this.specToValueSnapshot(spec);
            this.$nextTick(() => {
                this.positionMenuNearConnection();
            });
        },
        deleteButton() {
            const view = Registry.viewManager.view;
            const items = paper.project && paper.project.selectedItems;
            const hasPaper = items && items.length > 0;

            if (hasPaper) {
                view.deleteSelectedFeatures();
            } else if (this.currentConnection && this.currentConnection.id) {
                Registry.currentDevice.removeConnection(this.currentConnection);
                view.clearSelectedItems();
            } else {
                view.deleteSelectedFeatures();
            }
            this.closeCanvasSettingsCard();
        },
        saveName() {
            this.currentConnection.name = this.connectionName;
            this.showRename = false;
        },
        cancelRename() {
            this.showRename = false;
            this.connectionName = this.currentConnection.name;
        }
    }
};
</script>

<style lang="scss" scoped>
.connection-context-card.settings-panel-card {
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
.connection-context-settings-body {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.connection-context-card ::v-deep .v-messages {
    display: none;
}

.connection-context-card td {
    padding: 4px;
}

.connection-context-card ::v-deep .v-input__slot {
    margin: 12px 0;
}

.connection-context-card ::v-deep .v-text-field {
    padding-top: 0;
}

.connection-context-card ::v-deep .v-text-field__details {
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

.connection-context-settings-body {
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
