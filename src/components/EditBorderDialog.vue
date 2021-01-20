<template>
                <dialog id="border_settings_dialog" class="mdl-dialog">
                <div class="mdl-dialog__content">
                    <!-- Textfield with Floating Label -->
                    <h4>Drag Drop the DXF file containing border to import:</h4>
                    <div class="mdl-dialog__content">
                        <canvas id="border_import_panel" tabindex="1" width="300" height="200"></canvas>
                        <br />
                        <input type="file" class="upload" id="dxf_input" />
                    </div>
                </div>
                <div class="mdl-dialog__actions mdl-dialog__actions--full-width">
                    <button id="import_border_button" type="button" class="mdl-button">Import Border</button>
                    <button id="delete_border_button" type="button" class="mdl-button">Delete Border</button>
                    <button type="button" class="mdl-button close">Close</button>
                </div>
            </dialog>

</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

</style>