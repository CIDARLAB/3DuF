<template>
    <div class="property-drawer-parent">
        <v-btn ref="activator" :class="buttonClasses" @click="showProperties()">{{ mint }}</v-btn>
        <div ref="drawer" class="property-drawer">
            <v-card v-if="activated">
                <v-card-title class="subtitle-1 pb-0">{{ title }}</v-card-title>
                <v-card-text>
                    <PropertyBlock :title="mint" :spec="spec" @update="testfunc" />
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import EventBus from "@/events/events";
import PropertyBlock from "@/components/base/PropertyBlock.vue";
import Registry from "@/app/core/registry";

export default {
    name: "PropertyDrawer",
    components: { PropertyBlock },
    props: {
        mint: {
            type: String,
            required: true
        },
        spec: {
            type: Array,
            required: true
        },
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
            activated: false
        };
    },
    computed: {
        buttonClasses: function() {
            return [this.activated ? this.activatedColor : "white", this.activated ? this.activatedTextColor : "blue--text", "mx-auto", "my-1", "btn"];
        }
    },
    mounted() {
        // Setup an event for closing all the dialogs
        EventBus.get().on(EventBus.CLOSE_ALL_WINDOWS, function() {
            this.dialog = false;
        });
        EventBus.get().on(EventBus.NAVBAR_SCROLL_EVENT, this.setDrawerPosition);
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

            if (this.activated) {
                Registry.viewManager.activateComponentPlacementTool(this.mint);
                // Registry.viewManager.activateTool("CurvedMixer");
            } else {
                Registry.viewManager.deactivateComponentPlacementTool();
            }
        },
        handleScroll() {
            this.setDrawerPosition();
        },
        setDrawerPosition() {
            if (!this.activated) return;
            const bounds = this.$refs.activator.$el.getBoundingClientRect();
            this.$refs.drawer.style.top = bounds.bottom - bounds.height + "px";
        },
        testfunc(value, key) {
            console.log("testfunc:", value, key);
        }
    }
};
</script>

<style lang="scss" scoped>
.property-drawer-parent {
    overflow: visible;
    position: relative;
}

.btn {
    width: 100%;
}

.property-drawer {
    position: absolute;
    float: left;
    width: 500px;
    left: 225px;
    z-index: 100;

    ::v-deep .v-messages {
        display: none;
    }

    td {
        padding: 4px;
    }

    ::v-deep .v-input__slot {
        margin: 12px 0;
    }

    ::v-deep .v-text-field {
        padding-top: 0;
    }

    ::v-deep .v-text-field__details {
        display: none;
    }
}
</style>
