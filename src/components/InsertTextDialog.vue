<template>
        <dialog id="insert_text_dialog" class="mdl-dialog">
        <div class="mdl-dialog__content">
            <!-- Textfield with Floating Label -->
            <h4>Insert Text:</h4>
            <form action="#">
                <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                    <input
                        class="mdl-textfield__input"
                        type="text"
                        id="inserttext_textinput"
                    />
                    <label class="mdl-textfield__label" for="inserttext_textinput">Text</label>
                </div>
            </form>
        </div>
        <div class="mdl-dialog__actions mdl-dialog__actions--full-width">
            <button id="accept_text_button" type="button" class="mdl-button">Insert</button>
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