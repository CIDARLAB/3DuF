    <template>
    <div id="contextMenu" class="hidden-block">
        <v-simple-table dense fixed-header>
            <template>
                <thead>
                    <tr>
                        <th>
                            <!-- Colored icon button -->
                            <v-btn id="context_button_copy" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="copyButton()">
                                <span class="material-icons">file_copy</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_copy">Copy</div> -->
                        </th>
                        <th>
                            <v-btn id="context_button_delete" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="deleteButton()">
                                <span class="material-icons">delete</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_delete">Delete</div> -->
                        </th>
                        <th>
                            <v-btn id="context_button_move" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="moveButton()">
                                <span class="material-icons">open_with</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_move">Move</div> -->
                        </th>
                        <th>
                            <v-btn id="context_button_revert" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="revertToDefaults()">
                                <span class="material-icons">settings_backup_restore</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_revert">Revert</div> -->
                        </th>
                        <th>
                            <v-btn id="context_button_copytoall" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="copyToAllButton()">
                                <span class="material-icons">select_all</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_copytoall">Change All</div> -->
                        </th>
                        <div v-if="activated">
                            <ChangeAllDialog />
                        </div>
                        <th>
                            <v-btn id="context_button_rename" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="renameButton()">
                                <span class="material-icons">title</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_rename">Rename</div> -->
                        </th>
                        <th>
                            <v-btn id="context_button_arraygen" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" @click="generateArrayButton()">
                                <span class="material-icons">view_comfy</span>
                            </v-btn>
                            <!-- <div class="mdl-tooltip mdl-tooltip--top mdl-tooltip--large" data-mdl-for="context_button_arraygen">Generate Array</div> -->
                        </th>
                    </tr>
                </thead>
                <div ref="drawer" class="property-drawer">
                    <tbody>
                        <v-card-title class="subtitle-1 pb-0">{{ title }}</v-card-title>
                        <v-card-text>
                            <tr>
                                <td>Control</td>
                                <td>Key</td>
                                <td>Value</td>
                            </tr>
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
                        </v-card-text>
                    </tbody>
                </div>
            </template>
        </v-simple-table>
    </div>
</template>

<script>
//import { defineComponent } from "@vue/composition-api";
//import specname from "@/models/property-drawer/'specname'.js";
import { createFeatureTable, revertToDefaultParams } from "./parameterMenu";
import Registry from "../../core/registry";
import EventBus from "@/events/events";
import ChangeAllDialog from "@/app/view/ui/changeAllDialog";
import RoundedChannelSpec from "@/models/property-drawer/RoundedChannelSpec.js";

export default {
    components: ChangeAllDialog,
    props: {
        //title: mom,
        spec: {
            spec: RoundedChannelSpec,
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
        }
    },
    data() {
        return {
            activated: false,
            specname: this.title + "Spec"
        };
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
    },
    methods: {
        // Event Handeling
        revertToDefaults() {
            revertToDefaultParams(this.__featureTable, this.__typeString, this.__setString);
        },
        deleteButton() {
            Registry.viewManager.view.deleteSelectedFeatures();
            this.close();
        },
        copyButton() {
            Registry.viewManager.initiateCopy();
            this.close();
        },
        copyToAllButton() {
            console.log("Change all the component parameters");
            this.activated = !this.activated;
        },
        moveButton() {
            //TODO call move dialog
        },
        renameButton() {
            //TODO make rename Dialog
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
