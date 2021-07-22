<template>
    <Dialog title="Insert Text"
        ><v-card-title class="h6">Insert</v-card-title>
        <template #content>
            <form action="#">
                <tr>
                    <td>
                        <v-card-text><p class="text--primary subtitle-1">Text:</p></v-card-text>
                    </td>
                    <td width="125px">
                        <v-text-field :v-model="text"></v-text-field>
                    </td>
                    <td>
                        <v-card-text><p class="text--primary subtitle-1">Font Size:</p></v-card-text>
                    </td>
                    <td width="125px">
                        <v-text-field v-model="fontSize" :step="1" type="number"></v-text-field>
                    </td>
                </tr>
                <tr>
                    <td width="100px">
                        <v-card-text></v-card-text>
                    </td>
                    <td>
                        <v-card-text></v-card-text>
                    </td>
                    <td>
                        <v-card-text><p class="text--primary subtitle-1">Select Layer:</p></v-card-text>
                    </td>
                    <td>
                        <v-select :items="items" label="Dropdown"> </v-select>
                    </td>
                </tr>
            </form>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-spacer />
            <v-col>
                <v-btn class="pa-2" color="red darken-1" dark :style="{ right: '75%', transform: 'translateX(-100%)' }" @click="callbacks.close()"> Cancel </v-btn>
                <v-spacer />
            </v-col>
            <v-btn class="pa-2" color="green darken-1" dark :style="{ right: '30%', transform: 'translateX(-30%)' }" @click="onClick"> Insert </v-btn>
        </template>
    </Dialog>
</template>
<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "@/app/core/registry.ts";
export default {
    components: {
        Dialog
    },
    data: () => ({
        items: ["Level1- FLOW", "Level1- CONTROL", "Level1- INTEGRATION"],
        text: "",
        fontSize: 12
    }),
    methods: {
        onSave() {
            console.log("Saved data for Edit Device");
        },
        onClick() {
            Registry.viewManager.activateTool("InsertTextTool");
            Registry.viewManager.tools.InsertTextTool.text = this.text;
            this.close();
        }
    }
};
</script>
