<template>
    <v-card v-show="activeMenu" ref="RightClickMenu" :style="{ width: 550, height: 100, top: marginTop + 'px', left: marginLeft + 'px' }" scrollable>
        <div>
            <thead v-show="showRename">
                <v-col>
                    <v-row align-start>
                        <v-text-field v-model="connectionName" label="Name" type="input"> </v-text-field>
                        <v-btn x-small depressed @click="cancelRename">
                            <span class="material-icons">close</span>
                        </v-btn>
                        <v-btn x-small depressed @click="saveName">
                            <span class="material-icons">check</span>
                        </v-btn>
                    </v-row>
                </v-col>
            </thead>
            <v-row dense>
                <div id="buttonClass" class="buttonClass">
                    <!-- Colored icon button -->
                    <v-btn id="context_button_delete" color="white indigo--text" depressed @click="deleteButton()">
                        <span class="material-icons">delete</span>
                    </v-btn>
                    <v-btn id="context_button_showRename" color="white indigo--text" depressed @click="showRename = true">
                        <span class="material-icons">title</span>
                    </v-btn>
                    <!-- <v-btn id="context_button_arraygen" color="white indigo--text" depressed>
                        <span class="material-icons">view_comfy</span>
                    </v-btn> -->
                </div>
            </v-row>
            <v-row>
                <v-card-text>
                    <PropertyBlock :title="mint" :spec="spec" @update="updateParameter" />
                </v-card-text>
            </v-row>
        </div>
    </v-card>
</template>

<script>
import Registry from "@/app/core/registry";
import Connection from "@/app/core/connection";
import Layer from "@/app/core/layer";
import Params from "@/app/core/params";
import EventBus from "@/events/events";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import { ComponentAPI } from "@/componentAPI";

export default {
    name: "ConnectionContextMenu",
    components: { PropertyBlock },
    data() {
        return {
            mint: "CHANNEL",
            spec: [{ min: 0, max: 110, units: "", value: 0 }],
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            activeCopy: false,
            showRename: false,
            connectionName: "",
            featureRef: null,
            typeString: "",
            marginLeft: 500,
            marginTop: 100,
            currentConnection: new Connection("", new Params({}, new Map(), new Map()), "", "", new Layer({}, Registry.currentDevice))
        };
    },
    mounted() {
        // Setup an event for closing all the dialogs
        const ref = this;
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function () {
            ref.activeMenu = false;
        });
        EventBus.get().on(EventBus.DBL_CLICK_CONNECTION, this.activateMenu);
    },
    methods: {
        updateParameter(value, key) {
            this.currentConnection.updateParameter(key, value);
        },
        computeSpec: function (mint, params) {
            // Get the corresponding the definitions object from the componentAPI, convert to a spec object and return
            let spec = [];
            const definition = ComponentAPI.getDefinitionForMINT(mint);
            for (let i in params.heritable) {
                let key = params.heritable[i];
                let item = {
                    min: definition.minimum[key],
                    max: definition.maximum[key],
                    value: params.getValue(key),
                    units: definition.units[key],
                    steps: (definition.maximum[key] - definition.minimum[key]) / 10,
                    name: key
                };
                spec.push(item);
            }
            console.log("Spec: ", spec);
            return spec;
        },
        activateMenu: function (event, connection) {
            console.log("clienwidth/height", this.$el, this.$el.clientWidth, this.$el.clientHeight);
            this.currentConnection = connection;
            // Activate feat code
            this.featureRef = connection;
            this.typeString = "CHANNEL";
            //console.log(feat);
            const tempname = connection.name;
            this.connectionName = tempname;

            console.log(event, connection);
            this.activeMenu = !this.activeMenu;
            // console.log(this.activeMenu);

            //console.log("clienwidth/height", this.$el, this.$el.clientWidth, this.$el.clientHeight);

            /**
            //Margin Left Calculation
            if (event.clientX + 30 + this.clientWidth > window.innerWidth) {
                this.marginLeft = event.clientX - this.clientWidth - 30;
            } else {
                this.marginLeft = event.clientX + 30;
            }

            //Margin Right Calculation
            if (event.clientY - 20 + this.clientHeight > window.innerHeight) {
                this.marginTop = event.clientY - this.clientHeight + 20;
            } else {
                this.marginTop = event.clientY - 20;
            }
            **/
            //console.log(window.innerWidth / 2);
            //Margin Left Calculation
            if (event.clientX - 150 > window.innerWidth / 2) {
                this.marginLeft = event.clientX - 800;
            } else {
                this.marginLeft = event.clientX - 180;
            }
            //console.log(window.innerHeight / 2);
            //Margin Top Calculation
            if (window.innerHeight / 1.2 >= event.clientY && event.clientY >= window.innerHeight / 6) {
                this.marginTop = 0;
            } else if (event.clientY + 0 > window.innerHeight / 2) {
                this.marginTop = event.clientY - 750;
            } else {
                this.marginTop = event.clientY + 0;
            }

            // Compute the from the params and then handle whatever needs to get handeled
            const spec = this.computeSpec("CHANNEL", connection.params);
            //this.mint = connection.mint;
            console.log(spec);
            this.spec = spec;
        },
        onSave() {
            const nametext = this.getconnectionName();
            this.$refs.input.value = nametext;
            console.log("Saved data for showRename");
        },
        revertToDefaults() {
            this.revertToDefaultParams(this.$refs.table, this.typestring, this.__setString);
        },
        revertToDefaultParams(table, typeString, setString) {
            const def = ComponentAPI.getDefinition(typeString);
            const heritable = def.heritable;
            const defaults = def.defaults;

            for (const key in heritable) {
                Registry.viewManager.adjustParams(typeString, setString, key, defaults[key]);
            }
        },

        deleteButton() {
            Registry.viewManager.view.deleteSelectedFeatures();
        },
        copyButton() {
            Registry.viewManager.initiateCopy();
        },
        copyToAllButton() {
            this.activeCopy = !this.activeCopy;
            console.log("Change all the connection parameters");
        },
        generateArrayButton() {
            Registry.viewManager.activateTool("GenerateArrayTool");
            const connection = Registry.currentDevice.getConnectionForFeatureID(this.featureRef.getID());
            Registry.viewManager.tools.GenerateArrayTool.activate(connection);
        },
        // Property Drawer methods
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
            this.$refs.drawer.style.top = bounds.bottom - bounds.height + "px";
        },
        saveName() {
            this.currentConnection.name = this.connectionName;
            this.showRename = false;
        },
        closeDialog() {
            this.activeMenu = false;
        },
        cancelRename() {
            this.showRename = false;
            this.connectionName = this.currentConnection.name;
        }
    }
};
</script>

<style lang="scss" scoped>
#activateMenu {
    height: 10px;
}
#buttonClass {
    margin-left: 15px;
    margin-top: 15px;
}
#showRename {
    margin-left: 20px;
}
#close {
    margin-top: 20px;
    margin-left: 5px;
}
</style>
