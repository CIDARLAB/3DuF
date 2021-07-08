<template>
    <div class="property-drawer-parent">
        <v-btn ref="activator" style="width: 210px" :class="buttonClasses" @click="showProperties()">Change All</v-btn>
        <div ref="drawer" class="change-all-drawer">
            <v-card v-if="activated">
                <v-row>
                    <v-card-title class="heading-6 pb-0">Change All Components:</v-card-title>
                </v-row>
                <table>
                    <tr>
                        <th class="font-weight-bold pl-10 pt-4 pb-2">
                            <input v-model="selectAll" type="checkbox" />
                            <v-text class="pl-1">Select</v-text>
                        </th>
                        <th class="font-weight-bold pl-15 pt-4 pb-2">Name</th>
                    </tr>
                    <tr v-for="mixer in mixers" :key="mixer.id">
                        <td class="pl-15 pb-2"><input v-model="selected" type="checkbox" :value="mixer.id" /></td>
                        <td class="pl-15 pb-2">{{ mixer.name }}</td>
                    </tr>
                </table>

                <v-row id="actions-row">
                    <v-card-actions>
                        <slot name="actions" :callbacks="callbacks">
                            <v-btn color="green" class="white--text" @click="callbacks.close(onSave)"> Change </v-btn>
                            <v-btn color="red" class="white--text ml-9" @click="callbacks.close()"> Cancel </v-btn>
                        </slot>
                    </v-card-actions>
                </v-row>
            </v-card>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import EventBus from "@/events/events";
import "@mdi/font/css/materialdesignicons.css";

export default {
    name: "ChangeAllComponents",
    props: {
        activatedColor: {
            type: String,
            required: false,
            default: "primary"
        },
        activatedTextColor: {
            type: String,
            required: false,
            default: "white--text"
        }
    },
    data() {
        return {
            activated: false,
            mixers: [
                { id: "BetterMixer_1", name: "BetterMixer_1" },
                { id: "BetterMixer_2", name: "BetterMixer_2" }
            ],
            selected: [],
            callbacks: {}
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "ml-4", "mb-2", "btn"];
        },
        selectAll: {
            get: function() {
                return this.mixers ? this.selected.length == this.mixers.length : false;
            },
            set: function(value) {
                var selected = [];

                if (value) {
                    this.mixers.forEach(function(mixer) {
                        selected.push(mixer.id);
                    });
                }

                this.selected = selected;
            }
        }
    },
    mounted() {
        EventBus.get().on(EventBus.NAVBAR_SCOLL_EVENT, this.setDrawerPosition);
        Vue.set(this.callbacks, "close", callback => {
            if (callback) callback();
            this.activated = false;
            this.selected = false;
            this.selectAll = false;
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
            console.log("Saved data for Change All Components");
        }
    }
};
</script>

<style lang="scss" scoped>
.subtitle-1 {
    margin-left: 55px;
}

.heading-6 {
    margin-left: 30px;
}

#actions-row {
    margin-top: 50px;
    margin-left: 30px;
    padding-bottom: 10px;
}

.property-drawer-parent {
    overflow: visible;
    position: relative;
}
.change-all-drawer {
    position: absolute;
    float: left;
    width: 300px;
    left: 225px;
    z-index: 100;
}
</style>
