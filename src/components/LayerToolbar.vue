<template>
  <v-card elevation="0">
    <v-card-title class="py-2">
      <span>Layers</span>
      <v-btn icon small fab color="primary" @click="addLayer"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-title>

    <v-card-text class="px-1">
        <div v-for="layer in layers" :key="layer.id" class="my-1 mx-3">
            <v-btn icon small @click="deleteLayer(layer)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>

            <v-btn-toggle
              v-model="layer.mode"
              mandatory
              tile
            >

              <v-btn small 
                :color="getButtonColor(layer, 0)"
                @click="layerModeClicked(layer, 0)"
              >
                <span>Flow</span>
              </v-btn>

              <v-btn small 
                :color="getButtonColor(layer, 1)"
                @click="layerModeClicked(layer, 1)"
              >
                <span>Control</span>
              </v-btn>
            </v-btn-toggle>
          </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
    name: "ComponentToolbar",
    data() {
        return {
          layers: [],
          selectedLayer: 0,
          selectedMode: 0,
          disabled: false
        };
    },
    mounted() {
      this.addLayer()
    },
    methods: {
      addLayer(){
        let layer =  {
          id: this.layers.length,
          mode: 0
        }
        this.selectedLayer = layer.id
        this.layers.push(layer)
      },

      layerModeClicked(layer) {
        this.selectedLayer = layer.id
      },

      deleteLayer(layer) {
        let idx = this.layers.findIndex(l => l.id == layer.id)
        if(idx > -1) this.layers.splice(idx, 1)
      },

      getButtonColor(layer, buttonMode) {
        if(layer.id != this.selectedLayer) return ""
        if(layer.id == this.selectedLayer && layer.mode == buttonMode){
          if(buttonMode == 0) return "blue white--text"
          else return "red white--text"
        }
       return "" 
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