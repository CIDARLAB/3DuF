<template>
    <v-slide-y-transition>
        <div v-if="visible" class="canvas-warning-banner" role="alert">
            {{ message }}
        </div>
    </v-slide-y-transition>
</template>

<script>
import EventBus from "@/events/events";

const AUTO_HIDE_MS = 6000;

export default {
    name: "CanvasWarningBanner",
    data() {
        return {
            visible: false,
            message: "",
            hideTimer: null
        };
    },
    mounted() {
        this.onWarning = (payload) => {
            const text = payload && typeof payload === "object" ? payload.message : payload;
            if (!text) return;
            this.message = String(text);
            this.visible = true;
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
            }
            this.hideTimer = setTimeout(() => {
                this.visible = false;
                this.hideTimer = null;
            }, AUTO_HIDE_MS);
        };
        EventBus.get().on(EventBus.CANVAS_WARNING, this.onWarning);
    },
    beforeDestroy() {
        EventBus.get().off(EventBus.CANVAS_WARNING, this.onWarning);
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
};
</script>

<style lang="scss" scoped>
.canvas-warning-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10050;
    padding: 10px 16px;
    text-align: center;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #212121;
    background: rgba(255, 193, 7, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    pointer-events: none;
}
</style>
