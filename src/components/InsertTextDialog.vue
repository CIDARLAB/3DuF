<template>
    <Dialog title="Insert Text"
        ><v-card-title class="h6">{{ Insert }}</v-card-title>
        <template #content>
            <form action="#">
                <tr>
                    <td>
                        <v-card-text><p class="text--primary subtitle-1">Text:</p></v-card-text>
                    </td>
                    <td width="125px">
                        <v-text-field></v-text-field>
                    </td>
                    <td>
                        <v-card-text><p class="text--primary subtitle-1">Font Size:</p></v-card-text>
                    </td>
                    <td width="125px">
                        <v-text-field v-model="number" :step="1" type="number"></v-text-field>
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
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn color="primary" dark v-bind="attrs" v-on="on">
                                    Dropdown
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="(item, index) in items" :key="index">
                                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </form>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-spacer />
            <v-col>
                <v-btn class="pa-2" color="red darken-1" dark :style="{ right: '75%', transform: 'translateX(-100%)' }" @click="callbacks.close()">
                    Cancel
                </v-btn>
                <v-spacer />
            </v-col>
            <v-btn class="pa-2" color="green darken-1" dark :style="{ right: '30%', transform: 'translateX(-30%)' }" @click="callbacks.close()">
                Save
            </v-btn>
        </template>
    </Dialog>
</template>
<script>
import Dialog from "@/components/base/Dialog.vue";
export default {
    components: {
        Dialog
    },
    data: () => ({
        items: [{ title: "Level1- FLOW" }, { title: "Level1- CONTROL" }, { title: "Level1- INTEGRATION" }]
    }),
    methods: {
        onSave() {
            console.log("Saved data for Edit Device");
        }
    }
};
</script>



