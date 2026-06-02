<template>
    <v-simple-table dense fixed-header :class="tableClass">
        <template>
            <thead>
                <tr>
                    <th class="param-col">Parameter</th>
                    <th class="value-col">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in displaySpec" :key="item.name">
                    <td class="param-col">
                        <div class="d-flex align-center flex-nowrap param-name-with-help">
                            <code class="param-name-code">{{ item.name }}</code>
                            <v-tooltip bottom max-width="320">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon
                                        small
                                        dense
                                        class="param-help-icon ml-1"
                                        color="grey darken-1"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        mdi-help-circle-outline
                                    </v-icon>
                                </template>
                                <span>{{ parameterHelp(item.name) }}</span>
                            </v-tooltip>
                        </div>
                    </td>
                    <td class="value-col">
                        <v-text-field
                            v-model="item.value"
                            step="any"
                            type="number"
                            :suffix="item.units"
                            dense
                            hide-details
                            outlined
                            @change="paramChanged(item.value, item.name)"
                        />
                    </td>
                </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>
<script>
import { getParameterTooltip } from "@/constants/parameterTooltips";

/** Hidden in settings UI only; placement / engine may still use defaults or other paths. */
const HIDDEN_SETTING_KEYS = new Set(["connectionSpacing", "componentSpacing"]);

export default {
    name: "PropertyBlock",
    props: {
        title: {
            type: String,
            required: true,
            default: "UnSet"
        },
        /** default / sidebar value col widths; context uses 50/50 table (value col ×3/4 vs former 2:1 split). */
        density: {
            type: String,
            default: "default",
            validator: v => ["default", "context", "sidebar"].indexOf(v) !== -1
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
    computed: {
        tableClass() {
            return ["table", "property-block-settings", `property-block--${this.density}`];
        },
        displaySpec() {
            return this.spec.filter(row => row && row.name && !HIDDEN_SETTING_KEYS.has(row.name));
        }
    },
    methods: {
        parameterHelp(paramName) {
            return getParameterTooltip(this.title, paramName);
        },
        paramChanged(value, paramkey) {
            console.log("paramChanged", value, paramkey);
            this.$emit("update", value, paramkey);
        }
    }
};
</script>

<style scoped>
/* Match sidebar main v-btn (Vuetify default): Roboto, 14px, medium weight, MD letter-spacing */
.property-block-settings {
    font-family: Roboto, sans-serif !important;
    font-size: 0.875rem !important;
    font-weight: 500;
    letter-spacing: 0.0892857143em;
    line-height: 1.375rem;
}

/* Value column widths (× 3/4 vs prior default/sidebar); context keeps param/value ratio */
.property-block--default .value-col {
    width: 240px;
    min-width: 210px;
}

.property-block--sidebar .value-col {
    width: 144px;
    min-width: 126px;
    max-width: 144px;
}

.property-block--context {
    table-layout: fixed;
}

.property-block--context .param-col {
    width: 50%;
    max-width: 50%;
    overflow: hidden;
    word-break: break-word;
}

.property-block--context .value-col {
    width: 50%;
    min-width: 0;
    max-width: 50%;
}

.property-block--context ::v-deep .v-text-field .v-input__control {
    min-height: 32px;
}

.property-block--context ::v-deep .v-text-field input {
    padding: 4px 0 !important;
}

.param-name-code {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    background: transparent;
    color: inherit;
}

.param-name-with-help,
.param-name-with-help ::v-deep .v-icon {
    cursor: default !important;
}

.property-block--context .param-name-with-help {
    flex-wrap: wrap;
}
.param-help-icon {
    opacity: 0.85;
}

.property-block-settings ::v-deep .v-text-field input {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}

.property-block-settings ::v-deep .v-text-field__suffix {
    font-family: inherit !important;
    font-size: inherit !important;
}

.property-block-settings ::v-deep th,
.property-block-settings ::v-deep td {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
}
</style>
