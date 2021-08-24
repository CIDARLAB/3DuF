<template>
    <div class="property-drawer-parent">
        <v-btn ref="activator" :class="buttonClasses" @click="showProperties()">Connection</v-btn>
        <div ref="drawer" class="connection-property-drawer">
            <v-card v-if="activated">
                <v-card-text>
                    <v-row>
                        <v-col>
                            <v-card-text>
                                <v-row>
                                    <v-card-title class="subtitle-1 pb-0">{{ connectionName }}</v-card-title>
                                    <v-icon size="20px" class="pencil" @click="startConnection()">mdi-pencil</v-icon>
                                    <div class="pt-5 pl-16 d-block">{{ current_connection_suggestion }}</div>
                                </v-row>
                                <v-row cols="2">
                                    <!-- Connection properties -->
                                    <PropertyBlock title="Connection" :spec="spec" />
                                </v-row>
                            </v-card-text>
                        </v-col>
                        <v-divider vertical inset></v-divider>
                        <v-col>
                            <v-card-text>
                                <v-row no-gutters>
                                    Source:
                                    <v-col v-for="source in sources" :key="source.name" cols="4">
                                        <v-chip v-if="chip1" small close color="green" text-color="white" closable @click:close="chip1 = false">{{ source.name }}</v-chip>
                                    </v-col>
                                </v-row>
                                <v-row no-gutters>
                                    Sinks:
                                </v-row>
                                <v-row no-gutters>
                                    <v-col v-for="sink in sinks" :key="sink.name" cols="4">
                                        <v-chip v-if="chip2" small close color="green" text-color="white" @click:close="chip2 = false">{{ sink.name }}</v-chip>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-col>
                        <v-divider vertical inset></v-divider>
                        <v-col cols="3">
                            <v-row no-gutters>
                                Connection Profile
                            </v-row>
                            <v-row no-gutters>
                                <v-select v-model="selectedProfile" :items="connectionProfiles"></v-select>
                            </v-row>
                            <v-row>
                                <v-img max-height="150" max-width="150" src="@/assets/technology/CHANNEL.png" class="image-placeholder"></v-img>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import EventBus from "@/events/events";
import Registry from "@/app/core/registry";
import ConnectionTool from "@/app/view/tools/connectionTool.js";
import "@mdi/font/css/materialdesignicons.css";
import "vue-select/dist/vue-select.css";
import Vue from "vue";
import vSelect from "vue-select";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import { ComponentAPI } from "@/componentAPI";

Vue.component("v-select", vSelect);

export default {
    name: "ConnectionPropertyDrawer",
    components: { PropertyBlock },
    icons: {
        iconfont: "mdi"
    },
    data() {
        return {
            connectionName: "NewConnection",
            spec: this.computedSpec("Connection"),
            chip1: true,
            chip2: true,
            sources: [ConnectionTool.source],
            sinks: [ConnectionTool.sinks],
            // sources: [{ name: "source_1" }, { name: "source_2" }],
            // sinks: [{ name: "sink_1" }, { name: "sink_2" }],
            activated: false,
            isOpen: false,
            isEditing: false,
            items: [{ title: "Click Me" }, { title: "Click Me" }, { title: "Click Me" }],
            connection_suggestions: { state1: "Left Click to Choose a Point", state2: "Right Click to End Connection" },
            current_connection_suggestion: "Left Click to Choose a Point",
            connectionProfiles: [],
            selectedProfile: "",
            previews: { CHANNEL: "@/assets/technology/CHANNEL.png" }
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "mx-auto", "my-1", "btn"];
        }
    },
    mounted() {
        // Setup an event for closing all the dialogs
        const ref = this;
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function() {
            ref.activated = false;
        });
        EventBus.get().on(EventBus.RIGHT_CLICK, this.endConnection);
        // Load the connection profiles
        this.connectionProfiles = ComponentAPI.getConnectionTypes();
        this.selectedProfile = this.connectionProfiles[0];
    },
    methods: {
        computedSpec: function(threeduftype) {
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
        },
        showProperties() {
            this.activated = !this.activated;
            let attachPoint = document.querySelector("[data-app]");

            if (!attachPoint) {
                console.error("Could not find [data-app] element");
            }

            this.setDrawerPosition();

            attachPoint.appendChild(this.$refs.drawer);
            if (this.activated) {
                this.startConnection();
            } else {
                this.endConnection();
            }
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
        },
        openClose() {
            this.isOpen = !this.isOpen;
        },
        connectionStatus() {
            this.isEditing = true;
        },
        startConnection() {
            Registry.viewManager.activateTool("Connection", "Connection");
            this.current_connection_suggestion = this.connection_suggestions["state2"];
        },
        endConnection: function() {
            this.current_connection_suggestion = this.connection_suggestions["state1"];
            console.log(this.connection_suggestions["state1"]);
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
    width: 1000px;
    left: 225px;
    top: 10px;
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
