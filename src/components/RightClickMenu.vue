<template>
    <v-card v-show="activeMenu" ref="RightClickMenu" :style="{ width: 550, top: marginTop + 'px', left: marginLeft + 'px' }">
        <div>
            <thead v-if="Rename">
                <v-col>
                    <v-row id="rename" align-start>
                        <v-text-field label="Rename" type="input"> {{ rename }} </v-text-field>
                        <v-btn id="close" xsmall depressed @click="callbacks.close()">
                            <span class="material-icons">close</span>
                        </v-btn>
                        <v-btn id="close" xsmall depressed @click="Save">
                            <span class="material-icons">check</span>
                        </v-btn>
                    </v-row>
                </v-col>
            </thead>
            <v-row dense>
                <div id="buttonClass" class="buttonClass">
                    <!-- Colored icon button -->
                    <v-btn id="context_button_copy" color="white indigo--text" depressed @click="copyButton()">
                        <span class="material-icons">file_copy</span>
                    </v-btn>
                    <v-btn id="context_button_delete" color="white indigo--text" depressed @click="deleteButton()">
                        <span class="material-icons">delete</span>
                    </v-btn>
                    <v-btn id="context_button_move" color="white indigo--text" depressed @click="moveButton()">
                        <span class="material-icons">open_with</span>
                    </v-btn>
                    <v-btn id="context_button_revert" color="white indigo--text" depressed @click="revertToDefaults()">
                        <span class="material-icons">settings_backup_restore</span>
                    </v-btn>
                    <v-btn id="context_button_copytoall" color="white indigo--text" depressed @click="copyToAllButton()">
                        <span class="material-icons">select_all</span>
                    </v-btn>
                    <ChangeAll v-if="activeCopy" />
                    <v-btn id="context_button_rename" color="white indigo--text" depressed @click="renameButton()">
                        <span class="material-icons">title</span>
                    </v-btn>
                    <v-btn id="context_button_arraygen" color="white indigo--text" depressed @click="generateArrayButton()">
                        <span class="material-icons">view_comfy</span>
                    </v-btn>
                </div>
            </v-row>
            <v-row>
                <v-card-text>
                    <v-simple-table dense fixed-header>
                        <thead>
                            <tr>
                                <th>Control</th>
                                <th>Key</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody ref="table" dense>
                            <tr v-for="item in spec" :key="item.key">
                                <td width="250px">
                                    <v-slider v-model="item.value" :step="item.step" :max="item.max" :min="item.min" @change="UpdateFeatureSlider"></v-slider>
                                </td>
                                <td width="50px">
                                    <code>{{ item.name }}</code>
                                </td>
                                <td width="100px">
                                    <v-text-field v-model="item.value" :step="item.step" type="number" :suffix="item.units" @change="UpdateFeatureValue">{{
                                        item.value
                                    }}</v-text-field>
                                </td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </v-card-text>
            </v-row>
        </div>
    </v-card>
</template>

<script>
//import { defineComponent } from "@vue/composition-api";
//import specname from "@/models/property-drawer/'specname'.js";
import { revertToDefaultParams, generateUpdateFunction } from "@/app/view/ui/parameterMenu";
import Registry from "@/app/core/registry";
import EventBus from "@/events/events";
import ChangeAll from "@/components/ChangeAllDialog.vue";

export default {
    name: "RightClickMenu",
    components: { ChangeAll },
    props: {
        spec: {
            type: Array,
            required: true
        },
        rename: {
            type: String
        }
    },
    data() {
        return {
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            activeCopy: false,
            Rename: false,
            featureRef: null,
            typeString: "",
            marginLeft: 500,
            marginTop: 100
            //roundedChannelSpec: RoundedChannelSpec
        };
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
        EventBus.get().on(EventBus.DBL_CLICK, this.activateMenu);
    },
    methods: {
        activateMenu: function(event, feat) {
            //console.log("clienwidth/height", this.$el, this.$el.clientWidth, this.$el.clientHeight);

            // Activate feat code
            this.featureRef = feat;
            this.typeString = feat.getType();
            //console.log(feat);

            console.log(event, feat);
            this.activeMenu = !this.activeMenu;
            console.log(this.activeMenu);

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

            //Margin Left Calculation
            if (event.clientX + 30 > window.innerWidth) {
                this.marginLeft = event.clientX - 30;
            } else {
                this.marginLeft = event.clientX + 30;
            }

            //Margin Right Calculation
            if (event.clientY - 20 > window.innerHeight) {
                this.marginTop = event.clientY + 20;
            } else {
                this.marginTop = event.clientY - 20;
            }
        },
        onSave() {
            const nametext = this.getComponentName();
            this.$refs.input.value = nametext;
            console.log("Saved data for Rename");
        },
        revertToDefaults() {
            revertToDefaultParams(this.$refs.table, this.typestring, this.__setString);
        },
        deleteButton() {
            Registry.viewManager.view.deleteSelectedFeatures();
        },
        copyButton() {
            Registry.viewManager.initiateCopy();
        },
        copyToAllButton() {
            this.activeCopy = !this.activeCopy;
            console.log("Change all the component parameters");
        },
        moveButton() {
            // Registry.viewManager.activateTool("MoveTool");
            // const component = Registry.currentDevice.getComponentForFeatureID(this.featureRef.getID());
            // Registry.viewManager.tools.MoveTool.activate(component);
            EventBus.get().emit(EventBus.MOVE);
        },
        renameButton() {
            this.Rename = !this.Rename;
        },
        generateArrayButton() {
            Registry.viewManager.activateTool("GenerateArrayTool");
            const component = Registry.currentDevice.getComponentForFeatureID(this.featureRef.getID());
            Registry.viewManager.tools.GenerateArrayTool.activate(component);
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
        Save() {
            const nametext = this.$refs.rename;
            this.setComponentName(nametext);
        },
        setComponentName(nametext) {
            const id = this.featureRef.getID();
            // Find component for the feature id
            const component = Registry.currentDevice.getComponentForFeatureID(id);
            if (component) {
                component.setName(nametext);
                console.log("renamed component", component);
            } else {
                throw new Error("Could not find component to rename");
            }
        },
        getComponentName() {
            const id = this.featureRef.getID();
            // Find component for the feature id
            const component = Registry.currentDevice.getComponentForFeatureID(id);
            if (component) {
                return component.getName();
            } else {
                throw new Error("Could not find component to rename");
            }
        },
        UpdateFeatureSlider() {
            const featureID = this.featureRef.getID();
            const sliderID = featureID + "_" + this.featureRef.key + "_slider";
            const fieldID = featureID + "_" + this.featureRef.key + "_value";
            generateUpdateFunction(sliderID, fieldID, this.$refs.typeString, this.$refs.setString, this.featureRef.key);
        },
        UpdateFeatureValue() {
            const featureID = this.featureRef.getID();
            const sliderID = featureID + "_" + this.featureRef.key + "_slider";
            const fieldID = featureID + "_" + this.featureRef.key + "_value";
            generateUpdateFunction(fieldID, sliderID, this.$refs.typeString, this.$refs.setString, this.featureRef.key);
        }
    }
};
</script>

<style lang="scss" scoped>
#buttonClass {
    margin-left: 15px;
    margin-top: 15px;
}
#rename {
    margin-left: 20px;
}
#close {
    margin-top: 20px;
    margin-left: 5px;
}
</style>
