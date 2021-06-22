<template>
    <div class="property-drawer-parent">
        <v-btn ref="activator" :class="buttonClasses" @click="showProperties()">{{ title }}</v-btn>
        <div ref="drawer" class="connection-property-drawer">
            <v-card v-if="activated">
                <v-row>
                    <v-col>
                        <v-row>
                            <v-card-title class="subtitle-1 pb-0">{{ title }}</v-card-title>
                            <v-icon size="20px" class="pencil">mdi-pencil</v-icon>
                            <div class="d-inline">Right Click to End Connection</div>
                        </v-row>
                        <v-row>
                            <v-card-text>
                                <v-simple-table dense fixed-header class="table">
                                    <template>
                                        <thead>
                                            <tr>
                                                <th>Adjust</th>
                                                <th>Parameter</th>
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
                        </v-row>
                    </v-col>
                    <v-divider vertical inset></v-divider>
                    <v-col>
                        <v-card-text>
                            <v-row no-gutters>
                                <v-col cols="2">Source:</v-col>
                                <v-col cols="5"
                                    ><v-chip v-if="chip1" close color="green" text-color="white" closable @click:close="chip1 = false">{{ component }}</v-chip></v-col
                                >
                            </v-row>
                            <v-row no-gutters>
                                <v-col cols="2">Sinks:</v-col>
                                <v-col cols="5"
                                    ><v-chip v-if="chip2" close color="green" text-color="white" @click:close="chip2 = false">{{ component }}</v-chip></v-col
                                >
                                <v-col cols="5"
                                    ><v-chip v-if="chip3" close color="green" text-color="white" @click:close="chip3 = false">{{ component }}</v-chip></v-col
                                >
                            </v-row>
                            <v-row no-gutters>
                                <v-col cols="2"></v-col>
                                <v-col cols="5"
                                    ><v-chip v-if="chip4" close color="green" text-color="white" @click:close="chip4 = false">{{ component }}</v-chip></v-col
                                >
                            </v-row>
                        </v-card-text>
                    </v-col>
                    <v-divider vertical inset></v-divider>
                    <v-col cols="3">
                        <v-row no-gutters>
                            <v-col cols="3" class="connection-profile">Connection Profile</v-col>
                            <v-col cols="1"></v-col>
                            <v-col cols="5">
                                <v-menu offset-y>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn id="dropdown" color="orange" class="white--text" v-bind="attrs" v-on="on">DROPDOWN</v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item v-for="(item, index) in items" :key="index">
                                            <v-list-item-title>{{ item.title }}</v-list-item-title></v-list-item
                                        >
                                    </v-list>
                                </v-menu>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-img
                                lazy-src="https://picsum.photos/id/11/10/6"
                                max-height="200"
                                max-width="220"
                                src="https://picsum.photos/id/11/500/300"
                                class="image-placeholder"
                            ></v-img>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card>
        </div>
    </div>
</template>

<script>
import EventBus from "@/events/events";
import "@mdi/font/css/materialdesignicons.css";
import "vue-select/dist/vue-select.css";
import Vue from "vue";
import vSelect from "vue-select";

Vue.component("v-select", vSelect);

export default {
    name: "ConnectionPropertyDrawer",
    icons: {
        iconfont: "mdi"
    },
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
            component: "Component Name",
            chip1: true,
            chip2: true,
            chip3: true,
            chip4: true,
            activated: false,
            isOpen: false,
            items: [{ title: "Click Me" }, { title: "Click Me" }, { title: "Click Me" }]
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "mx-auto", "my-1", "btn"];
        }
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCROLL_EVENT, this.setDrawerPosition);
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
        },
        openClose() {
            this.isOpen = !this.isOpen;
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

.table {
    width: 480px;
}

.d-inline {
    margin-top: 20px;
    margin-left: 150px;
}

.d-inline:hover {
    cursor: pointer;
}

.subtitle-1 {
    margin-left: 12px;
}

.pencil {
    padding-top: 15px;
    padding-left: 15px;
}

.connection-property-drawer {
    position: absolute;
    float: left;
    width: 1300px;
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

    .connection-profile {
        margin-top: 10px;
        margin-left: 20px;
        text-align: center;
    }
}

#dropdown {
    margin-top: 10px;
}

.image-placeholder {
    margin-left: 35px;
    margin-top: 10px;
}
</style>
