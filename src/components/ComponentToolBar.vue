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
                <ConnectionPropertyDrawer />
                <PropertyDrawer mint="Channel" :spec="channelSpec" />
                <PropertyDrawer mint="Rounded Channel" :spec="roundedChannelSpec" />
                <PropertyDrawer mint="Transition" :spec="transitionSpec" />
                <PropertyDrawer mint="Alignment Marks" :spec="alignmentMarksSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Mix -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Mix</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer mint="MIXER" :spec="testSpec" />
                <PropertyDrawer mint="3D Mixer" :spec="mix3DSpec" />
                <PropertyDrawer mint="Gradient Gen" :spec="gradientGenSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Control -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Mix</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer mint="Valve3D" :spec="valve3DSpec" />
                <PropertyDrawer mint="Value" :spec="valveSpec" />
                <PropertyDrawer mint="Pump3D" :spec="pump3DSpec" />
                <PropertyDrawer mint="Pump" :spec="pumpSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Process -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Process</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer mint="LL Chamber" :spec="llChamberSpec" />
                <PropertyDrawer mint="Cell Trap" :spec="cellTrapSpec" />
                <PropertyDrawer mint="DiamondChamber" :spec="diamondChamberSpec" />
                <PropertyDrawer mint="Chamber" :spec="chamberSpec" />
                <PropertyDrawer mint="Droplet Gen" :spec="dropletGenSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Distribute -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Distribute</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer mint="Port" :spec="portSpec" />
                <PropertyDrawer mint="Via" :spec="viaSpec" />
                <PropertyDrawer mint="Y-Tree" :spec="yTreeSpec" />
                <PropertyDrawer mint="Mux" :spec="muxSpec" />
                <PropertyDrawer mint="Transponder" :spec="transponderSpec" />
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { ComponentAPI } from "@/componentAPI.ts";
import ConnectionSpec from "@/models/property-drawer/ConnectionSpec.js";
import ChannelSpec from "@/models/property-drawer/ChannelSpec.js";
import RoundedChannelSpec from "@/models/property-drawer/RoundedChannelSpec.js";
import TransitionSpec from "@/models/property-drawer/TransitionSpec.js";
// import AlignmentMarksSpec from "@/models/property-drawer/AlignmentMarksSpec.js";
import PropertyDrawer from "@/components/base/PropertyDrawer.vue";
import ConnectionPropertyDrawer from "@/components/ConnectionPropertyDrawer.vue";
import MixSpec from "@/models/property-drawer/MixSpec.js";
import Mix3DSpec from "@/models/property-drawer/Mix3DSpec.js";
import GradientGenSpec from "@/models/property-drawer/GradientGenSpec.js";
import Valve3DSpec from "@/models/property-drawer/Valve3DSpec.js";
import ValveSpec from "@/models/property-drawer/ValveSpec.js";
import Pump3DSpec from "@/models/property-drawer/Pump3DSpec.js";
import PumpSpec from "@/models/property-drawer/PumpSpec.js";
import LLChamberSpec from "@/models/property-drawer/LLChamberSpec.js";
import Registry from "@/app/core/registry";
import he from "he";

// import CellTrapSpec from "@/models/property-drawer/CellTrapSpec.js";
// import DiamondChamberSpec from "@/models/property-drawer/DiamondChamberSpec.js";
// import ChamberSpec from "@/models/property-drawer/ChamberSpec.js";
// import DropletGenSpec from "@/models/property-drawer/DropletGenSpec.js";
// import PortSpec from "@/models/property-drawer/PortSpec.js";
// import ViaSpec from "@/models/property-drawer/ViaSpec.js";
// import YTreeSpec from "@/models/property-drawer/YTreeSpec.js";
// import MuxSpec from "@/models/property-drawer/MuxSpec.js";
// import TransponderSpec from "@/models/property-drawer/TransponderSpec.js";

export default {
    components: { ConnectionPropertyDrawer, PropertyDrawer },
    data() {
        return {
            connectionSpec: ConnectionSpec,
            channelSpec: MixSpec,
            roundedChannelSpec: MixSpec,
            transitionSpec: MixSpec,
            alignmentMarksSpec: MixSpec,
            mixSpec: MixSpec,
            mix3DSpec: MixSpec,
            gradientGenSpec: MixSpec,
            valve3DSpec: MixSpec,
            valveSpec: MixSpec,
            pump3DSpec: MixSpec,
            pumpSpec: MixSpec,
            llChamberSpec: MixSpec,
            cellTrapSpec: MixSpec,
            diamondChamberSpec: MixSpec,
            chamberSpec: MixSpec,
            dropletGenSpec: MixSpec,
            portSpec: MixSpec,
            viaSpec: MixSpec,
            yTreeSpec: MixSpec,
            muxSpec: MixSpec,
            transponderSpec: MixSpec
        };
    },
    computed: {
        testSpec: function() {
            return this.computedSpec("MIXER");
        }
    },
    methods: {
        activateTool: function(tool) {
            console.log(tool);
            Registry.viewManager.activateTool(tool);
        },
        computedSpec: function(minttype) {
            // Get the corresponding the definitions object from the componentAPI, convert to a spec object and return
            let definition = ComponentAPI.getDefinitionForMINT(minttype);
            let spec = [];
            for (let key in definition.heritable) {
                console.log(definition.units[key]);
                // const unittext = definition.units[key] !== "" ? he.htmlDecode(definition.units[key]) : "";
                let item = {
                    name: key,
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: definition.defaults[key],
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10
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
