<template>
    <v-dialog v-model="dialog" persistent max-width="400">
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" text color="pink darken-1" v-on="on"> About/Help </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline"> 3DuF v1.1 </v-card-title>
            <v-card-text>
                <img src="img/cidar_logo.png" width="100%" />
                3DuF is microfluidic design environment developed by
                <a href="http://cidarlab.org" target="_blank" rel="noopener noreferrer">CIDAR</a>. For any help or queries, please send an email to
                <a href="mailto: 3dufhelp@gmail.com">3dufhelp@gmail.com</a>. Source code, issue tracking and feature requests are available at
                <a href="https://github.com/CIDARLAB/3DuF/" target="_blank" rel="noopener noreferrer">Github</a>.
                <hr />
                Developed by: Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka.
                <hr />
                Error Tracking powered by <a href="https://trackjs.com">https://trackjs.com</a>.
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="green darken-1" text @click="dialog = false"> Close </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            dialog: false
        };
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
