<template>
                <dialog id="doe_dialog" class="mdl-dialog">
                <div class="mdl-card__title">
                    <h2
                        class="mdl-card__title-text"
                    >Generate Design of Experiments for a Single Component</h2>
                </div>
                <div class="mdl-dialog__content">
                    <input type="file" class="upload" id="doe_input" />
                    <div id="taguchi-table"></div>
                </div>
                <!--<form action="#">-->
                <!--<div class="mdl-textfield mdl-js-textfield" width="300px">-->
                <!--<input class="mdl-textfield__input" type="text" id="new_component_name">-->
                <!--<label class="mdl-textfield__label" for="new_component_name">Name...</label>-->
                <!--</div>-->
                <!--</form>-->
                <br />
                <div class="mdl-dialog__actions mdl-dialog__actions--full-width">
                    <button
                        id="download-doe-button"
                        type="button"
                        class="mdl-button"
                    >Download Designs</button>
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