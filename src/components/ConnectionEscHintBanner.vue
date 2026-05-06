<template>
    <v-slide-y-transition>
        <div v-if="visible" class="connection-esc-hint-banner" role="status">
            You are drawing a connection. Press <kbd class="connection-esc-hint-kbd">Esc</kbd> on your keyboard to stop drawing and exit the connection tool.
        </div>
    </v-slide-y-transition>
</template>

<script>
import EventBus from "@/events/events";

export default {
    name: "ConnectionEscHintBanner",
    data() {
        return {
            visible: false
        };
    },
    mounted() {
        this._onEscHint = (show) => {
            this.visible = Boolean(show);
        };
        EventBus.get().on(EventBus.CONNECTION_ESC_HINT, this._onEscHint);
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.CONNECTION_ESC_HINT, this._onEscHint);
    }
};
</script>

<style lang="scss" scoped>
.connection-esc-hint-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10050;
    padding: 10px 16px;
    text-align: center;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #fff;
    background: rgba(33, 33, 33, 0.92);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    pointer-events: none;
}

.connection-esc-hint-kbd {
    display: inline-block;
    margin: 0 4px;
    padding: 2px 8px;
    font-size: 0.85em;
    font-family: inherit;
    color: #212121;
    background: #fafafa;
    border-radius: 4px;
    border: 1px solid #bdbdbd;
}
</style>
