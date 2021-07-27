<template>
    <v-dialog v-model="dialog" persistent max-width="600">
        <template v-slot:activator="{ on, attrs }">
            <a v-bind="attrs" class="popdown mdl-button mdl-js-button mdl-js-ripple-effect" title="About" style="color: hotpink" v-on="on">Getting Started</a>
        </template>
        <v-card>
<<<<<<< HEAD
            <v-card-title class="headline">
                Getting Started
            </v-card-title>
=======
            <v-card-title class="headline"> Getting Started </v-card-title>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
            <v-card-text>
                <h5>Academic Publications:</h5>
                <p>
                    Sanka, Radhakrishna, Joshua Lippai, Dinithi Samarasekera, Sarah Nemsick, and Douglas Densmore.
                    <br />“3DμF - Interactive Design Environment for Continuous Flow Microfluidic Devices.” <br />Scientific Reports 9, no. 1 (December 2019).
                </p>
                <a href="https://doi.org/10.1038/s41598-019-45623-z">https://doi.org/10.1038/s41598-019-45623-z</a>

                <h5>Videos</h5>

                <table>
                    <tr>
                        <td>
                            <iframe
                                width="355"
                                height="200"
                                src="https://www.youtube.com/embed/05nU8eQ73U8"
                                frameborder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            />
                        </td>
                        <td>
                            <iframe
                                width="355"
                                height="200"
                                src="https://www.youtube.com/embed/YOrnnZjma28"
                                frameborder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            />
                        </td>
                    </tr>
                    <tr>
<<<<<<< HEAD
                        <td style="text-align: center">
                            Introduction
                        </td>
                        <td style="text-align: center">
                            Long Tutorial
                        </td>
=======
                        <td style="text-align: center">Introduction</td>
                        <td style="text-align: center">Long Tutorial</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                </table>

                <br />

                <p>
                    <b>Send in comments, suggestions and issues to</b>
                    <a href="mailto: 3dufhelp@gmail.com">3dufhelp@gmail.com</a>.
                </p>

                <h5>Designs From Literature</h5>
                Check the various designs from microfluidic literature recreated in 3DµF can be found
                <a href="https://cidarlab.github.io/3DuF-Paper-Designs/" target="_blank">here</a>.
                <h5>Usage</h5>
                <table class="tg">
                    <tr>
                        <td class="tg-yw4l">
                            <pre>del</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Delete Feature
                        </td>
=======
                        <td class="tg-yw4l">- Delete Feature</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>F</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Reset Canvas
                        </td>
=======
                        <td class="tg-yw4l">- Reset Canvas</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>Esc</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Activate Select Tool/ Deselect Selected Components
                        </td>
=======
                        <td class="tg-yw4l">- Activate Select Tool/ Deselect Selected Components</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>ctrl+C , ctrl+V</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Activate Component Copy Mode
                        </td>
=======
                        <td class="tg-yw4l">- Activate Component Copy Mode</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>ctrl+Z</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Undo Last Edit
                        </td>
=======
                        <td class="tg-yw4l">- Undo Last Edit</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>ctrl+A</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Select All
                        </td>
=======
                        <td class="tg-yw4l">- Select All</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>ctrl+S</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Save JSON file
                        </td>
=======
                        <td class="tg-yw4l">- Save JSON file</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>left click</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Place Feature
                        </td>
=======
                        <td class="tg-yw4l">- Place Feature</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>right click</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Select Feature
                        </td>
=======
                        <td class="tg-yw4l">- Select Feature</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>mouse scroll</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Zoom
                        </td>
=======
                        <td class="tg-yw4l">- Zoom</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                    <tr>
                        <td class="tg-yw4l">
                            <pre>arrow keys</pre>
                        </td>
<<<<<<< HEAD
                        <td class="tg-yw4l">
                            - Pan
                        </td>
=======
                        <td class="tg-yw4l">- Pan</td>
>>>>>>> b84163b05e74292ef9cf15dd065df530a04d8d7a
                    </tr>
                </table>
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

<style lang="scss" scoped></style>
