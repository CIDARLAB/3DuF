<template>
    <div class="property-drawer-parent">
        <v-btn ref="activator" :class="buttonClasses" @click="showProperties()">{{ title }}</v-btn>
        <div ref="drawer" class="property-drawer">
            <v-card v-if="activated">
                <v-card-title class="subtitle-1 pb-0">{{ title }}</v-card-title>
                <v-card-text>
                    <v-simple-table dense fixed-header>
                        <template>
                            <thead>
                                <tr>
                                    <th>Control</th>
                                    <th>Key</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in spec" :key="item.key">
                                    <td width="200px">
                                        <v-slider v-model="item.value" :step="item.step" :max="item.max" :min="item.min"></v-slider>
                                    </td>
                                    <td>
                                        <code>{{ item.name }}</code>
                                    </td>
                                    <td width="125px">
                                        <v-text-field v-model="item.value" :step="item.step" type="number" :suffix="item.units"> </v-text-field>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import EventBus from "@/events/events";

export default {
    name: "PropertyDrawer",
    props: {
        title: {
            type: String,
            required: true
        },
        spec: {
            type: Object,
            required: true,
            validator: spec => {
                if (!Array.isArray(spec)) {
                    console.error("PropertyDrawer: Spec is not an array, unable to validate");
                    return "danger";
                }

                spec.forEach(item => {
                    ["min", "max", "key", "units", "value"].forEach(key => {
                        if (!Object.hasOwnProperty.call(item, key)) {
                            console.error("Missing key " + key + " from item", item);
                            return "danger";
                        }
                    });
                });

                return "success";
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
        }
    },
    data() {
        return {
            activated: false
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "mx-auto", "my-1", "btn"];
        }
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
    },
    methods: {
        showProperties() {
            this.activated = !this.activated;
            let attachPoint = document.querySelector("[data-app]");

            if (!attachPoint) {
                console.error("Could not find [data-app] element");
            }

            this.setDrawerPosition();

            attachPoint.appendChild(this.$refs.drawer);
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
            this.$refs.drawer.style.top = bounds.bottom - bounds.height + "px";
        }
    }
};
</script>

<style lang="scss" scoped>
.property-drawer-parent {
    overflow: visible;
    position: relative;
}

.btn {
    width: 100%;
}

.property-drawer {
    position: absolute;
    float: left;
    width: 500px;
    left: 225px;
    z-index: 100;

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
}
</style>