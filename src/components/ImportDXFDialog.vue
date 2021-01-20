<template>
                <dialog id="import_dialog" class="mdl-dialog">
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">Drag and drop the DXF file on the canvas</h2>
                </div>
                <div class="mdl-dialog__content">
                    <canvas id="component_preview_canvas" tabindex="1" width="500" height="400"></canvas>
                </div>
                <form action="#">
                    <div class="mdl-textfield mdl-js-textfield" width="300px">
                        <input class="mdl-textfield__input" type="text" id="new_component_name" />
                        <label class="mdl-textfield__label" for="new_component_name">Name...</label>
                    </div>
                </form>
                <br />
                <div class="mdl-dialog__actions mdl-dialog__actions--full-width">
                    <button id="import_component_button" type="button" class="mdl-button">Import</button>
                    <button type="button" class="mdl-button close">Cancel</button>
                </div>
            </dialog>

</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

</style>