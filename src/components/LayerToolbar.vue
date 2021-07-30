<template>
    <v-card elevation="0">
        <v-card-title class="py-2">
            <span>Levels</span>
            <v-btn icon small fab color="primary" @click="addLevel">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-card-title>

        <v-card-text class="px-1">
            <div v-for="level in levels" :key="level.id" class="my-1 mx-3">
                <v-btn icon small @click="deleteLevel(level)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>

                <v-btn-toggle :v-model="level.mode" mandatory tile borderless>
                    <v-btn small :color="getButtonColor(level, 0)" @click="layerModeClicked(level, 0)">
                        <span>Flow</span>
                    </v-btn>
                    <v-btn small :color="getButtonColor(level, 1)" @click="layerModeClicked(level, 1)">
                        <span>Ctrl</span>
                    </v-btn>
                    <v-btn small :color="getButtonColor(level, 2)" @click="layerModeClicked(level, 2)">
                        <span>Int</span>
                    </v-btn>
                </v-btn-toggle>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import Registry from "@/app/core/registry";
export default {
    name: "LayerToolbar",
    data() {
        return {
            selectedMode: 0,
            disabled: false,
            renderLayers: [],
            layers: []
        };
    },
    computed: {
        levels: function() {
            let ret = [];
            for (let i in this.layers) {
                if (i % 3 == 0) {
                    ret.push({
                        id: i / 3,
                        mode: 0
                    });
                }
            }
            return ret;
        },
        selectedLevel: function() {
            let layer = Registry.viewManager.activeRenderLayer;
            let remain = layer % 3;
            layer = layer - remain;

            return layer / 3;
        }
    },
    mounted() {
        // Load what layers are there in the device
        setTimeout(() => {
            this.layers = Registry.currentDevice.layers;
        }, 1000);
    },
    methods: {
        addLevel() {
            Registry.viewManager.createNewLayerBlock();
        },

        layerModeClicked(level, mode) {
            this.levels[level.id].mode = mode;
            this.selectedLevel = level.id;
            Registry.viewManager.setActiveRenderLayer(level.id * 3 + mode);
        },

        deleteLevel(level) {
            Registry.viewManager.deleteLayerBlock(level.id);
        },

        getButtonColor(level, buttonMode) {
            if (level.id != this.selectedLevel) return "";
            if (level.id == this.selectedLevel && level.mode == buttonMode) {
                if (buttonMode == 0) return "blue white--text";
                if (buttonMode == 1) return "red white--text";
                else return "green white--text";
            }
            return "";
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
