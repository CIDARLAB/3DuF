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
                <v-btn :disabled="level.id === 0" icon small @click="deleteLevel(level)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>

                <v-btn-toggle tile borderless>
                    <v-btn
                        small
                        depressed
                        :color="getButtonColor(level, 0)"
                        :class="getButtonTextClass(level, 0)"
                        @click="layerModeClicked(level, 0)"
                    >
                        <span>FLOW</span>
                    </v-btn>
                    <v-btn
                        small
                        depressed
                        :color="getButtonColor(level, 1)"
                        :class="getButtonTextClass(level, 1)"
                        @click="layerModeClicked(level, 1)"
                    >
                        <span>CTRL</span>
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
            layers: [],
            levels: [],
            toggleMode: [0],
            /** Mirrors ViewManager so computed styles stay reactive in Vue. */
            toolbarActiveLayerIndex: 0
        };
    },
    computed: {
        // levels: function() {
        //     let ret = [];
        //     for (let i in this.layers) {
        //         if (i % 3 == 0) {
        //             ret.push({
        //                 id: i / 3,
        //                 mode: 0
        //             });
        //         }
        //     }
        //     return ret;
        // },
        selectedLevel: function() {
            const layer = this.toolbarActiveLayerIndex;
            const remain = layer % 3;
            return (layer - remain) / 3;
        }
    },
    watch: {
        layers: {
            handler: function(newLayers) {
                console.log("layers changed", newLayers);
                this.rebuildLevelsFromLayers(newLayers);
            },
        },
    },
    mounted() {
        this._onDeviceLoaded = () => {
            if (!Registry.currentDevice) return;
            this.layers = Registry.currentDevice.layers;
            this.syncToolbarActiveIndex();
            this.rebuildLevelsFromLayers(this.layers);
        };
        window.addEventListener("threeduf-device-loaded", this._onDeviceLoaded);
        setTimeout(this._onDeviceLoaded, 1000);
    },
    beforeDestroy() {
        if (this._onDeviceLoaded) {
            window.removeEventListener("threeduf-device-loaded", this._onDeviceLoaded);
        }
    },
    methods: {
        syncToolbarActiveIndex() {
            let idx = Registry.viewManager.activeRenderLayerIndex;
            if (idx % 3 === 2) {
                idx = Math.floor(idx / 3) * 3;
                Registry.viewManager.setActiveRenderLayer(idx);
            }
            this.toolbarActiveLayerIndex = idx;
        },

        rebuildLevelsFromLayers(newLayers) {
            this.syncToolbarActiveIndex();
            const list = Array.isArray(newLayers) ? newLayers : [];
            const seen = [];
            const seenSet = new Set();
            list.forEach((layer) => {
                const g = String(layer && layer.group != null ? layer.group : "0");
                if (seenSet.has(g)) return;
                seenSet.add(g);
                seen.push(g);
            });
            seen.sort((a, b) => Number(a) - Number(b));
            const activeIdx = this.toolbarActiveLayerIndex;
            const activeLevel = Math.floor(activeIdx / 3);
            let subMode = activeIdx % 3;
            if (subMode === 2) {
                subMode = 0;
            }
            this.levels = seen.map((g) => {
                const id = Number(g);
                return {
                    id: Number.isFinite(id) ? id : 0,
                    mode: id === activeLevel ? subMode : null
                };
            });
        },

        addLevel() {
            Registry.viewManager.createNewLayerBlock();
            this.layers = Registry.currentDevice.layers;
            this.rebuildLevelsFromLayers(this.layers);
        },

        layerModeClicked(level, mode) {
            for(let i in this.levels) {
                if (this.levels[i].id == level.id) {
                    this.levels[i].mode = mode;
                }else{
                    this.levels[i].mode = null;
                }
            }
            this.levels[level.id].mode = mode;
            Registry.viewManager.setActiveRenderLayer(level.id * 3 + mode);
            this.toolbarActiveLayerIndex = level.id * 3 + mode;
        },

        deleteLevel(level) {
            Registry.viewManager.deleteLayerBlock(level.id);
            this.layers = Registry.currentDevice.layers;
            this.rebuildLevelsFromLayers(this.layers);
        },

        getButtonColor(level, buttonMode) {
            const idx = this.toolbarActiveLayerIndex;
            const levelIdx = Math.floor(idx / 3);
            let sub = idx % 3;
            if (sub === 2) {
                sub = 0;
            }
            if (level.id !== levelIdx) {
                return "grey lighten-2";
            }
            if (sub === buttonMode) {
                return buttonMode === 0 ? "blue" : "red";
            }
            return "grey lighten-2";
        },

        getButtonTextClass(level, buttonMode) {
            const idx = this.toolbarActiveLayerIndex;
            const levelIdx = Math.floor(idx / 3);
            let sub = idx % 3;
            if (sub === 2) {
                sub = 0;
            }
            if (level.id === levelIdx && sub === buttonMode) {
                return "white--text";
            }
            return "grey--text text--darken-2";
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

.layerbutton-flow{
    background-color: blue;
    color: white;
}

.layerbutton-control{

}

.layerbutton-integration{

}
</style>
