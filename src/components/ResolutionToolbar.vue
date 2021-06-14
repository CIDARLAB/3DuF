<template>
    <div id="resolution-toolbar" class="hidetoolbar">
        <div>
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="grid-enable-toggle">
                <input id="grid-enable-toggle" type="checkbox" class="mdl-switch__input" checked />
                <span class="mdl-switch__label">Enable Automatic Grid</span>
            </label>
            <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="render-snap-toggle">
                <input id="render-snap-toggle" type="checkbox" class="mdl-switch__input" checked />
                <span class="mdl-switch__label">Render Snap Points</span>
            </label>
            <br />
            <div id="grid-resolution-slider" />
            <br />
            <br />
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        handleGridSize() {
            EventBus.get().emit(EventBus.UPDATE_GRID_SIZE);
        }
    }
};
</script>

<style lang="scss" scoped></style>
