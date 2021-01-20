<template>
            <dialog id="edit_device_dialog" class="mdl-dialog">
                <div class="mdl-dialog__content">
                    <!-- Textfield with Floating Label -->
                    <h4>Rename:</h4>
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input
                                class="mdl-textfield__input"
                                type="text"
                                id="devicename_textinput"
                            />
                            <label
                                class="mdl-textfield__label"
                                for="devicename_textinput"
                            >Device Name</label>
                        </div>
                    </form>

                    <h4>Resize:</h4>
                    <!-- Numeric Textfield with Floating Label -->
                    <form action="#">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input
                                class="mdl-textfield__input"
                                type="text"
                                pattern="-?[0-9]*(\.[0-9]+)?"
                                id="xspan_textinput"
                            />
                            <label class="mdl-textfield__label" for="xspan_textinput">X-Span (mm)</label>
                            <span class="mdl-textfield__error">Input is not a number!</span>
                        </div>
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input
                                class="mdl-textfield__input"
                                type="text"
                                pattern="-?[0-9]*(\.[0-9]+)?"
                                id="yspan_textinput"
                            />
                            <label class="mdl-textfield__label" for="yspan_textinput">Y-Span (mm)</label>
                            <span class="mdl-textfield__error">Input is not a number!</span>
                        </div>
                    </form>
                </div>
                <div class="mdl-dialog__actions mdl-dialog__actions--full-width">
                    <button id="accept_resize_button" type="button" class="mdl-button">Save</button>
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