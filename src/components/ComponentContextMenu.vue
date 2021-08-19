<template>
    <v-card v-show="activeMenu" ref="RightClickMenu" :style="{ width: 550, height: 100, top: marginTop + 'px', left: marginLeft + 'px' }" scrollable>
        <div>
            <thead v-show="showRename">
                <v-col>
                    <v-row align-start>
                        <v-text-field v-model="componentName" label="Name" type="input"> </v-text-field>
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
                    <v-btn id="context_button_copy" color="white indigo--text" depressed @click="copyButton()">
                        <span class="material-icons">file_copy</span>
                    </v-btn>
                    <v-btn id="context_button_delete" color="white indigo--text" depressed @click="deleteButton()">
                        <span class="material-icons">delete</span>
                    </v-btn>
                    <MoveDialog :component="currentComponent" @close="activeMenu = false" />
                    <v-btn id="context_button_revert" color="white indigo--text" depressed @click="revertToDefaults()">
                        <span class="material-icons">settings_backup_restore</span>
                    </v-btn>
                    <ChangeAllDialog :component="currentComponent" @close="activeMenu = false" />
                    <v-btn id="context_button_showRename" color="white indigo--text" depressed @click="showRename = true">
                        <span class="material-icons">title</span>
                    </v-btn>
                    <!-- <v-btn id="context_button_arraygen" color="white indigo--text" depressed>
                        <span class="material-icons">view_comfy</span>
                    </v-btn> -->
                    <GenerateArrayDialog :component="currentComponent" @close="activeMenu = false" />
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
import { revertToDefaultParams, generateUpdateFunction } from "@/app/view/ui/parameterMenu";
import Registry from "@/app/core/registry";
import Component from "@/app/core/component";
import Params from "@/app/core/params";
import EventBus from "@/events/events";
import MoveDialog from "@/components/MoveDialog.vue";
import ChangeAllDialog from "@/components/ChangeAllDialog.vue";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import { ComponentAPI } from "@/componentAPI";
import GenerateArrayDialog from "@/components/GenerateArrayDialog.vue";

export default {
    name: "ComponentContextMenu",
    components: { MoveDialog, ChangeAllDialog, PropertyBlock, GenerateArrayDialog },
    data() {
        return {
            mint: "",
            spec: [{ min: 0, max: 110, units: "", value: 0 }],
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            activeCopy: false,
            showRename: false,
            componentName: "",
            featureRef: null,
            typeString: "",
            marginLeft: 500,
            marginTop: 100,
            currentComponent: new Component(new Params({}, new Map(), new Map()), "", "")
        };
    },
    mounted() {
        // Setup an event for closing all the dialogs
        const ref = this;
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function () {
            ref.activeMenu = false;
        });
        EventBus.get().on(EventBus.DBL_CLICK_COMPONENT, this.activateMenu);
    },
    methods: {
        updateParameter(value, key) {
            this.currentComponent.updateParameter(key, value);
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
            return spec;
        },
        activateMenu: function (event, component) {
            console.log("clienwidth/height", this.$el, this.$el.clientWidth, this.$el.clientHeight);
            this.currentComponent = component;
            // Activate feat code
            this.featureRef = component;
            this.typeString = component.mint;
            //console.log(feat);
            const tempname = component.name;
            this.componentName = tempname;

            console.log(event, component);
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
            const spec = this.computeSpec(component.mint, component.params);
            this.mint = component.mint;
            console.log(spec);
            this.spec = spec;
        },
        onSave() {
            const nametext = this.getComponentName();
            this.$refs.input.value = nametext;
            console.log("Saved data for showRename");
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
        saveName() {
            this.currentComponent.name = this.componentName;
            this.showRename = false;
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
        },
        closeDialog() {
            this.activeMenu = false;
        },
        cancelRename() {
            this.showRename = false;
            this.componentName = this.currentComponent.name;
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
