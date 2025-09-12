<template>
    <v-dialog v-model="dialog" persistent max-width="500">
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" text color="pink darken-1" v-on="on">
                About/Help
            </v-btn>
        </template>

        <v-card>
            <v-card-title class="headline">{{ pageTitle }}</v-card-title>

            <v-card-text>
                <!-- Page 1 -->
                <div v-if="page === 1">
                    <img src="img/cidar_logo.png" width="100%" />
                    3DuF is microfluidic design environment developed by
                    <a href="http://cidarlab.org" target="_blank" rel="noopener noreferrer">CIDAR</a>.
                    <br />
                    For any help or queries, please send an email to
                    <a href="mailto:3dufhelp@gmail.com">3dufhelp@gmail.com</a>.
                    <br />
                    Source code, issue tracking and feature requests are available at
                    <a href="https://github.com/CIDARLAB/3DuF/" target="_blank" rel="noopener noreferrer">Github</a>.
                    <hr />
                    Developed by: Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka.
                    <hr />
                    Error Tracking powered by
                    <a href="https://trackjs.com">https://trackjs.com</a>.
                </div>

                <!-- Page 2 -->
                <div v-else-if="page === 2">
                    <img src="img/cidar_logo.png" width="100%" />
                    3DuF is microfluidic design environment developed by
                    <a href="http://cidarlab.org" target="_blank" rel="noopener noreferrer">CIDAR</a>.
                    <br />
                    For any help or queries, please send an email to
                    <a href="mailto:3dufhelp@gmail.com">3dufhelp@gmail.com</a>.
                    <br />
                    Source code, issue tracking and feature requests are available at
                    <a href="https://github.com/CIDARLAB/3DuF/" target="_blank" rel="noopener noreferrer">Github</a>.
                    <hr />
                    Developed by: Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka.
                    <hr />
                    Error Tracking powered by
                    <a href="https://trackjs.com">https://trackjs.com</a>.
                    <hr />
                    Version Updates: blackbox render for unknown components, new component parameter for geometric reflection, correct rendering of primitive server devices
                </div>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <!-- numbered buttons -->
                <div>
                    <v-btn v-for="(label, index) in pageLabels" :key="index" text :color="page === index + 1 ? 'pink darken-1' : ''" @click="page = index + 1">
                        {{ label }}
                    </v-btn>
                </div>
                <v-spacer />
                <v-btn color="green darken-1" text @click="dialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            dialog: false,
            page: 1,
            pageLabels: ["v1.1", "v1.2"]
        };
    },
    computed: {
        pageTitle() {
            return `3DuF ${this.pageLabels[this.page - 1] || "Help"}`;
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
</style>
