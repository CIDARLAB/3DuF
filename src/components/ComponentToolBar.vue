<template>
    <div>
        <v-divider />
        <!-- feature  -->
        <v-card elevation="0">
            <v-card-text class="px-1">
                <ConnectionPropertyDrawer />
            </v-card-text>
            <v-card-title class="py-2">
                <span>Features</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer mint="Channel" :spec="channelSpec" />
                <PropertyDrawer mint="Rounded Channel" :spec="roundedChannelSpec" />
                <PropertyDrawer mint="Transition" :spec="transitionSpec" />
                <PropertyDrawer mint="Alignment Marks" :spec="alignmentMarksSpec" />
            </v-card-text>
        </v-card>
        <v-card v-for="key in Object.keys(toolTree)" :key="key" elevation="0">
            <v-card-title class="py-2">
                <span>{{ key }}</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer v-for="mint in toolTree[key]" :key="mint" :mint="mint" />
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
import he from "he";

export default {
    components: { ConnectionPropertyDrawer, PropertyDrawer },
    data() {
        return {
            toolTree: {
                Mix: ["MIXER", "MIXER3D", "GRADIENT GENERATOR", "CURVED MIXER", "ROTARY MIXER"],
                Control: ["VALVE3D", "VALVE", "PUMP3D", "PUMP"],
                Storage: ["LONG CELL TRAP", "SQUARE CELL TRAP", "REACTION CHAMBER", "DIAMOND REACTION CHAMBER"],
                Process: ["LL CHAMBER", "FILTER"],
                Distribute: ["PORT", "VIA", "YTREE", "TREE", "MUX", "TRANSPOSER", "MUX3D"],
                Droplet: ["NOZZLE DROPLET GENERATOR", "DROPLET CAPACITANCE SENSOR", "DROPLET MERGER", "PICOINJECTOR", "DROPLET SPLITTER"]
            },
            connectionSpec: this.computedSpec("Connection"),
            channelSpec: this.computedSpec("Channel"),
            roundedChannelSpec: this.computedSpec("RoundedChannel"),
            transitionSpec: this.computedSpec("Transition"),
            alignmentMarksSpec: this.computedSpec("AlignmentMarks")
        };
    },
    methods: {
        activateTool: function (tool) {
            console.log(tool);
            Registry.viewManager.activateTool(tool);
        },
        getEntry: function (mint) {
            return {
                mint: mint,
                spec: this.computedSpecForMINT(mint)
            };
        },
        computedSpec: function (threeduftype) {
            // Get the corresponding the definitions object from the componentAPI, convert to a spec object and return
            let definition = ComponentAPI.getDefinition(threeduftype);
            let spec = [];
            for (let key in definition.heritable) {
                console.log(definition.units[key]);
                // const unittext = definition.units[key] !== "" ? he.htmlDecode(definition.units[key]) : "";
                let item = {
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
