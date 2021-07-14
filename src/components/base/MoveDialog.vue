<template>
    <div class="property-drawer-parent">
        <v-btn ref="activator" style="width: 210px" :class="buttonClasses" @click="showProperties()">Move</v-btn>
        <div ref="drawer" class="move-drawer">
            <v-card v-if="activated">
                <v-row>
                    <v-col>
                        <v-row>
                            <v-card-title class="subtitle-1 pb-0">Move Component</v-card-title>
                        </v-row>
                        <v-row>
                            <v-col id="left-col" cols="3">
                                <v-row>
                                    <v-card-text>X,Y</v-card-text>
                                </v-row>
                                <v-row>
                                    <v-card-text class="bottom-xy">X,Y</v-card-text>
                                </v-row>
                            </v-col>
                            <v-col id="box"></v-col>
                            <v-col cols="3">
                                <v-row>
                                    <v-card-text>X,Y</v-card-text>
                                </v-row>
                                <v-row>
                                    <v-card-text class="bottom-xy">X,Y</v-card-text>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col id="right-col">
                        <tr>
                            <td>
                                <v-card-text>X (mm):</v-card-text>
                            </td>
                            <td width="125px">
                                <v-text-field v-model="number" placeholder="0" :step="1" type="number"> </v-text-field>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <v-card-text>Y (mm):</v-card-text>
                            </td>
                            <td width="125px">
                                <v-text-field v-model="number" placeholder="0" :step="1" type="number"> </v-text-field>
                            </td>
                        </tr>
                        <v-row id="actions-row">
                            <v-card-actions>
                                <slot name="actions" :callbacks="callbacks">
                                    <v-btn color="green darken-1" text @click="callbacks.close()"> Cancel </v-btn>
                                    <v-btn color="green darken-1" text @click="callbacks.close(onSave)"> Save </v-btn>
                                </slot>
                            </v-card-actions>
                        </v-row>
                    </v-col>
                </v-row>
                -->
            </v-card>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import EventBus from "@/events/events";
//import RightClickMenu from "@/components/RightClickMenu.vue";
import "@mdi/font/css/materialdesignicons.css";
import PumpSpec from "@/models/property-drawer/PumpSpec.js";

export default {
    name: "Move",
    data() {
        return {
            activated: false,
            callbacks: {},
            pumpSpec: PumpSpec
        };
    },
    computed: {
        buttonClasses: function () {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "ml-4", "mb-2", "btn"];
        }
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activated = false;
        });
    },
    methods: {
        showProperties() {
            this.activated = !this.activated;
            let attachPoint = document.querySelector("[data-app]");

            if (!attachPoint) {
                console.error("Could not find [data-app] element");
            }

            this.setDrawerPosition();

            attachPoint.appendChild(this.$refs.drawer);
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
            this.$refs.drawer.style.top = bounds.bottom - bounds.height + "px";
        },
        onSave() {
            console.log("Saved data for Move");
        }
    }
};
</script>

<style lang="scss" scoped>
.subtitle-1 {
    margin-left: 12px;
}

#box {
    height: 90px;
    width: 70px;
    background-color: #e2e2e2;
    margin-top: 30px;
}

.mdl-textfield__input {
    width: 100px;
}

.bottom-xy {
    margin-top: 40px;
}

#left-col {
    margin-left: 10px;
}

#right-col {
    margin-top: 10px;
}

.v-text-field {
    width: 100px;
}

#actions-row {
    margin-top: 10px;
}

.property-drawer-parent {
    overflow: visible;
    position: relative;
}
.move-drawer {
    position: absolute;
    float: left;
    width: 450px;
    left: 225px;
    z-index: 100;
}
</style>
