<template>
                <div id="resolution-toolbar" class="hidetoolbar">
                <div>
                    <label
                        class="mdl-switch mdl-js-switch mdl-js-ripple-effect"
                        for="grid-enable-toggle"
                    >
                        <input
                            type="checkbox"
                            id="grid-enable-toggle"
                            class="mdl-switch__input"
                            checked
                        />
                        <span class="mdl-switch__label">Enable Automatic Grid</span>
                    </label>
                    <label
                        class="mdl-switch mdl-js-switch mdl-js-ripple-effect"
                        for="render-snap-toggle"
                    >
                        <input
                            type="checkbox"
                            id="render-snap-toggle"
                            class="mdl-switch__input"
                            checked
                        />
                        <span class="mdl-switch__label">Render Snap Points</span>
                    </label>
                    <br />
                    <div id="grid-resolution-slider"></div>
                    <br />
                    <br />
                </div>
            </div>

</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

</style>