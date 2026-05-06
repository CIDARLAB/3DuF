<template>
    <div>
        <v-divider />
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Features</span>
            </v-card-title>
            <v-card-text class="px-1">
                <ConnectionPropertyDrawer
                    :active-sidebar-mint="activeSidebarMint"
                    :active-settings-mint="activeSettingsMint"
                />
                <PropertyDrawer
                    mint="ALIGNMENT MARKS"
                    :spec="alignmentMarksSpec"
                    :active-sidebar-mint="activeSidebarMint"
                    :active-settings-mint="activeSettingsMint"
                />
            </v-card-text>
        </v-card>
        <v-divider />
        <v-card v-for="key in toolCategoryOrder" :key="key" elevation="0">
            <v-card-title class="py-2">
                <span>{{ key }}</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer
                    v-for="mint in toolTree[key]"
                    :key="mint"
                    :mint="mint"
                    :active-sidebar-mint="activeSidebarMint"
                    :active-settings-mint="activeSettingsMint"
                />
            </v-card-text>
            <v-divider />
        </v-card>
    </div>
</template>

<script>
import { ComponentAPI } from "@/componentAPI.ts";
import PropertyDrawer from "@/components/base/PropertyDrawer.vue";
import ConnectionPropertyDrawer from "@/components/ConnectionPropertyDrawer.vue";
import Registry from "@/app/core/registry";
import EventBus from "@/events/events";

export default {
    name: "ComponentToolBar",
    components: { ConnectionPropertyDrawer, PropertyDrawer },
    data() {
        return {
            /** Which sidebar placement row is active (MINT string or Connection id). Empty = none. */
            activeSidebarMint: "",
            /** Which row has the settings (gear) detail panel open. Empty = none. */
            activeSettingsMint: "",
            toolCategoryOrder: ["Distribute", "Control", "Mix", "Storage", "Process", "Droplet"],
            toolTree: {
                Mix: ["MIXER", "MIXER3D", "TOROIDAL MIXER", "GRADIENT GENERATOR", "CURVED MIXER", "ROTARY MIXER"],
                Control: ["VALVE3D", "VALVE", "PUMP3D", "PUMP"],
                Storage: ["LONG CELL TRAP", "SQUARE CELL TRAP", "REACTION CHAMBER", "DIAMOND REACTION CHAMBER", "TERRACE"],
                Process: ["LL CHAMBER", "FILTER", "DOGBONE INSERT", "LOGIC ARRAY", "DROPLET SORTER"],
                Distribute: ["PORT", "VIA", "YTREE", "TREE", "MUX", "TRANSPOSER", "MUX3D"],
                Droplet: ["NOZZLE DROPLET GENERATOR", "DROPLET CAPACITANCE SENSOR", "DROPLET MERGER", "PICOINJECTOR", "DROPLET SPLITTER", "DROPLET GENERATOR FLOW FOCUS"]
            },
            alignmentMarksSpec: this.computedSpec("AlignmentMarks")
        };
    },
    mounted() {
        this._onSidebarPlacement = payload => {
            const m = payload && payload.mint;
            this.activeSidebarMint = m == null ? "" : String(m);
        };
        this._onSidebarSettings = payload => {
            const m = payload && payload.mint;
            this.activeSettingsMint = m == null ? "" : String(m);
        };
        this._onCloseAllToolbar = () => {
            this.activeSidebarMint = "";
            this.activeSettingsMint = "";
        };
        EventBus.get().on(EventBus.SIDEBAR_COMPONENT_ACTIVATED, this._onSidebarPlacement);
        EventBus.get().on(EventBus.SIDEBAR_SETTINGS_OPENED, this._onSidebarSettings);
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllToolbar);
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.SIDEBAR_COMPONENT_ACTIVATED, this._onSidebarPlacement);
        EventBus.get().off(EventBus.SIDEBAR_SETTINGS_OPENED, this._onSidebarSettings);
        EventBus.get().off(EventBus.CLOSE_ALL_WINDOWS, this._onCloseAllToolbar);
    },
    methods: {
        activateTool: function(tool) {
            console.log(tool);
            Registry.viewManager.activateTool(tool);
        },
        getEntry: function(mint) {
            return {
                mint: mint,
                spec: this.computedSpecForMINT(mint)
            };
        },
        computedSpec: function(threeduftype) {
            let definition = ComponentAPI.getDefinition(threeduftype);
            let spec = [];
            for (let key in definition.heritable) {
                let item = {
                    mint: key,
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
.md-content {
    width: 75px;
    height: 200px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
</style>
