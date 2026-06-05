<template>
    <div class="property-drawer-parent">
        <div class="property-drawer-row">
            <v-tooltip bottom max-width="280">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        ref="activator"
                        medium
                        :class="buttonClasses"
                        v-bind="attrs"
                        v-on="on"
                        @click="toggleConnectionTool"
                    >
                        Connection
                    </v-btn>
                </template>
                <span>
                    Route fluid connections between ports by placing channel segments; use waypoints and right-click to
                    finish each segment.
                </span>
            </v-tooltip>
            <v-btn
                ref="settingsActivator"
                icon
                medium
                text
                :ripple="false"
                class="settings-gear-btn"
                :class="{ 'settings-gear-btn--open': isSettingsRowOpen }"
                @click.stop="toggleSettingsDrawer"
            >
                <v-icon class="settings-gear-icon">mdi-cog</v-icon>
            </v-btn>
        </div>
        <div ref="drawer" class="connection-property-drawer" :style="drawerPositionStyle">
            <v-card v-if="isSettingsRowOpen" class="settings-panel-card settings-panel-card--chrome" @mousedown="startDrawerDrag">
                <v-btn
                    type="button"
                    fab
                    x-small
                    dark
                    :ripple="false"
                    class="settings-corner-close"
                    aria-label="Close"
                    @click="closeConnectionSettingsPanel"
                >
                    <v-icon size="16" color="white">mdi-close</v-icon>
                </v-btn>
                <div class="settings-panel-heading">
                    <span class="settings-panel-heading__title">Connection settings</span>
                    <v-spacer />
                    <v-btn
                        small
                        depressed
                        dark
                        color="orange darken-2"
                        class="settings-panel-reset-btn"
                        @click="resetConnectionDefaults"
                    >
                        Reset
                    </v-btn>
                </div>
                <v-card-text class="settings-panel-body pt-2">
                    <v-alert dense text type="info" class="mb-3 connection-settings-hint">
                        {{ current_connection_suggestion }}
                    </v-alert>
                    <v-row justify="start" align="start">
                        <v-col cols="12" md="auto" class="connection-settings-params-col">
                            <div class="connection-settings-property-wrap">
                                <PropertyBlock
                                    density="sidebar"
                                    title="Connection"
                                    :spec="settingsSpec"
                                    @update="updateParameter"
                                />
                            </div>
                        </v-col>
                        <v-col cols="12" md="6" class="connection-settings-preview-col">
                            <div class="settings-section-label mb-1">Cross-section preview</div>
                            <v-select
                                v-model="selectedProfile"
                                :items="connectionProfiles"
                                class="mb-3"
                                dense
                                hide-details
                                label="Channel profile"
                                outlined
                            ></v-select>
                            <div class="cross-section-frame">
                                <div class="cross-section-diagram">
                                    <svg v-if="isRectCrossSection" viewBox="0 0 260 155" class="cross-section-svg">
                                        <g class="cross-section-diagram-shift">
                                            <g :opacity="crossSectionFlowOpacity">
                                                <rect
                                                    :x="rectGeom.x"
                                                    :y="rectGeom.y"
                                                    :width="rectGeom.w"
                                                    :height="rectGeom.h"
                                                    class="cross-section-shape"
                                                />
                                                <line
                                                    :x1="rectGeom.wLineX1"
                                                    :y1="rectGeom.wy"
                                                    :x2="rectGeom.wLineX2"
                                                    :y2="rectGeom.wy"
                                                    class="cross-section-dim-line cross-section-dim-line--flow"
                                                />
                                                <polygon :points="rectGeom.wArrowLeft" class="cross-section-arrow cross-section-arrow--flow" />
                                                <polygon :points="rectGeom.wArrowRight" class="cross-section-arrow cross-section-arrow--flow" />
                                                <text
                                                    :x="rectGeom.wTextX"
                                                    :y="rectGeom.wTextY"
                                                    class="param-svg-name param-svg-name--center param-svg-name--flow"
                                                >
                                                    channelWidth
                                                </text>
                                            </g>
                                            <g :opacity="crossSectionControlOpacity">
                                                <line
                                                    :x1="rectGeom.hx"
                                                    :y1="rectGeom.hLineY1"
                                                    :x2="rectGeom.hx"
                                                    :y2="rectGeom.hLineY2"
                                                    class="cross-section-dim-line cross-section-dim-line--control"
                                                />
                                                <polygon :points="rectGeom.hArrowTop" class="cross-section-arrow cross-section-arrow--control" />
                                                <polygon :points="rectGeom.hArrowBottom" class="cross-section-arrow cross-section-arrow--control" />
                                                <text
                                                    :x="rectGeom.hTextX"
                                                    :y="rectGeom.hTextY"
                                                    class="param-svg-name param-svg-name--control"
                                                >
                                                    height
                                                </text>
                                            </g>
                                        </g>
                                    </svg>
                                    <svg v-else viewBox="0 0 260 155" class="cross-section-svg">
                                        <g class="cross-section-diagram-shift">
                                            <g :opacity="crossSectionFlowOpacity">
                                                <circle
                                                    :cx="circleGeom.cx"
                                                    :cy="circleGeom.cy"
                                                    :r="circleGeom.r"
                                                    class="cross-section-shape"
                                                />
                                                <line
                                                    :x1="circleGeom.lLineX1"
                                                    :y1="circleGeom.ly"
                                                    :x2="circleGeom.lLineX2"
                                                    :y2="circleGeom.ly"
                                                    class="cross-section-dim-line cross-section-dim-line--flow"
                                                />
                                                <polygon :points="circleGeom.cArrowLeft" class="cross-section-arrow cross-section-arrow--flow" />
                                                <polygon :points="circleGeom.cArrowRight" class="cross-section-arrow cross-section-arrow--flow" />
                                                <text
                                                    :x="circleGeom.textX"
                                                    :y="circleGeom.textY"
                                                    class="param-svg-name param-svg-name--center param-svg-name--flow"
                                                >
                                                    channelRadius
                                                </text>
                                            </g>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import EventBus, { SIDEBAR_CONNECTION_ID } from "@/events/events";
import Registry from "@/app/core/registry";
import { LogicalLayerType } from "@/app/core/init";
import "@mdi/font/css/materialdesignicons.css";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import { ComponentAPI } from "@/componentAPI";
import { ConnectionToolState } from "@/app/view/tools/connectionTool";

/** Same inactive emphasis as valve/canvas (featureRenderer2D). */
const INACTIVE_LOGICAL_LAYER_ALPHA = 0.5;

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

export default {
    name: "ConnectionPropertyDrawer",
    components: { PropertyBlock },
    props: {
        activeSidebarMint: {
            type: String,
            default: ""
        },
        activeSettingsMint: {
            type: String,
            default: ""
        }
    },
    icons: {
        iconfont: "mdi"
    },
    data() {
        return {
            spec: this.computedSpec("Connection"),
            connectionProfiles: [],
            selectedProfile: "",
            activeTool: null,
            settingsSpec: [],
            snapshot: {
                connectionSpacing: 1600,
                channelWidth: 800,
                height: 250
            },
            /** Bumps computed props that read Registry view layer (non-reactive). */
            layerSyncTick: 0,
            drawerLeft: 225,
            drawerTop: 10,
            isManualDrawerPosition: false,
            isDraggingDrawer: false,
            drawerDragStartPointer: null,
            drawerDragStartPosition: null
        };
    },
    computed: {
        buttonClasses: function() {
            return [
                this.isPlacementRowActive ? "primary" : "white",
                this.isPlacementRowActive ? "white--text" : "blue--text",
                "my-1",
                "component-tool-btn-main"
            ];
        },

        isPlacementRowActive() {
            return this.activeSidebarMint === SIDEBAR_CONNECTION_ID;
        },

        isSettingsRowOpen() {
            return this.activeSettingsMint === SIDEBAR_CONNECTION_ID;
        },

        isRectCrossSection() {
            return this.selectedProfile !== "ROUNDED CHANNEL";
        },

        crossSectionFlowOpacity() {
            this.layerSyncTick;
            const t = Registry.viewManager?.currentLayer?.type;
            if (t === undefined || t === null) return 1;
            return t === LogicalLayerType.FLOW ? 1 : INACTIVE_LOGICAL_LAYER_ALPHA;
        },

        crossSectionControlOpacity() {
            this.layerSyncTick;
            const t = Registry.viewManager?.currentLayer?.type;
            if (t === undefined || t === null) return 1;
            return t === LogicalLayerType.CONTROL ? 1 : INACTIVE_LOGICAL_LAYER_ALPHA;
        },

        /** Elongated rectangle + outward-pointing dimension arrows; channelWidth label centered under width line */
        rectGeom() {
            const w = 88;
            const h = 22;
            const x = 46;
            const y = 58;
            const wy = y + h + 20;
            const hx = x + w + 18;
            const gap = 6;
            const aw = 6;
            const ah = 4;
            const wx1 = x;
            const wx2 = x + w;
            const hy1 = y;
            const hy2 = y + h;
            const wLineX1 = wx1 + gap;
            const wLineX2 = wx2 - gap;
            /** Clear gap (svg units) between horizontal dim line and channelWidth label baseline offset */
            const dimLineToChannelWidthGap = 5;
            const labelBaselineBelowGap = 12;
            return {
                x,
                y,
                w,
                h,
                wy,
                hx,
                wLineX1,
                wLineX2,
                wArrowLeft: `${wx1},${wy} ${wx1 + aw},${wy - ah} ${wx1 + aw},${wy + ah}`,
                wArrowRight: `${wx2},${wy} ${wx2 - aw},${wy - ah} ${wx2 - aw},${wy + ah}`,
                wTextX: (wLineX1 + wLineX2) / 2,
                wTextY: wy + dimLineToChannelWidthGap + labelBaselineBelowGap,
                hLineY1: hy1 + gap,
                hLineY2: hy2 - gap,
                hArrowTop: `${hx},${hy1} ${hx - ah},${hy1 + aw} ${hx + ah},${hy1 + aw}`,
                hArrowBottom: `${hx},${hy2} ${hx - ah},${hy2 - aw} ${hx + ah},${hy2 - aw}`,
                hTextX: hx + 12,
                hTextY: y + h / 2 + 4
            };
        },

        /** Circle: horizontal dimension shows radius (center to left edge); label below circle */
        circleGeom() {
            const cx = 118;
            const cy = 76;
            const r = 38;
            const gap = 6;
            const aw = 6;
            const ah = 4;
            const lx1 = cx - r;
            const lx2 = cx;
            const lLineX1 = lx1 + gap;
            const lLineX2 = lx2 - gap;
            const dimLineToLabelGap = 5;
            const labelBaselineBelowGap = 12;
            return {
                cx,
                cy,
                r,
                ly: cy,
                lLineX1,
                lLineX2,
                cArrowLeft: `${lx1},${cy} ${lx1 + aw},${cy - ah} ${lx1 + aw},${cy + ah}`,
                cArrowRight: `${lx2},${cy} ${lx2 - aw},${cy - ah} ${lx2 + aw},${cy + ah}`,
                textX: cx,
                textY: cy + r + dimLineToLabelGap + labelBaselineBelowGap
            };
        },

        current_connection_suggestion: function() {
            const STATE0 = "Unable to test the connection tool state";
            const STATE1 = "Left Click to choose a Start Point";
            const STATE2 = "Left Click to place waypoint, Right Click to end Connection";
            const tool = this.activeTool || Registry.viewManager?.tools?.Connection;
            if (tool === null || tool === undefined) {
                return STATE0;
            } else {
                if (tool.state === ConnectionToolState.PLACE_FIRST_POINT) {
                    return STATE1;
                } else if (tool.state === ConnectionToolState.PLACE_WAYPOINT) {
                    return STATE2;
                } else if (tool.state === ConnectionToolState.TARGET_PLACED_START_AGAIN) {
                    return STATE1;
                } else {
                    return "Unknown State, suggestion error";
                }
            }
        },
        drawerPositionStyle() {
            return {
                left: this.drawerLeft + "px",
                top: this.drawerTop + "px"
            };
        }
    },
    watch: {
        selectedProfile(newVal, oldVal) {
            if (oldVal && oldVal !== newVal && oldVal === "CHANNEL" && newVal === "ROUNDED CHANNEL") {
                this.snapshot.height = this.snapshot.channelWidth;
            }
            this.rebuildSettingsSpec();
            this.applyProfileToTool();
        },
        isSettingsRowOpen(isOpen) {
            if (isOpen) {
                this.isManualDrawerPosition = false;
                this.initSnapshotFromSpec();
                this.rebuildSettingsSpec();
                this.layerSyncTick += 1;
                this.$nextTick(() => {
                    this.attachSettingsDrawerToApp();
                });
            }
        }
    },
    mounted() {
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, this.onCloseAllWindows);
        EventBus.get().on(EventBus.RIGHT_CLICK, this.endConnection);
        EventBus.get().on(EventBus.NAVBAR_SCROLL_EVENT, this.setDrawerPosition);
        EventBus.get().on(EventBus.ACTIVE_RENDER_LAYER_CHANGED, this.onActiveRenderLayerChanged);
        this.connectionProfiles = ComponentAPI.getConnectionTypes();
        this.initSnapshotFromSpec();
        this.selectedProfile = this.connectionProfiles[0] || "CHANNEL";
        this.layerSyncTick += 1;
        this.applyProfileToTool();
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.CLOSE_ALL_WINDOWS, this.onCloseAllWindows);
        EventBus.get().off(EventBus.RIGHT_CLICK, this.endConnection);
        EventBus.get().off(EventBus.NAVBAR_SCROLL_EVENT, this.setDrawerPosition);
        EventBus.get().off(EventBus.ACTIVE_RENDER_LAYER_CHANGED, this.onActiveRenderLayerChanged);
        this.stopDrawerDrag();
    },
    methods: {
        startDrawerDrag(event) {
            if (!event || event.button !== 0 || !this.isSettingsRowOpen) return;
            const target = event.target;
            if (!target || typeof target.closest !== "function") return;
            if (
                target.closest(
                    ".v-btn, button, input, textarea, select, .v-input, .v-slider, .property-block-scroll-shell--limited"
                )
            ) {
                return;
            }
            this.isDraggingDrawer = true;
            this.isManualDrawerPosition = true;
            this.drawerDragStartPointer = { x: event.clientX, y: event.clientY };
            this.drawerDragStartPosition = { left: this.drawerLeft, top: this.drawerTop };
            window.addEventListener("mousemove", this.onDrawerDragMove);
            window.addEventListener("mouseup", this.stopDrawerDrag);
            event.stopPropagation();
            event.preventDefault();
        },
        onDrawerDragMove(event) {
            if (!this.isDraggingDrawer || !this.drawerDragStartPointer || !this.drawerDragStartPosition) return;
            const drawerEl = this.$refs.drawer;
            const rect = drawerEl && typeof drawerEl.getBoundingClientRect === "function" ? drawerEl.getBoundingClientRect() : null;
            const width = rect ? rect.width : 720;
            const height = rect ? rect.height : 360;
            const pad = 12;
            const deltaX = event.clientX - this.drawerDragStartPointer.x;
            const deltaY = event.clientY - this.drawerDragStartPointer.y;
            const rawLeft = this.drawerDragStartPosition.left + deltaX;
            const rawTop = this.drawerDragStartPosition.top + deltaY;
            const maxLeft = Math.max(pad, window.innerWidth - width - pad);
            const maxTop = Math.max(pad, window.innerHeight - height - pad);
            this.drawerLeft = Math.max(pad, Math.min(rawLeft, maxLeft));
            this.drawerTop = Math.max(pad, Math.min(rawTop, maxTop));
            event.preventDefault();
        },
        stopDrawerDrag() {
            if (!this.isDraggingDrawer) return;
            this.isDraggingDrawer = false;
            this.drawerDragStartPointer = null;
            this.drawerDragStartPosition = null;
            window.removeEventListener("mousemove", this.onDrawerDragMove);
            window.removeEventListener("mouseup", this.stopDrawerDrag);
        },
        profileMintToCrossSection(mint) {
            return mint === "ROUNDED CHANNEL" ? 1 : 0;
        },
        applyProfileToTool() {
            const vm = Registry.viewManager;
            const tool = vm && vm.tools ? vm.tools.Connection : null;
            const v = this.profileMintToCrossSection(this.selectedProfile);
            if (tool) {
                tool.crossSection = v;
                if (tool.currentChannelID) {
                    tool.updateParameter("crossSection", v);
                }
            }
        },
        onActiveRenderLayerChanged() {
            this.layerSyncTick += 1;
        },
        onCloseAllWindows() {
            const vm = Registry.viewManager;
            if (vm && vm.mouseAndKeyboardHandler && vm.mouseAndKeyboardHandler.leftMouseTool === vm.tools.Connection) {
                vm.resetToDefaultTool();
            }
            this.activeTool = null;
        },
        initSnapshotFromSpec() {
            const arr = this.computedSpec("Connection");
            const snap = { connectionSpacing: 1600, channelWidth: 800, height: 250 };
            for (const item of arr) {
                if (Object.prototype.hasOwnProperty.call(snap, item.name)) {
                    snap[item.name] = Number(item.value);
                }
            }
            this.snapshot = snap;
        },

        rebuildSettingsSpec() {
            const def = ComponentAPI.getDefinition("Connection");
            if (!def) {
                this.settingsSpec = [];
                return;
            }
            if (this.selectedProfile === "ROUNDED CHANNEL") {
                const r = this.snapshot.channelWidth / 2;
                this.settingsSpec = [
                    specItemFromDef(def, "connectionSpacing", this.snapshot.connectionSpacing),
                    {
                        name: "channelRadius",
                        min: def.minimum.channelWidth / 2,
                        max: def.maximum.channelWidth / 2,
                        value: r,
                        units: def.units.channelWidth,
                        steps: (def.maximum.channelWidth / 2 - def.minimum.channelWidth / 2) / 10,
                        step: (def.maximum.channelWidth / 2 - def.minimum.channelWidth / 2) / 10
                    }
                ];
            } else {
                this.settingsSpec = [
                    specItemFromDef(def, "connectionSpacing", this.snapshot.connectionSpacing),
                    specItemFromDef(def, "channelWidth", this.snapshot.channelWidth),
                    specItemFromDef(def, "height", this.snapshot.height)
                ];
            }
        },

        syncSpecItemToSnapshot(name, value) {
            const n = Number(value);
            if (name === "connectionSpacing") this.snapshot.connectionSpacing = n;
            else if (name === "channelWidth") this.snapshot.channelWidth = n;
            else if (name === "height") this.snapshot.height = n;
            else if (name === "channelRadius") {
                this.snapshot.channelWidth = n * 2;
                this.snapshot.height = n * 2;
            }
        },

        updateParameter(value, key) {
            this.syncSpecItemToSnapshot(key, value);
            const tool = this.activeTool || Registry.viewManager.tools.Connection;
            if (key === "channelRadius") {
                if (tool) {
                    tool.updateParameter("channelWidth", this.snapshot.channelWidth);
                    tool.updateParameter("height", this.snapshot.height);
                }
            } else if (tool) {
                tool.updateParameter(key, Number(value));
            }
            if (key === "channelWidth" || key === "height" || key === "channelRadius") {
                this.$forceUpdate();
            }
        },

        computedSpec: function(threeduftype) {
            const definition = ComponentAPI.getDefinition(threeduftype);
            const spec = [];
            for (const key in definition.heritable) {
                const item = {
                    mint: key,
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: definition.defaults[key],
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10,
                    name: key
                };
                spec.push(item);
            }
            return spec;
        },
        toggleConnectionTool() {
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
            if (this.isPlacementRowActive) {
                Registry.viewManager.resetToDefaultTool();
                this.activeTool = null;
                EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
                return;
            }
            Registry.viewManager.deactivateComponentPlacementTool();
            EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: SIDEBAR_CONNECTION_ID });
            this.startConnection();
            this.activeTool = Registry.viewManager.tools.Connection;
        },
        toggleSettingsDrawer() {
            if (this.isSettingsRowOpen) {
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
                return;
            }
            // 1) Connection settings row first
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: SIDEBAR_CONNECTION_ID });

            // 2) Clear all placement / other main buttons
            this.$nextTick(() => {
                EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
                Registry.viewManager.deactivateComponentPlacementTool();

                // 3) Connection main button + tool
                this.$nextTick(() => {
                    EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: SIDEBAR_CONNECTION_ID });
                    this.startConnection();
                    this.activeTool = Registry.viewManager.tools.Connection;
                });
            });
        },
        attachSettingsDrawerToApp() {
            const attachPoint = document.querySelector("[data-app]");
            if (!attachPoint || !this.$refs.drawer) {
                return;
            }
            this.setDrawerPosition();
            attachPoint.appendChild(this.$refs.drawer);
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.isSettingsRowOpen) return;
            if (!this.$refs.activator || !this.$refs.drawer) return;
            if (this.isManualDrawerPosition) return;
            const anchorBtn = this.$refs.settingsActivator || this.$refs.activator;
            const bounds = anchorBtn.$el.getBoundingClientRect();
            const drawerEl = this.$refs.drawer;
            const rect =
                drawerEl && typeof drawerEl.getBoundingClientRect === "function"
                    ? drawerEl.getBoundingClientRect()
                    : null;
            const width = rect ? rect.width : 720;
            const pad = 12;
            const gap = 8;
            let left = bounds.right + gap;
            if (left + width + pad > window.innerWidth) {
                left = Math.max(pad, window.innerWidth - width - pad);
            }
            this.drawerLeft = Math.max(pad, left);
            this.drawerTop = Math.max(pad, bounds.top);
        },
        closeConnectionSettingsPanel() {
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
        },
        resetConnectionDefaults() {
            const obj = ComponentAPI.library.Connection && ComponentAPI.library.Connection.object;
            if (obj && typeof obj.resetToFactoryParameterDefaults === "function") {
                obj.resetToFactoryParameterDefaults();
            }
            this.initSnapshotFromSpec();
            this.rebuildSettingsSpec();
            const tool =
                this.activeTool ||
                (Registry.viewManager && Registry.viewManager.tools && Registry.viewManager.tools.Connection);
            if (!tool || typeof tool.updateParameter !== "function") return;
            tool.updateParameter("connectionSpacing", this.snapshot.connectionSpacing);
            tool.updateParameter("channelWidth", this.snapshot.channelWidth);
            tool.updateParameter("height", this.snapshot.height);
            this.selectedProfile = this.connectionProfiles[0] || "CHANNEL";
            tool.crossSection = 0;
            tool.updateParameter("crossSection", 0);
            this.$forceUpdate();
        },
        startConnection() {
            Registry.viewManager.activateTool("Connection", "Connection");
        },
        endConnection: function() {
            // Reserved for canvas / tool coordination
        }
    }
};
</script>

<style lang="scss" scoped>
.property-drawer-parent {
    overflow: visible;
    position: relative;
}

.property-drawer-row {
    display: flex;
    align-items: stretch;
    width: 100%;
    gap: 6px;
}

.component-tool-btn-main {
    flex: 1 1 auto;
    min-width: 0;
}

.settings-gear-btn {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    min-width: 40px !important;
    margin-top: 4px;
    margin-bottom: 4px;
    border-radius: 0 !important;
    box-shadow: none !important;
    background-color: #ffffff !important;
    border: none !important;
}

.settings-gear-btn .settings-gear-icon {
    color: #757575 !important;
}

.settings-gear-btn--open {
    background-color: #757575 !important;
}

.settings-gear-btn--open .settings-gear-icon {
    color: #ffffff !important;
}

.connection-settings-hint {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.settings-panel-card {
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

.settings-panel-body {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.settings-section-label {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
    color: rgba(0, 0, 0, 0.6);
}

.settings-panel-card ::v-deep .v-alert {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.settings-panel-card ::v-deep .v-select .v-label,
.settings-panel-card ::v-deep .v-select .v-select__selection {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.connection-settings-params-col {
    flex-grow: 0;
    flex-shrink: 0;
}

.connection-settings-property-wrap {
    max-width: 420px;
}

.connection-settings-preview-col {
    flex: 1 1 100%;
    min-width: 0;
}

/* Original md=7 ≈ 58.33% row; preview column ×4/5. Diagram SVG remains max 280px. */
@media (min-width: 960px) {
    .connection-settings-preview-col {
        flex: 0 0 calc(58.3333333333% * 0.8) !important;
        max-width: calc(58.3333333333% * 0.8) !important;
    }
}

.connection-property-drawer {
    position: absolute;
    float: left;
    width: 720px;
    max-width: calc(100vw - 40px);
    left: 225px;
    top: 10px;
    z-index: 100;
    overflow: visible;

    ::v-deep .v-messages {
        display: none;
    }

    td {
        padding: 4px;
    }

    ::v-deep .v-input__slot {
        margin: 12px 0;
    }

    ::v-deep .v-text-field {
        padding-top: 0;
    }

    ::v-deep .v-text-field__details {
        display: none;
    }

    .connection-profile {
        margin-top: 10px;
        margin-left: 20px;
        text-align: center;
    }
}

.cross-section-frame {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
    padding: 12px;
}

.cross-section-diagram {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 158px;
}

.cross-section-diagram-shift {
    transform: translate(0, -10px);
}

.param-svg-name {
    font-size: 0.875rem;
    font-family: Roboto, sans-serif;
    font-weight: 500;
    letter-spacing: 0.0892857143em;
    fill: #1976d2;
}

.param-svg-name--center {
    text-anchor: middle;
}

.param-svg-name--flow {
    fill: #1976d2;
}

.param-svg-name--control {
    fill: #e53935;
}

/* Match Vuetify “primary” (selected component button) blue */
.cross-section-shape {
    fill: #bbdefb;
    stroke: #1976d2;
    stroke-width: 2;
}

.cross-section-dim-line {
    stroke-width: 1.75;
    fill: none;
}

.cross-section-dim-line--flow {
    stroke: #1976d2;
}

.cross-section-dim-line--control {
    stroke: #e53935;
}

.cross-section-arrow {
    stroke: none;
}

.cross-section-arrow--flow {
    fill: #1976d2;
}

.cross-section-arrow--control {
    fill: #e53935;
}

.cross-section-svg {
    width: 100%;
    max-width: 280px;
    height: auto;
    display: block;
}

#dropdown {
    margin-top: 10px;
}

.image-placeholder {
    margin-left: 35px;
    margin-top: 10px;
}
</style>
