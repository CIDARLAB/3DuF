<template>
                <dialog id="intro_help_dialog" class="mdl-dialog" style="overflow-y: auto;">
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">Getting Started</h2>
                </div>
                <div class="mdl-dialog__content">
                    <div style="overflow-y: visible; max-height: 600px;">
                        <h5>Academic Publications:</h5>
                        <p>
                            Sanka, Radhakrishna, Joshua Lippai, Dinithi Samarasekera, Sarah Nemsick, and Douglas Densmore.
                            <br />“3DμF - Interactive Design Environment for Continuous Flow Microfluidic Devices.”
                            <br />Scientific Reports 9, no. 1 (December 2019).
                        </p>
                        <a
                            href="https://doi.org/10.1038/s41598-019-45623-z"
                        >https://doi.org/10.1038/s41598-019-45623-z</a>

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
                                    ></iframe>
                                </td>
                                <td>
                                    <iframe
                                        width="355"
                                        height="200"
                                        src="https://www.youtube.com/embed/YOrnnZjma28"
                                        frameborder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen
                                    ></iframe>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center">Introduction</td>
                                <td style="text-align: center">Long Tutorial</td>
                            </tr>
                        </table>
                        <br />

                        <p>
                            <b>Send in comments, suggestions and issues to</b>
                            <a href="mailto: 3dufhelp@gmail.com">3dufhelp@gmail.com</a>.
                        </p>

                        <h5>Designs From Literature</h5>Check the various designs from microfluidic literature recreated in 3DµF can be found
                        <a
                            href="https://cidarlab.github.io/3DuF-Paper-Designs/"
                            target="_blank"
                        >here</a>.
                        <h5>Usage</h5>
                        <table class="tg">
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>del</pre>
                                </td>
                                <td class="tg-yw4l">- Delete Feature</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>F</pre>
                                </td>
                                <td class="tg-yw4l">- Reset Canvas</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>Esc</pre>
                                </td>
                                <td
                                    class="tg-yw4l"
                                >- Activate Select Tool/ Deselect Selected Components</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>ctrl+C , ctrl+V</pre>
                                </td>
                                <td class="tg-yw4l">- Activate Component Copy Mode</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>ctrl+Z</pre>
                                </td>
                                <td class="tg-yw4l">- Undo Last Edit</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>ctrl+A</pre>
                                </td>
                                <td class="tg-yw4l">- Select All</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>ctrl+S</pre>
                                </td>
                                <td class="tg-yw4l">- Save JSON file</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>left click</pre>
                                </td>
                                <td class="tg-yw4l">- Place Feature</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>right click</pre>
                                </td>
                                <td class="tg-yw4l">- Select Feature</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>mouse scroll</pre>
                                </td>
                                <td class="tg-yw4l">- Zoom</td>
                            </tr>
                            <tr>
                                <td class="tg-yw4l">
                                    <pre>arrow keys</pre>
                                </td>
                                <td class="tg-yw4l">- Pan</td>
                            </tr>
                        </table>
                    </div>

                    <div class="mdl-card__menu">
                        <button
                            class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect close"
                        >
                            <i class="material-icons">clear</i>
                        </button>
                    </div>
                </div>
            </dialog>

</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

</style>