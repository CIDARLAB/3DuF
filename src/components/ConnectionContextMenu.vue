<template>
    <v-card
        v-show="activeMenu"
        ref="RightClickMenu"
        class="connection-context-card settings-panel-card settings-panel-card--chrome"
        :style="cardPositionStyle"
        scrollable
        @mousedown="startMenuDrag"
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
                v-if="hasPendingSpecChanges"
                small
                depressed
                dark
                color="primary"
                class="settings-panel-apply-btn"
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
            <v-select
                v-model="selectedProfile"
                :items="connectionProfiles"
                class="mb-3 connection-profile-select"
                dense
                hide-details
                label="Channel profile"
                outlined
                :menu-props="{ contentClass: 'connection-context-profile-menu' }"
            ></v-select>
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

function specItemFromDef(def, name, valueOverride) {
    const v = valueOverride !== undefined ? valueOverride : def.defaults[name];
    return {
        name,
        min: def.minimum[name],
        max: def.maximum[name],
        value: v,
        units: def.units[name],
        steps: (def.maximum[name] - def.minimum[name]) / 10,
        step: (def.maximum[name] - def.minimum[name]) / 10
    };
}

function toFiniteNumberOrFallback(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function normalizeProfileLabel(value) {
    return String(value || "").trim().toUpperCase();
}

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
            appliedSettingsSnapshot: null,
            connectionProfiles: [],
            selectedProfile: "CHANNEL",
            snapshot: {
                connectionSpacing: 1600,
                channelWidth: 800,
                height: 250
            },
            isManualMenuPosition: false,
            isDraggingMenu: false,
            dragStartPointer: null,
            dragStartMenuPosition: null
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
            const pending = this.buildAppliedSettingsSnapshot();
            const applied = this.appliedSettingsSnapshot || null;
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
            if (this.isManualMenuPosition) return;
            this.$nextTick(() => this.positionMenuNearConnection());
        };
        this._onUpdateRenders = () => {
            if (!this.activeMenu) return;
            if (this.isManualMenuPosition) return;
            this.$nextTick(() => this.positionMenuNearConnection());
        };
        this._onSidebarPlacementActivated = payload => {
            const mint = payload && payload.mint;
            if (mint == null || mint === "") return;
            if (!this.activeMenu) return;
            this.dismissCanvasSettingsPopup();
        };
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllWindows);
        EventBus.get().on(EventBus.DBL_CLICK_CONNECTION, this.activateMenu);
        EventBus.get().on(EventBus.DBL_CLICK_COMPONENT, this._onComponentSettingsOpened);
        EventBus.get().on(EventBus.UPDATE_ZOOM, this._onUpdateZoom);
        EventBus.get().on(EventBus.UPDATE_RENDERS, this._onUpdateRenders);
        EventBus.get().on(EventBus.SIDEBAR_COMPONENT_ACTIVATED, this._onSidebarPlacementActivated);
        this.connectionProfiles = ComponentAPI.getConnectionTypes();
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllWindows);
        EventBus.get().off(EventBus.DBL_CLICK_CONNECTION, this.activateMenu);
        EventBus.get().off(EventBus.DBL_CLICK_COMPONENT, this._onComponentSettingsOpened);
        EventBus.get().off(EventBus.UPDATE_ZOOM, this._onUpdateZoom);
        EventBus.get().off(EventBus.UPDATE_RENDERS, this._onUpdateRenders);
        EventBus.get().off(EventBus.SIDEBAR_COMPONENT_ACTIVATED, this._onSidebarPlacementActivated);
        this.stopMenuDrag();
    },
    methods: {
        startMenuDrag(event) {
            if (!event || event.button !== 0) return;
            const target = event.target;
            if (!target || typeof target.closest !== "function") return;
            if (
                target.closest(
                    ".v-btn, button, input, textarea, select, .v-input, .v-slider, .property-block-scroll-shell--limited"
                )
            ) {
                return;
            }
            this.isDraggingMenu = true;
            this.isManualMenuPosition = true;
            this.dragStartPointer = { x: event.clientX, y: event.clientY };
            this.dragStartMenuPosition = { left: this.marginLeft, top: this.marginTop };
            window.addEventListener("mousemove", this.onMenuDragMove);
            window.addEventListener("mouseup", this.stopMenuDrag);
            event.stopPropagation();
            event.preventDefault();
        },
        onMenuDragMove(event) {
            if (!this.isDraggingMenu || !this.dragStartPointer || !this.dragStartMenuPosition) return;
            const menuEl = this._getContextMenuRootEl();
            const rect = menuEl && typeof menuEl.getBoundingClientRect === "function" ? menuEl.getBoundingClientRect() : null;
            const width = rect ? rect.width : Math.min(420, window.innerWidth - 24);
            const height = rect ? rect.height : 320;
            const pad = 12;
            const deltaX = event.clientX - this.dragStartPointer.x;
            const deltaY = event.clientY - this.dragStartPointer.y;
            const rawLeft = this.dragStartMenuPosition.left + deltaX;
            const rawTop = this.dragStartMenuPosition.top + deltaY;
            const maxLeft = Math.max(pad, window.innerWidth - width - pad);
            const maxTop = Math.max(pad, window.innerHeight - height - pad);
            this.marginLeft = Math.max(pad, Math.min(rawLeft, maxLeft));
            this.marginTop = Math.max(pad, Math.min(rawTop, maxTop));
            event.preventDefault();
        },
        stopMenuDrag() {
            if (!this.isDraggingMenu) return;
            this.isDraggingMenu = false;
            this.dragStartPointer = null;
            this.dragStartMenuPosition = null;
            window.removeEventListener("mousemove", this.onMenuDragMove);
            window.removeEventListener("mouseup", this.stopMenuDrag);
        },
        dismissCanvasSettingsPopup() {
            this.stopMenuDrag();
            this.activeMenu = false;
            this.showRename = false;
            this.appliedSettingsSnapshot = null;
            this.menuPointerAnchor = null;
            this.isManualMenuPosition = false;
        },
        profileMintToCrossSection(mint) {
            const label = normalizeProfileLabel(mint);
            return label.includes("ROUND") ? 1 : 0;
        },
        crossSectionToProfileMint(crossSection) {
            const wantRounded = Number(crossSection) >= 0.5;
            return this.resolveProfileMintByCrossSection(wantRounded);
        },
        resolveProfileMintByCrossSection(wantRounded) {
            const items = Array.isArray(this.connectionProfiles) ? this.connectionProfiles : [];
            if (items.length === 0) {
                return wantRounded ? "ROUNDED CHANNEL" : "CHANNEL";
            }
            const roundedItem = items.find(item => normalizeProfileLabel(item).includes("ROUND"));
            const channelItem = items.find(item => !normalizeProfileLabel(item).includes("ROUND"));
            if (wantRounded) {
                return roundedItem || channelItem || items[0];
            }
            return channelItem || roundedItem || items[0];
        },
        getConnectionDefinition() {
            return ComponentAPI.getDefinition("Connection") || ComponentAPI.getDefinitionForMINT("CHANNEL");
        },
        initSnapshotFromConnection() {
            if (!this.currentConnection) return;
            const params = this.currentConnection.params;
            const featureValues = {};
            const firstFeatureID =
                Array.isArray(this.currentConnection.featureIDs) && this.currentConnection.featureIDs.length > 0
                    ? this.currentConnection.featureIDs[0]
                    : null;
            if (firstFeatureID && Registry.currentDevice) {
                try {
                    const feature = Registry.currentDevice.getFeatureByID(firstFeatureID);
                    featureValues.connectionSpacing = feature.getValue("connectionSpacing");
                    featureValues.channelWidth = feature.getValue("channelWidth");
                    featureValues.height = feature.getValue("height");
                    featureValues.crossSection = feature.getValue("crossSection");
                } catch {
                    // Fallback to connection params below.
                }
            }
            const toNumber = (key, fallback) => {
                try {
                    if (Object.prototype.hasOwnProperty.call(featureValues, key)) {
                        return toFiniteNumberOrFallback(featureValues[key], fallback);
                    }
                    return toFiniteNumberOrFallback(params.getValue(key), fallback);
                } catch {
                    return fallback;
                }
            };
            this.snapshot = {
                connectionSpacing: toNumber("connectionSpacing", 1600),
                channelWidth: toNumber("channelWidth", 800),
                height: toNumber("height", 250)
            };
            let crossSection = 0;
            try {
                if (Object.prototype.hasOwnProperty.call(featureValues, "crossSection")) {
                    crossSection = featureValues.crossSection;
                } else {
                    crossSection = params.getValue("crossSection");
                }
            } catch {
                crossSection = 0;
            }
            this.selectedProfile = this.crossSectionToProfileMint(crossSection);
        },
        rebuildSettingsSpec() {
            const def = this.getConnectionDefinition();
            if (!def) {
                this.spec = [];
                return;
            }
            if (this.profileMintToCrossSection(this.selectedProfile) >= 0.5) {
                const radius = this.snapshot.channelWidth / 2;
                this.spec = [
                    specItemFromDef(def, "connectionSpacing", this.snapshot.connectionSpacing),
                    {
                        name: "channelRadius",
                        min: def.minimum.channelWidth / 2,
                        max: def.maximum.channelWidth / 2,
                        value: radius,
                        units: def.units.channelWidth,
                        steps: (def.maximum.channelWidth / 2 - def.minimum.channelWidth / 2) / 10,
                        step: (def.maximum.channelWidth / 2 - def.minimum.channelWidth / 2) / 10
                    }
                ];
                return;
            }
            this.spec = [
                specItemFromDef(def, "connectionSpacing", this.snapshot.connectionSpacing),
                specItemFromDef(def, "channelWidth", this.snapshot.channelWidth),
                specItemFromDef(def, "height", this.snapshot.height)
            ];
        },
        syncSpecItemToSnapshot(name, value) {
            const n = Number(value);
            if (!Number.isFinite(n)) return;
            if (name === "connectionSpacing") this.snapshot.connectionSpacing = n;
            else if (name === "channelWidth") this.snapshot.channelWidth = n;
            else if (name === "height") this.snapshot.height = n;
            else if (name === "channelRadius") {
                this.snapshot.channelWidth = n * 2;
                this.snapshot.height = n * 2;
            }
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
        buildAppliedSettingsSnapshot() {
            return {
                profile: normalizeProfileLabel(this.selectedProfile),
                values: this.specToValueSnapshot(this.spec)
            };
        },
        applyConnectionChanges() {
            if (!this.currentConnection) return;
            for (const row of this.spec) {
                if (!row || !row.name) continue;
                this.syncSpecItemToSnapshot(row.name, row.value);
            }
            this.currentConnection.updateParameter("connectionSpacing", this.snapshot.connectionSpacing);
            this.currentConnection.updateParameter("channelWidth", this.snapshot.channelWidth);
            this.currentConnection.updateParameter("height", this.snapshot.height);
            this.currentConnection.updateParameter("crossSection", this.profileMintToCrossSection(this.selectedProfile));
            this.refreshConnectionRender();
            this.rebuildSettingsSpec();
            this.appliedSettingsSnapshot = this.buildAppliedSettingsSnapshot();
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
            this.syncSpecItemToSnapshot(key, nextValue);
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
            this.refreshConnectionRender();
            this.initSnapshotFromConnection();
            this.rebuildSettingsSpec();
            this.appliedSettingsSnapshot = this.buildAppliedSettingsSnapshot();
        },
        refreshConnectionRender() {
            if (!this.currentConnection || !Registry.viewManager || !Registry.currentDevice) return;
            try {
                Registry.viewManager.updatesConnectionRender(this.currentConnection);
            } catch (err) {
                console.warn("Could not recompute connection render after applying settings:", err);
            }
            for (const featureID of this.currentConnection.featureIDs) {
                try {
                    const feature = Registry.currentDevice.getFeatureByID(featureID);
                    Registry.viewManager.updateFeature(feature, false);
                } catch (err) {
                    console.warn("Could not refresh connection feature after apply:", featureID, err);
                }
            }
            Registry.viewManager.refresh(true);
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
            this.isManualMenuPosition = false;

            this.initSnapshotFromConnection();
            this.rebuildSettingsSpec();
            if (!Array.isArray(this.spec) || this.spec.length === 0) {
                // Fallback for legacy / malformed cases: still show current connection params in canvas popup.
                this.spec = this.computeSpec("CHANNEL", connection.params);
            }
            this.appliedSettingsSnapshot = this.buildAppliedSettingsSnapshot();
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
        },
        onSelectedProfileChanged(newVal, oldVal) {
            if (newVal === oldVal) return;
            if (this.profileMintToCrossSection(oldVal) < 0.5 && this.profileMintToCrossSection(newVal) >= 0.5) {
                this.snapshot.height = this.snapshot.channelWidth;
            }
            this.rebuildSettingsSpec();
        }
    },
    watch: {
        selectedProfile: "onSelectedProfileChanged"
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
    cursor: move;
    user-select: none;
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

.connection-context-card ::v-deep .v-select .v-label,
.connection-context-card ::v-deep .v-select .v-select__selection {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.connection-context-card ::v-deep .v-select .v-input__slot,
.connection-context-card ::v-deep .v-select input {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.connection-context-card ::v-deep .v-list-item__title {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
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

.connection-context-profile-menu .v-list-item__title,
.connection-context-profile-menu .v-list-item,
.connection-context-profile-menu .v-list-item__content {
    font-family: Roboto, sans-serif !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.0892857143em !important;
}
</style>
