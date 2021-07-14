<template>
    <div v-if="activeMenu" id="contextMenu">
        <v-container>
            <v-row>
                <v-col>
                    <thead v-if="Rename"></thead>
                    <v-row>
                        <v-col>
                            <!-- Colored icon button -->
                            <v-btn id="context_button_copy" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="copyButton()">
                                <span class="material-icons">file_copy</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_copy">Copy</div> -->
                            <v-btn id="context_button_delete" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="deleteButton()">
                                <span class="material-icons">delete</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_delete">Delete</div> -->
                            <v-btn id="context_button_move" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="moveButton()">
                                <span class="material-icons">open_with</span>
                            </v-btn>
                            <div v-if="activeMove">
                                <MoveDialog />
                            </div>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_move">Move</div> -->
                            <v-btn id="context_button_revert" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="revertToDefaults()">
                                <span class="material-icons">settings_backup_restore</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_revert">Revert</div> -->
                            <v-btn id="context_button_copytoall" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="copyToAllButton()">
                                <span class="material-icons">select_all</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_copytoall">Change All</div> -->
                            <div v-if="activeChange">
                                <ChangeAllDialog />
                            </div>
                            <v-btn id="context_button_rename" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="renameButton()">
                                <span class="material-icons">title</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_rename">Rename</div> -->
                            <v-btn id="context_button_arraygen" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="generateArrayButton()">
                                <span class="material-icons">view_comfy</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_arraygen">Generate Array</div> -->
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-card-title class="subtitle-1 pb-0" :title="getTitle()">{{ title }}</v-card-title>
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
                                        <tr v-for="item in spec" :key="item.key" :spec="getSpec()">
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
            </v-row>
        </v-container>
    </div>
</template>

<script>
//import { defineComponent } from "@vue/composition-api";
//import specname from "@/models/property-drawer/'specname'.js";
import { createFeatureTable, revertToDefaultParams } from "@/app/view/ui/parameterMenu";
import Registry from "@/app/core/registry";
import EventBus from "@/events/events";
import ChangeAllDialog from "@/components/ChangeAllDialog.vue";
import MoveDialog from "@/components/base/MoveDialog.vue";
import MouseSelectTool from "@/app/view/tools/mouseSelectTool";
import MouseTool from "@/app/view/tools/mouseTool";
//import RoundedChannelSpec from "@/models/property-drawer/RoundedChannelSpec.js";

export default {
    components: { ChangeAllDialog, MoveDialog },
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
            }
        },

    //             return "success";
    //         }
    //     }
    // },
    data() {
        return {
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            Rename: false
        };
    },
    computed() {
        //title getTitle();
        //spec = getSpec();
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
        EventBus.get().on(EventBus.DBL_CLICK, this.activateMenu);
    },
    methods: {
        activateMenu(event) {
            //alternate: Paperview.canvas.onmousedown
               this.activeMenu = !this.activeMenu;

            if (event.clientX + 30 + this.$refs.contextMenu.clientWidth > window.innerWidth) {
                let contextMenu_left = String(event.clientX - this.$refs.contextMenu.clientWidth - 30) + "px";
            } else {
                let contextMenu_left = String(event.clientX + 30) + "px";
            }
            if (event.clientY - 20 + this.$refs.contextMenu.clientHeight > window.innerHeight) {
                let contextMenu_top = String(event.clientY - this.$refs.contextMenu.clientHeight + 20) + "px";
            } else {
                let contextMenu_top = String(event.clientY - 20) + "px";
            }
        },
        revertToDefaults() {
            revertToDefaultParams(this.__featureTable, this.__typeString, this.__setString);
        },
        deleteButton() {
            let This = new this();
            Registry.viewManager.view.deleteSelectedFeatures();
            This.close();
        },
        copyButton() {
            Registry.viewManager.initiateCopy();
            this.close();
        },
        copyToAllButton() {
            console.log("Change all the component parameters");
            this.activeChange = !this.activeChange;
        },
        moveButton() {
            this.activeMove = !this.activeMove;
        },
        renameButton() {
            this.Rename = !this.Rename;
        },
        generateArrayButton() {
            this.close();
            Registry.viewManager.activateTool("GenerateArrayTool");
            const component = Registry.currentDevice.getComponentForFeatureID(this.__featureRef.getID());
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
        getTitle() {
            //TODO
            this.title = "Rounded Spec";
        },
        getSpec() {
            //TODO
            this.spec = RoundedChannelSpec;
        }
    }
};

//export default defineComponent({
//    setup() {}
</script>

<style lang="scss" scoped>
.contextMenu {
    z-index: 19;
    left: 500px;
    top: 500px;
    position: absolute;
    background-color: "#fff";
}
</style>
