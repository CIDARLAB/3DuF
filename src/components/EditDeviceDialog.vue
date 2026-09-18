<template>
    <Dialog title="Edit Device" @opened="syncFromDevice">
        <template v-slot:content>
            <tr>
                <h4 class="text--primary subtitle-1">Rename:</h4>
                <td>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <td>
                                <v-text-field v-model="deviceName" type="text" label="Device Name" />
                                <!-- <label class="mdl-textfield__label" for="devicename_textinput">Device Name</label> -->
                            </td>
                        </div>
                    </form>
                </td>
            </tr>
            <tr>
                <h4 class="text--primary subtitle-1">Resize:</h4>
                <td>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <v-text-field v-model="xspan" pattern="-?[0-9]*(\.[0-9]+)?" label="X-Span (mm)" />
                            <!-- <label class="mdl-textfield__label" for="xspan_textinput">X-Span (mm)</label> -->
                            <!-- <span class="mdl-textfield__error">Input is not a number!</span> -->
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <v-text-field v-model="yspan" pattern="-?[0-9]*(\.[0-9]+)?" label="Y-Span (mm)" />
                            <!-- <label class="mdl-textfield__label" for="yspan_textinput">Y-Span (mm)</label> -->
                            <!-- <span class="mdl-textfield__error">Input is not a number!</span> -->
                        </div>
                    </form>
                </td>
            </tr>
        </template>
        <template v-slot:actions="{ callbacks }">
            <v-btn dark color="green dark" elevation="2" @click="callbacks.close(onSave)"> Save </v-btn>
            <v-btn dark color="red dark" elevation="2" @click="callbacks.close()"> Cancel </v-btn>
        </template>
    </Dialog>
</template>

<script>
import Dialog from "@/components/base/Dialog.vue";
import Registry from "@/app/core/registry";

export default {
    components: {
        Dialog
    },
    data() {
        return {
            dialog: false,
            deviceName: "",
            xspan: "",
            yspan: ""
        };
    },
    mounted() {
        this.syncFromDevice();
        if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
            window.addEventListener("threeduf-device-loaded", this.syncFromDevice);
        }
    },
    beforeDestroy() {
        if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
            window.removeEventListener("threeduf-device-loaded", this.syncFromDevice);
        }
    },
    methods: {
        syncFromDevice() {
            const device = Registry.currentDevice;
            if (!device) {
                return;
            }
            this.deviceName = device.name || "";
            const x = Number(device.getXSpan());
            const y = Number(device.getYSpan());
            this.xspan = Number.isFinite(x) ? x / 1000 : "";
            this.yspan = Number.isFinite(y) ? y / 1000 : "";
        },
        onSave() {
            Registry.currentDevice.name = this.deviceName;
            Registry.currentDevice.setXSpan(this.xspan * 1000);
            Registry.currentDevice.setYSpan(this.yspan * 1000);
            Registry.viewManager.view.showActiveLayer();
            Registry.viewManager.updateDevice(Registry.currentDevice, false);
        }
    }
};
</script>

<style lang="scss" scoped></style>
