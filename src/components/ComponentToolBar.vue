<template>
    <div>
        <v-divider />
        <!-- feature  -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Feature</span>
            </v-card-title>
            <v-card-text class="px-1">
                <ConnectionPropertyDrawer />
                <PropertyDrawer title="Channel" :spec="channelSpec" />
                <PropertyDrawer title="Rounded Channel" :spec="roundedChannelSpec" />
                <PropertyDrawer title="Transition" :spec="transitionSpec" />
                <PropertyDrawer title="Alignment Marks" :spec="alignmentMarksSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Mix -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Mix</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer title="Mixer" :spec="mixSpec" />
                <PropertyDrawer title="3D Mixer" :spec="mix3DSpec" />
                <PropertyDrawer title="Gradient Gen" :spec="gradientGenSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Control -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Mix</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer title="Valve3D" :spec="valve3DSpec" />
                <PropertyDrawer title="Value" :spec="valveSpec" />
                <PropertyDrawer title="Pump3D" :spec="pump3DSpec" />
                <PropertyDrawer title="Pump" :spec="pumpSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Process -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Process</span> 
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer title="LL Chamber" :spec="llChamberSpec" />
                <PropertyDrawer title="Cell Trap" :spec="cellTrapSpec" />
                <PropertyDrawer title="DiamondChamber" :spec="diamondChamberSpec" />
                <PropertyDrawer title="Chamber" :spec="chamberSpec" />
                <PropertyDrawer title="Droplet Gen" :spec="dropletGenSpec" />
            </v-card-text>
        </v-card>

        <v-divider />
        <!-- Distribute -->
        <v-card elevation="0">
            <v-card-title class="py-2">
                <span>Distribute</span>
            </v-card-title>
            <v-card-text class="px-1">
                <PropertyDrawer title="Port" :spec="portSpec" />
                <PropertyDrawer title="Via" :spec="viaSpec" />
                <PropertyDrawer title="Y-Tree" :spec="yTreeSpec" />
                <PropertyDrawer title="Mux" :spec="muxSpec" />
                <PropertyDrawer title="Transponder" :spec="transponderSpec" />
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import ComponentAPI from "@/componentAPI.ts";
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
        computedSpec: function(minttype) {
            // Get the corresponding the definitions object from the componentAPI, convert to a spec object and return
            let definition = ComponentAPI.getDefinitionForMINT(minttype);
            let spec = [];
            for (let key in definition.unique){
                let item = {
                    name: key,
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    default: definition.default[key],
                    mint: definition.mint,
                }
                spec.push(item);
            }
            return spec;
        }
    },
    updated() {
        Registry.viewManager.activateTool(spec.name, spec.name);
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
