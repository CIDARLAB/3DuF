<template>
                <dialog id="change_all_dialog" class="mdl-dialog">
                <div class="mdl-dialog__content">
                    <!-- Textfield with Floating Label -->
                    <h5>
                        Change All Components:
                        <span id="component_type_span"></span>
                    </h5>
                </div>
                <table id="similar_components_table">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th scope="col">Name</th>
                            <th scope="col">Change</th>
                        </tr>
                    </thead>
                </table>
                <div class="mdl-dialog__actions mdl-dialog__actions--full-width">
                    <button id="change_all_button" type="button" class="mdl-button">Change</button>
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