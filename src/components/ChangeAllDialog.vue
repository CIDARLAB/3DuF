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
                <tr v-for="comp in components" :key="comp.id">
                    <td class="pl-15 pb-2"><input v-model="selected" type="checkbox" :value="comp.id" /></td>
                    <td class="pl-15 pb-2">{{ comp.name }}</td>
                </tr>
            </table>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green" class="white--text" @click="onSave"> Change </v-btn>
                <v-btn color="red" class="white--text ml-9" @click="dialog = false"> Cancel </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";
import EventBus from "@/events/events";
import "@mdi/font/css/materialdesignicons.css";
import Component from "@/app/core/component";
import Registry from "@/app/core/registry";

export default {
    name: "ChangeAllDialog",
    props: {
        component: {
            type: Component,
            required: true
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
        selectAll: {
            get: function () {
                return this.components ? this.selected.length == this.components.length : false;
            },
            set: function (value) {
                var selected = [];

                if (value) {
                    this.components.forEach(function (component) {
                        selected.push(component.id);
                    });
                }

                this.selected = selected;
            }
        }
    },
    watch: {
        dialog: function (newValue) {
            if (newValue) {
                // Dialog is activated
                this.$emit("close");
                // Load similar components
                const type = this.component.mint;
                const allcomponents = Registry.currentDevice.components;
                const similarComponents = [];
                for (let i = 0; i < allcomponents.length; i++) {
                    if (allcomponents[i].mint === type) {
                        if (this.component.id !== allcomponents[i].id) {
                            similarComponents.push(allcomponents[i]);
                        }
                    }
                }
                this.components = similarComponents.map(function (component) {
                    return { id: component.id, name: component.name };
                });
            } else {
                // Dialog is closed
                this.components = [];
            }
        }
    },
    mounted() {
        // Setup an event for closing all the dialogs
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function () {
            this.dialog = false;
        });
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.dialog = false;
            this.selected = false;
            this.selectAll = false;
        });
    },
    methods: {
        onSave() {
            console.log("Saved data for Change All Components");
            let paramstochange = this.component.params;
            for (let i in this.selected) {
                let componenttochange = Registry.currentDevice.getComponentByID(this.selected[i]);

                for (let key of paramstochange.heritable) {
                    let value = paramstochange.getValue(key);
                    componenttochange.updateParameter(key, value);
                    //componenttochange.params.updateParameter(key, value);
                }
            }
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
