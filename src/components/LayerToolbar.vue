<template>
    <div>
        <md-toolbar class="md-title" md-elevation="0">Select Layer</md-toolbar>

        <nav class="mdl-navigation" id="layer-controls">
            <!--<a id="control_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button&#45;&#45;raised view-button">Control</a>-->

            <div id="layer-toolbar">
                <div
                    id="template-layer-block"
                    class="mdl-button-group layer-block"
                    data-levelindex="0"
                >
                    <span class="level-index">LEVEL 1</span>
                    <button
                        class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored delete-level"
                        style="visibility: hidden"
                        data-levelindex="0"
                    >
                        <i class="material-icons">delete</i>
                    </button>
                    <!--<button class="mdl-button mdl-js-button mdl-button&#45;&#45;icon mdl-button&#45;&#45;colored">-->
                    <!--<i class="material-icons">visibility_off</i>-->
                    <!--</button>-->
                    <br />
                    <a
                        class="mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect layer-button flow-button"
                        data-layerindex="0"
                    >Flow</a>
                    <a
                        class="mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect layer-button control-button"
                        data-layerindex="1"
                    >Control</a>
                </div>
            </div>

            <button
                id="add-new-level"
                class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored"
            >
                <i class="material-icons">add_box</i>
            </button>
            <!--<a id="cells_button" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button&#45;&#45;raised view-button">Cells</a>-->
        </nav>
    </div>
</template>

<script>
export default {
    name: "ComponentToolbar",
    data() {
        return {
            test: "Level -"
        };
    }
};
</script>

<style lang="scss" scoped>
.md-content {
    width: 75px;
    height: 200px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
</style>