<template>
    <v-simple-table dense fixed-header class="table">
        <template>
            <thead>
                <tr>
                    <th>Adjust</th>
                    <th>Parameter</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in spec" :key="item.key">
                    <td width="200px">
                        <v-slider v-model="item.value" :step="item.step" :max="item.max" :min="item.min" @change="paramChanged(item.value, item.name)"></v-slider>
                    </td>
                    <td>
                        <code>{{ item.name }}</code>
                    </td>
                    <td width="125px">
                        <v-text-field v-model="item.value" :step="item.step" type="number" :suffix="item.units" @change="paramChanged(item.value, item.name)"> </v-text-field>
                    </td>
                </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>
<script>
export default {
    name: "PropertyBlock",
    props: {
        title: {
            type: String,
            required: true,
            default: "UnSet"
        },
        spec: {
            type: Array,
            required: true,
            validator: spec => {
                if (!Array.isArray(spec)) {
                    console.error("PropertyDrawer: Spec is not an array, unable to validate");
                    return "danger";
                }

                spec.forEach(item => {
                    ["min", "max", "units", "value"].forEach(key => {
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
        return {};
    },
    methods: {
        paramChanged(value, paramkey) {
            console.log("paramChanged", value, paramkey);
            this.$emit("update", value, paramkey);
        }
    }
};
</script>
