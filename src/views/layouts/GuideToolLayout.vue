<template>
    <v-row>
        <v-col>
            <v-navigation-drawer app permanent class="pt-4" color="grey lighten-3" style="width: 35%;">
                <div class="d-flex flex-column mx-2">
                    <v-img class="mx-auto" src="img/logo.png" alt="3DuF Logo" style="width: 90%" />
                    <v-divider class="mb-1" />
                    <v-divider />
                    <LayerToolbar />
                    <v-divider />
                    <HelpDialog />
                    <v-divider />
                    <br>
                    <h4>How many modes do you want?</h4>
                    <br>
                    <v-text-field v-model="inputModeNumber" :step="1" type="number" />

                    <!-- <v-text-field
                        clearable
                        v-model="inputModeNumber"
                        name="inputModeNumber"
                        value=""
                        hint="Input how many modes do you want."
                        label="Number of modes"
                        auto-grow
                        outlined
                        rows="1"
                        row-height="10"
                    ></v-textarea> -->
                    <!-- <v-btn @click="submitModeNumber">submit</v-btn> -->
                    <br>
                    <template id="DescriptionCollector">
                        <div class="DescriptionComponent" v-for="index in parseInt(inputModeNumber)" :key="index">
                            <v-textarea
                                clearable
                                name="ModeDescription"
                                value=""
                                hint="Input your mode description here."
                                label="Mode description"
                                auto-grow
                                outlined
                                rows="1"
                                row-height="10"
                            ></v-textarea>
                            <v-row align="center" justify="space-around" style="padding-top: 10px; padding-bottom: 30px;">
                                <v-btn 
                                    @click="setRules"
                                    color="primary"
                                    dark
                                    rounded
                                >set rules for mode {{index}}
                                    <v-icon right dark>mdi-pencil</v-icon>
                                </v-btn>
                            </v-row>
                        </div>
                        <v-btn @click="submitModeDescription">save</v-btn>

                        <div id="OperationInput">
                            <h4 style="padding-top: 30px;">Which operation mode do you want to choose?</h4>
                            <v-row align="center" justify="space-around" style="padding-top: 15px; padding-bottom: 30px;">
                                <v-btn v-for="index in parseInt(inputModeNumber)" :key="index">{{index}}</v-btn>
                            </v-row>
                        </div>
                    </template>
                    <br>
                    
                </div>
            </v-navigation-drawer>
        </v-col>
        <v-col>
            <div>
                <GuideVisualiser />
            </div>
        </v-col>
    </v-row>
    <!-- <v-navigation-drawer app permanent class="pt-4" color="grey lighten-3">
            <div class="d-flex flex-column mx-2">
                <v-img class="mx-auto" src="img/logo.png" alt="3DuF Logo" style="width: 90%" />
                <v-divider class="mb-1" />
                <IntroHelpDialog />
                <HelpDialog />
                <v-divider />
                <EditDeviceDialog />
                <EditBorderDialog />
                <InsertTextDialog />
                <ImportDXFDialog />
                <v-divider />
                <LayerToolbar />
                <ComponentToolbar />
            </div>

            <ManufacturingPanel />
        </v-navigation-drawer>

        <v-main id="visualizer-slot">
            <slot name="main" />
        </v-main> -->
</template>

<script>
import EventBus from "@/events/events";
import HelpDialog from "@/components/HelpDialog.vue";
import IntroHelpDialog from "@/components/IntroHelpDialog.vue";
import EditDeviceDialog from "@/components/EditDeviceDialog.vue";
import EditBorderDialog from "@/components/EditBorderDialog.vue";
import ImportDXFDialog from "@/components/ImportDXFDialog.vue";
import InsertTextDialog from "@/components/InsertTextDialog.vue";
import LayerToolbar from "@/components/LayerToolbar.vue";
import ComponentToolbar from "@/components/ComponentToolBar.vue";
import ManufacturingPanel from "@/components/ManufacturingPanel.vue";
import GuideVisualiser from "@/components/guide/GuideVisualiser.vue";
import { makeStateMachine } from "@/guide/step2";
import { Registry } from '@/app';

export default {
    components: {
        HelpDialog,
        // IntroHelpDialog,
        // EditDeviceDialog,
        // EditBorderDialog,
        // ImportDXFDialog,
        // InsertTextDialog,
        LayerToolbar,
        // ComponentToolbar,
        // ManufacturingPanel,
        GuideVisualiser
    },
    data() {
        return {
            buttons: [
                ["json", "mdi-devices", "3DuF File (.json)"],
                ["svg", "mdi-border-all", "Vector Art (.svg)"],
                ["cnc", "mdi-toolbox", "CNC (.svg)"],
                ["laser", "mdi-toolbox", "Laser Cutting (.svg)"],
                ["metafluidics", "mdi-toolbox", "Publish on Metafluidics"]
            ],
            inputModeNumber: 0,
            result1: "",
            ModeDescriptions: []
        };
    },
    mounted() {
        const scrollElement = document.querySelector(".v-navigation-drawer__content");
        scrollElement.addEventListener("scroll", this.handleScroll);
        window.addEventListener("scroll", () => {
            window.scrollTo(0, 0);
        });
    },
    destroyed() {
        // this.$el.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        submitModeDescription() {
            console.log(this.inputModeNumber);
            var amount = parseInt(this.inputModeNumber);
            this.inputModeNumber = "";
            for (var i=0; i<=amount; i++){
                this.addDescription();
            }
            // makeStateMachine(this.inputModeNumber);
            
        },
        addDescription() {
            var NewDescription = document.createElement("v-textarea");
        },
        deleteDescription(item) {
            var i = this.ModeDescriptions.indexOf(item);
            this.ModeDescriptions.splice(i,1);
        },
        editDescription(){

        },
        setRules(){
            console.log("setRules");
            console.log(Registry.viewManager.view.paperFeatures);
            Registry.viewManager.view.showAllFeatures();
        }

    }
};
</script>
<style scoped>
.newbox {
    position: absolute;
    right: 0;
    width: 85vw;
    height: 100vh;
}
</style>

