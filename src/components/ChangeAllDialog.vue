<template>
    <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on, attrs }">
            <v-btn id="context_button_copytoall" color="white indigo--text" depressed v-bind="attrs" v-on="on">
                <span class="material-icons">select_all</span>
            </v-btn>
        </template>

        <v-card>
            <v-card-title class="text-h5 lighten-2"> Change All Components: </v-card-title>

            <v-card-text> </v-card-text>
            <table>
                <tr>
                    <th class="font-weight-bold pl-10 pt-4 pb-2">
                        <input v-model="selectAll" type="checkbox" />
                        <span class="pl-1">Select</span>
                    </th>
                    <th class="font-weight-bold pl-15 pt-4 pb-2">Name</th>
                </tr>
                <tr v-for="component in components" :key="component.id">
                    <td class="pl-15 pb-2"><input v-model="selected" type="checkbox" :value="component.id" /></td>
                    <td class="pl-15 pb-2">{{ component.name }}</td>
                </tr>
            </table>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green" class="white--text" @click="callbacks.close(onSave)"> Change </v-btn>
                <v-btn color="red" class="white--text ml-9" @click="dialog = false"> Cancel </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- <div class="property-drawer-parent">
        <v-btn id="context_button_copytoall" color="white indigo--text" depressed @click="showProperties()">
            <span class="material-icons">select_all</span>
        </v-btn>
        <div ref="drawer" class="change-all-drawer">
            <v-card v-if="activated">
                <v-row>
                    <v-card-title class="heading-6 pb-0">Change All Components:</v-card-title>
                </v-row>
                <table>
                    <tr>
                        <th class="font-weight-bold pl-10 pt-4 pb-2">
                            <input v-model="selectAll" type="checkbox" />
                            <v-text class="pl-1">Select</v-text>
                        </th>
                        <th class="font-weight-bold pl-15 pt-4 pb-2">Name</th>
                    </tr>
                    <tr v-for="component in components" :key="component.id">
                        <td class="pl-15 pb-2"><input v-model="selected" type="checkbox" :value="component.id" /></td>
                        <td class="pl-15 pb-2">{{ component.name }}</td>
                    </tr>
                </table>

                <v-row id="actions-row">
                    <v-card-actions>
                        <slot name="actions" :callbacks="callbacks">
                            <v-btn color="green" class="white--text" @click="callbacks.close(onSave)"> Change </v-btn>
                            <v-btn color="red" class="white--text ml-9" @click="callbacks.close()"> Cancel </v-btn>
                        </slot>
                    </v-card-actions>
                </v-row>
            </v-card>
        </div>
    </div> -->
</template>

<script>
import Vue from "vue";
import EventBus from "@/events/events";
import "@mdi/font/css/materialdesignicons.css";

export default {
    name: "ChangeAllDialog",
    props: {
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
            activated: false,
            components: [
                { id: "Bettercomponent_1", name: "Bettercomponent_1" },
                { id: "Bettercomponent_2", name: "Bettercomponent_2" }
            ],
            selected: [],
            callbacks: {},
            dialog: false
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "ml-4", "mb-2", "btn"];
        },
        selectAll: {
            get: function() {
                return this.components ? this.selected.length == this.components.length : false;
            },
            set: function(value) {
                var selected = [];

                if (value) {
                    this.components.forEach(function(component) {
                        selected.push(component.id);
                    });
                }

                this.selected = selected;
            }
        }
    },
    mounted() {
        // Setup an event for closing all the dialogs
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function() {
            this.dialog = false;
        });
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activated = false;
            this.selected = false;
            this.selectAll = false;
        });
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
        onSave() {
            console.log("Saved data for Change All Components");
            this.dialog = false;
        }
    }
};
</script>

<style lang="scss" scoped>
.subtitle-1 {
    margin-left: 55px;
}

.heading-6 {
    margin-left: 30px;
}

#actions-row {
    margin-top: 50px;
    margin-left: 30px;
    padding-bottom: 10px;
}

.property-drawer-parent {
    overflow: visible;
    position: relative;
}
.change-all-drawer {
    position: absolute;
    float: left;
    width: 300px;
    left: 225px;
    z-index: 100;
}
</style>
