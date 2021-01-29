<template>
    <div class="property-drawer-parent">
        <v-btn @click="showProperties()">{{ title }}</v-btn>
        <v-card v-if="activated" class="property-drawer">
            <v-card-title>{{ title }}</v-card-title>
            <v-card-text>
                <v-simple-table>
                    <thead>
                        <tr>
                            <th class="text-left">Control</th>
                        </tr>
                        <tr>
                            <th class="text-left">Key</th>
                        </tr>
                        <tr>
                            <th class="text-left">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="param in spec" :key="param.key">
                            <th>Control</th>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                    </tbody>
                </v-simple-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: "PropertyDrawer",
    props: {
        title: {
            type: String,
            required: true
        },
        spec: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            activated: false
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? "primary white--text" : "", "mb-2", "feature-button", "button-row"];
        }
    },
    methods: {
        showProperties() {
            this.activated = !this.activated;
        }
    }
};
</script>

<style lang="scss" scoped>
.property-drawer-parent {
    overflow: visible;
    position: relative;
}

.property-drawer {
    position: absolute;
    float: left;
    left: 200px;
    z-index: 100;
}
</style>