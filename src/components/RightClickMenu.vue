<template>
    <v-card id="RightClickMenu">
        <div>
            <v-row>
                <v-col>
                    <thead v-if="Rename">
                        <form action="#">
                            <input id="inserttext_textinput" class="mdl-textfield__input" type="text" />
                            <label class="mdl-textfield__label" for="inserttext_textinput">Text</label>
                        </form>
                    </thead>
                    <v-row>
                        <v-col>
                            <div id="buttonClass" class="buttonClass">
                                <!-- Colored icon button -->
                                <v-btn id="context_button_copy" @click="copyButton()">
                                    <span class="material-icons">file_copy</span>
                                </v-btn>
                                <v-btn id="context_button_delete" @click="deleteButton()">
                                    <span class="material-icons">delete</span>
                                </v-btn>
                                <v-btn id="context_button_move" @click="moveButton()">
                                    <span class="material-icons">open_with</span>
                                </v-btn>
                                <v-btn id="context_button_revert" @click="revertToDefaults()">
                                    <span class="material-icons">settings_backup_restore</span>
                                </v-btn>
                                <v-btn id="context_button_copytoall" @click="copyToAllButton()">
                                    <span class="material-icons">select_all</span>
                                </v-btn>
                                <v-btn id="context_button_rename" @click="renameButton()">
                                    <span class="material-icons">title</span>
                                </v-btn>
                                <v-btn id="context_button_arraygen" @click="generateArrayButton()">
                                    <span class="material-icons">view_comfy</span>
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-card-title class="subtitle-1 pb-0">Parameter</v-card-title>
                        <v-card-text>
                            <v-simple-table dense fixed-header>
                                <thead>
                                    <tr>
                                        <th>Control</th>
                                        <th>Key</th>
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
                            </v-simple-table>
                        </v-card-text>
                    </v-row>
                </v-col>
            </v-row>
        </div>
    </v-card>
</template>

<script>
//import { defineComponent } from "@vue/composition-api";
//import specname from "@/models/property-drawer/'specname'.js";
import revertToDefaultParams from "@/app/view/ui/parameterMenu";
import Registry from "@/app/core/registry";
import EventBus from "@/events/events";
import RightPanel from "@/app/view/ui/rightPanel";

export default {
    name: "RightClickMenu",
    props: {
        spec: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            activeMenu: false,
            activeChange: false,
            activeMove: false,
            Rename: false
            //roundedChannelSpec: RoundedChannelSpec
        };
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
        //EventBus.get().on(EventBus.DBL_CLICK, this.activateMenu);
    },
    methods: {
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
            //callback.close();
        },
        copyToAllButton() {
            console.log("Change all the component parameters");
            EventBus.get().emit(EventBus.COPY_ALL);
        },
        moveButton() {
            EventBus.get().emit(EventBus.MOVE);
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
        }
        // getTitle() {
        //     //TODO
        //     this.title = "Rounded Spec";
        // },
        // getSpec() {
        //     //TODO
        //     this.spec = RoundedChannelSpec;
        // }
    }
};
</script>

<style lang="scss" scoped>
#buttonClass {
    margin-left: 15px;
}
#context_button_copy {
    margin-left: 10px;
}
#context_button_delete {
    margin-left: 10px;
}
#context_button_move {
    margin-left: 10px;
}
#context_button_revert {
    margin-left: 10px;
}
#context_button_copytoall {
    margin-left: 10px;
}
#context_button_rename {
    margin-left: 10px;
}
#context_button_arraygen {
    margin-left: 10px;
}
</style>
