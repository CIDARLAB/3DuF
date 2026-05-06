<template>
    <div class="property-drawer-parent">
        <div ref="settingsAnchor" class="property-drawer-row">
            <v-tooltip bottom max-width="300">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn ref="activator" medium :class="buttonClasses" v-bind="attrs" v-on="on" @click="activateTool()">
                        {{ shortenedMINT }}
                    </v-btn>
                </template>
                <span>{{ mintTooltip }}</span>
            </v-tooltip>
            <v-btn
                icon
                medium
                text
                :ripple="false"
                elevation="0"
                class="settings-gear-btn"
                :class="{ 'settings-gear-btn--open': isSettingsRowOpen }"
                @click.stop="showProperties()"
            >
                <v-icon class="settings-gear-icon">mdi-cog</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
import EventBus from "@/events/events";
import Registry from "@/app/core/registry";
import { ComponentAPI } from "@/componentAPI";
import { getMintTooltip } from "@/constants/mintTooltips";
export default {
    name: "PropertyDrawer",
    props: {
        mint: {
            type: String,
            required: true
        },
        spec: {
            type: Array,
            required: false,
            default: function() {
                return [{ min: 0, max: 110, units: "", value: 0 }];
            }
        },
        activatedColor: {
            type: String,
            required: false,
            default: "primary"
        },
        activatedTextColor: {
            type: String,
            required: false,
            default: "white--text"
        },
        /** Single source of truth from ComponentToolBar — which row shows the primary (blue) placement button. */
        activeSidebarMint: {
            type: String,
            default: ""
        },
        /** Single source of truth — which row has the settings detail panel and grey gear. */
        activeSettingsMint: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            storedSpec: [{ min: 0, max: 110, units: "", value: 0 }],
            activeTool: null
        };
    },
    computed: {
        buttonClasses: function() {
            return [
                this.isPlacementRowActive ? this.activatedColor : "white",
                this.isPlacementRowActive ? this.activatedTextColor : "blue--text",
                "my-1",
                "component-tool-btn-main"
            ];
        },

        isPlacementRowActive: function() {
            return this.activeSidebarMint === this.mint;
        },

        isSettingsRowOpen: function() {
            return this.activeSettingsMint === this.mint;
        },

        shortenedMINT: function() {
            return this.mint.substring(0, 15);
        },

        mintTooltip: function() {
            return getMintTooltip(this.mint);
        }
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCROLL_EVENT, this.emitPlacementSettingsRepositionIfOpen);
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.NAVBAR_SCROLL_EVENT, this.emitPlacementSettingsRepositionIfOpen);
    },
    methods: {
        getPlacementPanelAnchor() {
            const row = this.$refs.settingsAnchor;
            if (!row || typeof row.getBoundingClientRect !== "function") {
                return { left: 240, top: 120 };
            }
            const rect = row.getBoundingClientRect();
            return { left: rect.right, top: rect.top };
        },
        emitPlacementSettingsRepositionIfOpen() {
            if (!this.isSettingsRowOpen) return;
            EventBus.get().emit(EventBus.SIDEBAR_PLACEMENT_SETTINGS_REPOSITION, {
                anchor: this.getPlacementPanelAnchor()
            });
        },
        showProperties() {
            if (this.isSettingsRowOpen) {
                EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
                return;
            }
            this.storedSpec = this.spec;
            this.storedSpec = this.computedSpecForMINT(this.mint);
            const placementPanelAnchor = this.getPlacementPanelAnchor();
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: this.mint, placementPanelAnchor });

            this.$nextTick(() => {
                EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
                Registry.viewManager.deactivateComponentPlacementTool();

                this.$nextTick(() => {
                    EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: this.mint });
                    this.activeTool = Registry.viewManager.activateComponentPlacementTool(this.mint, this.storedSpec);
                });
            });
        },
        enterPlacementMode() {
            Registry.viewManager.deactivateComponentPlacementTool();
            EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: this.mint });
            this.storedSpec = this.spec;
            this.storedSpec = this.computedSpecForMINT(this.mint);
            this.activeTool = Registry.viewManager.activateComponentPlacementTool(this.mint, this.storedSpec);
        },
        activateTool() {
            EventBus.get().emit(EventBus.SIDEBAR_SETTINGS_OPENED, { mint: null });
            if (this.isPlacementRowActive) {
                Registry.viewManager.deactivateComponentPlacementTool();
                this.activeTool = null;
                EventBus.get().emit(EventBus.SIDEBAR_COMPONENT_ACTIVATED, { mint: null });
                return;
            }
            this.enterPlacementMode();
        },
        computedSpecForMINT: function(minttype) {
            const definition = ComponentAPI.getDefinitionForMINT(minttype);
            const spec = [];
            for (const key in definition.heritable) {
                const item = {
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: definition.defaults[key],
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10,
                    step: (definition.maximum[key] - definition.minimum[key]) / 10,
                    name: key
                };
                spec.push(item);
            }
            return spec;
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
</style>
