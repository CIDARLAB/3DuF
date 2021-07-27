<template>
    <v-dialog v-model="dialog" persistent max-width="400">
        <template v-slot:activator="{ on, attrs }">
            <a color="primary" dark v-bind="attrs" class="popdown mdl-button mdl-js-button mdl-js-ripple-effect" title="About" style="color: hotpink" v-on="on">About/Help</a>
        </template>
        <v-card>
<<<<<<< HEAD
            <v-card-title class="headline">
                3DuF v1.1
            </v-card-title>
=======
            <v-card-title class="headline"> 3DuF v1.1 </v-card-title>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
            <v-card-text>
                <img src="img/cidar_logo.png" width="100%" />
                3DuF is microfluidic design environment developed by
                <a href="http://cidarlab.org" target="_blank">CIDAR</a>. For any help or queries, please send an email to
                <a href="mailto: 3dufhelp@gmail.com">3dufhelp@gmail.com</a>. Source code, issue tracking and feature requests are available at
                <a href="https://github.com/CIDARLAB/3DuF/" target="_blank">Github</a>.
                <hr />
                Developed by: Aaron Heuckroth, Joshua Lippai and Radhakrishna Sanka.
                <hr />
                Error Tracking powered by <a href="https://trackjs.com">https://trackjs.com</a>.
            </v-card-text>
            <v-card-actions>
                <v-spacer />
<<<<<<< HEAD
                <v-btn color="green darken-1" text @click="dialog = false">
                    Close
                </v-btn>
=======
                <v-btn color="green darken-1" text @click="dialog = false"> Close </v-btn>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
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

<<<<<<< HEAD
<style lang="scss" scoped></style>
=======
<style lang="scss" scoped>
.property-drawer-parent {
    overflow: visible;
    position: relative;
}

.btn {
    width: 100%;
}
</style>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
